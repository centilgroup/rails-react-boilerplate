json.total_backlog @stat[:total_backlog]
json.total_in_progress @stat[:total_in_progress]
json.total_done @stat[:total_done]
json.grand_total @stat[:grand_total]
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
json.projects @projects do |project|
  json.project_id project.project_id
  json.key project.key
  json.name project.name
end
