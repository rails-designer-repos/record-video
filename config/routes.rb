Rails.application.routes.draw do
  resources :presentations, only: %w[new create edit update]

  root "presentations#new"
end
