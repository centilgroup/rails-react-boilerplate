namespace :dora_metrics do
  desc "Process and Stores DORA Metrics daily"
  task daily: :environment do
    Board.all.each do |board|
      issues = Issue.where(project_id: board.project_id, user_id: board.user_id)
      done_issues = issues.where("status->>'name' LIKE 'Done%'")
      current_issues = issues.where.not("status->>'name' LIKE 'Done%'")

      columns = []
      column_statuses = {}
      column_config = board.column_config.present? ? board.column_config : []
      column_config.each do |config|
        columns << config["name"]
        column_statuses[config["name"]] = config["statuses"].map { |status| status["id"] }
      end

      columns = columns.uniq
      data = {}
      columns.each do |column|
        next if column == "Done"

        lead_times = []
        done_issues.each do |done_issue|
          done_time = nil
          start_time = nil
          change_log = done_issue.try(:change_log)
          next if change_log.nil?

          histories = change_log["histories"]
          histories.reverse_each do |history|
            item = history["items"].first
            if item["field"] == "resolution" && item["fieldtype"] == "jira" && item["toString"].present?
              status = item["toString"].downcase
              done_time = Date.parse history["created"] if status == "done"
            end

            item = history["items"].last
            if item["field"] == "status" && item["fieldtype"] == "jira" && column_statuses[column].include?(item["from"])
              start_time = Date.parse history["created"]
            end
          end
          lead_times << (done_time - start_time) / 1.day if done_time.present? && start_time.present?
        end
        data[column] = lead_times.sum / lead_times.size.to_f if lead_times.size.positive?
      end

      deploy_data = {day: 0, week: 0, month: 0, year: 0}
      done_issues.each do |done_issue|
        change_log = done_issue.try(:change_log)
        next if change_log.nil?

        histories = change_log["histories"]
        histories.reverse_each do |history|
          item = history["items"].first
          if item["field"] == "resolution" && item["fieldtype"] == "jira" && item["toString"].present?
            status = item["toString"].downcase
            if status == "done"
              done_time = Date.parse history["created"]
              week_start = Date.today.at_beginning_of_week
              month_start = Date.today.beginning_of_month
              year_start = Date.today.beginning_of_year
              today = Date.today
              deploy_data[:day] += 1 if done_time.today?
              deploy_data[:week] += 1 if done_time.between?(week_start, today)
              deploy_data[:month] += 1 if done_time.between?(month_start, today)
              deploy_data[:year] += 1 if done_time.between?(year_start, today)
            end
          end
        end
      end

      reopened_issues = 0
      current_issues.each do |current_issue|
        change_log = current_issue.try(:change_log)
        next if change_log.nil?

        histories = change_log["histories"]
        histories.reverse_each do |history|
          item = history["items"].first
          if item["field"] == "resolution" && item["fieldtype"] == "jira" && item["fromString"].present?
            status = item["fromString"].downcase
            reopened_issues += 1 if status == "done"
          end
        end
      end

      board.dora_metrics.create(
        base_metric: {avg_lead_time: data, deploy_freq: deploy_data, fail_change: reopened_issues}
      )
    end
  end

end
