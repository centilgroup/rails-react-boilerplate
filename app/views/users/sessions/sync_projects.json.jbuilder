json.projects @projects do |project|
  json.project_id project.project_id
  json.key project.key
  json.name project.name
end
