/**
 * @file App component.
 */

import React, { Component } from 'react';
import Route, { BrowserRouter, Switch } from 'react-router-dom';
import Login from '../Login/Login';
import Main from '../Main/Main';
import Settings from '../Settings/Settings';
import Dashboard from '../Dashboard/Dashboard';
import FlowDetails from '../FlowDetails/FlowDetails';
import ProjectDropDown from '../ProjectDropDown/ProjectDropDown';
import Logout from '../Logout/Logout';

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      username: "",
      email: "",
      projects:[],
      teammates: [],
      isLoading: true,
      networkMessage: '',
      error: ''
    }
  }

  loginUser = (username, email) => {
    this.setState( { username })
    this.setState( { email } )
  }

  render() {
    return (
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
    );
  }
}

 
