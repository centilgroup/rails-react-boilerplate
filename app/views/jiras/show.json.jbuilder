json.id @issue.id
json.key @issue.key
json.status do
  json.name @issue.status["name"]
end
json.issue_type do
  json.icon_url @issue.issue_type["iconUrl"]
  json.name @issue.issue_type["name"]
end
json.summary @issue.summary
json.epic_link @issue.epic_link
json.epic_name @issue.epic_name
json.change_log @issue.try(:change_log)
json.created @issue.try(:created)
json.due_date @issue.try(:due_date)
