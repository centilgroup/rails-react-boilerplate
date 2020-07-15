import React, { Component } from 'react';
import Preview from '../Preview/Preview';
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
    };
  };

  filterTicketsDone = () => {
    const info = this.props.projectData[0];
    const ticketsDone = info.filter((item) => item.status == 'done');
    //this.calculateLoad();
  };

  calculateWorkTime = () => {  
  };


  calculateLoad = () => {
    const info = this.props.projectData[0];
    const featureCount = this.filterByType('feature', info);
    const riskCount = this.filterByType('risk', info);
    const debtCount = this.filterByType('debt', info);
    const defectCount = this.filterByType('defect', info);
    let answer = [featureCount, riskCount, debtCount, defectCount];
    return answer;
  };

<<<<<<< HEAD
  filterByType = (typeOfWork, tickets) => {
    const answer = tickets.filter((item) => item.type == typeOfWork);
=======
  calculateVelocity = () => {
    const featureVelocityCount = this.filterByTypeAndStatus('feature');
    const riskVelocityCount = this.filterByTypeAndStatus('risk');
    const debtVelocityCount = this.filterByTypeAndStatus('debt');
    const defectVelocityCount = this.filterByTypeAndStatus('defect');
    let answer = [featureVelocityCount, riskVelocityCount, debtVelocityCount, defectVelocityCount];
    return answer;
  };

  filterByTypeAndStatus = (typeOfWork) => {
    const info = this.props.projectData[0];
    const typeFiltered = info.filter((item) => item.type == typeOfWork);
    const statusFiltered = typeFiltered.filter((item) => item.status == 'backlog' || item.status == 'done');
    return statusFiltered.length;
  }
 
  filterByType = (typeOfWork) => {
    const info = this.props.projectData[0];
    const answer = info.filter((item) => item.type == typeOfWork);
>>>>>>> master
    return answer.length;
  };
  componentDidMount = () => {
    this.calculateLoad();
    this.filterTicketsDone();
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
    console.log(loadChart);
    return (
      <section>
        <p>{this.props.projectName}</p>
        <Bar
          data={loadChart}
          options={{
            maintainAspectRatio: true,
            title: {
              display: true,
              text: 'Flow',
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
        <h5>Feature: {this.calculateVelocity()[0]} Risk: {this.calculateVelocity()[1]} Debt: {this.calculateVelocity()[2]} Defect: {this.calculateVelocity()[3]}</h5>
      </section>
    );
  }
}
