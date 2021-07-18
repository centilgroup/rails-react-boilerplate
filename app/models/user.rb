class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_one_time_password column_name: :otp_secret_key, length: 6

  has_one_attached :avatar

  has_many :projects
  has_many :issues

  validates :username, uniqueness: {case_sensitive: false}, allow_nil: true
end
