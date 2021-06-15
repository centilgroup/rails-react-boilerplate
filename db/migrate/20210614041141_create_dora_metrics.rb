class CreateDoraMetrics < ActiveRecord::Migration[6.0]
  def change
    create_table :dora_metrics do |t|
      t.json :base_metric
      t.references :board, null: false, foreign_key: true

      t.timestamps
    end
  end
end
