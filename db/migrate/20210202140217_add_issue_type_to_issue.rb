class AddIssueTypeToIssue < ActiveRecord::Migration[6.0]
  def change
    add_column :issues, :issue_type, :json
  end
end
