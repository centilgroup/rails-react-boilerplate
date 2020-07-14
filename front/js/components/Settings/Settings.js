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
  console.log(this.props.email)
  console.log(this.props.project2data)
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
        <p></p>
        <h3>Username:</h3>
        <p>{this.props.username}</p>
        <h3>Email Address:</h3>
        <p>{this.props.email}</p>
    </div>
  );
};

}



export default Settings;

