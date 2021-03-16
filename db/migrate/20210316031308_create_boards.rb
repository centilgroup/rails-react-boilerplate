class CreateBoards < ActiveRecord::Migration[6.0]
  def change
    create_table :boards do |t|
      t.string :board_id, null: false, index: true
      t.string :name
      t.string :board_type
      t.string :project_id, null: false, index: true
      t.json :column_config
      t.references :user, null: false, foreign_key: true
      t.string :user_board_id, null: false, index: {unique: true}
    end
  end
end
