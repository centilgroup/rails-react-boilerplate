class AddDueDateToIssue < ActiveRecord::Migration[6.0]
  def change
    add_column :issues, :due_date, :date
  end
end
