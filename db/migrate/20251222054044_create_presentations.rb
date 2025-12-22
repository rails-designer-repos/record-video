class CreatePresentations < ActiveRecord::Migration[8.1]
  def change
    create_table :presentations do |t|
      t.string :title

      t.timestamps
    end
  end
end
