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

    const featuresInProgress = this.filterbyStatus(featureCount, 'inProgress')
    const risksInProgress = this.filterbyStatus(riskCount, 'inProgress')
    const debtsInProgress = this.filterbyStatus(debtCount, 'inProgress')
    const defectsInProgress = this.filterbyStatus(defectCount, 'inProgress')

    const featuresInReview = this.filterbyStatus(featureCount, 'inReview')
    const risksInReview = this.filterbyStatus(riskCount, 'inReview')
    const debtsInReview = this.filterbyStatus(debtCount, 'inReview')
    const defectsInReview = this.filterbyStatus(defectCount, 'inReview')

    const features = featuresInProgress.length + featuresInReview.length
    const risks = risksInProgress.length + risksInReview.length
    const debts = debtsInProgress.length + debtsInReview.length
    const defects = defectsInProgress.length + defectsInReview.length
    let answer = [features, risks, debts, defects];
    return answer;
  };

  // calculateVelocity = () => {
  //   const featureVelocityCount = this.filterByTypeAndStatus('feature');
  //   const riskVelocityCount = this.filterByTypeAndStatus('risk');
  //   const debtVelocityCount = this.filterByTypeAndStatus('debt');
  //   const defectVelocityCount = this.filterByTypeAndStatus('defect');
  //   let answer = [featureVelocityCount, riskVelocityCount, debtVelocityCount, defectVelocityCount];
  //   return answer;
  // };

  // filterByTypeAndStatus = (typeOfWork) => {
  //   const info = this.props.projectData[0];
  //   const typeFiltered = info.filter((item) => item.type == typeOfWork);
  //   const statusFiltered = typeFiltered.filter((item) => item.status == 'backlog' || item.status == 'done');
  //   return statusFiltered.length;
  // }

  filterByType = (typeOfWork, tickets) => {
    const answer = tickets.filter((item) => item.type == typeOfWork);
    return answer;
  };

  filterbyStatus = (tickets, statusLevel) => {
    const statusFiltered = tickets.filter((item) => item.status == statusLevel);
    return statusFiltered;
  }

  componentDidMount = () => {
    this.calculateLoad();
  };

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
         {/* {/* <h2>Velocity</h2> */}
        {/* <h5>Feature: {this.calculateVelocity()[0]} Risk: {this.calculateVelocity()[1]} Debt: {this.calculateVelocity()[2]} Defect: {this.calculateVelocity()[3]}</h5> */} */}
      </section>
    );
  }
}
