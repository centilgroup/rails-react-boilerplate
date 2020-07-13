import React, { Component } from 'react';
import Preview from '../Preview/Preview';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workCounts: []
      
    }
  }

  calculateLoad = () => {
    const defectCount = this.filterByType('defect')
    const featureCount = this.filterByType('feature')    
    const debtCount = this.filterByType('debt')
    const riskCount = this.filterByType('risk')
    let answer = [featureCount, riskCount, debtCount, defectCount]
    this.setState({ workCounts: answer })
  }

  filterByType = (typeOfWork) => {
    const info = this.props.projectData[0]
    const answer = info.filter(item => item.type == typeOfWork)
    return answer.length
  }

  componentDidMount = () => {
    this.calculateLoad()
  }


  render () {
    return (
        <section>
          <p>{this.props.projectName}</p>
          <Preview title='Distribution' data={this.state.workCounts}/>
          <Preview title='Close Time' data={this.state.workCounts}/>
          <Preview title='Velocity' data={this.state.workCounts}/>
          <Preview title='Flow Load' data={this.state.workCounts}/>
          <Preview title='Efficiency' data={this.state.workCounts}/>
        </section>
    );
  }
}
