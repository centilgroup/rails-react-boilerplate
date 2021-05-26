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
  OverlayTrigger,
  Row,
  Table,
  Tooltip,
} from 'react-bootstrap';
import { SortableHandle } from 'react-sortable-hoc';
import * as ChartJs from 'chart.js';
import { Bar } from 'react-chartjs-2';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import moment from 'moment';

export default class WIP extends Component {
  constructor(props) {
    super(props);
    const { wip } = JSON.parse(localStorage.getItem('user'));
    this.state = {
      show: wip === null ? true : wip,
      wipData: [],
      wipColumns: [],
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

        this.setState({
          wipColumns: data.wip_columns,
          wipData: data.wip_data,
          show: [null, true].includes(data.collapsable),
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

  render() {
    const { wipData, show, wipColumns } = this.state;
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
    const options = {
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        annotation: {
          annotations: [
            {
              type: 'line',
              mode: 'horizontal',
              scaleID: 'y-axis-1',
              borderWidth: 3,
              borderColor: 'black',
              value: 10,
            },
          ],
        },
      },
    };
    const labels = [...new Array(30)].map((i, labelIndex) =>
      moment().startOf('day').subtract(labelIndex, 'days').format('MM/DD'),
    );
    const WIPChart = wipColumns.map((item, idx) => {
      const count = [];
      labels.forEach((label, countIndex) => {
        wipData.forEach((wipDatum) => {
          const dateLabel = moment(wipDatum.created_at).format('MM/DD');
          if (dateLabel === label) {
            count[countIndex] = wipDatum.column_issues_count[item];
          }
        });
      });
      const median = () => {
        const dataSet = count.filter(Number).sort();
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
            data: count,
            backgroundColor: ['rgba(201, 203, 207, 0.2)'],
            borderColor: ['rgb(201, 203, 207)'],
            borderWidth: 1,
          },
        ],
      };

      return (
        <div key={item} className={idx === 0 ? '' : 'mt-3'}>
          {item}
          <div style={{ height: '190px' }}>
            <Bar
              data={feedData}
              width={100}
              height={150}
              type="bar"
              options={options}
              plugins={ChartAnnotation}
            />
          </div>
        </div>
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
                              <td className="text-left">{wipColumns[idx]}</td>
                              <td>{item}</td>
                              <td />
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
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
