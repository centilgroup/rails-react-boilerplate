class CreateIssues < ActiveRecord::Migration[6.0]
  def change
    create_table :issues do |t|
      t.string :project_id, null: false, index: true
      t.string :issue_id, null: false, index: {unique: true}
      t.string :key
      t.text :summary
      t.references :user, null: false, foreign_key: true
    end
  end
end
