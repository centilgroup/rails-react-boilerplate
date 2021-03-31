import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Doughnut, Bar, Bubble } from 'react-chartjs-2';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import GaugeChart from 'react-gauge-chart';
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
  Image,
  OverlayTrigger,
  Tooltip,
  ProgressBar,
  Form,
  Alert,
  Spinner,
  Modal,
  Collapse,
  Dropdown,
  Figure,
  Table,
} from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';
import { Redirect } from 'react-router';
import moment from 'moment';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import formattedTime from '../../utils/timeFormatter';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issues: [],
      selectedIssueId: '',
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
      projectsSync: false,
      issuesSync: false,
      epicLeadTime: '',
      hoveredEpic: '',
      remaining_days: null,
      remaining_issues: 0,
      average_time_to_close: null,
      showVPI: false,
      testVPI: 1,
      testAverageTimeToClose: 1,
      testRemainingIssues: 1,
      testRemainingDays: 1,
      totalBacklog: 0,
      totalWorkInProgress: 0,
      totalWorkInReview: 0,
      backlogLimit: 0,
      inProgressLimit: 0,
      inReviewLimit: 0,
      WIPChartType: 'bar',
      showWIPSection: true,
      showGaugeSection: true,
      showFocusSection: true,
      showVPISection: true,
      showActivitiesSection: true,
      sortableItems: ['vpi', 'wip', 'gauge', 'focus', 'activities'],
      user: {},
      showProjectVPIs: false,
      projectVPIs: [],
    };
  }

  componentDidMount = () => {
    this.fetchInitData();
    const user = JSON.parse(localStorage.getItem('user'));
    this.setState({ user });
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
        } else {
          this.setState({ selectedIssueId: issues[0].id });
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
        remaining_days,
        remaining_issues,
        average_time_to_close,
        total_work_in_progress,
        total_work_in_review,
        boards,
        min_max,
        sortable_items,
        vpi_by_project,
      } = data;
      let devPercent;
      let devPendingPercent;
      let testPercent;
      let testPendingPercent;
      let deployPercent;
      let deployPendingPercent;
      let backlogLimit = 0;
      let inProgressLimit = 0;
      let inReviewLimit = 0;
      let showWIPSection = true;
      let showGaugeSection = true;
      let showFocusSection = true;
      let showVPISection = true;
      let showActivitiesSection = true;
      let sortableItems = ['wip', 'gauge', 'focus', 'vpi', 'activities'];
      const leadStatus = ['backlog', 'to do', 'open'];
      const devStatus = ['selected for development', 'in progress'];
      const revStatus = ['review', 'qa', 'ready for review', 'in review'];

      if (grand_total > 0) {
        devPercent = total_backlog / grand_total;
        devPendingPercent = (grand_total - total_backlog) / grand_total;
        testPercent = total_in_progress / grand_total;
        testPendingPercent = (grand_total - total_in_progress) / grand_total;
        deployPercent = total_done / grand_total;
        deployPendingPercent = (grand_total - total_done) / grand_total;
      }

      if (boards.length > 0) {
        boards[0].column_config.forEach((config) => {
          if (config.statuses.length > 0 && config.max !== undefined) {
            if (leadStatus.includes(config.name.toLowerCase())) {
              backlogLimit += config.max;
            } else if (devStatus.includes(config.name.toLowerCase())) {
              inProgressLimit += config.max;
            } else if (revStatus.includes(config.name.toLowerCase())) {
              inReviewLimit += config.max;
            }
          }
        });
      }

      if (min_max !== null) {
        showWIPSection = min_max.showWIPSection;
        showGaugeSection = min_max.showGaugeSection;
        showFocusSection = min_max.showFocusSection;
        showVPISection = min_max.showVPISection;
        showActivitiesSection = min_max.showActivitiesSection;
      }

      if (sortable_items !== null) {
        sortableItems = sortable_items;
      }

      this.setState({
        devArcLength: [devPercent, devPendingPercent],
        testArcLength: [testPercent, testPendingPercent],
        deployArcLength: [deployPercent, deployPendingPercent],
        epics,
        epicIssues: epic_issues,
        projects,
        remaining_days,
        remaining_issues,
        average_time_to_close,
        totalBacklog: total_backlog,
        totalWorkInProgress: total_work_in_progress,
        totalWorkInReview: total_work_in_review,
        backlogLimit,
        inProgressLimit,
        inReviewLimit,
        showWIPSection,
        showGaugeSection,
        showFocusSection,
        showVPISection,
        showActivitiesSection,
        sortableItems,
        projectVPIs: vpi_by_project,
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

  selectIssue = (issueId) => {
    this.setState({ selectedIssueId: issueId });
  };

  clearEpicLeadTime = (event) => {
    event.stopPropagation();
    this.setState({ hoveredEpic: '', epicLeadTime: '' });
  };

  handleVPIClose = () => this.setState({ showVPI: false });

  handleVPIShow = () => this.setState({ showVPI: true });

  handleProjectVPIsClose = () => this.setState({ showProjectVPIs: false });

  handleProjectVPIsShow = () => this.setState({ showProjectVPIs: true });

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

  WIPChartTypeChangeHandler = (event) => {
    this.setState({ WIPChartType: event.target.id });
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

  displayLeadTime = (epicId) => {
    this.setState({ hoveredEpic: epicId, epicLeadTime: 'Loading...' });

    axios
      .get(`/jiras/${epicId}.json`)
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
          hoveredEpic: epicId,
          epicLeadTime: formattedTime(leadTime),
        });
      })
      .finally(() => {});
  };

  renderFocus = (epic, index) => {
    const colors = ['new-work', 'legacy-refactor', 'help-others', 'churn'];
    const { epicIssues, epicLeadTime, hoveredEpic } = this.state;
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
      <div
        className="mb-4"
        key={epic.key}
        onClick={() => this.displayLeadTime(epic.issue_id)}
        style={{ cursor: 'pointer' }}
        aria-hidden="true"
      >
        <div className="mb-2 d-flex justify-content-between">
          <div>{epic.epic_name}</div>
          <div className={`${hoveredEpic === epic.issue_id ? '' : 'd-none'}`}>
            [Lead Time: {epicLeadTime}]
            <i
              className="fa fa-times ml-1"
              onClick={this.clearEpicLeadTime}
              aria-hidden="true"
            />
          </div>
          <div className={`${hoveredEpic === epic.issue_id ? 'd-none' : ''}`}>
            {percentage}%
          </div>
        </div>
        <ProgressBar className={colors[index % 4]} now={percentage} />
      </div>
    );
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

  renderMinMaxIcon = (param) => {
    if (param) return <i className="fa fa-minus" />;

    return <i className="fa fa-plus" />;
  };

  minMaxHandler = (sectionName, value) => {
    const {
      showWIPSection,
      showGaugeSection,
      showFocusSection,
      showVPISection,
      showActivitiesSection,
    } = this.state;
    this.setState({ [sectionName]: !value });

    const data = {
      min_max: {
        showWIPSection,
        showGaugeSection,
        showFocusSection,
        showVPISection,
        showActivitiesSection,
        [sectionName]: !value,
      },
    };

    axios.put('/users/min_max_config.json', data);
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    let { sortableItems } = this.state;

    sortableItems = arrayMove(sortableItems, oldIndex, newIndex);

    this.setState({ sortableItems });

    axios.put('/users/sortable_items_config.json', {
      sortable_items: sortableItems,
    });
  };

  calculateVPI = (days, issues, rate) => {
    if (days === null || issues === 0 || [0, null].includes(rate)) {
      return '--';
    }

    return (days / (issues * rate)).toFixed(2);
  };

  projectName = (project_id) => {
    const { projects } = this.state;
    const filteredProject = projects.filter(
      (project) => project.project_id === project_id,
    );

    return filteredProject[0].name;
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
      selectedIssueId,
      projectsSync,
      issuesSync,
      remaining_days,
      remaining_issues,
      average_time_to_close,
      showVPI,
      testVPI,
      testAverageTimeToClose,
      testRemainingIssues,
      testRemainingDays,
      totalBacklog,
      totalWorkInProgress,
      totalWorkInReview,
      WIPChartType,
      backlogLimit,
      inProgressLimit,
      inReviewLimit,
      showWIPSection,
      showGaugeSection,
      showFocusSection,
      showVPISection,
      showActivitiesSection,
      sortableItems,
      user,
      showProjectVPIs,
      projectVPIs,
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
    let VPI;
    let healthRecommendation;
    let WIPChart;
    let VPIChart;
    let VPIPercent;

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

    if (
      remaining_days === null ||
      remaining_issues === 0 ||
      [0, null].includes(average_time_to_close)
    ) {
      VPI = '--';
    } else {
      VPI = (
        remaining_days /
        (remaining_issues * average_time_to_close)
      ).toFixed(2);
    }

    if (remaining_days === null) {
      healthRecommendation =
        'Please assign due date at least for an issue to view the VPI score.';
    } else if (remaining_issues === 0) {
      healthRecommendation =
        'There are no remaining issues to view the VPI score';
    } else if (average_time_to_close === null) {
      healthRecommendation =
        'At least one issue needs to be completed to view the VPI score.';
    } else if (average_time_to_close === 0) {
      healthRecommendation =
        'Average completion rate should be greater than zero to view the VPI score.';
    } else if (VPI > 1) {
      healthRecommendation = 'VPI indicates early delivery.';
      VPIPercent = 1;
    } else if (VPI < 1) {
      healthRecommendation = 'VPI indicates late delivery.';
      VPIPercent = 0;
    } else {
      healthRecommendation = 'VPI indicates on-schedule delivery.';
      VPIPercent = 0.5;
    }

    if (WIPChartType === 'bar') {
      const commonAnnotation = {
        drawTime: 'afterDatasetsDraw',
        type: 'box',
        xScaleID: 'x-axis-0',
        yScaleID: 'y-axis-0',
        backgroundColor: 'rgba(101, 33, 171, 0.5)',
        borderColor: 'rgb(101, 33, 171)',
        borderWidth: 1,
      };
      const backlogAnnotation = {
        ...commonAnnotation,
        xMin: -0.4,
        xMax: 0.4,
        yMin: backlogLimit,
        yMax: backlogLimit + 0.5,
      };
      const inProgressAnnotation = {
        ...commonAnnotation,
        xMin: 0.6,
        xMax: 1.4,
        yMin: inProgressLimit,
        yMax: inProgressLimit + 0.5,
      };
      const inReviewAnnotation = {
        ...commonAnnotation,
        xMin: 1.6,
        xMax: 2.4,
        yMin: inReviewLimit,
        yMax: inReviewLimit + 0.5,
      };
      WIPChart = (
        <Bar
          data={{
            labels: ['To Do', 'In Progress', 'In Review'],
            datasets: [
              {
                data: [totalBacklog, totalWorkInProgress, totalWorkInReview],
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
              },
            ],
          }}
          width={100}
          height={250}
          plugins={[ChartAnnotation]}
          options={{
            annotation: {
              annotations: [
                backlogLimit === 0 ? {} : backlogAnnotation,
                inProgressLimit === 0 ? {} : inProgressAnnotation,
                inReviewLimit === 0 ? {} : inReviewAnnotation,
              ],
            },
            maintainAspectRatio: false,
            legend: {
              display: false,
            },
            tooltips: {
              enabled: true,
              callbacks: {
                label(tooltipItem, data) {
                  const value = data.datasets[0].data[tooltipItem.index];
                  let label = ` WIP: ${value}`;
                  if (
                    tooltipItem.label.toLowerCase() === 'to do' &&
                    backlogLimit > 0
                  ) {
                    label += `; WIP Limit: ${backlogLimit}; Limit %: ${
                      (value / backlogLimit).toFixed(2) * 100
                    }`;
                  } else if (
                    tooltipItem.label.toLowerCase() === 'in progress' &&
                    inProgressLimit > 0
                  ) {
                    label += `; WIP Limit: ${inProgressLimit}; Limit %: ${
                      (value / inProgressLimit).toFixed(2) * 100
                    }`;
                  } else if (
                    tooltipItem.label.toLowerCase() === 'in review' &&
                    inReviewLimit > 0
                  ) {
                    label += `; WIP Limit: ${inReviewLimit}; Limit %: ${
                      (value / inReviewLimit).toFixed(2) * 100
                    }`;
                  }

                  return label;
                },
              },
            },
            scales: {
              xAxes: [
                {
                  gridLines: {
                    display: false,
                  },
                  ticks: {
                    display: true,
                  },
                },
              ],
              yAxes: [
                {
                  gridLines: {
                    display: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              ],
            },
          }}
        />
      );
    } else if (WIPChartType === 'bubble') {
      WIPChart = (
        <Bubble
          data={{
            labels: ['To Do', 'In Progress', 'In Review'],
            datasets: [
              {
                label: 'To Do',
                data: [{ x: 0.5, y: 1, r: totalBacklog }],
                backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)'],
                borderWidth: 1,
              },
              {
                label: 'To Do Limit',
                data: [{ x: 0.5, y: 1, r: backlogLimit }],
                backgroundColor: ['rgba(255, 255, 255, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 0.5)'],
                borderWidth: 2,
              },
              {
                label: 'In Progress',
                data: [{ x: 1.5, y: 1, r: totalWorkInProgress }],
                backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(54, 162, 235, 1)'],
                borderWidth: 1,
              },
              {
                label: 'In Progress Limit',
                data: [{ x: 1.5, y: 1, r: inProgressLimit }],
                backgroundColor: ['rgba(255, 255, 255, 0.2)'],
                borderColor: ['rgba(54, 162, 235, 0.5)'],
                borderWidth: 2,
              },
              {
                label: 'In Review',
                data: [{ x: 2.5, y: 1, r: totalWorkInReview }],
                backgroundColor: ['rgba(255, 206, 86, 0.2)'],
                borderColor: ['rgba(255, 206, 86, 1)'],
                borderWidth: 1,
              },
              {
                label: 'In Review Limit',
                data: [{ x: 2.5, y: 1, r: inReviewLimit }],
                backgroundColor: ['rgba(255, 255, 255, 0.2)'],
                borderColor: ['rgba(255, 206, 86, 0.5)'],
                borderWidth: 2,
              },
            ],
          }}
          width={100}
          height={250}
          options={{
            maintainAspectRatio: false,
            legend: {
              display: false,
            },
            tooltips: {
              enabled: true,
              callbacks: {
                label(tooltipItem, data) {
                  let label =
                    data.datasets[tooltipItem.datasetIndex].label || '';

                  if (label) {
                    label += ': ';
                  }
                  label += data.datasets[tooltipItem.datasetIndex].data[0].r;
                  return label;
                },
              },
            },
            scales: {
              xAxes: [
                {
                  gridLines: {
                    display: false,
                  },
                  ticks: {
                    min: 0,
                    display: false,
                  },
                },
              ],
              yAxes: [
                {
                  gridLines: {
                    display: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              ],
            },
          }}
        />
      );
    }

    if (VPI !== '--') {
      VPIChart = (
        <GaugeChart
          id="gauge_chart_vpi"
          colors={['#ff736f', '#ffce00', '#49d1c5']}
          cornerRadius={0}
          arcWidth={0.1}
          arcPadding={0.02}
          percent={VPIPercent}
          animate={false}
          hideText
          style={{ width: '75%' }}
        />
      );
    }

    const DragHandle = SortableHandle(() => (
      <i className="fa fa-bars" style={{ cursor: 'move' }} />
    ));

    const SortableItem = SortableElement(({ value }) => {
      if (value === 'wip') {
        return (
          <Row className="pt-4">
            <Col xs={12}>
              <Card>
                <Card.Header
                  className="d-flex justify-content-between align-items-center"
                  onClick={() =>
                    this.minMaxHandler('showWIPSection', showWIPSection)
                  }
                >
                  <div className="d-inline-flex">
                    <div className="mr-2">
                      <DragHandle /> WIP + WIP Limits
                    </div>
                    <Form onClick={(event) => event.stopPropagation()}>
                      <Form.Check
                        inline
                        label="Graph"
                        type="radio"
                        id="bar"
                        name="WIP"
                        onClick={this.WIPChartTypeChangeHandler}
                        defaultChecked={WIPChartType === 'bar'}
                      />
                      <Form.Check
                        inline
                        label="Circle Chart"
                        type="radio"
                        id="bubble"
                        name="WIP"
                        onClick={this.WIPChartTypeChangeHandler}
                        defaultChecked={WIPChartType === 'bubble'}
                      />
                    </Form>
                  </div>
                  {this.renderMinMaxIcon(showWIPSection)}
                </Card.Header>
                <Collapse in={showWIPSection} className="wip">
                  <Card.Body>{WIPChart}</Card.Body>
                </Collapse>
              </Card>
            </Col>
          </Row>
        );
      }

      if (value === 'gauge') {
        return (
          <Row className="pt-4">
            <Col xs={12}>
              <Card>
                <Card.Header
                  className="d-flex justify-content-between align-items-center"
                  onClick={() =>
                    this.minMaxHandler('showGaugeSection', showGaugeSection)
                  }
                >
                  <span>
                    <DragHandle /> Status Gauges
                  </span>
                  {this.renderMinMaxIcon(showGaugeSection)}
                </Card.Header>
                <Collapse in={showGaugeSection}>
                  <Card.Body>
                    <Row>
                      <Col xs={4}>
                        <Card>
                          <Card.Body>
                            <Card.Title className="text-center">
                              Backlog
                            </Card.Title>
                            <div className="d-flex align-items-center">
                              <div className="legend left-legend" />
                              <div>Backlog</div>
                              <div className="ml-auto">Remaining</div>
                              <div className="legend right-legend" />
                            </div>
                            <GaugeChart
                              id="gauge_chart_dev"
                              nrOfLevels={2}
                              arcsLength={devArcLength}
                              colors={['#e5e5e5', '#009cf0']}
                              cornerRadius={0}
                              arcWidth={0.1}
                              arcPadding={0.02}
                              hideText
                              needleColor="#FFFFFF"
                              needleBaseColor="#FFFFFF"
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xs={4}>
                        <Card>
                          <Card.Body>
                            <Card.Title className="text-center">
                              Development/QA/Test
                            </Card.Title>
                            <div className="d-flex align-items-center">
                              <div className="legend left-legend" />
                              <div>In Progress</div>
                              <div className="ml-auto">Remaining</div>
                              <div className="legend right-legend" />
                            </div>
                            <GaugeChart
                              id="gauge_chart_qa"
                              nrOfLevels={2}
                              arcsLength={testArcLength}
                              colors={['#e5e5e5', '#009cf0']}
                              cornerRadius={0}
                              arcWidth={0.1}
                              arcPadding={0.02}
                              hideText
                              needleColor="#FFFFFF"
                              needleBaseColor="#FFFFFF"
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xs={4}>
                        <Card>
                          <Card.Body>
                            <Card.Title className="text-center">
                              Deployment
                            </Card.Title>
                            <div className="d-flex align-items-center">
                              <div className="legend left-legend" />
                              <div>Done</div>
                              <div className="ml-auto">Remaining</div>
                              <div className="legend right-legend" />
                            </div>
                            <GaugeChart
                              id="gauge_chart_deploy"
                              nrOfLevels={2}
                              arcsLength={deployArcLength}
                              colors={['#e5e5e5', '#009cf0']}
                              cornerRadius={0}
                              arcWidth={0.1}
                              arcPadding={0.02}
                              hideText
                              needleColor="#FFFFFF"
                              needleBaseColor="#FFFFFF"
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Collapse>
              </Card>
            </Col>
          </Row>
        );
      }

      if (value === 'focus') {
        return (
          <Row className="pt-4">
            <Col xs={12}>
              <Card>
                <Card.Header
                  className="d-flex justify-content-between align-items-center"
                  onClick={() =>
                    this.minMaxHandler('showFocusSection', showFocusSection)
                  }
                >
                  <span>
                    <DragHandle /> Focus & Risk Commit
                  </span>
                  {this.renderMinMaxIcon(showFocusSection)}
                </Card.Header>
                <Collapse in={showFocusSection}>
                  <Card.Body>
                    <Row>
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
                                    <div className="text-secondary">
                                      since last PI
                                    </div>
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
                                    <div className="text-secondary">
                                      since last PI
                                    </div>
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
                                    <div className="text-secondary">
                                      since last PI
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Collapse>
              </Card>
            </Col>
          </Row>
        );
      }

      if (value === 'vpi') {
        return (
          <Row className="pt-4">
            <Col xs={12}>
              <Card>
                <Card.Header
                  className="d-flex justify-content-between align-items-center"
                  onClick={() =>
                    this.minMaxHandler('showVPISection', showVPISection)
                  }
                >
                  <span>
                    <DragHandle /> Project Flow Health
                  </span>
                  {this.renderMinMaxIcon(showVPISection)}
                </Card.Header>
                <Collapse in={showVPISection}>
                  <Card.Body className="text-center">
                    <Card.Text className="text-info">
                      {healthRecommendation}
                    </Card.Text>
                    <div className="d-flex align-items-center justify-content-around">
                      <div className="pt-2">
                        <div style={{ fontSize: '32px' }}>
                          {remaining_days === null ? '--' : remaining_days}
                        </div>
                        <div className="mt-1">Remaining Period (Days)</div>
                      </div>
                      <div className="pt-2">
                        <div style={{ fontSize: '32px' }}>
                          {remaining_issues}
                        </div>
                        <div className="mt-1">Remaining Issues</div>
                      </div>
                      <div className="pt-2">
                        <div style={{ fontSize: '32px' }}>
                          {average_time_to_close === null
                            ? '--'
                            : average_time_to_close}
                        </div>
                        <div className="mt-1">
                          Average Completion Rate (Days)
                        </div>
                      </div>
                      <div className="pt-2">
                        {VPIChart}
                        <div style={{ fontSize: '32px' }}>{VPI}</div>
                        <div className="mt-1">VPI</div>
                      </div>
                    </div>
                  </Card.Body>
                </Collapse>
              </Card>
            </Col>
          </Row>
        );
      }

      if (value === 'activities') {
        return (
          <Row className="py-4">
            <Col xs={12}>
              <Card>
                <Card.Header
                  className="d-flex justify-content-between align-items-center"
                  onClick={() =>
                    this.minMaxHandler(
                      'showActivitiesSection',
                      showActivitiesSection,
                    )
                  }
                >
                  <span>
                    <DragHandle /> Activities & Time Spent
                  </span>
                  {this.renderMinMaxIcon(showActivitiesSection)}
                </Card.Header>
                <Collapse in={showActivitiesSection}>
                  <Card.Body>
                    <Row>
                      <Col xs={8}>
                        <Card>
                          <Card.Body>
                            <Card.Title>Activities</Card.Title>
                            <ListGroup
                              variant="flush"
                              style={style}
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
                </Collapse>
              </Card>
            </Col>
          </Row>
        );
      }

      return '';
    });

    const SortableList = SortableContainer(({ items }) => {
      return (
        <div>
          {items.map((value, index) => (
            <SortableItem key={`item-${value}`} index={index} value={value} />
          ))}
        </div>
      );
    });

    return (
      <section>
        {alert}

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
                <NavLink to="/" onClick={this.logoutUser}>
                  <Dropdown.Item as="span">Logout</Dropdown.Item>
                </NavLink>
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

        <Container className="pt-5">
          <Row className="pt-4">
            <Col xs={12}>
              <Form>
                <div className="mb-1">Projects Filter</div>
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
          <SortableList
            items={sortableItems}
            onSortEnd={this.onSortEnd}
            useDragHandle
          />
          {/* <Row className="pt-4"> */}
          {/*  <Col xs={3}> */}
          {/*    <Card> */}
          {/*      <Card.Body> */}
          {/*        <ProgressBar className="lead-time" now={100} /> */}
          {/*        <div className="mb-2">Lead Time</div> */}
          {/*        <div className="avg-count"> */}
          {/*          <span className="le-ti">14 days</span> avg. */}
          {/*        </div> */}
          {/*      </Card.Body> */}
          {/*    </Card> */}
          {/*  </Col> */}
          {/*  <Col xs={3}> */}
          {/*    <Card> */}
          {/*      <Card.Body> */}
          {/*        <ProgressBar className="development" now={100} /> */}
          {/*        <div className="mb-2">Development</div> */}
          {/*        <div className="avg-count"> */}
          {/*          <span className="dev">2.3 day</span> avg. */}
          {/*        </div> */}
          {/*      </Card.Body> */}
          {/*    </Card> */}
          {/*  </Col> */}

          {/*  <Col xs={3}> */}
          {/*    <Card> */}
          {/*      <Card.Body> */}
          {/*        <ProgressBar className="review" now={100} /> */}
          {/*        <div className="mb-2">Review</div> */}
          {/*        <div className="avg-count"> */}
          {/*          <span className="rev">12.4 hours</span> avg. */}
          {/*        </div> */}
          {/*      </Card.Body> */}
          {/*    </Card> */}
          {/*  </Col> */}
          {/*  <Col xs={3}> */}
          {/*    <Card> */}
          {/*      <Card.Body> */}
          {/*        <ProgressBar className="deployment" now={100} /> */}
          {/*        <div className="mb-2">Deployment</div> */}
          {/*        <div className="avg-count"> */}
          {/*          <span className="deploy">2.7 week</span> avg. */}
          {/*        </div> */}
          {/*      </Card.Body> */}
          {/*    </Card> */}
          {/*  </Col> */}
          {/* </Row> */}
        </Container>

        <hr />

        <div className="m-3">Centil, LLC 2021.</div>
      </section>
    );
  }
}
