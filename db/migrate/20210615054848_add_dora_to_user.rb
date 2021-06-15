class AddDoraToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :dora, :boolean
  end
end
