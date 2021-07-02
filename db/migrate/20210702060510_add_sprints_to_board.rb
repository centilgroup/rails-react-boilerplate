class AddSprintsToBoard < ActiveRecord::Migration[6.0]
  def change
    add_column :boards, :sprints, :json
  end
end
