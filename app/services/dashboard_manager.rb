# frozen_string_literal: true

class DashboardManager
  def initialize(**params)
    required_keys = %i[user_id project_id]
    unless required_keys.all? { |required_key| params.key? required_key }
      missing_keys = required_keys - params.keys
      message = "missing #{missing_keys.map(&:to_s).join(", ")}"
      raise ArgumentError, message
    end

    @user = User.where(id: params[:user_id]).first

    @project =
      Project
        .where(project_id: params[:project_id], user_id: @user.id)
        .order(id: :asc).first

    @start_at = params[:start_at]
  end

  def fetch_issues
    Issue.where(project_id: @project.project_id, user_id: @user.id).limit(10).offset(@start_at)
  end

  def fetch_gas_gauge_data
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    backlog = ["backlog", "to do", "open"]
    in_progress = ["selected for development", "in progress", "review", "qa", "ready for review", "in review"]
    done = %w[done closed]
    work_in_progress = ["selected for development", "in progress"]
    work_in_review = ["review", "qa", "ready for review", "in review"]

    grand_total = issues.count
    total_backlog = issues.where("lower(status->>'name') IN (?)", backlog).count
    total_in_progress = issues.where("lower(status->>'name') IN (?)", in_progress).count
    total_done = issues.where("lower(status->>'name') IN (?)", done).count
    total_work_in_progress = issues.where("lower(status->>'name') IN (?)", work_in_progress).count
    total_work_in_review = issues.where("lower(status->>'name') IN (?)", work_in_review).count

    {
      total_backlog: total_backlog, total_in_progress: total_in_progress,
      total_done: total_done, grand_total: grand_total,
      total_work_in_progress: total_work_in_progress,
      total_work_in_review: total_work_in_review
    }
  end

  def fetch_wip_data(min = 1, max = 30)
    board = Board.where(project_id: @project.project_id, user_id: @user.id).first
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    issue_types = issues.distinct.select("issue_type->>'name' as name").map(&:name)
    columns = []
    max_limit = {}
    column_config = board.column_config.present? ? board.column_config : []
    column_config.each do |config|
      columns << config["name"]
      max_limit[config["name"]] = config["max"]
    end
    configurations = board.column_configurations.order(created_at: :desc).limit(max).offset(min - 1)

    [columns.uniq, max_limit, configurations, issue_types]
  end

  def fetch_dora_metrics(min = 1, max = 30, snap_to = nil, sprint_id = "", version_id = "")
    board = Board.where(project_id: @project.project_id, user_id: @user.id).first
    columns = []
    column_config = board.column_config.present? ? board.column_config : []
    column_config.each do |config|
      columns << config["name"]
    end
    sprints = board.sprints
    versions = @project.versions
    dora_metrics =
      if snap_to == "true" && sprints.present? && sprints["values"]&.length&.positive?
        sprint = sprints["values"].find { |sprint| sprint["id"] == sprint_id.to_i }
        start_date = Date.parse sprint["startDate"]
        end_date = Date.parse sprint["endDate"]
        board
          .dora_metrics.where("created_at >= ? AND created_at <= ?", start_date, end_date)
          .order(created_at: :desc).limit(max).offset(min - 1)
      elsif snap_to == "true" && versions.present? && versions.length.positive?
        version = versions.find { |version| version["id"] == version_id }
        start_date = Date.parse version["startDate"]
        end_date = Date.parse version["releaseDate"]
        board
          .dora_metrics.where("created_at >= ? AND created_at <= ?", start_date, end_date)
          .order(created_at: :desc).limit(max).offset(min - 1)
      else
        board.dora_metrics.order(created_at: :desc).limit(max).offset(min - 1)
      end

    [columns.uniq, dora_metrics, sprints]
  end

  def fetch_vpi_data(project_id = @project.project_id)
    issues = Issue.where(project_id: project_id, user_id: @user.id)
    done = %w[done closed crushed approved]
    remaining_issues = issues.where.not("lower(status->>'name') IN (?)", done)
    done_issues = issues.where("lower(status->>'name') IN (?)", done)
    current_date = Date.today
    max_due_date =
      issues.where.not(due_date: nil).order(due_date: :desc).limit(1)
        .pluck(:due_date).first
    remaining_days =
      if @project_end_date.present?
        (@project_end_date - current_date).to_i
      elsif max_due_date.present?
        (max_due_date - current_date).to_i
      end

    # binding.pry
    average_time_to_close =
      if done_issues.length.positive?
        done_issues.pluck(:time_to_close_in_days).map(&:to_i).sum / done_issues.length
      end

    {
      project_id: project_id,
      remaining_days: remaining_days,
      remaining_issues: remaining_issues.length,
      average_time_to_close: average_time_to_close
    }
  end

  def fetch_vpi_by_project
    projects = Project.where(user_id: @user.id).order(id: :asc)
    vpi_by_project = []
    projects.each do |project|
      @project_end_date = project.end_date
      vpi_by_project << fetch_vpi_data(project.project_id)
    end
    vpi_by_project
  end

  def fetch_epics
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    epics = issues.where("issue_type->>'name' = 'Epic'")
    epic_keys = epics.pluck(:key)
    epic_issues = issues.where(epic_link: epic_keys)
    [epics, epic_issues]
  end

  def fetch_bugs
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    issues.where("issue_type->>'name' = 'Bug'")
  end

  def fetch_tasks
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    issues.where("issue_type->>'name' = 'Task'")
  end

  def fetch_vsm
    issues = Issue.where(project_id: @project.project_id, user_id: @user.id)
    to_do = ["backlog", "to do", "open", "selected for development"]
    wip = ["in progress"]
    qa = ["review", "qa", "ready for review", "in review"]
    done = %w[done closed]
    to_do_lt = []
    wip_lt = []
    qa_lt = []
    done_lt = []
    to_do_pt = []
    wip_pt = []
    qa_pt = []
    done_pt = []
    to_do_c = 0
    to_do_a = 0
    wip_c = 0
    wip_a = 0
    qa_c = 0
    qa_a = 0

    issues.each do |issue|
      to_do_lt_days = 0
      wip_lt_days = 0
      qa_lt_days = 0
      done_lt_days = 0
      to_do_pt_days = 0
      wip_pt_days = 0
      qa_pt_days = 0
      done_pt_days = 0
      begin
        issue.status_transitions.each do |transition|
          from = transition["from_string"].downcase
          to = transition["to_string"].downcase
          to_do_lt_days += transition["lead_time"] if to_do.include? from
          wip_lt_days += transition["lead_time"] if wip.include? from
          qa_lt_days += transition["lead_time"] if qa.include? from
          done_lt_days += transition["lead_time"] if done.include? from
          to_do_pt_days += transition["process_time"] if to_do.include? from
          wip_pt_days += transition["process_time"] if wip.include? from
          qa_pt_days += transition["process_time"] if qa.include? from
          done_pt_days += transition["process_time"] if done.include? from
          to_do_c += 1 if to_do.include?(from) && wip.include?(to)
          to_do_a += 1 if (done + qa + wip).include?(from) && to_do.include?(to)
          wip_c += 1 if wip.include?(from) && qa.include?(to)
          wip_a += 1 if (done + qa).include?(from) && wip.include?(to)
          qa_c += 1 if qa.include?(from) && done.include?(to)
          qa_a += 1 if done.include?(from) && qa.include?(to)
        end
      
      rescue
      end
      
      to_do_lt << to_do_lt_days if to_do_lt_days.positive?
      wip_lt << wip_lt_days if wip_lt_days.positive?
      qa_lt << qa_lt_days if qa_lt_days.positive?
      done_lt << done_lt_days if done_lt_days.positive?
      to_do_pt << to_do_pt_days if to_do_pt_days.positive?
      wip_pt << wip_pt_days if wip_pt_days.positive?
      qa_pt << qa_pt_days if qa_pt_days.positive?
      done_pt << done_pt_days if done_pt_days.positive?
    end

    median_lt_to_do = median(to_do_lt)
    median_lt_wip = median(wip_lt)
    median_lt_qa = median(qa_lt)
    median_lt_done = median(done_lt)

    median_pt_to_do = median(to_do_pt)
    median_pt_wip = median(wip_pt)
    median_pt_qa = median(qa_pt)
    median_pt_done = median(done_pt)

    ca_to_do = percent(to_do_c, to_do_a).round(1)
    ca_wip = percent(wip_c, wip_a).round(1)
    ca_qa = percent(qa_c, qa_a).round(1)

    total_lt = median_lt_to_do + median_lt_wip + median_lt_qa + median_lt_done
    total_pt = median_pt_to_do + median_pt_wip + median_pt_qa + median_pt_done
    activity_ratio =
      if total_lt.positive?
        ((total_pt / total_lt) * 100).round(1)
      end
    rolled_ca =
      if ca_to_do.positive? && ca_wip.positive? && ca_qa.positive?
        (ca_to_do / 100) * (ca_wip / 100) * (ca_qa / 100) * 100
      elsif ca_to_do.positive? && ca_wip.positive? && ca_qa.zero?
        (ca_to_do / 100) * (ca_wip / 100) * 100
      elsif ca_to_do.positive? && ca_wip.zero? && ca_qa.positive?
        (ca_to_do / 100) * (ca_qa / 100) * 100
      elsif ca_to_do.zero? && ca_wip.positive? && ca_qa.positive?
        (ca_wip / 100) * (ca_qa / 100) * 100
      elsif ca_to_do.zero? && ca_wip.zero? && ca_qa.positive?
        ca_qa
      elsif ca_to_do.zero? && ca_wip.positive? && ca_qa.zero?
        ca_wip
      elsif ca_to_do.positive? && ca_wip.zero? && ca_qa.zero?
        ca_to_do
      elsif ca_to_do.zero? && ca_wip.zero? && ca_qa.zero?
        0
      end

    [
      {
        to_do: median_lt_to_do.round(1),
        wip: median_lt_wip.round(1),
        qa: median_lt_qa.round(1),
        done: median_lt_done.round(1)
      },
      {
        to_do: median_pt_to_do.round(1),
        wip: median_pt_wip.round(1),
        qa: median_pt_qa.round(1),
        done: median_pt_done.round(1)
      },
      {
        to_do: ca_to_do,
        wip: ca_wip,
        qa: ca_qa
      },
      {
        total_lt: total_lt.round(1),
        total_pt: total_pt.round(1),
        activity_ratio: activity_ratio,
        rolled_ca: rolled_ca.round(1)
      }
    ]
  end

  private

  def median(array, already_sorted = false)
    return 0 if array.empty?
    array = array.sort unless already_sorted
    m_pos = array.size / 2
    array.size % 2 == 1 ? array[m_pos] : mean(array[m_pos - 1..m_pos])
  end

  def mean(array)
    array.sum / array.size.to_f
  end

  def percent(c, a)
    return 0 if c.zero?

    ((c - a) / c.to_f) * 100
  end
end
