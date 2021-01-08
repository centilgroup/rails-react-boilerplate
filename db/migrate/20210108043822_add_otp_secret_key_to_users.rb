class AddOtpSecretKeyToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :otp_secret_key, :string

    User.find_each { |user| user.update_attribute(:otp_secret_key, User.otp_random_secret) }
  end
end
