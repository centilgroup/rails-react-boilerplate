json.array! @issues do |issue|
  json.id issue.id
  json.key issue.key
  json.summary issue.summary
end
