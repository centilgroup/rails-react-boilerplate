class DashboardController < ApplicationController
  skip_before_action :verify_authenticity_token, only: :update

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

  def dora_metrics
    @columns, @dora_metrics, @sprints =
      if filters_applied?
        @manager.fetch_dora_metrics(params[:min].to_i, params[:max].to_i, params[:snap_to], params[:sprint], params[:version])
      else
        @manager.fetch_dora_metrics
      end
    @versions = current_user.projects.where(project_id: params[:project_id]).first.versions
  end

  def projects_vpi
    @vpi_by_project = @manager.fetch_vpi_by_project
  end

  def projects
    @projects = current_user.projects.order(id: :asc)
  end

  def show
    @issue = current_user.issues.where(issue_id: params[:id]).first
  end

  def update
    @project = current_user.projects.where(project_id: params[:id]).first
    @project.update(end_date: params[:end_date])
    @projects = current_user.projects.order(id: :asc)
  end

  private

  def filters_applied?
    params[:min].present? && params[:max].present? && params[:snap_to].present? && (params[:sprint].present? || params[:version].present?)
  end

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
