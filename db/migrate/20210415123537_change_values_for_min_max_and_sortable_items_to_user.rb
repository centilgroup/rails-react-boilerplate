class ChangeValuesForMinMaxAndSortableItemsToUser < ActiveRecord::Migration[6.0]
  def up
    User.all.each do |user|
      min_max = user.min_max
      min_max["showVSMSection"] = true
      sortable_items = user.sortable_items + ['vsm']
      user.update_columns(min_max: min_max, sortable_items: sortable_items)
    end
  end

  def down
  end
end
