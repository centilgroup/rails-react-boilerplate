class AddCreatedToIssue < ActiveRecord::Migration[6.0]
  def change
    add_column :issues, :created, :date
  end
end
