/**
 * @file App component.
 */

import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Switch } from 'react-router';
import { GuardProvider, GuardedRoute } from 'react-router-guards';
import { createBrowserHistory } from 'history';

import Login from '../Login/Login';
import Register from '../Register/Register';
import Password from '../Password/Password';
import PasswordEdit from '../Password/PasswordEdit';
import OneTimePassword from '../Login/OneTimePassword';
import Profile from '../Profile/Profile';
import Dashboard from '../Dashboard/Dashboard';
import LinkJira from '../Settings/LinkJira';
import SyncProjects from '../Settings/SyncProjects';
import SyncIssues from '../Settings/SyncIssues';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  render() {
    const history = createBrowserHistory();
    const requireLogin = (to, from, next) => {
      let userLoggedIn = false;
      if (localStorage.getItem('auth_token')) {
        userLoggedIn = true;
      }

      if (to.meta.auth) {
        if (userLoggedIn) {
          next();
        }
        next.redirect('/login');
      } else if (to.meta.auth === false) {
        if (userLoggedIn) {
          next.redirect('/');
        }
        next();
      } else {
        next();
      }
    };

    return (
      <main>
        <BrowserRouter history={history}>
          <GuardProvider guards={[requireLogin]}>
            <Switch>
              <GuardedRoute
                path="/"
                exact
                component={Dashboard}
                meta={{ auth: true }}
              />
              <GuardedRoute
                path="/profile"
                exact
                component={Profile}
                meta={{ auth: true }}
              />
              <GuardedRoute
                path="/initial-config-step-1"
                exact
                component={LinkJira}
                meta={{ auth: true }}
              />
              <GuardedRoute
                path="/initial-config-step-2"
                exact
                component={SyncProjects}
                meta={{ auth: true }}
              />
              <GuardedRoute
                path="/initial-config-step-3"
                exact
                component={SyncIssues}
                meta={{ auth: true }}
              />
              <GuardedRoute
                path="/login"
                exact
                component={Login}
                meta={{ auth: false }}
              />
              <GuardedRoute
                path="/register"
                exact
                component={Register}
                meta={{ auth: false }}
              />
              <GuardedRoute
                path="/password"
                exact
                component={Password}
                meta={{ auth: false }}
              />
              <GuardedRoute
                path="/password/edit"
                exact
                component={PasswordEdit}
                meta={{ auth: false }}
              />
              <GuardedRoute
                path="/otp"
                exact
                component={OneTimePassword}
                meta={{ auth: false }}
              />
            </Switch>
          </GuardProvider>
        </BrowserRouter>
      </main>
    );
  }
}
