class AddColumnsToIssue < ActiveRecord::Migration[6.0]
  def change
    add_column :issues, :epic_link, :string
    add_column :issues, :epic_name, :string
  end
end
