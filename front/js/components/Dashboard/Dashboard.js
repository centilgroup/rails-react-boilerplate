import React, { Component } from 'react';
import Preview from '../Preview/Preview';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labels: ['features', 'risks', 'debt', 'defect'],
      backgroundColor: [],
      hoverBackgroundColor: [],
      borderColor: [],
      // distributionChart: {
      //   labels: this.state.labels,
      //   datasets: {
      //     label: 'Distribution',
      //     backgroundColor: this.state.backgroundColor,
      //     hoverBackgroundColor: this.state.hoverBackgroundColor,
      //     data: this.state.distributionData,
      //   }
      // },
      // closeTimeChart: {
      //   labels: this.state.labels,
      //   datasets: {
      //     label: 'Close Time',
      //     backgroundColor: this.state.backgroundColor,
      //     borderColor: this.state.borderColor,
      //     data: this.state.closeTimeData,
      //   }
      // },
      // loadChart: {},
      loadChart: {
        labels: ['features', 'risks', 'debt', 'defect'],
        datasets: {
          label: 'Load',
          backgroundColor: [],
          borderColor: [],
          data: this.calculateLoad(),
        }
      }
      // velocityChart: {
      //   labels: this.state.labels,
      //   datasets: {
      //     label: 'Velocity',
      //     backgroundColor: this.state.backgroundColor,
      //     borderColor: this.state.borderColor,
      //     data: this.velocityData,
      //   }
      // },
      // efficiencyChart: {
      //   labels: this.state.labels,
      //   datasets: {
      //     label: 'Efficiency',
      //     fill: false,
      //     lineTension:  0.5, 
      //     backgroundColor: this.state.backgroundColor,
      //     borderColor: this.state.borderColor,
      //     borderWidth: 2, 
      //     data: this.efficiencyData,
      //   }
      // }
    }
  }

  calculateLoad = () => {
    const featureCount = this.filterByType('feature')    
    const riskCount = this.filterByType('risk')
    const debtCount = this.filterByType('debt')
    const defectCount = this.filterByType('defect')
    let answer = [featureCount, riskCount, debtCount, defectCount]
    return answer
}

  filterByType = (typeOfWork) => {
    const info = this.props.projectData[0]
    const answer = info.filter(item => item.type == typeOfWork)
    return answer.length
  }

  render () {
    return (
        <section>
          <p>{this.props.projectName}</p>
          {/* <Preview title='Distribution' data={this.state.workCounts}/> */}
          {/* <Preview title='Close Time' data={this.state.workCounts}/> */}
          {/* <Preview title='Velocity' data={this.state.workCounts}/> */}
          <Preview chartData={this.state.loadChart} title='Flow Load'/>
          {/* <Preview title='Efficiency' data={this.state.workCounts}/> */}
        </section>
    );
  }
}
