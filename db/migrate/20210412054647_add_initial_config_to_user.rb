class AddInitialConfigToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :initial_config, :boolean
  end
end
