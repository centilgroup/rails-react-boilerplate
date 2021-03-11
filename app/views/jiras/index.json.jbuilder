json.array! @issues do |issue|
  json.id issue.id
  json.key issue.key
  json.status do
    json.name issue.status.name
  end
  json.issue_type do
    json.icon_url issue.fields["issuetype"]["iconUrl"]
    json.name issue.fields["issuetype"]["name"]
  end
  json.summary issue.summary
  json.labels issue.labels
  json.epic_link issue.try(:customfield_10014)
  json.epic_name issue.try(:customfield_10011)
  json.change_log issue.try(:changelog)
  json.created issue.try(:created)
  json.due_date issue.try(:duedate)
end
