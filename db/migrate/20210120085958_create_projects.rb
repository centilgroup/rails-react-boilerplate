class CreateProjects < ActiveRecord::Migration[6.0]
  def change
    create_table :projects do |t|
      t.string :project_id, null: false, index: {unique: true}
      t.string :key
      t.string :name
      t.references :user, null: false, foreign_key: true
    end
  end
end
