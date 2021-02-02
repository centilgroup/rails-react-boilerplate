json.total_backlog @stat[:total_backlog]
json.total_in_progress @stat[:total_in_progress]
json.total_done @stat[:total_done]
json.grand_total @stat[:grand_total]
json.epics @epics, :key, :epic_name
