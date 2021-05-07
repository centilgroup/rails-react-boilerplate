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
  Tooltip,
} from 'react-bootstrap';
import { SortableHandle } from 'react-sortable-hoc';
import { Bar } from 'react-chartjs-2';
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
                <Card.Body>{WIPChart}</Card.Body>
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
