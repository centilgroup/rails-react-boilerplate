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
    };
  }

  handleChange = (event) => {
    this.setState({ ingest: event.target.files[0] });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { ingest } = this.state;
    const data = new FormData();
    data.append(`user[issues_ingest]`, ingest);
    this.setState({ disableIngest: true });

    axios
      .put('/users/ingest.json', data)
      .then((response) => {
        this.setState({ redirect: true, redirectTo: '/' });
      })
      .catch((error) => {
        const { message } = error.response.data;
        this.setState({ showIngestAlert: true, ingestErrorMessage: message });
      })
      .finally(() => {
        setTimeout(() => {
          this.setState({ showIngestAlert: false, disableIngest: false });
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
          <Form className="pt-4">
            <h4>Ingest Issues .csv</h4>
            <Row>
              <Col xs={6}>
                {ingestAlert}
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
              disabled={determineEnabled}
            >
              Ingest & Continue
            </Button>
            <Row>
              <Col xs={6}>
                <Alert variant="info" className="mt-3">
                  We expect headers - issue_id, project_id, status, issue_type,
                  issue_key, change_log, summary, due_date & created.
                </Alert>
              </Col>
            </Row>
          </Form>
        </Container>

        <Footer />
      </section>
    );
  }
}
