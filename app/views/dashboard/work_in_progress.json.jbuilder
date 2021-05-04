json.boards @boards do |board|
  json.board_id board.board_id
  json.name board.name
  json.column_config board.column_config
end
json.total_backlog @wip[:total_backlog]
json.total_work_in_progress @wip[:total_work_in_progress]
json.total_work_in_review @wip[:total_work_in_review]
json.collapsable current_user.wip
