json.projects @projects do |project|
  json.project_id project.project_id
  json.key project.key
  json.name project.name
  json.end_date project.end_date.strftime("%d/%m/%Y") if project.end_date.present?
end
json.sortable_items current_user.sortable_items
