class CreateJiras < ActiveRecord::Migration[6.0]
  def change
    create_table :jiras do |t|

      t.timestamps
    end
  end
end
