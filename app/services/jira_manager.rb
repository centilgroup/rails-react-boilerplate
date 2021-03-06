# frozen_string_literal: true

require "net/http"
require "uri"

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

    @start_at = params[:start_at]
    @username = params[:username]
    @password = params[:password]
    @site = params[:site]
  end

  def sync_projects
    jira_projects = @client.Project.all
    jira_boards = @client.Board.all




    jira_boards.each do |jira_board|
      config = jira_board.configuration
      next if config.try(:location).nil?
      p config


      board = {
        user_board_id: "#{@user.id}_#{config.id}",
        board_id: config.id, name: config.name,
        board_type: config.type, project_id: config.location["id"],
        user_id: @user.id, column_config: config.columnConfig["columns"]
      }
      Board.upsert(board, unique_by: :user_board_id)
    end

    jira_projects.each do |jira_project|
      uri = URI.parse("#{@site}rest/api/3/project/#{jira_project.id}/versions")
      request = Net::HTTP::Get.new(uri)
      request.basic_auth(@username, @password)
      request["Accept"] = "application/json"

      req_options = {
        use_ssl: uri.scheme == "https"
      }

      response = Net::HTTP.start(uri.hostname, uri.port, req_options) { |http|
        http.request(request)
      }

      versions = JSON.parse(response.body)

      project = {
        user_project_id: "#{@user.id}_#{jira_project.id}",
        project_id: jira_project.id, name: jira_project.name,
        user_id: @user.id, key: jira_project.key, versions: versions
      }

      Project.upsert(project, unique_by: :user_project_id)
    rescue => e
      p e
    end

    jira_boards.each do |jira_board|
      sprints = @client.Agile.get_sprints(jira_board.id)
      Board.find(jira_board.id).update_column(:sprints, sprints)
    rescue => e
      p e
    end
  end

  def sync_issues

    start_at = 0
    max_results = 150
    jira_projects = []

    jira_projects << @client.Project.find('SPAC')


    jira_projects.each do |jira_project|

      p "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$"
      p jira_project
      p "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"



      loop do
        query_options = {
          start_at: start_at,
          max_results: max_results,
          expand: "changelog"
        }



        jira_issues = @client.Issue.jql('PROJECT = "' + jira_project.name + '" ', query_options)
        puts "LOAD  #{jira_project.name}************************************"


        break if jira_issues.length.zero?




        jira_issues.each do |jira_issue|

          puts "UPSERT!!! ************************************"


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

    end


  end

  private

  def time_to_close_in_days(issue)
    change_log = issue.try(:changelog)
    histories = change_log["histories"]
    issue_created_at = Date.parse issue.try(:created)
    current_status = issue.status.name.downcase
    return unless %w[done closed crushed approved].include? current_status

    histories.reverse_each do |history|
      item = history["items"].first
      if %w[status resolution].include?(item["field"]) && item["fieldtype"] == "jira"
        status = history["items"].last["toString"].downcase
        if %w[done closed crushed approved].include? status
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
end
