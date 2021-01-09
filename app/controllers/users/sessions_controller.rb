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

  # PATCH /resource/tfa
  def tfa
    current_user.update_attribute(:two_factor_auth, params[:two_factor_auth])
  end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end

  private

  def sign_in_user
    auth_token = encode(user_id: @user.id)
    sign_in :user, @user

    render json: { user: @user, auth_token: auth_token }
  end

  def invalid_login_attempt
    warden.custom_failure!
    render json: { error: 'invalid login attempt' }, status: :unprocessable_entity
  end

  def encode(payload, exp = 1.month.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, Rails.application.secrets.secret_key_base)
  end
end
