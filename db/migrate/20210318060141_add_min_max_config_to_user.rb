class AddMinMaxConfigToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :min_max, :json
  end
end
