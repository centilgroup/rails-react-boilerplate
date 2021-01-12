class AddColumnsToUser < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :first_name, :string
    add_column :users, :last_name, :string
    add_column :users, :username, :string
    add_column :users, :company_name, :string
    add_column :users, :jira_url, :string
    add_column :users, :api_version, :string
    add_column :users, :jira_username, :string
    add_column :users, :jira_password, :string
  end
end
