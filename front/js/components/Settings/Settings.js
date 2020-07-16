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

  displayTeamMembers = () => {
    return this.props.teamMembers.map((member, index) => {
      return (
        <div key={index}>
          <li key={index}>{member}</li>
        </div>
      );
    });
  };

  render() {
    const { toggleSettings } = this.props;
    return (
      <div className="settings-div-outer">
        <div className="settings-div-inner">
          <img
            className="setting-close"
            src="https://user-images.githubusercontent.com/38546045/87554381-4df92880-c671-11ea-8ad5-9d747cf5532e.png"
            onClick={toggleSettings}
          />
          <h2 className="settings-header">Settings</h2>
          <h3>
            <span className="settings-inline-span">Username: </span>
            {this.props.username}
          </h3>
          <h3>
            <span className="settings-inline-span">Email Address: </span>
            {this.props.email}
          </h3>
          <h3 className="settings-inline-span">Projects:</h3>
          <ul>
            <li>{this.props.project1name}</li>
            <li>{this.props.project2name}</li>
          </ul>
          <h3 className="settings-inline-span">Team Members:</h3>
          <ul>{this.displayTeamMembers()}</ul>
          <h3 className="settings-inline-span">Metric Descriptions:</h3>
          <ul>
            <li>Distribution: percentage of each work type </li>
            <li>Close Times: average number of days to complete work </li>
            <li>Load: work in progress </li>
            <li>Velocity: work items completed </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Settings;
