/**
 * @file ProfileSection component.
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
  Alert,
} from 'react-bootstrap';
import { Redirect } from 'react-router';
import Footer from '../Shared/Footer';

export default class ProfileSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      username: '',
      companyName: '',
      redirect: false,
      redirectTo: '',
      showAlert: false,
      errorMessage: '',
    };
  }

  componentDidMount() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.first_name === null) {
      user.first_name = '';
    }
    if (user.last_name === null) {
      user.last_name = '';
    }
    if (user.username === null) {
      user.username = '';
    }
    if (user.company_name === null) {
      user.company_name = '';
    }

    this.setState({
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      companyName: user.company_name,
    });
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  determineEnabled = () => {
    const { firstName, lastName, username, companyName } = this.state;
    return (
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      username.trim() === '' ||
      companyName.trim() === ''
    );
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { firstName, lastName, username, companyName } = this.state;
    const data = new FormData();
    data.append('user[first_name]', firstName);
    data.append('user[last_name]', lastName);
    data.append('user[username]', username);
    data.append('user[company_name]', companyName);
    data.append('user[initial_config_step]', '2');

    axios
      .put('/users/update.json', data)
      .then((response) => {
        localStorage.setItem('user', JSON.stringify(response.data));
        this.setState({ redirect: true, redirectTo: 'initial-config-step-2' });
      })
      .catch((error) => {
        const { message } = error.response.data;
        this.setState({ showAlert: true, errorMessage: message });
      })
      .finally(() => {
        setTimeout(
          () => this.setState({ showAlert: false, errorMessage: '' }),
          3000,
        );
      });
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
      firstName,
      lastName,
      username,
      companyName,
      redirect,
      redirectTo,
      showAlert,
      errorMessage,
    } = this.state;

    let alert;

    if (redirect) {
      return <Redirect to={`/${redirectTo}`} />;
    }

    if (showAlert) {
      alert = (
        <Alert variant="danger">
          <span>{errorMessage}</span>
        </Alert>
      );
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
            <h4>Profile Section</h4>
            <Row>
              <Col xs={6}>
                {alert}
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={firstName}
                    name="firstName"
                    type="text"
                    placeholder="Enter First Name"
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={lastName}
                    name="lastName"
                    type="text"
                    placeholder="Enter Last Name"
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={username}
                    name="username"
                    type="text"
                    placeholder="Enter Username"
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    onChange={this.handleChange}
                    value={companyName}
                    name="companyName"
                    type="text"
                    placeholder="Enter Company Name"
                    required
                  />
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
