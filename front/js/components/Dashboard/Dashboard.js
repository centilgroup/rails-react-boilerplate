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

  filterTicketsDone = () => {
    const info = this.props.projectData[0];
    const ticketsDone = info.filter((item) => item.status == 'done');
    //this.calculateLoad();
  };

  calculateWorkTime = () => {  
    const info = this.props.projectData[0];
    this.filterTicketsDone();
    const totalTime = this.type('endTime' - 'startTime');
    const averageTotalTime = this.type('totalTime' / 100);
    this.calculateLoad();
    let answer = [AverageTotalTime];
    return answer;
    
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


  filterByType = (typeOfWork, tickets) => {
    const answer = tickets.filter((item) => item.type == typeOfWork);
    return answer.length;
  };

  componentDidMount = () => {
    this.calculateLoad();

    this.filterTicketsDone();
    
    this.calculateWorkTime();
  };

  render() {

    const closeTimeChart = {
      labels: ['features', 'risks', 'debt', 'defect'],
      datasets: [
        {
          label: 'close Time',
          backgroundColor: ['#2477B6', '#CAF0F8', '#48B4D9', '#90E1F0'],
          borderColor: ['#2477B6', '#CAF0F8', '#48B4D9', '#90E1F0'],
          borderWidth: 2,
          data: this.calculateWorkTime(),
        },
      ],
    };

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
        Feature: {this.calculateWorkTime()[0]} Risk: {this.calculateWorkTime()[1]} Debt: {this.calculateWorkTime()[2]} Defect: {this.calculateWorkTime()[3]

      </section>
    );
  }
}
