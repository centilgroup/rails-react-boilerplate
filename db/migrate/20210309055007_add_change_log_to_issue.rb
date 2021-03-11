class AddChangeLogToIssue < ActiveRecord::Migration[6.0]
  def change
    add_column :issues, :change_log, :json
  end
end
