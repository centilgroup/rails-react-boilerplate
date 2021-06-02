class AddColumnTypesCountToColumnConfiguration < ActiveRecord::Migration[6.0]
  def change
    add_column :column_configurations, :column_types_count, :json
  end
end
