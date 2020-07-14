class JirasController < ApplicationController
  before_action :set_jira, only: [:show, :edit, :update, :destroy]

  # GET /jiras
  # GET /jiras.json
  def index
          @jiras = JSON.parse ('{  "projects": 
              [
                  {"project1": 
                      [
                          {
                              "type": "feature",
                              "title": "feature #8",
                              "ticketNumber": 145,
                              "timeMovedToStart": "2020-06-20 24:36:45",
                              "timeMovedToInProgress": "2020-06-21 08:13:20",
                              "timeMovedToDone": "2020-06-21 15:09:01",
                              "assignee": "Josh Hazard",
                              "status": "done"
                          }, 
                          {
                              "type": "debt",
                              "title": "debt #10",
                              "ticketNumber": 82,
                              "timeMovedToStart": "2020-06-19 08:20:15",
                              "timeMovedToInProgress": "2020-06-22 22:56:08",
                              "timeMovedToDone": "2020-06-24 01:44:24",
                              "assignee": "Todd Giammo",
                              "status": "done"
                          } , 
                          {
                              "type": "risk",
                              "title": "risk #3",
                              "ticketNumber": 32,
                              "timeMovedToStart": "2020-06-17 04:04:04",
                              "timeMovedToInProgress": "2020-06-21 10:44:32",
                              "timeMovedToDone": null,
                              "assignee": "Alex Griffith",
                              "status": "inProgress"
                          } ,
                          {
                              "type": "defect",
                              "title": "defect #5",
                              "ticketNumber": 103,
                              "timeMovedToStart": "2020-06-18 09:30:40",
                              "timeMovedToInProgress": "2020-06-20 03:11:33",
                              "timeMovedToDone": null,
                              "assignee": "Alyssa Lundgren",
                              "status": "inReview"
                          },
                          {
                              "type": "defect",
                              "title": "defect #77",
                              "ticketNumber": 122,
                              "timeMovedToStart": "2020-06-17 09:59:55",
                              "timeMovedToInProgress": "2020-06-18 11:47:19",
                              "timeMovedToDone": "2020-06-30 07:18:07",
                              "assignee": "Alyssa Lundgren",
                              "status": "done"
                          } 
                      ]
                  },

                  {"project2": 
                      [
                          {
                              "type": "feature",
                              "title": "feature #81",
                              "ticketNumber": 11,
                              "timeMovedToStart": "2020-06-19 06:27:09",
                              "timeMovedToInProgress": "2020-06-22 06:01:18",
                              "timeMovedToDone": null,
                              "assignee": "JB",
                              "status": "inReview"
                          }, 
                          {
                              "type": "debt",
                              "title": "debt #14",
                              "ticketNumber": 39,
                              "timeMovedToStart": "2020-06-18 11:31:10",
                              "timeMovedToInProgress": "2020-06-20 01:34:52",
                              "timeMovedToDone": null,
                              "assignee": "Daniel Wetteroth",
                              "status": "inProgress"
                          } , 
                          {
                              "type": "risk",
                              "title": "risk #55",
                              "ticketNumber": 14,
                              "timeMovedToStart": "2020-06-16 09:39:13",
                              "timeMovedToInProgress": "2020-06-19 23:59:58",
                              "timeMovedToDone": "2020-06-30 00:24:27",
                              "assignee": "Jason Nelson",
                              "status": "done"
                          } ,
                          {
                              "type": "defect",
                              "title": "defect #34",
                              "ticketNumber": 131,
                              "timeMovedToStart": "2020-06-16 03:07:53",
                              "timeMovedToInProgress": "2020-06-18 19:35:10",
                              "timeMovedToDone": "2020-06-27 19:52:18",
                              "assignee": "Scott Worden",
                              "status": "done"

                          },
                          {
                              "type": "feature",
                              "title": "feature #87",
                              "ticketNumber": 99,
                              "timeMovedToStart": "2020-06-18 22:25:34",
                              "timeMovedToInProgress": null,
                              "timeMovedToDone": null,
                              "assignee": "JB",
                              "status": "toDo"
                          },
                          {
                              "type": "feature",
                              "title": "feature #89",
                              "ticketNumber": 104,
                              "timeMovedToStart": null,
                              "timeMovedToInProgress": null,
                              "timeMovedToDone": null,
                              "assignee": "unassigned",
                              "status": "backlog"
                          }
                      ]
                  }
              ]
          }')
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
        format.html { redirect_to @jira, notice: 'Jira was successfully created.' }
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
        format.html { redirect_to @jira, notice: 'Jira was successfully updated.' }
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
      format.html { redirect_to jiras_url, notice: 'Jira was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_jira
      @jira = Jira.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def jira_params
      params.fetch(:jira, {})
    end
end
