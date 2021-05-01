json.epics @epics do |epic|
  json.issue_id epic.issue_id
  json.key epic.key
  json.epic_name epic.epic_name
  json.status epic.status
end
json.epic_issues @epic_issues do |epic_issue|
  json.key epic_issue.key
  json.epic_link epic_issue.epic_link
  json.status epic_issue.status
end
json.bugs @bugs do |bug|
  json.issue_id bug.issue_id
  json.key bug.key
  json.status bug.status
end
json.tasks @tasks do |task|
  json.issue_id task.issue_id
  json.key task.key
  json.status task.status
end
json.collapsable current_user.focus
