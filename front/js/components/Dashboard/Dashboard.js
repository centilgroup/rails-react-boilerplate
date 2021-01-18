import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import GaugeChart from 'react-gauge-chart';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issues: [],
    };
  }

  componentDidMount = () => {
    axios.get('/jiras.json').then(
      (response) => {
        this.setState({ issues: response.data });
      },
      (error) => {
        console.log(error);
      },
    );
  };

  render() {
    const { issues } = this.state;

    const listIssues = issues.map((issue) => (
      <ListGroup.Item key={issue.key}>{issue.summary}</ListGroup.Item>
    ));

    return (
      <section>
        <Container>
          <Row className="py-4">
            <Col xs={4}>
              <Card>
                <Card.Body>
                  <GaugeChart className="gas-gauge" id="gauge_chart1" />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={4}>
              <Card>
                <Card.Body>
                  <GaugeChart className="gas-gauge" id="gauge_chart2" />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={4}>
              <Card>
                <Card.Body>
                  <GaugeChart className="gas-gauge" id="gauge_chart3" />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Card>
                <Card.Body>
                  <Bar
                    width={100}
                    height={250}
                    options={{ maintainAspectRatio: false }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="py-4">
            <Col xs={6}>
              <Card>
                <Card.Body>
                  <ListGroup variant="flush">{listIssues}</ListGroup>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={6}>
              <Card>
                <Card.Body className="text-center">
                  Project Flow Health
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    );
  }
}
