/**
 * @file SyncIssues component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { Container, Button, Figure, Dropdown, Spinner } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Redirect } from 'react-router';
import Footer from '../Shared/Footer';

export default class SyncIssues extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issuesSync: false,
      redirect: false,
      redirectTo: '',
    };
  }

  syncIssues = () => {
    this.setState({ issuesSync: true });

    axios
      .put('/users/sync_issues.json', {})
      .then((response) => {
        this.setState({ issuesSync: false, redirect: true });

        const data = new FormData();
        data.append('user[initial_config]', 'true');
        axios
          .put('/users/profile.json', data)
          .then((profileResponse) => {
            const profile_data = profileResponse.data;
            localStorage.setItem('user', JSON.stringify(profile_data));
          })
          .catch(() => {});
      })
      .catch(() => {});
  };

  logoutUser = () => {
    axios.delete('/users/sign_out.json').then(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      this.setState({ redirect: true, redirectTo: 'login' });
    });
  };

  render() {
    const { redirect, issuesSync, redirectTo } = this.state;

    if (redirect) {
      return <Redirect to={`/${redirectTo}`} />;
    }

    return (
      <section>
        <nav>
          <span>
            <Figure className="m-0">
              <Figure.Image
                src="https://user-images.githubusercontent.com/38546045/87486176-f1a5f280-c5f7-11ea-90de-1e80393d15a0.png"
                width={50}
                height={30}
                alt="Logo"
                className="m-0"
              />
            </Figure>
          </span>
          <span>
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="navDropdown">
                <i className="fa fa-bars" />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="#" onClick={this.logoutUser}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </span>
        </nav>

        <Container className="pt-5">
          <div className="pt-4">
            <h4>Issues Sync</h4>
            <Button
              variant="outline-primary"
              onClick={this.syncIssues}
              disabled={issuesSync}
            >
              Sync & Complete{' '}
              {issuesSync ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                ''
              )}
            </Button>
            <p className="text-muted mt-1">
              After clicking Sync Issues button give FlowLab some time to pull
              in all the associated Jira ticket metadata.
            </p>
          </div>
        </Container>

        <Footer />
      </section>
    );
  }
}
