# frozen_string_literal: true

require "csv"

class Users::SessionsController < Devise::SessionsController
  respond_to :json

  skip_before_action :verify_authenticity_token
  # before_action :configure_sign_in_params, only: [:create]

  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /resource/pre_otp
  def pre_otp
    return invalid_login_attempt unless params[:email].present?

    set_user
    return invalid_login_attempt unless @user.valid_password?(params[:password])

    return sign_in_user unless @user.two_factor_auth.present?

    otp_code = @user.otp_code
    UserMailer.send_otp_email(params, otp_code).deliver
  rescue => error
    render json: {message: error.message}, status: :unprocessable_entity
  end

  # POST /resource/sign_in
  def create
    return invalid_login_attempt unless params[:email].present?

    set_user
    return invalid_login_attempt if @user&.authenticate_otp(params[:otp], drift: TFA_OTP_VALIDITY).nil?

    sign_in_user
  end

  # PUT /resource/update
  def update
    current_user.update!(user_params)
    current_user.avatar.attach(params[:user][:avatar]) if params[:user][:avatar].present?
  rescue => error
    render json: {message: error.message}, status: :unprocessable_entity
  end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  # PUT /resource/profile
  def profile
    current_user.update(user_params)
    current_user.avatar.attach(params[:user][:avatar]) if params[:user][:avatar].present?
  end

  # PUT /resource/ingest
  def ingest
    csv_text = File.read(ingest_data)
    converter = lambda { |header| header.downcase.split.join("_") }
    csv = CSV.parse(csv_text, headers: true, header_converters: converter)

    csv.each(&method(:upsert_issue)) if params[:user][:issues_ingest].present?
    csv.each(&method(:upsert_board)) if params[:user][:boards_ingest].present?
    csv.each(&method(:upsert_project)) if params[:user][:projects_ingest].present?

    raise StandardError, "File can't be blank" if csv.length.zero?

    current_user.update(user_params)
  rescue => e
    p e.message
    render json: {message: e.message}, status: :unprocessable_entity
  end

  # PUT /resource/sync_projects
  def sync_projects
    jira = init_jira(current_user)
    jira.sync_projects
    @projects = current_user.projects
    current_user.update(user_params) if params[:user].present?
  rescue => e
    p e.message
    render json: {message: e.message}, status: :unprocessable_entity
  end

  # PUT /resource/sync_issues
  def sync_issues
    jira = init_jira(current_user)
    jira.sync_issues
  rescue => e
    p e.message
    render json: {message: e.message}, status: :unprocessable_entity
  end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end

  private

  def set_user
    @user = User.where(["lower(username) = :value OR lower(email) = :value", {value: params[:email].downcase}]).first
  end

  def ingest_data
    if params[:user][:issues_ingest].present?
      params[:user][:issues_ingest]
    elsif params[:user][:boards_ingest].present?
      params[:user][:boards_ingest]
    elsif params[:user][:projects_ingest].present?
      params[:user][:projects_ingest]
    end
  end

  def upsert_issue(row)
    required_keys = %w[issue_id project_id status issue_type issue_key change_log summary due_date created]
    unless required_keys.all? { |required_key| row.to_hash.key? required_key }
      missing_keys = required_keys - row.to_hash.keys
      message = "Missing #{missing_keys.join(", ")}"
      raise ArgumentError, message
    end
    
    issue = {
    
      user_issue_id:  "#{current_user.id}_#{row["issue_id"]}",
      project_id:     row["project_id"], 
      status:         JSON.parse(row["status"].to_json),
      user_id:        current_user.id, 
      issue_type:     JSON.parse(row["issue_type"].to_json),
      key:            row["issue_key"], 
      change_log:     row["change_log"].nil? ? '' : JSON.parse(row["change_log"].to_json)
    
    }.merge(row.to_hash.slice("issue_id", "summary", "due_date", "created"))
    # binding.pry
    begin
      issue = issue.merge(
        time_to_close_in_days: time_to_close_in_days(issue),
        status_transitions: status_transitions(issue)
      )
    rescue

    end

    Issue.upsert(issue, unique_by: :user_issue_id)
  end

  def upsert_board(row)
    required_keys = %w[board_id name board_type project_id column_config]
    unless required_keys.all? { |required_key| row.to_hash.key? required_key }
      missing_keys = required_keys - row.to_hash.keys
      message = "Missing #{missing_keys.join(", ")}"
      raise ArgumentError, message
    end

    board = {
      user_board_id: "#{current_user.id}_#{row["board_id"]}",
      name: row["name"], board_type: row["board_type"],
      user_id: current_user.id, project_id: row["project_id"],
      column_config: JSON.parse(row["column_config"]), board_id: row["board_id"]
    }

    Board.upsert(board, unique_by: :user_board_id)
  end

  def upsert_project(row)
    required_keys = %w[project_id key name]
    unless required_keys.all? { |required_key| row.to_hash.key? required_key }
      missing_keys = required_keys - row.to_hash.keys
      message = "Missing #{missing_keys.join(", ")}"
      raise ArgumentError, message
    end

    project = {
      user_project_id: "#{current_user.id}_#{row["project_id"]}",
      name: row["name"], key: row["key"],
      user_id: current_user.id, project_id: row["project_id"]
    }

    Project.upsert(project, unique_by: :user_project_id)
  end

  def user_params
    params.require(:user).permit(
      :email, :password, :first_name, :last_name, :username,
      :company_name, :jira_url, :api_version, :jira_username,
      :jira_password, :two_factor_auth, :avatar, :initial_config,
      :wip, :gauge, :focus, :vpi, :activities, :vsm, :initial_config_step, :dora,
      sortable_items: []
    )
  end

  def sign_in_user
    @auth_token = encode(user_id: @user.id)
    sign_in :user, @user
  end

  def invalid_login_attempt
    warden.custom_failure!
    render json: {error: "invalid login attempt"}, status: :unprocessable_entity
  end

  def encode(payload, exp = 1.month.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, Rails.application.secrets.secret_key_base)
  end

  def init_jira(user)
    JiraManager.new(
      username: user.jira_username,
      password: user.jira_password,
      site: user.jira_url,
      user_id: user.id,
      start_at: 0
    )
  end

  def time_to_close_in_days(issue)
    change_log = issue[:change_log]
    histories = change_log["histories"]
    issue_created_at = Date.parse issue["created"]
    current_status = issue[:status]["name"].downcase
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
    change_log = issue[:change_log]
    histories = change_log["histories"]
    offset_time = Time.parse issue["created"]

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
