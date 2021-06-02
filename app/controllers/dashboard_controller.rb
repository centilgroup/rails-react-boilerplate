class DashboardController < ApplicationController
  before_action :init_manager, except: %i[projects show]

  def project_flow_health
    @vpi = @manager.fetch_vpi_data
  end

  def work_in_progress
    @columns, @limit, @wip, @issue_types =
      if params[:min].present? && params[:max].present?
        @manager.fetch_wip_data(params[:min].to_i, params[:max].to_i)
      else
        @manager.fetch_wip_data
      end
  end

  def status_gauge
    @gauge = @manager.fetch_gas_gauge_data
  end

  def activities
    @issues = @manager.fetch_issues
  end

  def focus
    @epics, @epic_issues = @manager.fetch_epics
    @bugs = @manager.fetch_bugs
    @tasks = @manager.fetch_tasks
  end

  def value_stream_map
    @lead_time, @process_time, @percent_c_a, @total = @manager.fetch_vsm
  end

  def projects_vpi
    @vpi_by_project = @manager.fetch_vpi_by_project
  end

  def projects
    @projects = Project.where(user_id: current_user.id).order(id: :asc)
  end

  def show
    @issue = Issue.where(issue_id: params[:id]).first
  end

  private

  def init_manager
    @projects = Project.where(user_id: current_user.id).order(id: :asc)
    project_id = params[:project_id].present? ? params[:project_id] : @projects.first&.project_id

    @manager = DashboardManager.new(
      user_id: current_user.id,
      start_at: params[:start_at],
      project_id: project_id
    )
  end
end
