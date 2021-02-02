class JirasController < ApplicationController
  before_action :set_jira, only: [:show, :edit, :update, :destroy]
  before_action :init_jira, only: [:index, :stat]

  # GET /jiras
  # GET /jiras.json
  def index
    @issues = @jira_manager.fetch_issues
  rescue => error
    render json: {message: error.message}, status: :internal_server_error
  end

  def stat
    @stat = @jira_manager.fetch_gas_gauge_data
    @epics = @jira_manager.fetch_epics
    epic_keys = @epics.pluck(:key)
    @issues = Issue.where(project_id: "10015", user_id: current_user.id, epic_link: epic_keys)
  end

  # GET /jiras/1
  # GET /jiras/1.json
  def show
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

  def init_jira
    @jira_manager = JiraManager.new(
      username: current_user.jira_username,
      password: current_user.jira_password,
      site: current_user.jira_url,
      user_id: current_user.id,
      start_at: params[:start_at]
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
