# frozen_string_literal: true

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

  # PUT /resource/min_max_config
  def min_max_config
    current_user.update(min_max: params[:min_max])
  end

  # PUT /resource/sync_projects
  def sync_projects
    jira = init_jira(current_user)
    jira.sync_projects
    @projects = current_user.projects
  rescue => e
    p e.message
    render json: {error: e.message}, status: :internal_server_error
  end

  # PUT /resource/sync_issues
  def sync_issues
    jira = init_jira(current_user)
    jira.sync_issues
  rescue => e
    p e.message
    render json: {error: e.message}, status: :internal_server_error
  end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end

  private

  def user_params
    params.require(:user).permit(
      :email, :password, :first_name, :last_name, :username,
      :company_name, :jira_url, :api_version, :jira_username,
      :jira_password, :two_factor_auth, :avatar
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
