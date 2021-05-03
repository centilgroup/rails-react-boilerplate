/**
 * @file Password component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { Button, Col, Form, Row } from 'react-bootstrap';
import Footer from '../Shared/Footer';

export default class Password extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      validated: false,
      emailErrorMessage: '',
      emailSuccessMessage: '',
    };
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value,
      emailErrorMessage: '',
      emailSuccessMessage: '',
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { email } = this.state;
    const data = { user: { email } };

    axios
      .post('/users/password.json', data)
      .then(() => {
        this.setState({
          validated: true,
          emailSuccessMessage: 'Reset password link sent to your email.',
        });

        setTimeout(() => {
          this.setState({
            validated: false,
            emailSuccessMessage: '',
            email: '',
          });
        }, 5000);
      })
      .catch((error) => {
        const { errors } = error.response.data;
        let emailErrorMessage = '';

        if (errors.email) {
          [emailErrorMessage] = errors.email;
        }

        this.setState({
          validated: true,
          email: '',
          emailErrorMessage,
        });
      });
  };

  render() {
    const {
      email,
      validated,
      emailErrorMessage,
      emailSuccessMessage,
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
                  isInvalid={emailErrorMessage === 'not found'}
                />
                <Form.Control.Feedback>
                  {emailSuccessMessage}
                </Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                  {emailErrorMessage}
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
            Reset Your Password
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
