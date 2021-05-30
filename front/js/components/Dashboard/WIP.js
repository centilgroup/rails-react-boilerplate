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
  Table,
  Tooltip,
} from 'react-bootstrap';
import { SortableHandle } from 'react-sortable-hoc';
import { Bar } from 'react-chartjs-2';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import moment from 'moment';
import Slider from 'rc-slider';
import * as _ from 'lodash';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

export default class WIP extends Component {
  constructor(props) {
    super(props);
    const { wip } = JSON.parse(localStorage.getItem('user'));
    this.state = {
      show: wip === null ? true : wip,
      wipData: [],
      wipColumns: [],
      wipLimits: [],
      highlightLimit: true,
      min: 1,
      max: 30,
      activeWorkflowStates: [],
      activeIssueTypes: [],
      issueTypes: [],
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
        const activeWorkflowStates = data.wip_columns.slice(1, -1);
        const activeIssueTypes = data.issue_types.filter(
          (type) => type !== 'Epic',
        );

        this.setState({
          wipColumns: data.wip_columns,
          wipData: data.wip_data,
          wipLimits: data.limit,
          show: [null, true].includes(data.collapsable),
          activeWorkflowStates,
          issueTypes: data.issue_types,
          activeIssueTypes,
        });
      })
      .catch(() => {})
      .finally(() => {});
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

  handleRangeSliderChange = (value) => {
    const { projectId } = this.props;
    const [min, max] = value;

    axios
      .get(
        `/dashboard/work_in_progress.json?project_id=${projectId}&min=${min}&max=${max}`,
      )
      .then((response) => {
        const { data } = response;

        this.setState({
          wipColumns: data.wip_columns,
          wipData: data.wip_data,
          wipLimits: data.limit,
          min,
          max,
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  handleHighlightChange = (event) => {
    const { checked } = event.target;
    this.setState({ highlightLimit: checked });
  };

  handleWorkflowStatesChange = (event) => {
    const { checked, value } = event.target;
    if (checked) {
      this.setState((prevState) => ({
        activeWorkflowStates: _.uniq([
          ...prevState.activeWorkflowStates,
          value,
        ]),
      }));
    } else {
      this.setState((prevState) => ({
        activeWorkflowStates: [
          ...prevState.activeWorkflowStates.filter((state) => state !== value),
        ],
      }));
    }
  };

  handleIssueTypesChange = (event) => {
    const { checked, value } = event.target;
    if (checked) {
      this.setState((prevState) => ({
        activeIssueTypes: _.uniq([...prevState.activeIssueTypes, value]),
      }));
    } else {
      this.setState((prevState) => ({
        activeIssueTypes: [
          ...prevState.activeIssueTypes.filter((state) => state !== value),
        ],
      }));
    }
  };

  render() {
    const {
      wipData,
      show,
      wipColumns,
      wipLimits,
      highlightLimit,
      min,
      max,
      activeWorkflowStates,
      issueTypes,
      activeIssueTypes,
    } = this.state;
    let medianArrivalRate;
    let medianThroughPutRate;
    const medianDailyWIP = [];
    const sectionStyle = { position: 'relative' };
    const helperStyle = {
      position: 'absolute',
      bottom: 0,
      right: 0,
      fontSize: '24px',
      opacity: 0.5,
    };
    const medianStyle = {
      border: 'solid 1px #ccc',
      padding: '20px 80px',
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
    const WIPChart = wipColumns.map((item, idx) => {
      const counts = [];
      const colors = [];
      const limit = wipLimits[item];
      labels.forEach((label, countIndex) => {
        wipData.forEach((wipDatum) => {
          const dateLabel = moment(wipDatum.created_at).format('MM/DD');
          if (dateLabel === label) {
            counts[countIndex] = wipDatum.column_issues_count[item];
            issueTypes.forEach((type) => {
              if (
                !activeIssueTypes.includes(type) &&
                wipDatum.column_types_count !== null
              ) {
                counts[countIndex] -= wipDatum.column_types_count[item][type];
              }
            });
            if (highlightLimit && limit !== null) {
              if (counts[countIndex] <= limit) {
                colors[countIndex] = 'rgba(75, 192, 192, 0.2)';
              } else if (counts[countIndex] <= limit + limit * 0.25) {
                colors[countIndex] = 'rgba(255, 205, 86, 0.2)';
              } else {
                colors[countIndex] = 'rgba(255, 99, 132, 0.2)';
              }
            } else {
              colors[countIndex] = 'rgba(201, 203, 207, 0.2)';
            }
          }
        });
      });
      const median = () => {
        const dataSet = counts.filter(Number).sort();
        if (dataSet.length === 0) return 0;
        if (dataSet.length === 1) return dataSet[0];

        const half = Math.floor(dataSet.length / 2);
        if (dataSet.length % 2) return dataSet[half];

        return (dataSet[half - 1] + dataSet[half]) / 2.0;
      };
      const calcMedian = median();
      if (idx === 0) medianArrivalRate = calcMedian;
      if (idx === wipColumns.length - 1) medianThroughPutRate = calcMedian;
      medianDailyWIP.push(calcMedian);
      const feedData = {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
          },
        ],
      };
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
        annotation: {
          annotations: [
            {
              type: 'line',
              mode: 'horizontal',
              scaleID: 'y-axis-0',
              borderWidth: 1,
              borderColor: 'red',
              value: limit,
              borderDash: [10, 10],
            },
          ],
        },
      };

      if (!activeWorkflowStates.includes(item)) {
        return '';
      }

      return (
        <div key={item} className="mb-3">
          <h5 style={{ margin: 'auto' }}>{item}</h5>
          <div
            style={{
              height: '190px',
              border: 'solid 1px #ccc',
              padding: '10px',
            }}
          >
            <Bar
              data={feedData}
              width={100}
              height={150}
              type="bar"
              options={options}
              plugins={[ChartAnnotation]}
            />
          </div>
        </div>
      );
    });
    const workflowStates = wipColumns.map((column) => {
      let defaultChecked = false;
      if (activeWorkflowStates.includes(column)) {
        defaultChecked = true;
      }

      return (
        <Form.Check
          type="checkbox"
          className="mb-2"
          label={column}
          value={column}
          key={column}
          defaultChecked={defaultChecked}
          onChange={this.handleWorkflowStatesChange}
        />
      );
    });
    const issueTypeElements = issueTypes.map((type) => {
      let defaultChecked = false;
      if (activeIssueTypes.includes(type)) {
        defaultChecked = true;
      }

      return (
        <Form.Check
          type="checkbox"
          className="mb-2"
          label={type}
          value={type}
          key={type}
          defaultChecked={defaultChecked}
          onChange={this.handleIssueTypesChange}
        />
      );
    });

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
              </div>
              {this.renderMinMaxIcon(show)}
            </Card.Header>
            <Collapse in={show} className="wip">
              <div style={sectionStyle}>
                <Card.Body>
                  <Row>
                    <Col xs={10}>
                      {WIPChart}
                      <div className="d-flex align-items-center justify-content-around mt-4">
                        <div className="text-center">
                          Median Arrival Rate
                          <div style={medianStyle}>{medianArrivalRate}</div>
                        </div>
                        <div className="text-center">
                          Median Throughput Rate
                          <div style={medianStyle}>{medianThroughPutRate}</div>
                        </div>
                        <div className="text-center">
                          <Table bordered size="sm">
                            <thead>
                              <tr>
                                <th>Status</th>
                                <th>Median Daily WIP</th>
                                <th>Optimal WIP Limit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {medianDailyWIP.map((item, idx) => (
                                <tr key={wipColumns[idx]}>
                                  <td className="text-left">
                                    {wipColumns[idx]}
                                  </td>
                                  <td>{item}</td>
                                  <td />
                                </tr>
                              ))}
                            </tbody>
                          </Table>
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
                        <Form.Check
                          type="switch"
                          id="highlight_wip"
                          className="mb-2"
                          label="Highlight WIP Limit Issues"
                          defaultChecked
                          onChange={this.handleHighlightChange}
                          style={{ zIndex: 0 }}
                        />
                        <div>
                          <p className="mb-1">Workflow States</p>
                          {workflowStates}
                        </div>
                        <div>
                          <p className="mb-1">Types</p>
                          {issueTypeElements}
                        </div>
                      </Form>
                    </Col>
                  </Row>
                </Card.Body>
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
