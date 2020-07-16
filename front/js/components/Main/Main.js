/**
 * @file Main component.
 */

import React, { Component } from 'react';
import Nav from '../Nav/Nav';
import Settings from '../Settings/Settings';
import ProjectSelector from '../ProjectSelector/ProjectSelector';
import ProjectDropDown from '../ProjectDropDown/ProjectDropDown';
import Dashboard from '../Dashboard/Dashboard';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project1name: this.getName(0),
      project2name: this.getName(1),
      project1data: this.getData(0),
      project2data: this.getData(1),
      teamMembers: []
    };
  }


  getName = (num) => {
    return Object.keys(this.props.projectInfo.projects[num]);
  };

  getData = (num) => {
    return Object.values(this.props.projectInfo.projects[num]);
  };

  getTeam = () => {
    const team1 = this.state.project1data[0].map((project) => project.assignee);
    const team2 = this.state.project2data[0].map((project) => project.assignee);
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

  componentDidMount = () => {
    this.getTeam()
  }

  render() {
    const {
      settingsSelected,
      clickedProjectDropDown,
      username,
      email,
      logoutUser,
      toggleSettings,
      openProjectDropDown,
      selectProject,
      projectSelection,
    } = this.props;
    const {
      project1data,
      project2name,
      project1name,
      project2data,
      teamMembers,
    } = this.state;

    return (
      <main>
        <Nav
          toggleSettings={toggleSettings}
          logoutUser={logoutUser}
          openProjectDropDown={openProjectDropDown}
        />
        <section>
          {projectSelection === false ? (
            <ProjectSelector
              selectProject={selectProject}
              username={username}
              project1name={project1name}
              project2name={project2name}
            />
          ) : null}
          {settingsSelected ? (
            <Settings 
              username={username} 
              email={email} 
              teamMembers={teamMembers}
              project1name={project1name}
              project2name={project2name}
              project1data={project1data}
              project2data={project2data}
              toggleSettings={toggleSettings}

            /> 
          ): null}
          {clickedProjectDropDown ? (
            <ProjectDropDown
              selectProject={selectProject}
              project1name={project1name}
              project2name={project2name}
              openProjectDropDown={openProjectDropDown}
            />
          ) : null}
          {projectSelection === 1 ? (
            <Dashboard projectData={project1data} projectName={project1name} />
          ) : null}
          {projectSelection === 2 ? (
            <Dashboard projectData={project2data} projectName={project2name} />
          ) : null}
        </section>
      </main>
    );
  }
}

export default Main;
