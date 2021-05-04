json.projects @projects do |project|
  json.project_id project.project_id
  json.key project.key
  json.name project.name
end
json.sortable_items current_user.sortable_items
