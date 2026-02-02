Rails.application.routes.draw do
  resources :presentations, only: %w[index new create edit update]

  root "presentations#index"
end
