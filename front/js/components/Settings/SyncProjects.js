/**
 * @file SyncProjects component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { Container, Button, Figure, Dropdown, Spinner } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Redirect } from 'react-router';
import Footer from '../Shared/Footer';

export default class SyncProjects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectsSync: false,
      redirect: false,
      redirectTo: '',
    };
  }

  syncProjects = () => {
    this.setState({ projectsSync: true });

    axios
      .put('/users/sync_projects.json', {})
      .then((response) => {
        this.setState({
          projectsSync: false,
          redirect: true,
          redirectTo: 'initial-config-step-3',
        });
      })
      .catch(() => {
        this.setState({
          projectsSync: false,
          redirect: true,
          redirectTo: 'initial-config-step-1',
        });
      });
  };

  logoutUser = () => {
    axios.delete('/users/sign_out.json').then(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      this.setState({ redirect: true, redirectTo: 'login' });
    });
  };

  render() {
    const { redirect, projectsSync, redirectTo } = this.state;

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
            <h4>Projects Sync</h4>
            <Button
              variant="outline-primary"
              onClick={this.syncProjects}
              disabled={projectsSync}
            >
              Sync & Continue{' '}
              {projectsSync ? (
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
          </div>
        </Container>

        <Footer />
      </section>
    );
  }
}
