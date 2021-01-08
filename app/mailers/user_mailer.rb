class UserMailer < ActionMailer::Base
  def send_otp_email(params, otp)
    @email = params[:email]
    @otp = otp

    mail(
      from: 'CENTIL <info@centil.co>',
      to: @email,
      subject: 'OTP - CENTIL'
    )
  end
end
