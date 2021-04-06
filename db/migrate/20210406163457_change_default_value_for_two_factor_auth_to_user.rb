class ChangeDefaultValueForTwoFactorAuthToUser < ActiveRecord::Migration[6.0]
  def up
    change_column_default :users, :two_factor_auth, false

    User.update_all(two_factor_auth: false)
  end

  def down
  end
end
