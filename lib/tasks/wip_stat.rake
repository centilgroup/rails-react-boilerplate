namespace :wip_stat do
  desc "Process and Stores daily stat for the work in progress section"
  task daily: :environment do
    Board.all.each do |board|
      issues = Issue.where(project_id: board.project_id, user_id: board.user_id)
      issue_types = issues.distinct.select("issue_type->>'name' as name").map(&:name)

      columns = []
      column_statuses = {}
      column_config = board.column_config.present? ? board.column_config : []
      column_config.each do |config|
        columns << config["name"]
        column_statuses[config["name"]] = config["statuses"].map { |status| status["id"] }
      end

      columns = columns.uniq
      data = {}
      type_data = {}
      columns.each do |column|
        data[column] = issues.where("status->>'id' IN (?)", column_statuses[column]).count
        type_data[column] = {}
        issue_types.each do |issue_type|
          type_data[column][issue_type] = issues.where("status->>'id' IN (?) AND issue_type->>'name' = ?", column_statuses[column], issue_type).count
        end
      end

      next if columns.length.zero?

      board.column_configurations.create(column_config: board.column_config, column_issues_count: data, column_types_count: type_data)
    end
  end

end
