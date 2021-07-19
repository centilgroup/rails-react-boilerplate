class AddVersionsToProject < ActiveRecord::Migration[6.0]
  def change
    add_column :projects, :versions, :json
  end
end
