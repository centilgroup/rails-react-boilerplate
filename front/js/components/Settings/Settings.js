/**
 * @file Settings component.
 */

import React, {Component} from 'react';


class Settings extends Component {  
  constructor(props) {
  super(props)
  this.state = {
    teamMembers: []
  }
  }

getTeam = () => {
  const team1 = this.props.project1data[0].map((project) => project.assignee)
  const team2 = this.props.project2data[0].map((project) => project.assignee)
  const teams = [...team1,...team2]
  const teamsNoDupes = teams.reduce((a,b) => {
    if(a.indexOf(b)<0)a.push(b);return a;},[]);
    const noUnassigned = teamsNoDupes.filter((member) => member !== 'unassigned')
  this.setState({ teamMembers: noUnassigned })
}

displayTeamMembers = () => {
  return this.state.teamMembers.map(member => {
    return (
    <p>{member}</p>
    )
  })
}

componentDidMount = () => {
  this.getTeam()
}

render() {
  return (
    <div>
        {/* <img>x</img> */}
        <h2>Settings</h2>
        <h3>Projects:</h3>
        <p>{this.props.project1name}</p>
        <p>{this.props.project2name}</p>
        <h3>Team Members:</h3>
        {this.displayTeamMembers()}
        <h3>Username:</h3>
        <p>{this.props.username}</p>
        <h3>Email Address:</h3>
        <p>{this.props.email}</p>
    </div>
  );
};

}



export default Settings;

