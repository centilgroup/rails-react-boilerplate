/**
 * @file Main component.
 */

import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
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
    };
  }


  return (
    <main>
      <Nav
        toggleSettings={toggleSettings}
        logoutUser={logoutUser}
        openProjectDropDown={openProjectDropDown}
      />
      <section>
        <ProjectSelector username={username} />
        {settingsSelected ? <Settings /> : null}
        {clickedProjectDropDown ? <ProjectDropDown /> : null}
      </section>
    </main>
  );
};

  getName = (num) => {
    return Object.keys(this.props.projectInfo.projects[num]);
  };

  getData = (num) => {
    return Object.values(this.props.projectInfo.projects[num]);
  };

  render() {
    const {
      settingsSelected,
      clickedProjectDropDown,
      username,
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
          {settingsSelected ? <Settings /> : null}
          {clickedProjectDropDown ? (
            <ProjectDropDown
              selectProject={selectProject}
              project1name={project1name}
              project2name={project2name}
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
>>>>>>> master

export default Main;
