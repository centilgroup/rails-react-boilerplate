json.array! @issues do |issue|
  json.key issue.key
  json.summary issue.summary
end
