/**
 * @file WIP component.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Card,
  Col,
  Collapse,
  Form,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap';
import { SortableHandle } from 'react-sortable-hoc';
import { Bar, Bubble } from 'react-chartjs-2';
import * as ChartAnnotation from 'chartjs-plugin-annotation';

export default class WIP extends Component {
  constructor(props) {
    super(props);
    const { wip } = JSON.parse(localStorage.getItem('user'));
    this.state = {
      totalBacklog: 0,
      totalWorkInProgress: 0,
      totalWorkInReview: 0,
      backlogLimit: 0,
      inProgressLimit: 0,
      inReviewLimit: 0,
      WIPChartType: 'bar',
      show: wip === null ? true : wip,
    };
  }

  componentDidMount() {
    const { projectId } = this.props;
    this.fetchInitData(projectId);
  }

  fetchInitData = (projectId) => {
    axios
      .get(`/dashboard/work_in_progress.json?project_id=${projectId}`)
      .then((response) => {
        const { data } = response;
        const leadStatus = ['backlog', 'to do', 'open'];
        const devStatus = ['selected for development', 'in progress'];
        const revStatus = ['review', 'qa', 'ready for review', 'in review'];

        let backlogLimit = 0;
        let inProgressLimit = 0;
        let inReviewLimit = 0;

        if (data.boards.length > 0) {
          data.boards[0].column_config.forEach((config) => {
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

        this.setState({
          totalBacklog: data.total_backlog,
          totalWorkInProgress: data.total_work_in_progress,
          totalWorkInReview: data.total_work_in_review,
          backlogLimit,
          inProgressLimit,
          inReviewLimit,
          show: [null, true].includes(data.collapsable),
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  WIPChartTypeChangeHandler = (event) => {
    this.setState({ WIPChartType: event.target.id });
  };

  minMaxHandler = (value) => {
    this.setState({ show: !value });

    const data = {
      user: { wip: !value },
    };

    axios
      .put('/users/update.json', data)
      .then((response) => {
        localStorage.setItem('user', JSON.stringify(response.data));
      })
      .catch(() => {
        this.setState({ show: value });
      })
      .finally(() => {
        this.forceUpdate();
      });
  };

  renderMinMaxIcon = (param) => {
    if (param) return <i className="fa fa-minus" />;

    return <i className="fa fa-plus" />;
  };

  render() {
    const {
      totalBacklog,
      totalWorkInProgress,
      totalWorkInReview,
      backlogLimit,
      inProgressLimit,
      inReviewLimit,
      WIPChartType,
      show,
    } = this.state;
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

    let WIPChart;

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
            labels: [
              `To Do ( WIP = ${totalBacklog} )`,
              `In Progress ( WIP = ${totalWorkInProgress} )`,
              `In Review ( WIP = ${totalWorkInReview} )`,
            ],
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
                  let label = ` Work in progress: ${value}`;
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

    return (
      <Row className="pt-4">
        <Col xs={12}>
          <Card>
            <Card.Header
              className="d-flex justify-content-between align-items-center"
              onClick={() => this.minMaxHandler(show)}
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
              {this.renderMinMaxIcon(show)}
            </Card.Header>
            <Collapse in={show} className="wip">
              <div style={sectionStyle}>
                <Card.Body style={{ height: '290px' }}>{WIPChart}</Card.Body>
                <OverlayTrigger
                  key="wipHelper"
                  placement="top"
                  overlay={
                    <Tooltip id="wipHelper">
                      Work in Progress with limits
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

WIP.propTypes = {
  projectId: PropTypes.string,
};
