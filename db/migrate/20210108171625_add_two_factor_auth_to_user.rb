class AddTwoFactorAuthToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :two_factor_auth, :boolean, default: true
  end
end
