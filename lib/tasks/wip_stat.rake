namespace :wip_stat do
  desc "Process and Stores daily stat for the work in progress section"
  task daily: :environment do
    Board.all.each do |board|
      issues = Issue.where(project_id: board.project_id, user_id: board.user_id)

      columns = []
      column_statuses = {}
      board.column_config&.each do |config|
        columns << config["name"]
        column_statuses[config["name"]] = config["statuses"].map { |status| status["id"] }
      end

      columns = columns.uniq
      data = {}
      columns.each do |column|
        data[column] = issues.where("status->>'id' IN (?)", column_statuses[column]).count
      end

      board.column_configurations.create(column_config: board.column_config, column_issues_count: data)
    end
  end

end
