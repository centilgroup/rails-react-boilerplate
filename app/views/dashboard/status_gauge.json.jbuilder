json.total_backlog @gauge[:total_backlog]
json.total_in_progress @gauge[:total_in_progress]
json.total_done @gauge[:total_done]
json.grand_total @gauge[:grand_total]
json.total_work_in_progress @gauge[:total_work_in_progress]
json.total_work_in_review @gauge[:total_work_in_review]
json.collapsable current_user.gauge
