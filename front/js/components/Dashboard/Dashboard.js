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
  }

  calculateLoad = () => {
    const featureCount = this.filterByType('feature');
    const riskCount = this.filterByType('risk');
    const debtCount = this.filterByType('debt');
    const defectCount = this.filterByType('defect');
    let answer = [featureCount, riskCount, debtCount, defectCount];
    return answer;
  };

  filterByType = (typeOfWork) => {
    const info = this.props.projectData[0];
    const answer = info.filter((item) => item.type == typeOfWork);
    return answer.length;
  };
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
      </section>
    );
  }
}
