/**
 * @file IngestProjects component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Figure,
  Dropdown,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { Redirect } from 'react-router';
import Footer from '../Shared/Footer';

export default class IngestProjects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingest: null,
      disableIngest: false,
      showIngestAlert: false,
      ingestErrorMessage: '',
      projectsIngest: false,
      projectsSync: false,
      redirect: false,
      redirectTo: '',
      disableAll: false,
    };
  }

  handleChange = (event) => {
    this.setState({ ingest: event.target.files[0] });
  };

  handleSubmit = (e) => {
    this.setState({ projectsIngest: true, disableAll: true });
    e.preventDefault();
    const { ingest } = this.state;
    const data = new FormData();
    data.append(`user[projects_ingest]`, ingest);
    data.append('user[initial_config_step]', '4');
    this.setState({ disableIngest: true });

    axios
      .put('/users/ingest.json', data)
      .then(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        user.initial_config_step = 4;
        localStorage.setItem('user', JSON.stringify(user));
        this.setState({ redirect: true, redirectTo: 'initial-config-step-4' });
      })
      .catch((error) => {
        const { message } = error.response.data;
        this.setState({ showIngestAlert: true, ingestErrorMessage: message });
      })
      .finally(() => {
        this.setState({ projectsIngest: false, disableAll: false });
        setTimeout(() => {
          this.setState({ showIngestAlert: false, disableIngest: false });
        }, 3000);
      });
  };

  syncProjects = () => {
    this.setState({ projectsSync: true, disableAll: true });

    const data = new FormData();
    data.append('user[initial_config_step]', '4');

    axios
      .put('/users/sync_projects.json', data)
      .then((response) => {
        const user = JSON.parse(localStorage.getItem('user'));
        user.initial_config_step = 4;
        localStorage.setItem('user', JSON.stringify(user));
        this.setState({
          projectsSync: false,
          redirect: true,
          redirectTo: 'initial-config-step-4',
        });
      })
      .catch((error) => {
        const { message } = error.response.data;
        this.setState({
          showIngestAlert: true,
          ingestErrorMessage: `${message}! Please check and update the Jira Link.`,
        });
        setTimeout(() => {
          this.setState({
            projectsSync: false,
            redirect: true,
            redirectTo: 'initial-config-step-2',
            disableAll: false,
          });
        }, 3000);
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
    const {
      showIngestAlert,
      ingestErrorMessage,
      ingest,
      disableIngest,
      redirect,
      redirectTo,
      projectsSync,
      projectsIngest,
      disableAll,
    } = this.state;
    let ingestAlert;
    let determineEnabled = [null, undefined].includes(ingest);

    if (!determineEnabled) {
      determineEnabled = disableIngest;
    }

    if (redirect) {
      return <Redirect to={`/${redirectTo}`} />;
    }

    if (showIngestAlert) {
      ingestAlert = (
        <Alert variant="danger">
          <span>{ingestErrorMessage}</span>
        </Alert>
      );
    }

    return (
      <section>
        <nav>
          <span>
            <Figure className="m-0">
              <Figure.Image
                src="/logo.png"
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
            {ingestAlert}
            <Form className="pt-4">
              <h4>Ingest Projects .csv</h4>
              <Row>
                <Col xs={6}>
                  <Form.Group>
                    <Form.File
                      name="ingest"
                      onChange={this.handleChange}
                      accept=".csv"
                      className="mt-3"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button
                variant="outline-primary"
                type="submit"
                onClick={this.handleSubmit}
                disabled={disableAll || determineEnabled}
              >
                Ingest & Continue{' '}
                {projectsIngest ? (
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
              <Row>
                <Col xs={6}>
                  <Alert variant="info" className="mt-3">
                    We expect headers - project_id, key & name.
                  </Alert>
                </Col>
              </Row>
            </Form>
            <div className="separator">Or</div>
            <div className="pt-4">
              <h4>Sync Projects</h4>
              <Button
                variant="outline-primary"
                onClick={this.syncProjects}
                disabled={disableAll || projectsSync}
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
          </div>
        </Container>

        <Footer />
      </section>
    );
  }
}
