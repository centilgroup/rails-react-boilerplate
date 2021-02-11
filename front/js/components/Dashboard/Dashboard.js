import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import GaugeChart from 'react-gauge-chart';
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
  Button,
  Image,
  OverlayTrigger,
  Tooltip,
  ProgressBar,
  Form,
  Alert,
} from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';
import { Redirect } from 'react-router';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issues: [],
      epics: [],
      epicIssues: [],
      projects: [],
      devArcLength: [0.7, 0.3],
      testArcLength: [0.2, 0.8],
      deployArcLength: [0.15, 0.85],
      redirect: false,
      project_id: '',
      jiraActivityLoading: false,
      jiraActivityHasMore: true,
      showAlert: false,
    };
  }

  componentDidMount = () => {
    this.fetchInitData();
  };

  fetchInitData = (project_id = '') => {
    this.setState({ jiraActivityLoading: true, jiraActivityHasMore: true });

    axios
      .get(`/jiras.json?project_id=${project_id}`)
      .then((response) => {
        this.setState({ issues: response.data, jiraActivityLoading: false });
      })
      .catch(() => {
        this.setState({ jiraActivityLoading: false, showAlert: true });
      })
      .finally(() => {
        const { issues } = this.state;
        if (issues.length === 0) {
          this.setState({ jiraActivityHasMore: false });
        }
        setTimeout(() => {
          this.setState({ showAlert: false });
        }, 3000);
      });

    axios.get(`/jiras/stat.json?project_id=${project_id}`).then((response) => {
      const { data } = response;
      const {
        total_backlog,
        total_in_progress,
        total_done,
        grand_total,
        epics,
        epic_issues,
        projects,
      } = data;
      let devPercent;
      let devPendingPercent;
      let testPercent;
      let testPendingPercent;
      let deployPercent;
      let deployPendingPercent;

      if (grand_total > 0) {
        devPercent = total_backlog / grand_total;
        devPendingPercent = (grand_total - total_backlog) / grand_total;
        testPercent = total_in_progress / grand_total;
        testPendingPercent = (grand_total - total_in_progress) / grand_total;
        deployPercent = total_done / grand_total;
        deployPendingPercent = (grand_total - total_done) / grand_total;
      }
      this.setState({
        devArcLength: [devPercent, devPendingPercent],
        testArcLength: [testPercent, testPendingPercent],
        deployArcLength: [deployPercent, deployPendingPercent],
        epics,
        epicIssues: epic_issues,
        projects,
      });
    });
  };

  fetchMoreData = () => {
    const { issues, project_id } = this.state;
    const startAt = issues.length;

    axios
      .get(`/jiras.json?start_at=${startAt}&project_id=${project_id}`)
      .then((response) => {
        this.setState({ issues: issues.concat(response.data) });
        if (response.data.length === 0) {
          this.setState({ jiraActivityHasMore: false });
        }
      })
      .catch(() => {
        this.setState({ showAlert: true });
      })
      .finally(() => {
        setTimeout(() => {
          this.setState({ showAlert: false });
        }, 3000);
      });
  };

  logoutUser = () => {
    axios.delete('/users/sign_out.json').then(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      this.setState({ redirect: true });
    });
  };

  handleProjectChange = (event) => {
    const { value } = event.target;
    this.setState({ project_id: value });
    this.fetchInitData(value);
  };

  renderFocus = (epic, index) => {
    const colors = ['new-work', 'legacy-refactor', 'help-others', 'churn'];
    const { epicIssues } = this.state;
    const filteredEpicIssues = epicIssues.filter(
      (epicIssue) => epicIssue.epic_link === epic.key,
    );
    let percentage;
    if (epic.status.name === 'Done') {
      percentage = 100;
    } else if (filteredEpicIssues.length > 0) {
      const doneEpicIssues = filteredEpicIssues.filter(
        (issue) => issue.status.name === 'Done',
      );
      const done = doneEpicIssues.length;
      const total = filteredEpicIssues.length;
      percentage = Math.round((done / total) * 100);
    } else {
      percentage = 0;
    }

    return (
      <div className="mb-4" key={epic.key}>
        <div className="mb-2 d-flex justify-content-between">
          <div>{epic.epic_name}</div>
          <div>{percentage}%</div>
        </div>
        <ProgressBar className={colors[index % 4]} now={percentage} />
      </div>
    );
  };

  render() {
    const {
      issues,
      epics,
      projects,
      redirect,
      devArcLength,
      testArcLength,
      deployArcLength,
      jiraActivityLoading,
      jiraActivityHasMore,
      showAlert,
    } = this.state;
    const style = {
      height: 300,
      overflow: 'auto',
    };
    const alertStyle = {
      position: 'fixed',
      zIndex: 2,
      width: '100%',
    };
    let listIssues;
    let listEpics;
    let alert;

    if (jiraActivityLoading) {
      listIssues = <Skeleton count={10} />;
    } else if (issues.length === 0) {
      listIssues = <div>No activities found.</div>;
    } else {
      listIssues = issues.map((issue) => (
        <ListGroup.Item key={issue.id} className="d-flex">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-issue-type-${issue.id}`}>
                {issue.issue_type.name}
              </Tooltip>
            }
          >
            <div>
              <Image
                src={issue.issue_type.icon_url}
                alt={issue.issue_type.name}
                rounded
              />
            </div>
          </OverlayTrigger>
          <div className="ml-2">
            <strong>{issue.key}</strong>
          </div>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-summary-${issue.id}`}>
                {issue.summary}
              </Tooltip>
            }
          >
            <div className="text-truncate ml-2 issue-summary">
              {issue.summary}
            </div>
          </OverlayTrigger>
          <div className="ml-auto">
            <Badge variant="secondary" className="text-uppercase">
              {issue.status.name}
            </Badge>
          </div>
        </ListGroup.Item>
      ));
    }

    if (epics.length > 0) {
      listEpics = epics.map((epic, index) => this.renderFocus(epic, index));
    } else {
      listEpics = <div>No epics found.</div>;
    }

    if (redirect) {
      return <Redirect to="/login" />;
    }

    if (showAlert) {
      alert = (
        <Alert variant="danger" style={alertStyle}>
          <span>
            An unexpected error occurred while fetching Jira issues!!!
          </span>
        </Alert>
      );
    }

    return (
      <section>
        {alert}

        <nav>
          <span>
            <NavLink to="/profile" className="mr-2">
              <Button variant="primary" size="sm">
                Profile
              </Button>
            </NavLink>
            <a href="/vpi-demo" className="mr-2">
              <Button variant="primary" size="sm">
                VPI
              </Button>
            </a>
            <NavLink to="/" onClick={this.logoutUser}>
              <Button variant="primary" size="sm">
                Logout
              </Button>
            </NavLink>
          </span>
        </nav>

        <Container className="pt-5">
          <Row className="pt-4">
            <Col xs={12}>
              <Form>
                <Form.Label>Projects Filter</Form.Label>
                <Form.Control
                  as="select"
                  size="lg"
                  onChange={this.handleProjectChange}
                >
                  {projects.map((project) => (
                    <option key={project.project_id} value={project.project_id}>
                      {project.name}
                    </option>
                  ))}
                </Form.Control>
              </Form>
            </Col>
          </Row>
          <Row className="pt-4">
            <Col xs={4}>
              <Card>
                <Card.Body>
                  <Card.Title className="text-center">Development</Card.Title>
                  <div className="d-flex align-items-center">
                    <div className="legend left-legend" />
                    <div>Backlog</div>
                    <div className="ml-auto">Remaining</div>
                    <div className="legend right-legend" />
                  </div>
                  <GaugeChart
                    className="gas-gauge"
                    id="gauge_chart_dev"
                    nrOfLevels={2}
                    arcsLength={devArcLength}
                    colors={['#e5e5e5', '#009cf0']}
                    cornerRadius={0}
                    arcWidth={0.1}
                    arcPadding={0.02}
                    hideText
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={4}>
              <Card>
                <Card.Body>
                  <Card.Title className="text-center">QA/Test</Card.Title>
                  <div className="d-flex align-items-center">
                    <div className="legend left-legend" />
                    <div>In Progress</div>
                    <div className="ml-auto">Remaining</div>
                    <div className="legend right-legend" />
                  </div>
                  <GaugeChart
                    className="gas-gauge"
                    id="gauge_chart_qa"
                    nrOfLevels={2}
                    arcsLength={testArcLength}
                    colors={['#e5e5e5', '#009cf0']}
                    cornerRadius={0}
                    arcWidth={0.1}
                    arcPadding={0.02}
                    hideText
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={4}>
              <Card>
                <Card.Body>
                  <Card.Title className="text-center">Deploy</Card.Title>
                  <div className="d-flex align-items-center">
                    <div className="legend left-legend" />
                    <div>Done</div>
                    <div className="ml-auto">Remaining</div>
                    <div className="legend right-legend" />
                  </div>
                  <GaugeChart
                    className="gas-gauge"
                    id="gauge_chart_deploy"
                    nrOfLevels={2}
                    arcsLength={deployArcLength}
                    colors={['#e5e5e5', '#009cf0']}
                    cornerRadius={0}
                    arcWidth={0.1}
                    arcPadding={0.02}
                    hideText
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="pt-4">
            <Col xs={3}>
              <Card>
                <Card.Body>
                  <ProgressBar className="lead-time" now={100} />
                  <div className="mb-2">Lead Time</div>
                  <div className="avg-count">
                    <span className="le-ti">14 days</span> avg.
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={3}>
              <Card>
                <Card.Body>
                  <ProgressBar className="development" now={100} />
                  <div className="mb-2">Development</div>
                  <div className="avg-count">
                    <span className="dev">2.3 day</span> avg.
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={3}>
              <Card>
                <Card.Body>
                  <ProgressBar className="review" now={100} />
                  <div className="mb-2">Review</div>
                  <div className="avg-count">
                    <span className="rev">12.4 hours</span> avg.
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={3}>
              <Card>
                <Card.Body>
                  <ProgressBar className="deployment" now={100} />
                  <div className="mb-2">Deployment</div>
                  <div className="avg-count">
                    <span className="deploy">2.7 week</span> avg.
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="pt-4">
            <Col xs={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Focus</Card.Title>
                  <div className="focus">{listEpics}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={8}>
              <Card>
                <Card.Body>
                  <Card.Title>Commit Breakdown</Card.Title>
                  <div className="d-flex justify-content-around align-items-center">
                    <div className="commit-risk-chart-holder">
                      <Doughnut
                        data={{
                          datasets: [
                            {
                              data: [60, 35, 5],
                              backgroundColor: [
                                'rgb(94,196,182)',
                                'rgb(241,203,73)',
                                'rgb(254,139,169)',
                              ],
                            },
                          ],
                          labels: ['Low', 'Medium', 'High'],
                        }}
                        width={224}
                        height={224}
                        options={{
                          cutoutPercentage: 80,
                          legend: {
                            display: false,
                          },
                          tooltips: {
                            enabled: true,
                          },
                        }}
                      />
                      <div className="total-commit">
                        <div className="number">18</div>
                        <div className="text">Total</div>
                        <div className="text">Commits</div>
                      </div>
                    </div>
                    <div className="risk-commit">
                      <div className="mb-4">
                        <div className="mb-2">Low Risk</div>
                        <div className="d-flex align-items-center">
                          <div className="risk-commit-value low mr-2">
                            11 (61%)
                          </div>
                          <div className="mr-1 up text-success">
                            <i className="fa fa-arrow-up mr-1" />
                            83%
                          </div>
                          <div className="text-secondary">since last PI</div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="mb-2">Medium Risk</div>
                        <div className="d-flex align-items-center">
                          <div className="risk-commit-value medium mr-2">
                            7 (39%)
                          </div>
                          <div className="mr-1 down text-danger">
                            <i className="fa fa-arrow-down mr-1" />
                            82%
                          </div>
                          <div className="text-secondary">since last PI</div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-2">High Risk</div>
                        <div className="d-flex align-items-center">
                          <div className="risk-commit-value high mr-2">
                            1 (0%)
                          </div>
                          <div className="mr-1 down text-danger">
                            <i className="fa fa-arrow-down mr-1" />
                            100%
                          </div>
                          <div className="text-secondary">since last PI</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="py-4">
            <Col xs={12}>
              <Card>
                <Card.Body>
                  <Card.Title>Jira Activity</Card.Title>
                  <ListGroup variant="flush" style={style} id="jiraActivity">
                    <InfiniteScroll
                      dataLength={issues.length}
                      next={this.fetchMoreData}
                      hasMore={jiraActivityHasMore}
                      loader={<Skeleton count={10} />}
                      scrollableTarget="jiraActivity"
                    >
                      {listIssues}
                    </InfiniteScroll>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            {/* <Col xs={6}> */}
            {/*  <Card> */}
            {/*    <Card.Body className="text-center"> */}
            {/*      Project Flow Health */}
            {/*    </Card.Body> */}
            {/*  </Card> */}
            {/* </Col> */}
          </Row>
        </Container>

        <hr />

        <div className="m-3">Centil, LLC 2021.</div>
      </section>
    );
  }
}
