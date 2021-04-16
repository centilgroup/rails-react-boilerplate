class ChangeValuesForMinMaxAndSortableItemsToUser < ActiveRecord::Migration[6.0]
  def up
    User.all.each do |user|
      min_max = user.min_max
      if min_max.present?
        min_max["showVSMSection"] = true
      else
        min_max = {
          "showWIPSection": true, "showGaugeSection": true, "showFocusSection": true,
          "showVPISection": true, "showActivitiesSection": true, "showVSMSection": true
        }
      end
      sortable_items = user.sortable_items
      sortable_items =
        if sortable_items.present?
          user.sortable_items + ["vsm"]
        else
          %w[vpi wip gauge focus activities vsm]
        end

      user.update_columns(min_max: min_max, sortable_items: sortable_items.uniq)
    end
  end

  def down
  end
end
