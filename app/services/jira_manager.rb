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

  def sync_projects
    jira_projects = @client.Project.all

    jira_projects.each do |jira_project|
      project = {
        project_id: "#{@user.id}_#{jira_project.id}", key: jira_project.key,
        name: jira_project.name, user_id: @user.id
      }
      Project.upsert(project, unique_by: :project_id)
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
        fields: [],
        start_at: start_at,
        max_results: max_results
      }
      jira_issues = @client.Issue.jql("", query_options)

      break if jira_issues.length.zero?

      jira_issues.each do |jira_issue|
        project = {
          project_id: "#{@user.id}_#{jira_issue.project.id}", key: jira_issue.key,
          issue_id: "#{@user.id}_#{jira_issue.project.id}_#{jira_issue.id}",
          summary: jira_issue.summary, user_id: @user.id
        }
        Issue.upsert(project, unique_by: :issue_id)
      end

      start_at += max_results
    end

    p "Issues synced for user - #{@user.id}"
  rescue => e
    p e.message
    p "Issues not synced for user - #{@user.id}"
  end
end
