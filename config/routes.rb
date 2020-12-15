Rails.application.routes.draw do
  resources :jiras
  get 'home/index'
  get 'home/timestamp'
  get '/vpi-demo', to: "vpi_demo#index"
  get '/csv', to: 'vpi_demo#csv'
  root 'home#index'

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
