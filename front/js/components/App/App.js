/**
 * @file App component.
 */

import React, { Component } from 'react';
<<<<<<< HEAD
import Route, { BrowserRouter, Switch } from 'react-router-dom';
import Login from '../Login/Login';
import Main from '../Main/Main';
import Settings from '../Settings/Settings';
import Dashboard from '../Dashboard/Dashboard';
import FlowDetails from '../FlowDetails/FlowDetails';
import ProjectDropDown from '../ProjectDropDown/ProjectDropDown';
import Logout from '../Logout/Logout';
=======
import { Route } from 'react-router-dom';
import Login from '../Login/Login';
import Main from '../Main/Main';
import projects from '../Data';
>>>>>>> master

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      email: '',
      projectInfo: {},
      teammates: [],
      userLoggedIn: false,
      settingsSelected: false,
      projectSelection: '',
      clickedProjectDropDown: false,
    };
  }

  loginUser = (username, email) => {
    this.setState({ username });
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
  };

  clearProject = () => {
    this.setState({ projectInfo: {} });
  };

  toggleSettings = () => {
    this.setState({ settingsSelected: !this.state.settingsSelected });
  };

  openProjectDropDown = () => {
    this.setState({
      clickedProjectDropDown: !this.state.clickedProjectDropDown,
    });
  };

  render() {
    return (
<<<<<<< HEAD
      <section>
      <Route exact path='/' render={() => <Login loginUser={this.loginUser}/>}/>
      <Route path='/home' component={() => <Main username={this.state.username}/>}/>
      <Route path='/project/:id' component={() => <Dashboard projectInfo={this.state.projects}/>}/>
      <Route path='/project/:id/detail/:id' component={() => <FlowDetails/>}/>
      </section>

        <nav>
          <Switch>
            <Route exact path="/" component={Main}/>
            <Route path="/projects" component={ProjectDropDown}/>
            <Route path="/settings" component={Settings}/>
            <Route path="/logout" component={Logout}/>
          </Switch>
      </nav>
=======
      <main>
        <Route
          exact
          path="/"
          render={() =>
            this.state.userLoggedIn === false ? (
              <Login loginUser={this.loginUser} />
            ) : (
              <Main
                settingsSelected={this.state.settingsSelected}
                toggleSettings={this.toggleSettings}
                logoutUser={this.logoutUser}
                clickedProjectDropDown={this.state.clickedProjectDropDown}
                openProjectDropDown={this.openProjectDropDown}
              />
            )
          }
        />
      </main>
>>>>>>> master
    );
  }
}

 
