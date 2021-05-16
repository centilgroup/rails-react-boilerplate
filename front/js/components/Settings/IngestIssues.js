/**
 * @file IngestIssues component.
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

export default class IngestIssues extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ingest: null,
      disableIngest: false,
      showIngestAlert: false,
      ingestErrorMessage: '',
      redirect: false,
      redirectTo: '',
      disableAll: false,
      issuesSync: false,
      issuesIngest: false,
    };
  }

  handleChange = (event) => {
    this.setState({ ingest: event.target.files[0] });
  };

  handleSubmit = (e) => {
    this.setState({ issuesIngest: true, disableAll: true });
    e.preventDefault();
    const { ingest } = this.state;
    const data = new FormData();
    data.append(`user[issues_ingest]`, ingest);
    data.append('user[initial_config]', 'true');
    this.setState({ disableIngest: true });

    axios
      .put('/users/ingest.json', data)
      .then(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        user.initial_config = true;
        localStorage.setItem('user', JSON.stringify(user));
        this.setState({ redirect: true });
      })
      .catch((error) => {
        const { message } = error.response.data;
        this.setState({ showIngestAlert: true, ingestErrorMessage: message });
      })
      .finally(() => {
        this.setState({ issuesIngest: false, disableAll: false });
        setTimeout(() => {
          this.setState({ showIngestAlert: false, disableIngest: false });
        }, 3000);
      });
  };

  syncIssues = () => {
    this.setState({ issuesSync: true, disableAll: true });

    const data = new FormData();
    data.append('user[initial_config]', 'true');

    axios
      .put('/users/sync_issues.json', data)
      .then((response) => {
        const user = JSON.parse(localStorage.getItem('user'));
        user.initial_config = true;
        localStorage.setItem('user', JSON.stringify(user));
        this.setState({
          issuesSync: false,
          redirect: true,
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
            issuesSync: false,
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
      issuesSync,
      disableAll,
      issuesIngest,
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
              <h4>Ingest Issues .csv</h4>
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
                {issuesIngest ? (
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
                    We expect headers - issue_id, project_id, status,
                    issue_type, issue_key, change_log, summary, due_date &
                    created.
                  </Alert>
                </Col>
              </Row>
            </Form>
            <div className="separator">Or</div>
            <div className="pt-4">
              <h4>Sync Issues</h4>
              <Button
                variant="outline-primary"
                onClick={this.syncIssues}
                disabled={disableAll || issuesSync}
              >
                Sync & Continue{' '}
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
            </div>
          </div>
        </Container>

        <Footer />
      </section>
    );
  }
}
