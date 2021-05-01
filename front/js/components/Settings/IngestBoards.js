/**
 * @file IngestBoards component.
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

export default class IngestBoards extends Component {
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
    data.append(`user[boards_ingest]`, ingest);
    this.setState({ disableIngest: true });

    axios
      .put('/users/ingest.json', data)
      .then((response) => {
        this.setState({ redirect: true, redirectTo: 'initial-config-step-5' });
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
          <Form className="pt-4">
            <h4>Ingest Boards .csv</h4>
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
                  We expect headers - board_id, name, board_type, project_id,
                  column_config.
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
