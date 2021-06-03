/**
 * @file VPI component.
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
import moment from 'moment';

export default class VPI extends Component {
  constructor(props) {
    super(props);
    const { vpi } = JSON.parse(localStorage.getItem('user'));
    this.state = {
      remainingDays: null,
      remainingIssues: 0,
      averageTimeToClose: null,
      show: vpi === null ? true : vpi,
    };
  }

  componentDidMount() {
    const { projectId, projectEndDate } = this.props;
    this.fetchInitData(projectId, projectEndDate);
  }

  fetchInitData = (projectId, projectEndDate) => {
    axios
      .get(`/dashboard/project_flow_health.json?project_id=${projectId}`)
      .then((response) => {
        const { data } = response;
        let remainingDays;

        if (![null, undefined, '', NaN].includes(projectEndDate)) {
          const currentDate = moment().startOf('day');
          const endDate = moment(projectEndDate, 'DD/MM/YYYY');

          remainingDays = endDate.diff(currentDate, 'days');
        } else {
          remainingDays = data.remaining_days;
        }

        this.setState({
          remainingDays,
          remainingIssues: data.remaining_issues,
          averageTimeToClose: data.average_time_to_close,
          show: [null, true].includes(data.collapsable),
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  minMaxHandler = (value) => {
    this.setState({ show: !value });

    const data = {
      user: { vpi: !value },
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
      remainingDays,
      remainingIssues,
      averageTimeToClose,
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

    let VPIChart;
    let healthRecommendation;
    let VPIPercent;
    let VPIScore;

    if (
      remainingDays === null ||
      remainingIssues === 0 ||
      [0, null].includes(averageTimeToClose)
    ) {
      VPIScore = '--';
    } else {
      VPIScore = (
        remainingDays /
        (remainingIssues * averageTimeToClose)
      ).toFixed(2);
    }

    if (remainingDays === null) {
      healthRecommendation =
        'Please assign due date at least for an issue to view the VPI score.';
    } else if (remainingIssues === 0) {
      healthRecommendation =
        'There are no remaining issues to view the VPI score';
    } else if (averageTimeToClose === null) {
      healthRecommendation =
        'At least one issue needs to be completed to view the VPI score.';
    } else if (averageTimeToClose === 0) {
      healthRecommendation =
        'Average completion rate should be greater than zero to view the VPI score.';
    } else if (VPIScore >= 0.67) {
      healthRecommendation = 'VPI indicates early delivery.';
      VPIPercent = 0.85;
    } else if (VPIScore <= 0.33) {
      healthRecommendation = 'VPI indicates late delivery.';
      VPIPercent = 0.15;
    } else {
      healthRecommendation = 'VPI indicates on-schedule delivery.';
      VPIPercent = 0.5;
    }

    if (VPIScore !== '--') {
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
          style={{ height: '135px' }}
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
              <span>
                <DragHandle /> Project Flow Health
              </span>
              {this.renderMinMaxIcon(show)}
            </Card.Header>
            <Collapse in={show}>
              <div style={sectionStyle}>
                <Card.Body className="text-center">
                  <Card.Text className="text-info">
                    {healthRecommendation}
                  </Card.Text>
                  <div className="d-flex align-items-center justify-content-around">
                    <div className="pt-2">
                      <div style={{ fontSize: '32px' }}>
                        {remainingDays === null ? '--' : remainingDays}
                      </div>
                      <div className="mt-1">Remaining Period (Days)</div>
                    </div>
                    <div className="pt-2">
                      <div style={{ fontSize: '32px' }}>{remainingIssues}</div>
                      <div className="mt-1">Remaining Issues</div>
                    </div>
                    <div className="pt-2">
                      <div style={{ fontSize: '32px' }}>
                        {averageTimeToClose === null
                          ? '--'
                          : averageTimeToClose}
                      </div>
                      <div className="mt-1">Average Completion Rate (Days)</div>
                    </div>
                    <div className="pt-2">
                      <div style={{ width: '300px' }}>{VPIChart}</div>
                      <div style={{ fontSize: '32px' }}>{VPIScore}</div>
                      <div className="mt-1">VPI</div>
                    </div>
                  </div>
                </Card.Body>
                <OverlayTrigger
                  key="vpiHelper"
                  placement="top"
                  overlay={
                    <Tooltip id="vpiHelper">Project Flow Health</Tooltip>
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

VPI.propTypes = {
  projectId: PropTypes.string,
  projectEndDate: PropTypes.string || PropTypes.object,
};
