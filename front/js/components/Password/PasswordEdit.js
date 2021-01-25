/**
 * @file Password component.
 */

import React, { Component } from 'react';
import { Redirect } from 'react-router';
import axios from 'axios';

export default class PasswordEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      confirm_password: '',
      reset_password_token: '',
      redirect: false,
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('reset_password_token');

    this.setState({ reset_password_token: token });
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = () => {
    const { password, confirm_password, reset_password_token } = this.state;
    const data = { user: { password, confirm_password, reset_password_token } };

    axios.put('/users/password.json', data).then(() => {
      this.setState({ redirect: true });
    });
  };

  clearInputs = () => {
    this.setState({ password: '', confirm_password: '' });
  };

  determineEnabled = () => {
    const { password, confirm_password, reset_password_token } = this.state;

    if (
      password === '' ||
      confirm_password === '' ||
      reset_password_token === ''
    ) {
      return false;
    }

    return false;
  };

  render() {
    const { password, confirm_password, redirect } = this.state;

    if (redirect) {
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
              value={password}
              name="password"
              type="password"
              placeholder="new password"
            />
            <input
              className="input-login"
              onChange={this.handleChange}
              value={confirm_password}
              name="confirm_password"
              type="password"
              placeholder="confirm new password"
            />
            <button
              className="button-login"
              type="submit"
              disabled={this.determineEnabled()}
              onClick={this.handleSubmit}
            >
              change my password
            </button>
          </div>

          <hr />

          <div className="m-3">Centil, LLC 2021.</div>
        </fieldset>
      </article>
    );
  }
}
