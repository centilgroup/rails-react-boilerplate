json.extract! current_user, :id, :email, :two_factor_auth, :first_name,
  :last_name, :username, :company_name, :jira_url, :api_version,
  :jira_username, :jira_password, :initial_config, :wip, :gauge, :focus, :vpi,
  :activities, :vsm, :sortable_items, :initial_config_step, :dora
json.avatar url_for(current_user.avatar) if current_user.avatar.present?
