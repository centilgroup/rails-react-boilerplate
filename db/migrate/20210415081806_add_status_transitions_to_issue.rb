class AddStatusTransitionsToIssue < ActiveRecord::Migration[6.0]
  def change
    add_column :issues, :status_transitions, :json
  end
end
