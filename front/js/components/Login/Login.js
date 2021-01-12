/**
 * @file Login component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      redirect: '',
    };
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = () => {
    const { email, password } = this.state;
    const data = { email, password };

    axios.post('/users/pre_otp.json', data).then(
      (response) => {
        const { auth_token, user } = response.data;
        if (auth_token) {
          localStorage.setItem('auth_token', auth_token);
          localStorage.setItem('user', JSON.stringify(user));
          this.props.loginUser(email);
          this.setState({ redirect: 'no_otp' });
        } else {
          this.setState({ redirect: 'otp' });
        }
      },
      (error) => {
        console.log(error);
      },
    );
  };

  clearInputs = () => {
    this.setState({ username: '', email: '' });
  };

  determineEnabled = () => {
    const { username } = this.state;
    const { email } = this.state;
    if (username === '' || email === '') {
      return false;
    }

    return false;
  };

  render() {
    const { email, password, redirect } = this.state;

    if (redirect === 'otp') {
      const url = `/otp?email=${email}`;
      return <Redirect to={url} />;
    }

    if (redirect === 'no_otp') {
      return <Redirect to="/" />;
    }

    return (
      <article className="article-login">
        <fieldset>
          <div className="div-login">
            <img
              className="logo-login"
              alt="logo-login"
              src="https://user-images.githubusercontent.com/38546045/87486176-f1a5f280-c5f7-11ea-90de-1e80393d15a0.png"
            />
            <input
              className="input-login"
              onChange={this.handleChange}
              value={email}
              name="email"
              type="text"
              placeholder="email"
            />
            <input
              className="input-login"
              onChange={this.handleChange}
              value={password}
              name="password"
              type="password"
              placeholder="password"
            />
            <button
              className="button-login"
              type="submit"
              disabled={this.determineEnabled()}
              onClick={this.handleSubmit}
            >
              login
            </button>
            <Link to="/register">
              <span className="nav-link">New user registration</span>
            </Link>
            <span className="nav-link"> | </span>
            <Link to="/password">
              <span className="nav-link">Forgot password?</span>
            </Link>
          </div>
        </fieldset>
      </article>
    );
  }
}
