/**
 * @file App component.
 */

import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import axios from 'axios';

import Login from '../Login/Login';
import Register from '../Register/Register';
import Main from '../Main/Main';
import projects from '../Data';
import Password from '../Password/Password';
import PasswordEdit from '../Password/PasswordEdit';
// import fetchProjectData from '../apiCall';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      projectInfo: projects,
      userLoggedIn: false,
      settingsSelected: false,
      projectSelection: false,
      clickedProjectDropDown: false,
    };
  }

  loginUser = (email) => {
    this.setState({ username: 'test' });
    this.setState({ email });
    this.setState({ userLoggedIn: true });
    this.fetchProjects();
  };

  fetchProjects = () => {
    this.setState({ projectInfo: projects });
  };

  logoutUser = () => {
    this.setState({ username: '' });
    this.setState({ email: '' });
    this.setState({ userLoggedIn: false });
    this.clearProject();

    axios.delete('/users/sign_out.json').then(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      },
    );
  };

  clearProject = () => {
    this.setState({ projectInfo: {} });
    this.setState({ projectSelection: false });
  };

  toggleSettings = () => {
    this.setState({ settingsSelected: !this.state.settingsSelected });
  };

  selectProject = (projectNum) => {
    this.setState({ projectSelection: projectNum });
  };

  openProjectDropDown = () => {
    this.setState({
      clickedProjectDropDown: !this.state.clickedProjectDropDown,
    });
  };

  render() {
    return (
      <main>
        <Route
          exact
          path="/"
          render={() =>
            this.state.userLoggedIn === false ? (
              <Login loginUser={this.loginUser} />
            ) : (
              <Main
                projectSelection={this.state.projectSelection}
                username={this.state.username}
                email={this.state.email}
                projectInfo={this.state.projectInfo}
                settingsSelected={this.state.settingsSelected}
                toggleSettings={this.toggleSettings}
                logoutUser={this.logoutUser}
                clickedProjectDropDown={this.state.clickedProjectDropDown}
                openProjectDropDown={this.openProjectDropDown}
                selectProject={this.selectProject}
              />
            )
          }
        />
        <Route exact path="/register">
          <Register />
        </Route>
        <Route exact path="/password">
          <Password />
        </Route>
        <Route exact path="/password/edit">
          <PasswordEdit />
        </Route>
      </main>
    );
  }
}
