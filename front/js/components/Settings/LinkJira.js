/**
 * @file LinkJira component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Figure,
  Dropdown,
} from 'react-bootstrap';
import { Redirect } from 'react-router';
import Footer from '../Shared/Footer';

export default class LinkJira extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jira_url: '',
      jira_username: '',
      jira_password: '',
      redirect: false,
      redirectTo: '',
    };
  }

  componentDidMount() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.jira_url === null) {
      user.jira_url = '';
    }
    if (user.jira_username === null) {
      user.jira_username = '';
    }
    if (user.jira_password === null) {
      user.jira_password = '';
    }

    this.setState(user);
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  determineEnabled = () => {
    const { jira_url, jira_username, jira_password } = this.state;
    return (
      jira_url.trim() === '' ||
      jira_username.trim() === '' ||
      jira_password === ''
    );
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { jira_url, jira_username, jira_password } = this.state;
    const data = new FormData();
    data.append('user[jira_url]', jira_url);
    data.append('user[jira_username]', jira_username);
    data.append('user[jira_password]', jira_password);

    axios
      .put('/users/profile.json', data)
      .then((response) => {
        const profile_data = response.data;
        localStorage.setItem('user', JSON.stringify(profile_data));
        this.setState({ redirect: true, redirectTo: 'initial-config-step-3' });
      })
      .catch(() => {});
  };

  logoutUser = () => {
    axios.delete('/users/sign_out.json').then(() => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      this.setState({ redirect: true, redirectTo: 'login' });
    });
  };

  render() {
    const {
      jira_url,
      jira_username,
      jira_password,
      redirect,
      redirectTo,
    } = this.state;
    const helperTextStyle = { fontSize: 'initial' };

    if (redirect) {
      return <Redirect to={`/${redirectTo}`} />;
    }

    return (
      <section>
        <nav>
          <span>
            <Figure className="m-0">
              <Figure.Image
                src="/logo.png"
                width={50}
                height={30}
                alt="Logo"
                className="m-0"
              />
            </Figure>
          </span>
          <span>
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="navDropdown">
                <i className="fa fa-bars" />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="#" onClick={this.logoutUser}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </span>
        </nav>

        <Container className="pt-5">
          <Form className="pt-4">
            <h4>Jira Link</h4>
            <Row>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Jira URL</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={jira_url}
                    name="jira_url"
                    type="text"
                    placeholder="Jira URL"
                    aria-describedby="jiraURLHelpBlock"
                    required
                  />
                  <Form.Text
                    id="jiraURLHelpBlock"
                    muted
                    style={helperTextStyle}
                  >
                    Input your Jira URL (ex. https://company.atlassian.net/)
                  </Form.Text>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Jira Username</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={jira_username}
                    name="jira_username"
                    type="text"
                    placeholder="Jira Username"
                    aria-describedby="jiraUsernameHelpBlock"
                    required
                  />
                  <Form.Text
                    id="jiraUsernameHelpBlock"
                    muted
                    style={helperTextStyle}
                  >
                    Input the email address associated with your Jira instance.
                  </Form.Text>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Jira Password</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={jira_password}
                    name="jira_password"
                    type="password"
                    placeholder="Jira Password"
                    aria-describedby="jiraPasswordHelpBlock"
                    required
                  />
                  <Form.Text
                    id="jiraPasswordHelpBlock"
                    muted
                    style={helperTextStyle}
                  >
                    Visit the Jira instance that you want to connect to FlowLab.
                    Click Account Settings &gt; Security &gt; Create and manage
                    API tokens &gt; Create API token. Add a Label (suggested
                    “FlowLab Dashboard”) and click Create. Once the token is
                    generated Copy and Paste the API key into the FlowLab Jira
                    Password field.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Button
              variant="outline-primary"
              type="submit"
              onClick={this.handleSubmit}
              disabled={this.determineEnabled()}
            >
              Save & Continue
            </Button>
          </Form>
        </Container>

        <Footer />
      </section>
    );
  }
}
