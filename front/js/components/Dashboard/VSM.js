/**
 * @file VSM component.
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

export default class VSM extends Component {
  constructor(props) {
    super(props);
    const { vsm } = JSON.parse(localStorage.getItem('user'));
    this.state = {
      statusLeadTimes: {},
      statusProcessTimes: {},
      statusCA: {},
      VSMTotal: {},
      show: vsm === null ? true : vsm,
    };
  }

  componentDidMount() {
    const { projectId } = this.props;
    this.fetchInitData(projectId);
  }

  fetchInitData = (projectId) => {
    axios
      .get(`/dashboard/value_stream_map.json?project_id=${projectId}`)
      .then((response) => {
        const { data } = response;

        this.setState({
          statusLeadTimes: data.lead_time,
          statusProcessTimes: data.process_time,
          statusCA: data.percent_c_a,
          VSMTotal: data.total,
          show: [null, true].includes(data.collapsable),
        });
      })
      .catch(() => {})
      .finally(() => {});
  };

  minMaxHandler = (value) => {
    this.setState({ show: !value });

    const data = {
      user: { vsm: !value },
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

  render() {
    const {
      statusLeadTimes,
      statusProcessTimes,
      statusCA,
      VSMTotal,
      show,
    } = this.state;
    const statusStyle = {
      padding: '10px',
      border: 'solid 3px rgba(0, 0, 0, 0.4)',
      borderRadius: '5px',
      minWidth: '160px',
      textAlign: 'center',
      backgroundColor: '#e3e6e9',
    };
    const nonStatusStyle = {
      ...statusStyle,
      backgroundColor: '#fff',
    };
    const statHolderStyle = {
      width: '130px',
      margin: '0 15px',
    };
    const statStyle = {
      border: 'solid 1px #ccc',
      borderTop: 'none',
      borderRadius: '5px',
      padding: '8px',
    };
    const VSMArrow = {
      fontSize: '42px',
      color: '#9c9ea0',
    };
    const totalStyle = {
      border: 'solid 1px #ccc',
      borderRadius: '5px',
      padding: '8px',
    };
    const startEndStyle = {
      margin: '0 22px',
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

    return (
      <Row className="pt-4">
        <Col xs={12}>
          <Card>
            <Card.Header
              className="d-flex justify-content-between align-items-center"
              onClick={() => this.minMaxHandler(show)}
            >
              <span>
                <DragHandle /> VSM
              </span>
              {this.renderMinMaxIcon(show)}
            </Card.Header>
            <Collapse in={show}>
              <div style={sectionStyle}>
                <Card.Body>
                  <div
                    className="d-flex justify-content-between"
                    style={startEndStyle}
                  >
                    <div className="text-center">
                      <div style={nonStatusStyle}>Request</div>
                      <i
                        className="fa fa-long-arrow-down m-3"
                        style={VSMArrow}
                      />
                    </div>
                    <div className="text-center">
                      <div style={nonStatusStyle}>User</div>
                      <i className="fa fa-long-arrow-up m-3" style={VSMArrow} />
                    </div>
                  </div>
                  <div className="d-flex justify-content-around">
                    <div>
                      <div style={statusStyle}>To Do</div>
                      <div style={statHolderStyle}>
                        <div className="text-center" style={statStyle}>
                          LT = {statusLeadTimes.to_do} days
                        </div>
                        <div className="text-center" style={statStyle}>
                          PT = 0 days
                        </div>
                        <div className="text-center" style={statStyle}>
                          %C/A = {statusCA.to_do} %
                        </div>
                      </div>
                    </div>
                    <i className="fa fa-long-arrow-right" style={VSMArrow} />
                    <div>
                      <div style={statusStyle}>In Progress</div>
                      <div style={statHolderStyle}>
                        <div className="text-center" style={statStyle}>
                          LT = {statusLeadTimes.wip} days
                        </div>
                        <div className="text-center" style={statStyle}>
                          PT = {statusProcessTimes.wip} days
                        </div>
                        <div className="text-center" style={statStyle}>
                          %C/A = {statusCA.wip} %
                        </div>
                      </div>
                    </div>
                    <i className="fa fa-long-arrow-right" style={VSMArrow} />
                    <div>
                      <div style={statusStyle}>In Review</div>
                      <div style={statHolderStyle}>
                        <div className="text-center" style={statStyle}>
                          LT = {statusLeadTimes.qa} days
                        </div>
                        <div className="text-center" style={statStyle}>
                          PT = {statusProcessTimes.qa} days
                        </div>
                        <div className="text-center" style={statStyle}>
                          %C/A = {statusCA.qa} %
                        </div>
                      </div>
                    </div>
                    <i className="fa fa-long-arrow-right" style={VSMArrow} />
                    <div>
                      <div style={statusStyle}>Done</div>
                      <div style={statHolderStyle}>
                        <div className="text-center" style={statStyle}>
                          LT = 0 days
                        </div>
                        <div className="text-center" style={statStyle}>
                          PT = 0 days
                        </div>
                        <div className="text-center" style={statStyle}>
                          %C/A = 0 %
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-around mt-3">
                    <div style={totalStyle}>
                      Total LT = {VSMTotal.total_lt} days
                    </div>
                    <div style={totalStyle}>
                      Total PT = {VSMTotal.total_pt} days
                    </div>
                    <div style={totalStyle}>
                      Activity Ratio = {VSMTotal.activity_ratio} %
                    </div>
                    <div style={totalStyle}>
                      Rolled %C/A = {VSMTotal.rolled_ca} %
                    </div>
                  </div>
                </Card.Body>
                <OverlayTrigger
                  key="vsmHelper"
                  placement="top"
                  overlay={<Tooltip id="vsmHelper">Value Stream Map</Tooltip>}
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

VSM.propTypes = {
  projectId: PropTypes.string,
};
