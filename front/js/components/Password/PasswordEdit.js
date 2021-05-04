/**
 * @file Password component.
 */

import React, { Component } from 'react';
import { Redirect } from 'react-router';
import axios from 'axios';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import Footer from '../Shared/Footer';

export default class PasswordEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      resetPasswordToken: '',
      redirect: false,
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('reset_password_token');

    this.setState({ resetPasswordToken: token });
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { password, resetPasswordToken } = this.state;
    const data = {
      user: {
        password,
        reset_password_token: resetPasswordToken,
      },
    };

    axios
      .put('/users/password.json', data)
      .then(() => {
        this.setState({ redirect: true });
      })
      .catch((error) => {
        const { errors } = error.response.data;
        let passwordErrorMessage = '';

        if (errors.password) {
          [passwordErrorMessage] = errors.password;
        }

        this.setState({
          validated: true,
          passwordErrorMessage,
        });
      });
  };

  render() {
    const { password, redirect, validated, passwordErrorMessage } = this.state;
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

    if (redirect) {
      return <Redirect to="/" />;
    }

    return (
      <section>
        <Form
          noValidate
          validated={validated}
          className="p-4"
          style={formStyle}
        >
          <Row>
            <Col xs={12}>
              <div className="mb-3 d-flex justify-content-center">
                <img
                  alt="register"
                  src="/logo.png"
                  width="75px"
                  height="75px"
                />
              </div>
              <Form.Group controlId="password">
                <Form.Control
                  onChange={this.handleChange}
                  value={password}
                  name="password"
                  type="password"
                  placeholder="Enter New Password"
                  required
                  style={inputStyle}
                  minLength="6"
                />
                <Form.Control.Feedback type="invalid">
                  {passwordErrorMessage}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Button
            variant="primary"
            type="submit"
            onClick={this.handleSubmit}
            style={{ width: '100%' }}
          >
            Change My Password
          </Button>
          <div className="mt-2 text-center">
            <NavLink to="/" className="text-light">
              Go To Login
            </NavLink>
          </div>
        </Form>

        <Footer />
      </section>
    );
  }
}
