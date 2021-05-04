class AddInitialConfigStepToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :initial_config_step, :integer
  end
end
