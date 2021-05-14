class CreateColumnConfigurations < ActiveRecord::Migration[6.0]
  def change
    create_table :column_configurations do |t|
      t.json :column_config
      t.belongs_to :board, foreign_key: true

      t.timestamps
    end
  end
end
