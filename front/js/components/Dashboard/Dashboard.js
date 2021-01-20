import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import GaugeChart from 'react-gauge-chart';
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
  Button,
} from 'react-bootstrap';
import Skeleton from 'react-loading-skeleton';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';
import { Redirect } from 'react-router';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issues: [],
      redirect: false,
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

  fetchMoreData = () => {
    const { issues } = this.state;
    const startAt = issues.length;

    axios.get(`/jiras.json?start_at=${startAt}`).then(
      (response) => {
        this.setState({ issues: issues.concat(response.data) });
      },
      (error) => {
        console.log(error);
      },
    );
  };

  logoutUser = () => {
    axios.delete('/users/sign_out.json').then(
      (response) => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        this.setState({ redirect: true });
      },
      (error) => {
        console.log(error);
      },
    );
  };

  render() {
    const { issues, redirect } = this.state;
    const style = {
      height: 300,
      overflow: 'auto',
    };
    let listIssues;

    listIssues = <Skeleton count={10} />;

    if (issues.length > 0) {
      listIssues = issues.map((issue) => (
        <ListGroup.Item key={issue.id}>
          <Badge variant="primary">{issue.key}</Badge>
          <div>{issue.summary}</div>
        </ListGroup.Item>
      ));
    }

    if (redirect) {
      return <Redirect to="/login" />;
    }

    return (
      <section>
        <nav>
          <span>
            <NavLink to="/profile" className="mr-2">
              <Button variant="primary" size="sm">
                Profile
              </Button>
            </NavLink>
            <NavLink to="/" onClick={this.logoutUser}>
              <Button variant="primary" size="sm">
                Logout
              </Button>
            </NavLink>
          </span>
        </nav>

        <Container>
          <Row className="py-4">
            <Col xs={4}>
              <Card>
                <Card.Body>
                  <GaugeChart
                    className="gas-gauge"
                    id="gauge_chart_dev"
                    nrOfLevels={2}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={4}>
              <Card>
                <Card.Body>
                  <GaugeChart
                    className="gas-gauge"
                    id="gauge_chart_qa"
                    nrOfLevels={2}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col xs={4}>
              <Card>
                <Card.Body>
                  <GaugeChart
                    className="gas-gauge"
                    id="gauge_chart_deploy"
                    nrOfLevels={2}
                  />
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
                  <Card.Title>Jira Activity</Card.Title>
                  <ListGroup variant="flush" style={style} id="jiraActivity">
                    <InfiniteScroll
                      dataLength={issues.length}
                      next={this.fetchMoreData}
                      hasMore
                      loader={<Skeleton count={10} />}
                      scrollableTarget="jiraActivity"
                    >
                      {listIssues}
                    </InfiniteScroll>
                  </ListGroup>
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
