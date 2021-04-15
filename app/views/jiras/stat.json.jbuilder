json.total_backlog @stat[:total_backlog]
json.total_in_progress @stat[:total_in_progress]
json.total_done @stat[:total_done]
json.grand_total @stat[:grand_total]
json.total_work_in_progress @stat[:total_work_in_progress]
json.total_work_in_review @stat[:total_work_in_review]
json.remaining_days @vpi[:remaining_days]
json.remaining_issues @vpi[:remaining_issues]
json.average_time_to_close @vpi[:average_time_to_close]
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
json.projects @projects do |project|
  json.project_id project.project_id
  json.key project.key
  json.name project.name
end
json.boards @boards do |board|
  json.board_id board.board_id
  json.name board.name
  json.column_config board.column_config
end
json.min_max @min_max
json.sortable_items @sortable_items
json.vpi_by_project @vpi_by_project
json.lead_time @lead_time
json.process_time @process_time
