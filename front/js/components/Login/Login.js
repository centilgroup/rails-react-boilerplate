/**
 * @file Login component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import { NavLink } from 'react-router-dom';
import { Button, Col, Form, Row } from 'react-bootstrap';
import Footer from '../Shared/Footer';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      redirect: '',
    };
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = this.state;
    const data = { email, password };

    axios.post('/users/pre_otp.json', data).then((response) => {
      const { auth_token, user } = response.data;
      if (auth_token) {
        localStorage.setItem('auth_token', auth_token);
        localStorage.setItem('user', JSON.stringify(user));
        this.setState({ redirect: 'no_otp' });
      } else {
        this.setState({ redirect: 'otp' });
      }
    });
  };

  render() {
    const { email, password, redirect } = this.state;
    const formStyle = {
      width: '30%',
      margin: 'auto',
      marginTop: '200px',
      backgroundColor: '#07165e',
      borderRadius: '5px',
    };
    const inputStyle = {
      border: 'none',
    };

    if (redirect === 'otp') {
      const url = `/otp?email=${email}`;
      return <Redirect to={url} />;
    }

    if (redirect === 'no_otp') {
      return <Redirect to="/" />;
    }

    return (
      <section>
        <Form className="p-4" style={formStyle}>
          <Row>
            <Col xs={12}>
              <div className="mb-3 d-flex justify-content-center">
                <img alt="login" src="/logo.png" width="75px" height="75px" />
              </div>
              <Form.Group controlId="email">
                <Form.Control
                  onChange={this.handleChange}
                  value={email}
                  name="email"
                  type="email"
                  placeholder="Enter Email"
                  required
                  style={inputStyle}
                />
              </Form.Group>
              <Form.Group controlId="password">
                <Form.Control
                  onChange={this.handleChange}
                  value={password}
                  name="password"
                  type="password"
                  placeholder="Enter Password"
                  required
                  style={inputStyle}
                  minLength="6"
                />
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant="primary"
            type="submit"
            onClick={this.handleSubmit}
            style={{ width: '100%' }}
          >
            Login
          </Button>
          <div className="mt-2 text-center">
            <NavLink to="/register" className="text-light">
              New User Registration
            </NavLink>
          </div>
          <div className="mt-2 text-center">
            <NavLink to="/password" className="text-light">
              Forgot Password?
            </NavLink>
          </div>
        </Form>

        <Footer />
      </section>
    );
  }
}
