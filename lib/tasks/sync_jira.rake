def init_jira(user)
  JiraManager.new(
    username: user.jira_username,
    password: user.jira_password,
    site: user.jira_url,
    user_id: user.id,
    start_at: 0
  )
end

namespace :sync_jira do
  desc "Jira projects sync"
  task projects: :environment do
    p "Projects sync started"
    User.all.each do |user|
      jira = init_jira(user)
      jira.sync_projects

      p "===================================="
    end
  end

  desc "Jira issues sync"
  task issues: :environment do
    p "Issues sync started"
    User.all.each do |user|
      jira = init_jira(user)
      jira.sync_issues

      p "===================================="
    end
  end

end
