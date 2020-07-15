import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labels: ['features', 'risks', 'debt', 'defect'],
      backgroundColor: 'black',
      hoverBackgroundColor: [],
      borderColor: [],
      loadData: [],
      velocityData: [],
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
    const featureVelocityCount = this.filterByTypeAndStatus('feature', info);
    const riskVelocityCount = this.filterByTypeAndStatus('risk', info);
    const debtVelocityCount = this.filterByTypeAndStatus('debt', info);
    const defectVelocityCount = this.filterByTypeAndStatus('defect', info);
    let answer = [featureVelocityCount.length, riskVelocityCount.length, debtVelocityCount.length, defectVelocityCount.length];
    this.setState({ velocityData: answer });
  };

  filterByTypeAndStatus = (typeOfWork, tickets) => {
    const typeFiltered = tickets.filter((item) => item.type == typeOfWork);
    const statusFiltered = typeFiltered.filter((item) => item.status == 'done');
    return statusFiltered;
  }
 
  filterByType = (typeOfWork, tickets) => {
    const answer = tickets.filter((item) => item.type == typeOfWork);
    return answer;
  };

  filterbyStatus = (tickets, statusLevel) => {
    const statusFiltered = tickets.filter((item) => item.status == statusLevel);
    return statusFiltered;
  };

  componentDidMount = () => {
    this.calculateVelocity()
  }

  render() {
    const loadChart = {
      labels: ['features', 'risks', 'debt', 'defect'],
      datasets: [
        {
          label: 'Load',
          backgroundColor: ['#2477B6', '#CAF0F8', '#48B4D9', '#90E1F0'],
          borderColor: ['#2477B6', '#CAF0F8', '#48B4D9', '#90E1F0'],
          borderWidth: 2,
          data: this.calculateLoad(),
        },
      ],
    };
    return (
      <section>
        <h2>{this.props.projectName}</h2>
        <Bar
          data={loadChart}
          options={{
            maintainAspectRatio: true,
            title: {
              display: true,
              text: 'Load',
              fontSize: 20,
            },
            legend: {
              display: true,
              position: 'right',
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
        <h2>Velocity</h2>
        <h5>Features: {this.state.velocityData[0]}</h5>
        <h5>Risks: {this.state.velocityData[1]}</h5>
        <h5>Debts: {this.state.velocityData[2]}</h5>
        <h5>Defects: {this.state.velocityData[3]}</h5>
      </section>
    );
  }
}
