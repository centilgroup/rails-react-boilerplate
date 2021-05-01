/**
 * @file Gauge component.
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
  Tooltip,
} from 'react-bootstrap';
import GaugeChart from 'react-gauge-chart';
import { SortableHandle } from 'react-sortable-hoc';

export default class Gauge extends Component {
  constructor(props) {
    super(props);
    const { gauge } = JSON.parse(localStorage.getItem('user'));
    this.state = {
      devArcLength: [0.7, 0.3],
      testArcLength: [0.2, 0.8],
      deployArcLength: [0.15, 0.85],
      show: gauge === null ? true : gauge,
    };
  }

  componentDidMount() {
    const { projectId } = this.props;
    this.fetchInitData(projectId);
  }

  fetchInitData = (projectId) => {
    axios
      .get(`/dashboard/status_gauge.json?project_id=${projectId}`)
      .then((response) => {
        const { data } = response;

        let devPercent;
        let devPendingPercent;
        let testPercent;
        let testPendingPercent;
        let deployPercent;
        let deployPendingPercent;

        if (data.grand_total > 0) {
          devPercent = data.total_backlog / data.grand_total;
          devPendingPercent =
            (data.grand_total - data.total_backlog) / data.grand_total;
          testPercent = data.total_in_progress / data.grand_total;
          testPendingPercent =
            (data.grand_total - data.total_in_progress) / data.grand_total;
          deployPercent = data.total_done / data.grand_total;
          deployPendingPercent =
            (data.grand_total - data.total_done) / data.grand_total;
        }

        this.setState({
          devArcLength: [devPercent, devPendingPercent],
          testArcLength: [testPercent, testPendingPercent],
          deployArcLength: [deployPercent, deployPendingPercent],
          show: [null, true].includes(data.collapsable),
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  minMaxHandler = (value) => {
    this.setState({ show: !value });

    const data = {
      user: { gauge: !value },
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
    const { devArcLength, testArcLength, deployArcLength, show } = this.state;
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

    return (
      <Row className="pt-4">
        <Col xs={12}>
          <Card>
            <Card.Header
              className="d-flex justify-content-between align-items-center"
              onClick={() => this.minMaxHandler(show)}
            >
              <span>
                <DragHandle /> Status Gauges
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
                          <Card.Title className="text-center">
                            Backlog
                          </Card.Title>
                          <div className="d-flex align-items-center">
                            <div className="legend left-legend" />
                            <div>Backlog</div>
                            <div className="ml-auto">Remaining</div>
                            <div className="legend right-legend" />
                          </div>
                          <div style={{ width: '294px' }}>
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
                              style={{ height: '135px' }}
                            />
                          </div>
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
                          <div style={{ width: '294px' }}>
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
                              style={{ height: '135px' }}
                            />
                          </div>
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
                          <div style={{ width: '294px' }}>
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
                              style={{ height: '135px' }}
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
                <OverlayTrigger
                  key="gaugeHelper"
                  placement="top"
                  overlay={<Tooltip id="gaugeHelper">Status Gauges</Tooltip>}
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

Gauge.propTypes = {
  projectId: PropTypes.string,
};
