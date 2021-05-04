/**
 * @file Login component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router';
import Footer from '../Shared/Footer';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      otp: '',
      redirect: false,
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    this.setState({ email });
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = () => {
    const { email, otp } = this.state;
    const data = { email, otp };

    axios.post('/users/sign_in.json', data).then((response) => {
      const { auth_token, user } = response.data;
      localStorage.setItem('auth_token', auth_token);
      localStorage.setItem('user', JSON.stringify(user));
      this.setState({ redirect: true });
    });
  };

  clearInputs = () => {
    this.setState({ otp: '' });
  };

  determineEnabled = () => {
    const { email, otp } = this.state;
    if (email === '' || otp === '') {
      return false;
    }

    return false;
  };

  render() {
    const { otp, redirect } = this.state;

    if (redirect) {
      return <Redirect to="/" />;
    }

    return (
      <article className="article-login">
        <fieldset>
          <div className="div-login">
            <img className="logo-login" alt="logo-login" src="/logo.png" />
            <input
              className="input-login"
              onChange={this.handleChange}
              value={otp}
              name="otp"
              type="password"
              placeholder="otp"
            />
            <button
              className="button-login"
              type="submit"
              disabled={this.determineEnabled()}
              onClick={this.handleSubmit}
            >
              submit otp
            </button>
          </div>
        </fieldset>

        <Footer />
      </article>
    );
  }
}
