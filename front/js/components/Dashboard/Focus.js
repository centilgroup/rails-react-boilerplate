/**
 * @file Focus component.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Card,
  Col,
  Collapse,
  OverlayTrigger,
  ProgressBar,
  Row,
  Tooltip,
} from 'react-bootstrap';
import { SortableHandle } from 'react-sortable-hoc';
import moment from 'moment';
import formattedTime from '../../utils/timeFormatter';

export default class Focus extends Component {
  constructor(props) {
    super(props);
    const { focus } = JSON.parse(localStorage.getItem('user'));
    this.state = {
      epics: [],
      epicIssues: [],
      bugs: [],
      tasks: [],
      leadTime: '',
      hoveredFocus: '',
      show: focus === null ? true : focus,
    };
  }

  componentDidMount() {
    const { projectId } = this.props;
    this.fetchInitData(projectId);
  }

  fetchInitData = (projectId) => {
    axios
      .get(`/dashboard/focus.json?project_id=${projectId}`)
      .then((response) => {
        const { data } = response;

        this.setState({
          epics: data.epics,
          epicIssues: data.epic_issues,
          bugs: data.bugs,
          tasks: data.tasks,
          show: [null, true].includes(data.collapsable),
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  clearLeadTime = (event) => {
    event.stopPropagation();
    this.setState({ hoveredFocus: '', leadTime: '' });
  };

  minMaxHandler = (value) => {
    this.setState({ show: !value });

    const data = {
      user: { focus: !value },
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

  displayLeadTime = (epicId) => {
    this.setState({ hoveredFocus: epicId, leadTime: 'Loading...' });

    axios
      .get(`/dashboard/${epicId}.json`)
      .then((response) => {
        const { data } = response;
        let leadTime = 0;
        const leadStatus = ['backlog', 'to do', 'open'];
        const { histories } = data.change_log;
        const IssueCreatedAt = data.created;
        const currentStatus = data.status.name.toLowerCase();
        const totalTime = moment().diff(moment(IssueCreatedAt), 'minutes');
        const statusChanges = histories.filter(
          (history) =>
            ['status', 'resolution'].includes(history.items[0].field) &&
            history.items[0].fieldtype === 'jira',
        );

        if (statusChanges.length === 0 && leadStatus.includes(currentStatus)) {
          leadTime += totalTime;
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
            }
          } else if (index === statusChanges.length - 1) {
            const diff = moment(statusChange.created).diff(
              moment(IssueCreatedAt),
              'minutes',
            );

            if (leadStatus.includes(status)) {
              leadTime += diff;
            }
          } else if (index > 0 || index < statusChanges.length - 1) {
            const createdAt = statusChanges[index + 1].created;
            const diff = moment(statusChange.created).diff(
              moment(createdAt),
              'minutes',
            );

            if (leadStatus.includes(status)) {
              leadTime += diff;
            }
          }
        });

        if (leadTime === 0 && leadStatus.includes(currentStatus)) {
          leadTime += totalTime;
        }

        this.setState({
          hoveredFocus: epicId,
          leadTime: formattedTime(leadTime),
        });
      })
      .finally(() => {});
  };

  renderFocus = (focus, index) => {
    const colors = ['new-work', 'legacy-refactor', 'help-others', 'churn'];
    const { epicIssues, leadTime, hoveredFocus } = this.state;
    const filteredEpicIssues = epicIssues.filter(
      (epicIssue) => epicIssue.epic_link === focus.key,
    );
    let percentage;
    if (focus.status.name === 'Done') {
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
      <div
        className="mb-4"
        key={focus.key}
        onClick={() => this.displayLeadTime(focus.issue_id)}
        style={{ cursor: 'pointer' }}
        aria-hidden="true"
      >
        <div className="mb-2 d-flex justify-content-between">
          <div>{focus.epic_name || focus.key}</div>
          <div className={`${hoveredFocus === focus.issue_id ? '' : 'd-none'}`}>
            [Lead Time: {leadTime}]
            <i
              className="fa fa-times ml-1"
              onClick={this.clearLeadTime}
              aria-hidden="true"
            />
          </div>
          <div className={`${hoveredFocus === focus.issue_id ? 'd-none' : ''}`}>
            {percentage}%
          </div>
        </div>
        <ProgressBar className={colors[index % 4]} now={percentage} />
      </div>
    );
  };

  render() {
    const { epics, bugs, tasks, show } = this.state;
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

    let listEpics;
    let listBugs;
    let listTasks;

    if (epics.length > 0) {
      listEpics = epics.map((epic, index) => this.renderFocus(epic, index));
    } else {
      listEpics = <div>No epics found.</div>;
    }

    if (bugs.length > 0) {
      listBugs = bugs.map((bug, index) => this.renderFocus(bug, index));
    } else {
      listBugs = <div>No bugs found.</div>;
    }

    if (tasks.length > 0) {
      listTasks = tasks.map((task, index) => this.renderFocus(task, index));
    } else {
      listTasks = <div>No tasks found.</div>;
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
                <DragHandle /> Focus
              </span>
              {this.renderMinMaxIcon(show)}
            </Card.Header>
            <Collapse in={show}>
              <div style={sectionStyle}>
                <Card.Body>
                  <Row>
                    <Col xs={4}>
                      <Card>
                        <Card.Body>
                          <Card.Title>Epics</Card.Title>
                          <div className="focus">{listEpics}</div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={4}>
                      <Card>
                        <Card.Body>
                          <Card.Title>Bugs</Card.Title>
                          <div className="focus">{listBugs}</div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={4}>
                      <Card>
                        <Card.Body>
                          <Card.Title>Tasks</Card.Title>
                          <div className="focus">{listTasks}</div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
                <OverlayTrigger
                  key="focusHelper"
                  placement="top"
                  overlay={
                    <Tooltip id="focusHelper">
                      Focus - Epics, Bugs & Tasks
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

Focus.propTypes = {
  projectId: PropTypes.string,
};
