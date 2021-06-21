class Board < ApplicationRecord
  belongs_to :user

  has_many :column_configurations
  has_many :dora_metrics
end
