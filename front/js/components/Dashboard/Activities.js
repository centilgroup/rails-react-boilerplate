/**
 * @file Activities component.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Card,
  Col,
  Collapse,
  Image,
  ListGroup,
  OverlayTrigger,
  ProgressBar,
  Row,
  Tooltip,
} from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import Skeleton from 'react-loading-skeleton';
import { SortableHandle } from 'react-sortable-hoc';
import axios from 'axios';
import moment from 'moment';
import formattedTime from '../../utils/timeFormatter';

export default class Activities extends Component {
  constructor(props) {
    super(props);
    const { activities } = JSON.parse(localStorage.getItem('user'));
    this.state = {
      issues: [],
      selectedIssueId: '',
      jiraActivityLoading: false,
      jiraActivityHasMore: false,
      projectId: props.projectId,
      show: activities === null ? true : activities,
    };
  }

  componentDidMount() {
    const { projectId } = this.props;
    this.fetchInitData(projectId);
  }

  selectIssue = (issueId) => {
    this.setState({ selectedIssueId: issueId });
  };

  fetchInitData = (projectId) => {
    this.setState({
      projectId,
      jiraActivityLoading: true,
      jiraActivityHasMore: true,
    });

    axios
      .get(`/dashboard/activities.json?start_at=0&project_id=${projectId}`)
      .then((response) => {
        const { data } = response;
        this.setState({
          issues: data.issues,
          show: [null, true].includes(data.collapsable),
        });
      })
      .catch(() => {})
      .finally(() => {
        const { issues } = this.state;
        this.setState({ jiraActivityLoading: false });
        if (issues.length === 0) {
          this.setState({ jiraActivityHasMore: false });
        } else {
          this.setState({ selectedIssueId: issues[0].id });
        }
      });
  };

  fetchMoreData = () => {
    const { issues, projectId } = this.state;
    const startAt = issues.length;
    const URL = `/dashboard/activities.json?start_at=${startAt}&project_id=${projectId}`;

    axios
      .get(URL)
      .then((response) => {
        const { data } = response;
        this.setState({ issues: issues.concat(data.issues) });
        if (data.issues.length === 0) {
          this.setState({ jiraActivityHasMore: false });
        }
      })
      .catch(() => {})
      .finally(() => {});
  };

  minMaxHandler = (value) => {
    this.setState({ show: !value });

    const data = {
      user: { activities: !value },
    };

    axios
      .put('/users/update.json', data)
      .then((response) => {
        localStorage.setItem('user', JSON.stringify(response.data));
      })
      .catch(() => {
        this.setState({ show: value });
      });
  };

  renderMinMaxIcon = (param) => {
    if (param) return <i className="fa fa-minus" />;

    return <i className="fa fa-plus" />;
  };

  renderAverageTimes = () => {
    let leadTime = 0;
    let developmentTime = 0;
    let reviewTime = 0;
    let deploymentTime = 0;
    const { issues, selectedIssueId } = this.state;
    const selectedIssue = issues.filter(
      (issue) => issue.id === selectedIssueId,
    );
    const style = {
      height: 300,
      overflow: 'auto',
    };
    const leadStatus = ['backlog', 'to do', 'open'];
    const devStatus = ['selected for development', 'in progress'];
    const revStatus = ['review', 'qa', 'ready for review', 'in review'];
    const deployStatus = ['done', 'closed'];

    if (selectedIssue.length === 0) {
      return <div />;
    }

    const { histories } = selectedIssue[0].change_log;
    const IssueCreatedAt = selectedIssue[0].created;
    const currentStatus = selectedIssue[0].status.name.toLowerCase();
    const totalTime = moment().diff(
      moment(selectedIssue[0].created),
      'minutes',
    );
    const statusChanges = histories.filter(
      (history) =>
        ['status', 'resolution'].includes(history.items[0].field) &&
        history.items[0].fieldtype === 'jira',
    );

    if (statusChanges.length === 0) {
      if (leadStatus.includes(currentStatus)) {
        leadTime += totalTime;
      } else if (devStatus.includes(currentStatus)) {
        developmentTime += totalTime;
      } else if (revStatus.includes(currentStatus)) {
        reviewTime += totalTime;
      } else if (deployStatus.includes(currentStatus)) {
        deploymentTime += totalTime;
      }
    }

    statusChanges.forEach((statusChange, index) => {
      const lastIndex = statusChange.items.length - 1;
      const status = statusChange.items[lastIndex].toString
        .toString()
        .toLowerCase();

      if (index === 0) {
        const diff = moment().diff(moment(statusChange.created), 'minutes');

        if (leadStatus.includes(status)) {
          leadTime += diff;
        } else if (devStatus.includes(status)) {
          developmentTime += diff;
        } else if (revStatus.includes(status)) {
          reviewTime += diff;
        } else if (deployStatus.includes(status)) {
          deploymentTime += diff;
        }
      } else if (index === statusChanges.length - 1) {
        const diff = moment(statusChange.created).diff(
          moment(IssueCreatedAt),
          'minutes',
        );

        if (leadStatus.includes(status)) {
          leadTime += diff;
        } else if (devStatus.includes(status)) {
          developmentTime += diff;
        } else if (revStatus.includes(status)) {
          reviewTime += diff;
        } else if (deployStatus.includes(status)) {
          deploymentTime += diff;
        }
      } else if (index > 0 || index < statusChanges.length - 1) {
        const createdAt = statusChanges[index + 1].created;
        const diff = moment(statusChange.created).diff(
          moment(createdAt),
          'minutes',
        );

        if (leadStatus.includes(status)) {
          leadTime += diff;
        } else if (devStatus.includes(status)) {
          developmentTime += diff;
        } else if (revStatus.includes(status)) {
          reviewTime += diff;
        } else if (deployStatus.includes(status)) {
          deploymentTime += diff;
        }
      }
    });

    if (
      leadTime === 0 &&
      developmentTime === 0 &&
      reviewTime === 0 &&
      deploymentTime === 0
    ) {
      if (leadStatus.includes(currentStatus)) {
        leadTime += totalTime;
      } else if (devStatus.includes(currentStatus)) {
        developmentTime += totalTime;
      } else if (revStatus.includes(currentStatus)) {
        reviewTime += totalTime;
      } else if (deployStatus.includes(currentStatus)) {
        deploymentTime += totalTime;
      }
    }

    const percentage = (time) => Math.floor((time / totalTime) * 100);

    return (
      <Card>
        <Card.Body>
          <Card.Title>Time Spent</Card.Title>
          <div style={style}>
            <div className="mb-4">
              <div className="mb-2 d-flex justify-content-between avg-count">
                <div>Lead Time</div>
                <div className="le-ti">{formattedTime(leadTime)}</div>
              </div>
              <ProgressBar className="lead-time" now={percentage(leadTime)} />
            </div>

            <div className="mb-4">
              <div className="mb-2 d-flex justify-content-between avg-count">
                <div>Development Time</div>
                <div className="dev">{formattedTime(developmentTime)}</div>
              </div>
              <ProgressBar
                className="development"
                now={percentage(developmentTime)}
              />
            </div>

            <div className="mb-4">
              <div className="mb-2 d-flex justify-content-between avg-count">
                <div>Review Time</div>
                <div className="rev">{formattedTime(reviewTime)}</div>
              </div>
              <ProgressBar className="review" now={percentage(reviewTime)} />
            </div>

            <div className="mb-4">
              <div className="mb-2 d-flex justify-content-between avg-count">
                <div>Deployment Time</div>
                <div className="deploy">{formattedTime(deploymentTime)}</div>
              </div>
              <ProgressBar
                className="deployment"
                now={percentage(deploymentTime)}
              />
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  render() {
    const {
      issues,
      selectedIssueId,
      jiraActivityLoading,
      jiraActivityHasMore,
      show,
    } = this.state;
    const activitiesStyle = {
      height: 300,
      overflow: 'auto',
    };
    const sectionStyle = { position: 'relative' };
    const helperStyle = {
      position: 'absolute',
      bottom: 0,
      right: 0,
      fontSize: '24px',
      opacity: 0.5,
    };
    const DragHandle = SortableHandle(() => (
      <i className="fa fa-bars" style={{ cursor: 'move' }} />
    ));

    let listIssues;

    if (jiraActivityLoading) {
      listIssues = <Skeleton count={10} />;
    } else if (issues.length === 0) {
      listIssues = <div>No activities found.</div>;
    } else {
      listIssues = issues.map((issue) => (
        <ListGroup.Item
          key={issue.id}
          className={`${
            selectedIssueId === issue.id ? 'selected d-flex' : 'd-flex'
          }`}
          onClick={() => this.selectIssue(issue.id)}
        >
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

    return (
      <Row className="pt-4">
        <Col xs={12}>
          <Card>
            <Card.Header
              className="d-flex justify-content-between align-items-center"
              onClick={() => this.minMaxHandler(show)}
            >
              <span>
                <DragHandle /> Activities & Time Spent
              </span>
              {this.renderMinMaxIcon(show)}
            </Card.Header>
            <Collapse in={show}>
              <div style={sectionStyle}>
                <Card.Body>
                  <Row>
                    <Col xs={8}>
                      <Card>
                        <Card.Body>
                          <Card.Title>Activities</Card.Title>
                          <ListGroup
                            variant="flush"
                            style={activitiesStyle}
                            id="jiraActivity"
                          >
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
                    <Col xs={4}>{this.renderAverageTimes()}</Col>
                  </Row>
                </Card.Body>
                <OverlayTrigger
                  key="activitiesHelper"
                  placement="top"
                  overlay={
                    <Tooltip id="activitiesHelper">
                      Activities & Time Spent
                    </Tooltip>
                  }
                >
                  <i
                    className="fa fa-question-circle m-3"
                    style={helperStyle}
                  />
                </OverlayTrigger>
              </div>
            </Collapse>
          </Card>
        </Col>
      </Row>
    );
  }
}

Activities.propTypes = {
  projectId: PropTypes.string,
};
