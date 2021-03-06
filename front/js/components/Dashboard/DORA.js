/**
 * @file DORA component.
 */

import React, { Component } from 'react';
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
import { Bar } from 'react-chartjs-2';
import * as _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

export default class DORA extends Component {
  constructor(props) {
    super(props);
    const { dora } = JSON.parse(localStorage.getItem('user'));
    this.state = {
      show: [null, undefined, ''].includes(dora) ? true : dora,
      doraMetrics: [],
      min: 1,
      max: 30,
      defaultWorkflowStartState: '',
      workFlowStartStates: [],
      defaultDeployFrequency: 'week',
      sprints: [],
      versions: [],
      snapTo: false,
      defaultSprint: '',
      defaultVersion: '',
    };
  }

  componentDidMount() {
    const { projectId } = this.props;
    this.fetchInitData(projectId);
  }

  fetchInitData = (projectId) => {
    axios
      .get(`/dashboard/dora_metrics.json?project_id=${projectId}`)
      .then((response) => {
        const { data } = response;
        const workFlowStartStates = data.workflow_statuses.slice(0, -1);
        let sprints = [];
        let versions = [];
        let defaultSprint = '';
        let defaultVersion = '';

        if (data.sprints && data.sprints.values.length > 0) {
          sprints = data.sprints.values;
          defaultSprint = sprints[0].id;
        }

        if (data.versions && data.versions.length > 0) {
          versions = data.versions;
          defaultVersion = versions[0].id;
        }

        this.setState({
          doraMetrics: data.dora_metrics,
          show: [null, true].includes(data.collapsable),
          defaultWorkflowStartState: workFlowStartStates[0],
          workFlowStartStates,
          sprints,
          versions,
          defaultSprint,
          defaultVersion,
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  minMaxHandler = (value) => {
    this.setState({ show: !value });

    const data = {
      user: { dora: !value },
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

  handleRangeSliderChange = (value) => {
    const { projectId } = this.props;
    const [min, max] = value;
    const { snapTo, defaultSprint, defaultVersion } = this.state;

    axios
      .get(
        `/dashboard/dora_metrics.json?project_id=${projectId}&min=${min}&max=${max}&snap_to=${snapTo}&sprint=${defaultSprint}&version=${defaultVersion}`,
      )
      .then((response) => {
        const { data } = response;

        this.setState({
          doraMetrics: data.dora_metrics,
          min,
          max,
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  handleWorkflowStatesChange = (event) => {
    const { value } = event.target;
    this.setState({ defaultWorkflowStartState: value });
  };

  handleDeployFreq = (event) => {
    const { value } = event.target;
    this.setState({ defaultDeployFrequency: value });
  };

  handleSnapToChange = (event) => {
    const { checked } = event.target;
    const { projectId } = this.props;
    const { min, max, defaultSprint, defaultVersion } = this.state;
    this.setState({ snapTo: checked });

    axios
      .get(
        `/dashboard/dora_metrics.json?project_id=${projectId}&min=${min}&max=${max}&snap_to=${checked}&sprint=${defaultSprint}&version=${defaultVersion}`,
      )
      .then((response) => {
        const { data } = response;

        this.setState({
          doraMetrics: data.dora_metrics,
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  handleSprintToChange = (event) => {
    const { value } = event.target;
    const { projectId } = this.props;
    const { min, max, snapTo, defaultVersion } = this.state;

    axios
      .get(
        `/dashboard/dora_metrics.json?project_id=${projectId}&min=${min}&max=${max}&snap_to=${snapTo}&sprint=${value}&version=${defaultVersion}`,
      )
      .then((response) => {
        const { data } = response;

        this.setState({
          doraMetrics: data.dora_metrics,
          defaultSprint: value,
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  handleVersionToChange = (event) => {
    const { value } = event.target;
    const { projectId } = this.props;
    const { min, max, snapTo, defaultSprint } = this.state;

    axios
      .get(
        `/dashboard/dora_metrics.json?project_id=${projectId}&min=${min}&max=${max}&snap_to=${snapTo}&sprint=${defaultSprint}&version=${value}`,
      )
      .then((response) => {
        const { data } = response;

        this.setState({
          doraMetrics: data.dora_metrics,
          defaultVersion: value,
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  renderMinMaxIcon = (param) => {
    if (param) return <i className="fa fa-minus" />;

    return <i className="fa fa-plus" />;
  };

  render() {
    const {
      show,
      doraMetrics,
      defaultWorkflowStartState,
      defaultDeployFrequency,
      min,
      max,
      sprints,
      versions,
      snapTo,
    } = this.state;
    let { workFlowStartStates } = this.state;
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
    const labels = _.range(min - 1, max).map((i, labelIndex) =>
      moment()
        .subtract(min - 1, 'days')
        .startOf('day')
        .subtract(labelIndex, 'days')
        .format('MM/DD'),
    );
    const options = {
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            gridLines: {
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
              beginAtZero: true,
              display: true,
            },
          },
        ],
      },
      legend: {
        display: false,
      },
    };
    const averageLeadTimes = [];
    const deployFrequencies = [];
    const changeFails = [];
    let displaySnapTo;

    labels.forEach((label, countIndex) => {
      doraMetrics.forEach((doraMetric) => {
        const dateLabel = moment(doraMetric.created_at).format('MM/DD');
        if (dateLabel === label && defaultWorkflowStartState !== '') {
          const metric = doraMetric.base_metric;
          averageLeadTimes.push(
            metric.avg_lead_time[defaultWorkflowStartState],
          );
          deployFrequencies.push(metric.deploy_freq[defaultDeployFrequency]);
          changeFails.push(metric.fail_change);
        }
      });
    });
    const leadTimeFeedData = {
      labels,
      datasets: [
        {
          data: averageLeadTimes,
          backgroundColor: ['rgba(201, 203, 207, 0.2)'],
        },
      ],
    };
    const deployFrequencyFeedData = {
      labels,
      datasets: [
        {
          data: deployFrequencies,
          backgroundColor: ['rgba(201, 203, 207, 0.2)'],
        },
      ],
    };
    const changeFailFeedData = {
      labels,
      datasets: [
        {
          data: changeFails,
          backgroundColor: ['rgba(201, 203, 207, 0.2)'],
        },
      ],
    };

    workFlowStartStates = workFlowStartStates.map((column, idx) => {
      let defaultChecked = false;
      if (idx === 0) {
        defaultChecked = true;
      }

      return (
        <Form.Check
          type="radio"
          className="mb-2"
          label={column}
          value={column}
          key={column}
          name="workflowStartState"
          defaultChecked={defaultChecked}
          onChange={this.handleWorkflowStatesChange}
        />
      );
    });

    const displayDeployFreq = ['day', 'week', 'month', 'year'].map((freq) => {
      let defaultChecked = false;
      if (freq === 'week') {
        defaultChecked = true;
      }

      return (
        <Form.Check
          type="radio"
          className="mb-2"
          label={`Per ${freq}`}
          value={freq}
          key={freq}
          name="deployFreq"
          defaultChecked={defaultChecked}
          onChange={this.handleDeployFreq}
        />
      );
    });

    const displaySprints = sprints.map((sprint, idx) => {
      let defaultChecked = false;
      if (idx === 0) {
        defaultChecked = true;
      }

      return (
        <Form.Check
          type="radio"
          className="mb-2"
          label={sprint.name}
          value={sprint.id}
          key={sprint.id}
          name="sprints"
          defaultChecked={defaultChecked}
          onChange={this.handleSprintToChange}
        />
      );
    });

    const displayVersions = versions.map((version, idx) => {
      let defaultChecked = false;
      if (idx === 0) {
        defaultChecked = true;
      }

      return (
        <Form.Check
          type="radio"
          className="mb-2"
          label={version.name}
          value={version.id}
          key={version.id}
          name="versions"
          defaultChecked={defaultChecked}
          onChange={this.handleVersionToChange}
        />
      );
    });

    if (snapTo) {
      displaySnapTo = (
        <div>
          <p className="mb-1">Sprints</p>
          {displaySprints}
          <p className="mb-1">Versions</p>
          {displayVersions}
        </div>
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
              <span>
                <DragHandle /> DORA Metrics
              </span>
              {this.renderMinMaxIcon(show)}
            </Card.Header>
            <Collapse in={show}>
              <div style={sectionStyle}>
                <Card.Body>
                  <Row>
                    <Col xs={10}>
                      <div className="mb-3">
                        <h5 style={{ margin: 'auto' }}>Average Lead Time</h5>
                        <div
                          style={{
                            height: '190px',
                            border: 'solid 1px #ccc',
                            padding: '10px',
                          }}
                        >
                          <Bar
                            data={leadTimeFeedData}
                            width={100}
                            height={150}
                            type="bar"
                            options={options}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <h5 style={{ margin: 'auto' }}>Deploy Frequency</h5>
                        <div
                          style={{
                            height: '190px',
                            border: 'solid 1px #ccc',
                            padding: '10px',
                          }}
                        >
                          <Bar
                            data={deployFrequencyFeedData}
                            width={100}
                            height={150}
                            type="bar"
                            options={options}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <h5 style={{ margin: 'auto' }}>Change Fail</h5>
                        <div
                          style={{
                            height: '190px',
                            border: 'solid 1px #ccc',
                            padding: '10px',
                          }}
                        >
                          <Bar
                            data={changeFailFeedData}
                            width={100}
                            height={150}
                            type="bar"
                            options={options}
                          />
                        </div>
                      </div>
                    </Col>
                    <Col xs={2}>
                      <Form>
                        <h5>Display Controls</h5>
                        <div className="mb-2">
                          <p className="mb-1">Range</p>
                          <Range
                            allowCross={false}
                            reverse
                            min={1}
                            max={365}
                            step={1}
                            defaultValue={[1, 30]}
                            onAfterChange={this.handleRangeSliderChange}
                          />
                        </div>
                        <div>
                          <p className="mb-1">Workflow Start States</p>
                          {workFlowStartStates}
                        </div>
                        <div>
                          <p className="mb-1">Display Deploy Frequency</p>
                          {displayDeployFreq}
                        </div>
                        <div>
                          <Form.Check
                            type="switch"
                            id="snap_to"
                            className="mb-2"
                            label="Snap To"
                            onChange={this.handleSnapToChange}
                            style={{ zIndex: 0 }}
                          />
                          {displaySnapTo}
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </Card.Body>
                <OverlayTrigger
                  key="doraHelper"
                  placement="top"
                  overlay={
                    <Tooltip id="doraHelper">
                      DevOps Research and Assessment Metrics
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

DORA.propTypes = {
  projectId: PropTypes.string,
};
