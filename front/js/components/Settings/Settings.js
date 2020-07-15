/**
 * @file Settings component.
 */

import React, { Component } from 'react';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //  teamMembers: this.getTeam()
    };
  }

  getTeam = () => {
    const team1 = this.props.project1data[0].map((project) => project.assignee);
    const team2 = this.props.project2data[0].map((project) => project.assignee);
    const teams = [...team1, ...team2];
    const teamsNoDupes = teams.reduce((a, b) => {
      if (a.indexOf(b) < 0) a.push(b);
      return a;
    }, []);
    const noUnassigned = teamsNoDupes.filter(
      (member) => member !== 'unassigned',
    );
    this.setState({ teamMembers: noUnassigned });
  };

  displayTeamMembers = () => {
    return this.state.teamMembers.map((member, index) => {
      return (
        <div key={index}>
          <p key={index}>{member}</p>
        </div>
      );
    });
  };

  render() {
    const { toggleSettings } = this.props;
    return (
      <div className="settings-div-outer">
        <div className="settings-div-inner">
          <img className="setting-close" src="https://user-images.githubusercontent.com/38546045/87554381-4df92880-c671-11ea-8ad5-9d747cf5532e.png" onClick={toggleSettings}/>
          <h2 className="settings-header">Settings</h2>
            <h3> <span className="settings-inline-span">Username: </span>{this.props.username}</h3>
            <h3><span className="settings-inline-span">Email Address: </span>{this.props.email}</h3> 
          <h3 className="settings-inline-span">Projects:</h3>
          <ul>
            <li>{this.props.project1name}</li>
            <li>{this.props.project2name}</li>
          </ul>
          <h3 className="settings-inline-span">Team Members:</h3>
          
        </div>
      </div>
    );
  }
}

export default Settings;
