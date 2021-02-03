# frozen_string_literal: true

class JiraManager
  def initialize(**params)
    required_keys = %i[username password site user_id]
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

    @client = JIRA::Client.new(options)

    @query_options = {
      fields: [],
      start_at: params[:start_at] || 0,
      max_results: 10
    }
  end

  def fetch_issues
    @client.Issue.jql("project = VPI", @query_options)
  end

  def fetch_gas_gauge_data
    issues = Issue.where(project_id: "10015", user_id: @user.id)

    grand_total = issues.count
    total_backlog = issues.where("status->>'name' = 'Backlog'").count
    total_in_progress = issues.where("status->>'name' = 'In Progress'").count
    total_done = issues.where("status->>'name' = 'Done'").count

    {
      total_backlog: total_backlog, total_in_progress: total_in_progress,
      total_done: total_done, grand_total: grand_total
    }
  end

  def fetch_epics
    issues = Issue.where(project_id: "10015", user_id: @user.id)
    epics = issues.where("issue_type->>'name' = 'Epic'")
    epic_keys = epics.pluck(:key)
    epic_issues = issues.where(epic_link: epic_keys)
    [epics, epic_issues]
  end

  def sync_projects
    jira_projects = @client.Project.all

    jira_projects.each do |jira_project|
      project = {
        user_project_id: "#{@user.id}_#{jira_project.id}",
        project_id: jira_project.id,
        name: jira_project.name, user_id: @user.id, key: jira_project.key
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
        max_results: max_results
      }
      jira_issues = @client.Issue.jql("", query_options)

      break if jira_issues.length.zero?

      jira_issues.each do |jira_issue|
        project = {
          user_issue_id: "#{@user.id}_#{jira_issue.id}",
          project_id: jira_issue.project.id, issue_id: jira_issue.id,
          summary: jira_issue.summary, user_id: @user.id, key: jira_issue.key,
          status: {name: jira_issue.status.name}, issue_type: jira_issue.fields["issuetype"],
          epic_link: jira_issue.try(:customfield_10014), epic_name: jira_issue.try(:customfield_10011)
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
end
