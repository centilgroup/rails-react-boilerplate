class AddSortableItemsToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :sortable_items, :json
  end
end
