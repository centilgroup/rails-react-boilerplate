class JirasController < ApplicationController
  before_action :set_jira, only: [:edit, :update, :destroy]
  before_action :init_jira, only: [:index, :stat]
  before_action :set_jira_client, only: [:show]

  # GET /jiras
  # GET /jiras.json
  def index
    @issues = @jira_manager.fetch_issues
  rescue => error
    render json: {message: error.message}, status: :internal_server_error
  end

  def stat
    @stat = @jira_manager.fetch_gas_gauge_data
    @epics, @epic_issues = @jira_manager.fetch_epics
    @bugs = @jira_manager.fetch_bugs
    @tasks = @jira_manager.fetch_tasks
    @vpi = @jira_manager.fetch_vpi_data
    @boards = @jira_manager.fetch_board_data
    @min_max = current_user.min_max
    @sortable_items = current_user.sortable_items
    @vpi_by_project = @jira_manager.fetch_vpi_by_project
  end

  # GET /jiras/1
  # GET /jiras/1.json
  def show
    @issue = @client.Issue.find(params[:id], {
      expand: "changelog"
    })
  rescue => error
    render json: {message: error.message}, status: :internal_server_error
  end

  # GET /jiras/new
  def new
    @jira = Jira.new
  end

  # GET /jiras/1/edit
  def edit
  end

  # POST /jiras
  # POST /jiras.json
  def create
    @jira = Jira.new(jira_params)

    respond_to do |format|
      if @jira.save
        format.html { redirect_to @jira, notice: "Jira was successfully created." }
        format.json { render :show, status: :created, location: @jira }
      else
        format.html { render :new }
        format.json { render json: @jira.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /jiras/1
  # PATCH/PUT /jiras/1.json
  def update
    respond_to do |format|
      if @jira.update(jira_params)
        format.html { redirect_to @jira, notice: "Jira was successfully updated." }
        format.json { render :show, status: :ok, location: @jira }
      else
        format.html { render :edit }
        format.json { render json: @jira.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /jiras/1
  # DELETE /jiras/1.json
  def destroy
    @jira.destroy
    respond_to do |format|
      format.html { redirect_to jiras_url, notice: "Jira was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

  def set_jira_client
    options = {
      username: current_user.jira_username,
      password: current_user.jira_password,
      site: current_user.jira_url,
      context_path: "",
      auth_type: :basic
    }
    @client = JIRA::Client.new(options)
  end

  def init_jira
    @projects = Project.where(user_id: current_user.id).order(id: :asc)
    project_id = params[:project_id].present? ? params[:project_id] : @projects.first&.project_id

    @jira_manager = JiraManager.new(
      username: current_user.jira_username,
      password: current_user.jira_password,
      site: current_user.jira_url,
      user_id: current_user.id,
      start_at: params[:start_at],
      project_id: project_id
    )
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_jira
    @jira = Jira.find(params[:id])
  end

  # Only allow a list of trusted parameters through.
  def jira_params
    params.fetch(:jira, {})
  end
end
