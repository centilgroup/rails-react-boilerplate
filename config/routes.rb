Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations",
    passwords: "users/passwords"
  }
  devise_scope :user do
    post "users/pre_otp", to: "users/sessions#pre_otp"
    put "users/profile", to: "users/sessions#profile"
    put "users/sync_projects", to: "users/sessions#sync_projects"
    put "users/sync_issues", to: "users/sessions#sync_issues"
    put "users/min_max_config", to: "users/sessions#min_max_config"
    put "users/sortable_items_config", to: "users/sessions#sortable_items_config"
    put "users/ingest", to: "users/sessions#ingest"
  end

  resources :jiras do
    collection do
      get :stat
    end
  end
  get "home/index"
  get "home/timestamp"
  get "/csv", to: "vpi_demo#csv"
  root "home#index"

  match "*path", to: "home#index", via: :all, constraints: ->(req) { req.path.downcase !~ /\.(png|jpg|gif|svg)$/ }

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
