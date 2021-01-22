class CreateIssues < ActiveRecord::Migration[6.0]
  def change
    create_table :issues do |t|
      t.string :user_issue_id, null: false, index: {unique: true}
      t.string :project_id, null: false, index: true
      t.string :issue_id, null: false, index: true
      t.string :key
      t.text :summary
      t.json :status
      t.references :user, null: false, foreign_key: true
    end
  end
end
