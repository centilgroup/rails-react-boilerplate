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
    @user = User.find_for_authentication(email: params[:email])
    return invalid_login_attempt unless @user.valid_password?(params[:password])

    return sign_in_user unless @user.two_factor_auth.present?

    otp_code = @user.otp_code
    UserMailer.send_otp_email(params, otp_code).deliver
  end

  # POST /resource/sign_in
  def create
    @user = User.where(email: params[:email]).first
    return invalid_login_attempt if @user&.authenticate_otp(params[:otp], drift: TFA_OTP_VALIDITY).nil?

    sign_in_user
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
  rescue => e
    p e.message
    render json: {message: e.message}, status: :unprocessable_entity
  end

  # PUT /resource/min_max_config
  def min_max_config
    current_user.update(min_max: params[:min_max])
  end

  # PUT /resource/sortable_items_config
  def sortable_items_config
    current_user.update(sortable_items: params[:sortable_items])
  end

  # PUT /resource/sync_projects
  def sync_projects
    jira = init_jira(current_user)
    jira.sync_projects
    @projects = current_user.projects
  rescue => e
    p e.message
    render json: {message: e.message}, status: :internal_server_error
  end

  # PUT /resource/sync_issues
  def sync_issues
    jira = init_jira(current_user)
    jira.sync_issues
  rescue => e
    p e.message
    render json: {message: e.message}, status: :internal_server_error
  end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end

  private

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
    required_keys = %i[issue_id project_id status issue_type issue_key change_log summary due_date created]
    unless required_keys.all? { |required_key| row.to_hash.key? required_key }
      missing_keys = required_keys - row.to_hash.keys.map(&:to_sym)
      message = "Missing #{missing_keys.map(&:to_s).join(", ")}"
      raise ArgumentError, message
    end

    issue = {
      user_issue_id: "#{current_user.id}_#{row["issue_id"]}",
      project_id: row["project_id"], status: {name: row["status"]},
      user_id: current_user.id, issue_type: {name: row["issue_type"]},
      key: row["issue_key"], change_log: row["change_log"]
    }.merge(row.to_hash.slice("issue_id", "summary", "due_date", "created"))

    Issue.upsert(issue, unique_by: :user_issue_id)
  end

  def upsert_board(row)
    required_keys = %i[board_id name board_type project_id column_config]
    unless required_keys.all? { |required_key| row.to_hash.key? required_key }
      missing_keys = required_keys - row.to_hash.keys.map(&:to_sym)
      message = "Missing #{missing_keys.map(&:to_s).join(", ")}"
      raise ArgumentError, message
    end

    board = {
      user_board_id: "#{current_user.id}_#{row["board_id"]}",
      name: row["name"], board_type: row["board_type"],
      user_id: current_user.id, project_id: row["project_id"],
      column_config: row["column_config"]
    }

    Board.upsert(board, unique_by: :user_board_id)
  end

  def upsert_project(row)
    required_keys = %i[project_id key name]
    unless required_keys.all? { |required_key| row.to_hash.key? required_key }
      missing_keys = required_keys - row.to_hash.keys.map(&:to_sym)
      message = "Missing #{missing_keys.map(&:to_s).join(", ")}"
      raise ArgumentError, message
    end

    board = {
      user_project_id: "#{current_user.id}_#{row["project_id"]}",
      name: row["name"], key: row["key"],
      user_id: current_user.id, project_id: row["project_id"]
    }

    Project.upsert(board, unique_by: :user_project_id)
  end

  def user_params
    params.require(:user).permit(
      :email, :password, :first_name, :last_name, :username,
      :company_name, :jira_url, :api_version, :jira_username,
      :jira_password, :two_factor_auth, :avatar, :initial_config
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
      start_at: 0,
      project_id: ""
    )
  end
end
