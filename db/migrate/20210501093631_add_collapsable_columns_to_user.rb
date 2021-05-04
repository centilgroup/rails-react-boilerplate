class AddCollapsableColumnsToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :wip, :boolean
    add_column :users, :gauge, :boolean
    add_column :users, :focus, :boolean
    add_column :users, :vpi, :boolean
    add_column :users, :activities, :boolean
    add_column :users, :vsm, :boolean
  end
end
