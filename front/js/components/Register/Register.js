/**
 * @file Register component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { Redirect } from 'react-router';
import { Button, Col, Form, Row } from 'react-bootstrap';
import Footer from '../Shared/Footer';

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      passwordConfirmation: '',
      redirect: false,
      validated: false,
      emailErrorMessage: '',
      passwordErrorMessage: '',
      passwordConfirmationErrorMessage: '',
    };
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value,
      emailErrorMessage: '',
      passwordErrorMessage: '',
      passwordConfirmationErrorMessage: '',
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { email, password, passwordConfirmation } = this.state;
    const data = {
      user: {
        email,
        password,
        password_confirmation: passwordConfirmation,
      },
    };

    axios
      .post('/users.json', data)
      .then(() => {
        this.setState({ redirect: true });
      })
      .catch((error) => {
        const { errors } = error.response.data;
        let emailErrorMessage = '';
        let passwordErrorMessage = '';
        let passwordConfirmationErrorMessage = '';

        if (errors.email) {
          [emailErrorMessage] = errors.email;
        }
        if (errors.password) {
          [passwordErrorMessage] = errors.password;
        }
        if (errors.password_confirmation) {
          [passwordConfirmationErrorMessage] = errors.password_confirmation;
        }

        this.setState({
          validated: true,
          emailErrorMessage,
          passwordErrorMessage,
          passwordConfirmationErrorMessage,
        });
      });
  };

  render() {
    const {
      email,
      password,
      passwordConfirmation,
      redirect,
      validated,
      emailErrorMessage,
      passwordErrorMessage,
      passwordConfirmationErrorMessage,
    } = this.state;
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
              <Form.Group controlId="email">
                <Form.Control
                  onChange={this.handleChange}
                  value={email}
                  name="email"
                  type="email"
                  placeholder="Enter Email"
                  required
                  style={inputStyle}
                  isInvalid={emailErrorMessage === 'has already been taken'}
                />
                <Form.Control.Feedback type="invalid">
                  {emailErrorMessage}
                </Form.Control.Feedback>
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
                <Form.Control.Feedback type="invalid">
                  {passwordErrorMessage}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="passwordConfirmation">
                <Form.Control
                  onChange={this.handleChange}
                  value={passwordConfirmation}
                  name="passwordConfirmation"
                  type="password"
                  placeholder="Confirm Password"
                  required
                  style={inputStyle}
                  minLength="6"
                />
                <Form.Control.Feedback type="invalid">
                  {passwordConfirmationErrorMessage}
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
            Register
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
