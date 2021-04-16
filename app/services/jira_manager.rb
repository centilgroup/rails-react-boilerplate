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

  def fetch_bugs
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    issues.where("issue_type->>'name' = 'Bug'")
  end

  def fetch_tasks
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    issues.where("issue_type->>'name' = 'Task'")
  end

  def fetch_vsm
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    to_do = ["backlog", "to do", "open", "selected for development"]
    wip = ["in progress"]
    qa = ["review", "qa", "ready for review", "in review"]
    done = %w[done closed]
    to_do_lt = []
    wip_lt = []
    qa_lt = []
    done_lt = []
    to_do_pt = []
    wip_pt = []
    qa_pt = []
    done_pt = []
    to_do_c = 0
    to_do_a = 0
    wip_c = 0
    wip_a = 0
    qa_c = 0
    qa_a = 0

    issues.each do |issue|
      to_do_lt_days = 0
      wip_lt_days = 0
      qa_lt_days = 0
      done_lt_days = 0
      to_do_pt_days = 0
      wip_pt_days = 0
      qa_pt_days = 0
      done_pt_days = 0
      issue.status_transitions.each do |transition|
        from = transition["from_string"].downcase
        to = transition["to_string"].downcase
        to_do_lt_days += transition["lead_time"] if to_do.include? from
        wip_lt_days += transition["lead_time"] if wip.include? from
        qa_lt_days += transition["lead_time"] if qa.include? from
        done_lt_days += transition["lead_time"] if done.include? from
        to_do_pt_days += transition["process_time"] if to_do.include? from
        wip_pt_days += transition["process_time"] if wip.include? from
        qa_pt_days += transition["process_time"] if qa.include? from
        done_pt_days += transition["process_time"] if done.include? from
        to_do_c += 1 if to_do.include?(from) && wip.include?(to)
        to_do_a += 1 if (done + qa + wip).include?(from) && to_do.include?(to)
        wip_c += 1 if wip.include?(from) && qa.include?(to)
        wip_a += 1 if (done + qa).include?(from) && wip.include?(to)
        qa_c += 1 if qa.include?(from) && done.include?(to)
        qa_a += 1 if done.include?(from) && qa.include?(to)
      end
      to_do_lt << to_do_lt_days if to_do_lt_days.positive?
      wip_lt << wip_lt_days if wip_lt_days.positive?
      qa_lt << qa_lt_days if qa_lt_days.positive?
      done_lt << done_lt_days if done_lt_days.positive?
      to_do_pt << to_do_pt_days if to_do_pt_days.positive?
      wip_pt << wip_pt_days if wip_pt_days.positive?
      qa_pt << qa_pt_days if qa_pt_days.positive?
      done_pt << done_pt_days if done_pt_days.positive?
    end

    median_lt_to_do = median(to_do_lt)
    median_lt_wip = median(wip_lt)
    median_lt_qa = median(qa_lt)
    median_lt_done = median(done_lt)

    median_pt_to_do = median(to_do_pt)
    median_pt_wip = median(wip_pt)
    median_pt_qa = median(qa_pt)
    median_pt_done = median(done_pt)

    ca_to_do = percent(to_do_c, to_do_a).round(1)
    ca_wip = percent(wip_c, wip_a).round(1)
    ca_qa = percent(qa_c, qa_a).round(1)

    total_lt = median_lt_to_do + median_lt_wip + median_lt_qa + median_lt_done
    total_pt = median_pt_to_do + median_pt_wip + median_pt_qa + median_pt_done
    activity_ratio = (total_pt / total_lt) * 100
    rolled_ca =
      if ca_to_do.positive? && ca_wip.positive? && ca_qa.positive?
        (ca_to_do / 100) * (ca_wip / 100) * (ca_qa / 100) * 100
      elsif ca_to_do.positive? && ca_wip.positive? && ca_qa.zero?
        (ca_to_do / 100) * (ca_wip / 100) * 100
      elsif ca_to_do.positive? && ca_wip.zero? && ca_qa.positive?
        (ca_to_do / 100) * (ca_qa / 100) * 100
      elsif ca_to_do.zero? && ca_wip.positive? && ca_qa.positive?
        (ca_wip / 100) * (ca_qa / 100) * 100
      elsif ca_to_do.zero? && ca_wip.zero? && ca_qa.positive?
        ca_qa
      elsif ca_to_do.zero? && ca_wip.positive? && ca_qa.zero?
        ca_wip
      elsif ca_to_do.positive? && ca_wip.zero? && ca_qa.zero?
        ca_to_do
      elsif ca_to_do.zero? && ca_wip.zero? && ca_qa.zero?
        0
      end

    [
      {
        to_do: median_lt_to_do.round(1),
        wip: median_lt_wip.round(1),
        qa: median_lt_qa.round(1),
        done: median_lt_done.round(1)
      },
      {
        to_do: median_pt_to_do.round(1),
        wip: median_pt_wip.round(1),
        qa: median_pt_qa.round(1),
        done: median_pt_done.round(1)
      },
      {
        to_do: ca_to_do,
        wip: ca_wip,
        qa: ca_qa
      },
      {
        total_lt: total_lt.round(1),
        total_pt: total_pt.round(1),
        activity_ratio: activity_ratio.round(1),
        rolled_ca: rolled_ca.round(1)
      }
    ]
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
        status = {name: jira_issue.status.name, id: jira_issue.status.id}
        project = {
          user_issue_id: "#{@user.id}_#{jira_issue.id}",
          project_id: jira_issue.project.id, issue_id: jira_issue.id,
          summary: jira_issue.summary, user_id: @user.id, key: jira_issue.key,
          status: status, issue_type: jira_issue.fields["issuetype"],
          epic_link: jira_issue.try(:customfield_10014), epic_name: jira_issue.try(:customfield_10011),
          due_date: jira_issue.try(:duedate), change_log: jira_issue.try(:changelog),
          created: jira_issue.try(:created), time_to_close_in_days: time_to_close_in_days(jira_issue),
          status_transitions: status_transitions(jira_issue)
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

    histories.reverse_each do |history|
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

  def status_transitions(issue)
    transitions = []
    change_log = issue.try(:changelog)
    histories = change_log["histories"]
    offset_time = Time.parse issue.try(:created)

    histories.reverse_each do |history|
      item = history["items"].last
      if item["field"] == "status" && item["fieldtype"] == "jira"
        created_at = Time.parse history["created"]
        lead_time = (created_at - offset_time) / 1.day
        transitions << {
          from_status: history["items"].last["from"],
          from_string: history["items"].last["fromString"],
          to_status: history["items"].last["to"],
          to_string: history["items"].last["toString"],
          lead_time: lead_time,
          process_time: (lead_time * 8) / 24.to_f
        }
        offset_time = Time.parse history["created"]
      end
    end

    transitions
  end

  def median(array, already_sorted = false)
    return 0 if array.empty?
    array = array.sort unless already_sorted
    m_pos = array.size / 2
    array.size % 2 == 1 ? array[m_pos] : mean(array[m_pos - 1..m_pos])
  end

  def mean(array)
    array.sum / array.size.to_f
  end

  def percent(c, a)
    return 0 if c.zero?

    ((c - a) / c.to_f) * 100
  end
end
