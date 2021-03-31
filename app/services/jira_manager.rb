# frozen_string_literal: true

class JiraManager
  def initialize(**params)
    required_keys = %i[username password site user_id project_id]
    unless required_keys.all? { |required_key| params.key? required_key }
      missing_keys = required_keys - params.keys
      message = "missing #{missing_keys.map(&:to_s).join(", ")}"
      raise ArgumentError, message
    end

    options = {
      username: params[:username],
      password: params[:password],
      site: params[:site],
      context_path: "",
      auth_type: :basic
    }

    @user = User.where(id: params[:user_id]).first

    @project =
      Project.where(project_id: params[:project_id], user_id: @user.id)
        .order(id: :asc).first

    @client = JIRA::Client.new(options)

    @query_options = {
      fields: [],
      start_at: params[:start_at] || 0,
      max_results: 10,
      expand: "changelog"
    }
  end

  def fetch_issues
    @client.Issue.jql("project = #{@project.key}", @query_options)
  end

  def fetch_gas_gauge_data
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    backlog = ["backlog", "to do", "open"]
    in_progress = ["selected for development", "in progress", "review", "qa", "ready for review", "in review"]
    done = %w[done closed]
    work_in_progress = ["selected for development", "in progress"]
    work_in_review = ["review", "qa", "ready for review", "in review"]

    grand_total = issues.count
    total_backlog = issues.where("lower(status->>'name') IN (?)", backlog).count
    total_in_progress = issues.where("lower(status->>'name') IN (?)", in_progress).count
    total_done = issues.where("lower(status->>'name') IN (?)", done).count
    total_work_in_progress = issues.where("lower(status->>'name') IN (?)", work_in_progress).count
    total_work_in_review = issues.where("lower(status->>'name') IN (?)", work_in_review).count

    {
      total_backlog: total_backlog, total_in_progress: total_in_progress,
      total_done: total_done, grand_total: grand_total,
      total_work_in_progress: total_work_in_progress,
      total_work_in_review: total_work_in_review
    }
  end

  def fetch_board_data
    Board.where(project_id: @project.project_id, user_id: @user.id)
  end

  def fetch_vpi_data(project_id = @project.project_id)
    issues = Issue.where(project_id: project_id, user_id: @user.id)
    done = %w[done closed]
    remaining_issues = issues.where.not("lower(status->>'name') IN (?)", done)
    done_issues = issues.where("lower(status->>'name') IN (?)", done)
    current_date = Date.today
    max_due_date =
      issues.where.not(due_date: nil).order(due_date: :desc).limit(1)
        .pluck(:due_date).first
    remaining_days =
      if max_due_date.present?
        (max_due_date - current_date).to_i
      end
    average_time_to_close =
      if done_issues.length.positive?
        done_issues.pluck(:time_to_close_in_days).map(&:to_i).sum / done_issues.length
      end

    {
      project_id: project_id,
      remaining_days: remaining_days,
      remaining_issues: remaining_issues.length,
      average_time_to_close: average_time_to_close
    }
  end

  def fetch_vpi_by_project
    projects = Project.where(user_id: @user.id).order(id: :asc)
    vpi_by_project = []
    projects.each do |project|
      vpi_by_project << fetch_vpi_data(project.project_id)
    end
    vpi_by_project
  end

  def fetch_epics
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    epics = issues.where("issue_type->>'name' = 'Epic'")
    epic_keys = epics.pluck(:key)
    epic_issues = issues.where(epic_link: epic_keys)
    [epics, epic_issues]
  end

  def sync_projects
    jira_projects = @client.Project.all
    jira_boards = @client.Board.all

    jira_boards.each do |jira_board|
      config = jira_board.configuration
      board = {
        user_board_id: "#{@user.id}_#{config.id}",
        board_id: config.id, name: config.name,
        board_type: config.type, project_id: config.location["id"],
        user_id: @user.id, column_config: config.columnConfig["columns"]
      }
      Board.upsert(board, unique_by: :user_board_id)
    end

    jira_projects.each do |jira_project|
      project = {
        user_project_id: "#{@user.id}_#{jira_project.id}",
        project_id: jira_project.id, name: jira_project.name,
        user_id: @user.id, key: jira_project.key
      }
      Project.upsert(project, unique_by: :user_project_id)
    end

    p "Projects synced for user - #{@user.id}"
  rescue => e
    p e.message
    p "Projects not synced for user - #{@user.id}"
  end

  def sync_issues
    start_at = 0
    max_results = 100
    loop do
      query_options = {
        start_at: start_at,
        max_results: max_results,
        expand: "changelog"
      }
      jira_issues = @client.Issue.jql("", query_options)

      break if jira_issues.length.zero?

      jira_issues.each do |jira_issue|
        project = {
          user_issue_id: "#{@user.id}_#{jira_issue.id}",
          project_id: jira_issue.project.id, issue_id: jira_issue.id,
          summary: jira_issue.summary, user_id: @user.id, key: jira_issue.key,
          status: {name: jira_issue.status.name}, issue_type: jira_issue.fields["issuetype"],
          epic_link: jira_issue.try(:customfield_10014), epic_name: jira_issue.try(:customfield_10011),
          due_date: jira_issue.try(:duedate), change_log: jira_issue.try(:changelog),
          created: jira_issue.try(:created), time_to_close_in_days: time_to_close_in_days(jira_issue)
        }
        Issue.upsert(project, unique_by: :user_issue_id)
      end

      start_at += max_results
    end

    p "Issues synced for user - #{@user.id}"
  rescue => e
    p e.message
    p "Issues not synced for user - #{@user.id}"
  end

  private

  def time_to_close_in_days(issue)
    change_log = issue.try(:changelog)
    histories = change_log["histories"]
    issue_created_at = Date.parse issue.try(:created)
    current_status = issue.status.name.downcase
    return unless %w[done closed].include? current_status

    histories.reverse.each do |history|
      item = history["items"].first
      if %w[status resolution].include?(item["field"]) && item["fieldtype"] == "jira"
        status = history["items"].last["toString"].downcase
        if %w[done closed].include? status
          history_created_at = Date.parse history["created"]
          return (history_created_at - issue_created_at).to_i
        end
      end
    end
  end
end
