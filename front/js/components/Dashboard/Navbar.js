/**
 * @file Navbar component.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Alert,
  Button,
  Dropdown,
  Figure,
  Form,
  Modal,
  Spinner,
  Table,
} from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Redirect } from 'react-router';

export default class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: props.projects,
      redirect: false,
      projectsSync: false,
      issuesSync: false,
      showVPI: false,
      testVPI: 1,
      testAverageTimeToClose: 1,
      testRemainingIssues: 1,
      testRemainingDays: 1,
      user: JSON.parse(localStorage.getItem('user')),
      showProjectVPIs: false,
      showIngest: false,
      projectVPIs: [],
      ingest: null,
      ingestType: 'projects',
      showIngestAlert: false,
      ingestErrorMessage: '',
      disableIngest: false,
    };
  }

  componentDidMount() {
    this.fetchInitData();
  }

  fetchInitData = (projectId = '') => {
    axios
      .get(`/dashboard/projects_vpi.json?project_id=${projectId}`)
      .then((response) => {
        const { data } = response;

        this.setState({ projectVPIs: data.vpi_by_project });
      })
      .catch(() => {})
      .finally(() => {});
  };

  logoutUser = () => {
    axios.delete('/users/sign_out.json').then(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      this.setState({ redirect: true });
    });
  };

  handleIngestTypeChange = (event) => {
    this.setState({ ingestType: event.target.value });
  };

  handleIngestChange = (event) => {
    this.setState({ ingest: event.target.files[0] });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { ingest, ingestType } = this.state;
    const data = new FormData();
    data.append(`user[${ingestType}_ingest]`, ingest);
    this.setState({ disableIngest: true });

    axios
      .put('/users/ingest.json', data)
      .then((response) => {
        window.location.href = '/';
      })
      .catch((error) => {
        const { message } = error.response.data;
        this.setState({ showIngestAlert: true, ingestErrorMessage: message });
      })
      .finally(() => {
        this.setState({ disableIngest: false });
        setTimeout(() => {
          this.setState({ showIngestAlert: false });
        }, 3000);
      });
  };

  handleVPIClose = () => this.setState({ showVPI: false });

  handleVPIShow = () => this.setState({ showVPI: true });

  handleProjectVPIsClose = () => this.setState({ showProjectVPIs: false });

  handleProjectVPIsShow = () => this.setState({ showProjectVPIs: true });

  handleIngestClose = () =>
    this.setState({ showIngest: false, ingestType: 'projects', ingest: null });

  handleIngestShow = () => this.setState({ showIngest: true });

  handleRD = (event) => {
    const { value } = event.target;
    if (value === '') return;
    this.setState({ testRemainingDays: value });
    this.updateVPI('rd', value);
  };

  handleRI = (event) => {
    const { value } = event.target;
    if (value === '') return;
    this.setState({ testRemainingIssues: value });
    this.updateVPI('ri', value);
  };

  handleACR = (event) => {
    const { value } = event.target;
    if (value === '') return;
    this.setState({ testAverageTimeToClose: value });
    this.updateVPI('acr', value);
  };

  updateVPI = (param, value) => {
    let {
      testAverageTimeToClose,
      testRemainingIssues,
      testRemainingDays,
    } = this.state;

    if (param === 'rd') {
      testRemainingDays = value;
    } else if (param === 'ri') {
      testRemainingIssues = value;
    } else if (param === 'acr') {
      testAverageTimeToClose = value;
    }

    const testVPI = (
      testRemainingDays /
      (testAverageTimeToClose * testRemainingIssues)
    ).toFixed(2);

    this.setState({ testVPI });
  };

  syncProjects = () => {
    this.setState({ projectsSync: true });

    axios
      .put('/users/sync_projects.json', {})
      .then((response) => {
        const { projects } = response.data;
        this.setState({ projects });
      })
      .finally(() => {
        this.setState({ projectsSync: false });
      });
  };

  syncIssues = () => {
    this.setState({ issuesSync: true });

    axios
      .put('/users/sync_issues.json', {})
      .then((response) => {
        window.location.href = '/';
      })
      .finally(() => {
        this.setState({ issuesSync: false });
      });
  };

  calculateVPI = (days, issues, rate) => {
    if (days === null || issues === 0 || [0, null].includes(rate)) {
      return '--';
    }

    return (days / (issues * rate)).toFixed(2);
  };

  projectName = (projectId) => {
    const { projects } = this.state;
    const filteredProject = projects.filter(
      (project) => project.project_id === projectId,
    );

    if (filteredProject.length <= 0) {
      return projectId;
    }

    return filteredProject[0].name;
  };

  render() {
    const {
      redirect,
      projectsSync,
      issuesSync,
      showVPI,
      testVPI,
      testAverageTimeToClose,
      testRemainingIssues,
      testRemainingDays,
      user,
      showProjectVPIs,
      showIngest,
      projectVPIs,
      showIngestAlert,
      ingestErrorMessage,
      disableIngest,
      ingestType,
    } = this.state;

    let ingestAlert;
    let ingestInfoMessage;

    if (ingestType === 'issues') {
      ingestInfoMessage =
        'issue_id, project_id, status, issue_type, issue_key, change_log, summary, due_date & created';
    } else if (ingestType === 'boards') {
      ingestInfoMessage =
        'board_id, name, board_type, project_id, column_config';
    } else if (ingestType === 'projects') {
      ingestInfoMessage = 'project_id, key & name';
    }

    if (showIngestAlert) {
      ingestAlert = (
        <Alert variant="danger">
          <span>{ingestErrorMessage}</span>
        </Alert>
      );
    }

    if (redirect) {
      return <Redirect to="/login" />;
    }

    return (
      <>
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
                <Figure className="m-0 d-flex justify-content-center">
                  <Figure.Image
                    src="/avatar.jpg"
                    width={50}
                    height={30}
                    alt="Avatar"
                    className="m-0"
                  />
                </Figure>
                <Figure.Caption className="text-center">
                  {user.email}
                </Figure.Caption>
                <Dropdown.Divider />
                <Dropdown.Item href="#" onClick={this.handleIngestShow}>
                  Ingest .csv
                </Dropdown.Item>
                <Dropdown.Item href="#" onClick={this.handleVPIShow}>
                  VPI Calculator
                </Dropdown.Item>
                <Dropdown.Item href="#" onClick={this.handleProjectVPIsShow}>
                  VPI By Project
                </Dropdown.Item>
                <Dropdown.Item
                  href="#"
                  onClick={this.syncProjects}
                  disabled={projectsSync}
                >
                  Sync Projects{' '}
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
                </Dropdown.Item>
                <Dropdown.Item
                  href="#"
                  onClick={this.syncIssues}
                  disabled={issuesSync}
                >
                  Sync Issues{' '}
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
                </Dropdown.Item>
                <NavLink to="/profile">
                  <Dropdown.Item as="span">Profile</Dropdown.Item>
                </NavLink>
                <Dropdown.Item href="#" onClick={this.logoutUser}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </span>
        </nav>

        <Modal
          show={showVPI}
          onHide={this.handleVPIClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>VPI Test Harness</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Remaining Period (Days)</Form.Label>
              <Form.Control
                type="number"
                value={testRemainingDays}
                onChange={this.handleRD}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Remaining Issues</Form.Label>
              <Form.Control
                type="number"
                value={testRemainingIssues}
                onChange={this.handleRI}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Average Completion Rate (Days)</Form.Label>
              <Form.Control
                type="number"
                value={testAverageTimeToClose}
                onChange={this.handleACR}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Value Performance Index</Form.Label>
              <div className="text-center" style={{ fontSize: '32px' }}>
                {testVPI}
              </div>
            </Form.Group>
          </Modal.Body>
        </Modal>

        <Modal
          show={showProjectVPIs}
          onHide={this.handleProjectVPIsClose}
          backdrop="static"
          keyboard={false}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>VPI By Project</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '500px', overflowY: 'scroll' }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Remaining Period (Days)</th>
                  <th>Remaining Issues</th>
                  <th>Average Completion Rate (Days)</th>
                  <th>VPI</th>
                </tr>
              </thead>
              <tbody>
                {projectVPIs.map((vpi) => (
                  <tr key={vpi.project_id}>
                    <td>{this.projectName(vpi.project_id)}</td>
                    <td>
                      {vpi.remaining_days === null ? '--' : vpi.remaining_days}
                    </td>
                    <td>{vpi.remaining_issues}</td>
                    <td>
                      {vpi.average_time_to_close === null
                        ? '--'
                        : vpi.average_time_to_close}
                    </td>
                    <td>
                      {this.calculateVPI(
                        vpi.remaining_days,
                        vpi.remaining_issues,
                        vpi.average_time_to_close,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Modal.Body>
        </Modal>

        <Modal
          show={showIngest}
          onHide={this.handleIngestClose}
          backdrop="static"
          keyboard={false}
          size="md"
        >
          <Modal.Header closeButton>
            <Modal.Title>Ingest .csv</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {ingestAlert}
              <Form.Control
                as="select"
                size="md"
                onChange={this.handleIngestTypeChange}
              >
                <option value="projects">Projects</option>
                <option value="issues">Issues</option>
                <option value="boards">Boards</option>
              </Form.Control>
              <Form.File
                name="ingest"
                onChange={this.handleIngestChange}
                accept=".csv"
                className="mt-3"
              />
              <Button
                variant="outline-primary"
                type="submit"
                onClick={this.handleSubmit}
                disabled={disableIngest}
                className="mt-3"
              >
                Ingest
              </Button>
              <Alert variant="info" className="mt-3">
                For {ingestType}, we expect headers - {ingestInfoMessage}.
              </Alert>
            </Form>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

Navbar.propTypes = {
  projects: PropTypes.instanceOf(Array),
};
