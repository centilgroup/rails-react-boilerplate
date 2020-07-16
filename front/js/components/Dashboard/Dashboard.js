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
  }

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
        <h2 className="dash-header">{this.props.projectName}</h2>

        <article className="dashboard-grid">
          <div className="dashboard-preview-distribution">
            <Doughnut
              data={distributionChart}
              width={'30%'}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                title: {
                  display: true,
                  text: 'Distribution',
                  fontSize: 20,
                  fontFamily: 'Montserrat',
                },
                legend: {
                  display: true,
                  position: 'right',
                  labels: {
                    fontColor: '#07165e',
                    defaultFontFamily: 'Montserrat',
                  },
                },
              }}
            />
          </div>

          <section className="dashboard-preview-close">
            <h2 className="dashboard-preview-header">Close Times</h2>
            <div className="dashboard-preview-div-nums">
              <div className="dashbboard-preview-div-num">
                <h3 className="features">{this.state.closeData[0]}</h3>
                <h5>features</h5>
              </div>
              <div className="dashbboard-preview-div-num">
                <h3 className="risks">{this.state.closeData[1]}</h3>
                <h5>risks</h5>
              </div>
              <div className="dashbboard-preview-div-num">
                <h3 className="debts">{this.state.closeData[2]}</h3>
                <h5>debts</h5>
              </div>
              <div className="dashbboard-preview-div-num">
                <h3 className="defects">{this.state.closeData[3]}</h3>
                <h5>defects</h5>
              </div>
            </div>
          </section>

          <div className="dashboard-preview-load">
            <Bar
              data={loadChart}
              width={'15%'}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                title: {
                  display: true,
                  text: 'Load',
                  fontSize: 20,
                },
                legend: {
                  display: false,
                },
                scales: {
                  yAxes: [
                    {
                      ticks: {
                        suggestedMin: 0,
                      },
                    },
                  ],
                },
              }}
            />
          </div>

          <section className="dashboard-preview-velocity">
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
          </section>
        </article>
      </section>
    );
  }
}
