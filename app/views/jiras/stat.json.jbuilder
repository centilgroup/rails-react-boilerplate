json.total_backlog @stat[:total_backlog]
json.total_in_progress @stat[:total_in_progress]
json.total_done @stat[:total_done]
json.grand_total @stat[:grand_total]
json.epics @epics do |epic|
  json.key epic.key
  json.epic_name epic.epic_name
  json.status epic.status
  json.issues @issues.where(epic_link: epic.key) do |issue|
    json.key issue.key
    json.status issue.status
  end
end
