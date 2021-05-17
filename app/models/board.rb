class Board < ApplicationRecord
  belongs_to :user

  has_many :column_configurations
end
