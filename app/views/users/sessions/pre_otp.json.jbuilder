unless @user.two_factor_auth.present?
  json.auth_token @auth_token
  json.user do
    json.extract! @user, :id, :email, :two_factor_auth, :first_name,
      :last_name, :username, :company_name, :jira_url, :api_version,
      :jira_username, :jira_password
    json.avatar url_for(@user.avatar) if @user.avatar.present?
  end
end
