import React, { Component } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labels: ['features', 'risks', 'debt', 'defect'],

      backgroundColor: ['#2477B6', '#CAF0F8', '#48B4D9', '#90E1F0'],
      hoverColor: ['#07165E'],
      borderColor: ['#2477B6', '#CAF0F8', '#48B4D9', '#90E1F0'],

      velocityData: [],
      closeData: [],
    };
  };

  calculateLoad = () => {
    const info = this.props.projectData[0];
    const featureCount = this.filterByType('feature', info);
    const riskCount = this.filterByType('risk', info);
    const debtCount = this.filterByType('debt', info);
    const defectCount = this.filterByType('defect', info);
    const featuresInProgress = this.filterbyStatus(featureCount, 'inProgress');
    const risksInProgress = this.filterbyStatus(riskCount, 'inProgress');
    const debtsInProgress = this.filterbyStatus(debtCount, 'inProgress');
    const defectsInProgress = this.filterbyStatus(defectCount, 'inProgress');
    const featuresInReview = this.filterbyStatus(featureCount, 'inReview');
    const risksInReview = this.filterbyStatus(riskCount, 'inReview');
    const debtsInReview = this.filterbyStatus(debtCount, 'inReview');
    const defectsInReview = this.filterbyStatus(defectCount, 'inReview');
    const features = featuresInProgress.length + featuresInReview.length;
    const risks = risksInProgress.length + risksInReview.length;
    const debts = debtsInProgress.length + debtsInReview.length;
    const defects = defectsInProgress.length + defectsInReview.length;
    let answer = [features, risks, debts, defects];
    return answer;
  };

  calculateVelocity = () => {
    const info = this.props.projectData[0];
    const featuresDone = this.filterByTypeAndDoneStatus('feature', info);
    const risksDone = this.filterByTypeAndDoneStatus('risk', info);
    const debtsDone = this.filterByTypeAndDoneStatus('debt', info);
    const defectsDone = this.filterByTypeAndDoneStatus('defect', info);
    let answer = [
      featuresDone.length,
      risksDone.length,
      debtsDone.length,
      defectsDone.length,
    ];
    this.setState({ velocityData: answer });
  };

  filterByTypeAndDoneStatus = (typeOfWork, tickets) => {
    const typeFiltered = tickets.filter((item) => item.type == typeOfWork);
    const statusFiltered = typeFiltered.filter((item) => item.status == 'done');
    return statusFiltered;
  };

  filterByType = (typeOfWork, tickets) => {
    const answer = tickets.filter((item) => item.type == typeOfWork);
    return answer;
  };

  filterbyStatus = (tickets, statusLevel) => {
    const statusFiltered = tickets.filter((item) => item.status == statusLevel);
    return statusFiltered;
  };

  calculateWorkTime = () => {
    const info = this.props.projectData[0];
    const featuresDone = this.filterByTypeAndDoneStatus('feature', info);
    const risksDone = this.filterByTypeAndDoneStatus('risk', info);
    const debtsDone = this.filterByTypeAndDoneStatus('debt', info);
    const defectsDone = this.filterByTypeAndDoneStatus('defect', info);

    const featureTimes = this.parseDates(featuresDone);
    const riskTimes = this.parseDates(risksDone);
    const debtTimes = this.parseDates(debtsDone);
    const defectTimes = this.parseDates(defectsDone);

    const featuresCloseTime = this.calculateAverageCloseTime(featureTimes);
    const risksCloseTime = this.calculateAverageCloseTime(riskTimes);
    const debtsCloseTime = this.calculateAverageCloseTime(debtTimes);
    const defectsCloseTime = this.calculateAverageCloseTime(defectTimes);
    let answer = [
      featuresCloseTime,
      risksCloseTime,
      debtsCloseTime,
      defectsCloseTime,
    ];
    this.setState({ closeData: answer });
  };

  parseDates = (tickets) => {
    const answer = tickets.map((ticket) => {
      return {
        timeMovedToStart: new Date(ticket.timeMovedToStart),
        timeMovedToDone: new Date(ticket.timeMovedToDone),
      };
    });
    return answer;
  };

  calculateAverageCloseTime = (tickets) => {
    const times = tickets.map((ticket) => this.calculateTimeDifference(ticket));
    const ticketTotal = times.reduce((total, ticketTime) => {
      return (total += ticketTime);
    }, 0);
    const average = ticketTotal / tickets.length;
    const answer = this.convertToDays(average);
    return answer;
  };

  calculateTimeDifference = (ticket) => {
    let diffInSeconds =
      Math.abs(ticket.timeMovedToDone - ticket.timeMovedToStart) / 1000;
    return diffInSeconds;
  };

  convertToDays = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    return days;
  };

  calculateDistribution = () => {
    const info = this.props.projectData[0];
    const features = this.filterByType('feature', info);
    const risks = this.filterByType('risk', info);
    const debts = this.filterByType('debt', info);
    const defects = this.filterByType('defect', info);
    let answer = [features.length, risks.length, debts.length, defects.length];
    return answer;
  };

  componentDidMount = () => {
    this.calculateVelocity();
    this.calculateWorkTime();
  };

  render() {
    const loadChart = {
      labels: this.state.labels,
      datasets: [
        {
          backgroundColor: this.state.backgroundColor,
          hoverColor: this.state.hoverColor,
          borderColor: this.state.borderColor,
          borderWidth: 2,
          data: this.calculateLoad(),
        },
      ],
    };

    const distributionChart = {
      labels: this.state.labels,
      datasets: [
        {
          label: 'Distribution',
          backgroundColor: this.state.backgroundColor,
          hoverColor: this.state.hoverColor,
          borderColor: this.state.borderColor,
          borderWidth: 2,
          data: this.calculateDistribution(),
        },
      ],
    };

    return (



      <section>
        <div className="row">
          <div className="col-md-1 sidenav" >
            <h3 className="">
              Euphoria v.1
            </h3>
            <hr />
            <div className="side-group">
              <label>Project</label>
              <br />
              <select className="main-select">
                <option>-</option>
                <option></option>
              </select>
              <br />
              <label>Team</label>
              <br />
              <select className="main-select">
                <option>-</option>
                <option></option>
              </select>
              <br />
              <label>Lead Times</label>
              <br />
              <select className="main-select">
                <option>-</option>
                <option></option>
              </select>
              <br />
              <hr />
              <h5>Quick Links</h5>
              <ul>
                <li>Jira</li>
                <li>Confluence</li>
                <li>CI/CD</li>
                <li>Bamboo</li>

              </ul>



            </div>

          </div>
          <div className="col-md-11">
            <div className="row">
              <div className="col-md-2">
                <h2 className="dash-header">MGMT Main Board </h2> (Last updated: 12/11/2020 12:00 MST - With VSM)
              </div>
              <div className="col-md-8">

              </div>
              <div className="col-md-2">
                <div className="vpi-tile">
                  <span className="vpi-h5">VPI: 1.5 </span>
                  <i className="fa fa-question-circle-o" aria-hidden="true"></i>
                </div>
              </div>
            </div>
            <div className="row top-tile-row">
              <div className="col-md-3">
                <div className="top-tile">
                  <h5>Development</h5>
                  <span className="question-icon">
                    <i className="fa fa-question-circle-o" aria-hidden="true"></i>
                  </span>
                  <span className="menu-icon">
                    <i className="fa fa-bars" aria-hidden="true"></i>
                  </span>
                  <div className="chartjs-wrapper">
                    <canvas className="chartjs-gauge"></canvas>
                  </div>
                  <div className="tile-bottom row">
                    <div className="col-md-4">
                      WIP: 12
                    </div>
                    <div className="col-md-5">
                      Avg. Lead Time: 2.4 days
                    </div>
                    <div className="col-md-3">
                      %C/A: 68%
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="top-tile">
                  <h5>QA/Test</h5>
                  <span className="question-icon">
                    <i className="fa fa-question-circle-o" aria-hidden="true"></i>
                  </span>
                  <span className="menu-icon">
                    <i className="fa fa-bars" aria-hidden="true"></i>
                  </span>
                  <div className="chartjs-wrapper">
                    <canvas className="chartjs-gauge2"></canvas>
                  </div>
                  <div className="tile-bottom row">
                    <div className="col-md-4">
                      WIP: 6
                    </div>
                    <div className="col-md-5">
                      Avg. Lead Time: 1.4 days
                    </div>
                    <div className="col-md-3">
                      %C/A: 88%
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="top-tile">
                  <h5>Deploy</h5>
                  <span className="question-icon">
                    <i className="fa fa-question-circle-o" aria-hidden="true"></i>
                  </span>
                  <span className="menu-icon">
                    <i className="fa fa-bars" aria-hidden="true"></i>
                  </span>
                  <div className="chartjs-wrapper">
                    <canvas className="chartjs-gauge3"></canvas>
                  </div>
                  <div className="tile-bottom row">
                    <div className="col-md-4">
                      WIP: 0
                    </div>
                    <div className="col-md-5">
                      Avg. Lead Time: 0.4 days
                    </div>
                    <div className="col-md-3">
                      %C/A: 95%
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="top-tile">
                  <h5>Execution</h5>
                  <span className="question-icon">
                    <i className="fa fa-question-circle-o" aria-hidden="true"></i>
                  </span>
                  <span className="menu-icon">
                    <i className="fa fa-bars" aria-hidden="true"></i>
                  </span>
                  <div className="chartjs-wrapper">
                    <canvas className="chartjs-gauge4"></canvas>
                  </div>
                  <div className="tile-bottom row">
                    <div className="col-md-4">
                      WIP: 0
                    </div>
                    <div className="col-md-5">
                      Avg. Lead Time: 0 days
                    </div>
                    <div className="col-md-3">
                      %C/A: N/A%
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="row top-tile-row border-top">
              {/* <div className="col-md-12">
                <div className="chartjs-wrapper">
                  <canvas className="bottom4"></canvas>
                </div>
              </div> */}
              {/* <div className="col-md-6">
                <div className="chartjs-wrapper">
                  <canvas className="bottom2"></canvas>
                </div>
              </div> */}
            </div>
            {/* <div className="row top-tile-row shim-top">
              <div className="col-md-6">
                <div className="chartjs-wrapper">
                  <canvas className="bottom3"></canvas>
                </div>
              </div>
              <div className="col-md-6">
                <div className="chartjs-wrapper">
                  <canvas className="bottom4"></canvas>
                </div>
              </div>
            </div> */}


            <article className="dashboard-grid">
              <div className="dashboard-preview-distribution">






              </div>



              <div className="dashboard-preview-load">

              </div>

              {/* <section className="dashboard-preview-velocity">
                <h2 className="dashboard-preview-header">Velocity</h2>
                <div className="dashboard-preview-div-nums">
                  <div className="dashbboard-preview-div-num">
                    <h3 className="features">{this.state.velocityData[0]}</h3>
                    <h5>features</h5>
                  </div>
                  <div className="dashbboard-preview-div-num">
                    <h3 className="risks">{this.state.velocityData[1]}</h3>
                    <h5>risks</h5>
                  </div>
                  <div className="dashbboard-preview-div-num">
                    <h3 className="debts">{this.state.velocityData[2]}</h3>
                    <h5>debts</h5>
                  </div>
                  <div className="dashbboard-preview-div-num">
                    <h3 className="defects">{this.state.velocityData[3]}</h3>
                    <h5>defects</h5>
                  </div>
                </div>
              </section> */}
            </article>


          </div>
        </div>

      </section>
    );
  }
}
