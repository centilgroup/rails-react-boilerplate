class AddTimeToCloseInDaysToIssue < ActiveRecord::Migration[6.0]
  def change
    add_column :issues, :time_to_close_in_days, :integer
  end
end
