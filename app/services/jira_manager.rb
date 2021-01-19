# frozen_string_literal: true

class JiraManager
  def initialize(**params)
    required_keys = %i[username password site]
    unless required_keys.all? { |required_key| params.key? required_key }
      raise ArgumentError, "missing username, password, or site"
    end

    options = {
      username: params[:username],
      password: params[:password],
      site: params[:site],
      context_path: "",
      auth_type: :basic
    }

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
end
