Rails.application.routes.draw do
  devise_for :users, controllers: {
      sessions: 'users/sessions',
      registrations: 'users/registrations',
      passwords: 'users/passwords'
  }
  devise_scope :user do
    post 'users/pre_otp', to: 'users/sessions#pre_otp'
  end

  resources :jiras
  get 'home/index'
  get 'home/timestamp'
  get '/vpi-demo', to: "vpi_demo#index"
  get '/csv', to: 'vpi_demo#csv'
  root 'home#index'

  match '*path', to: 'home#index', via: :all, constraints: ->(req) { req.path !~ /\.(png|jpg|js|css)$/ }

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
