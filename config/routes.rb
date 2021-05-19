Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations",
    passwords: "users/passwords"
  }
  devise_scope :user do
    post "users/pre_otp", to: "users/sessions#pre_otp"
    put "users/update", to: "users/sessions#update"
    put "users/sync_projects", to: "users/sessions#sync_projects"
    put "users/sync_issues", to: "users/sessions#sync_issues"
    put "users/ingest", to: "users/sessions#ingest"
  end

  resources :dashboard do
    collection do
      get :project_flow_health
      get :work_in_progress
      get :status_gauge
      get :activities
      get :focus
      get :value_stream_map
      get :projects_vpi
      get :projects
    end
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
