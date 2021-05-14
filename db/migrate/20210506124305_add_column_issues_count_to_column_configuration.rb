class AddColumnIssuesCountToColumnConfiguration < ActiveRecord::Migration[6.0]
  def change
    add_column :column_configurations, :column_issues_count, :json
  end
end
