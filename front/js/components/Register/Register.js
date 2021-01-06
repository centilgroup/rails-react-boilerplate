/**
 * @file Register component.
 */

import React, { Component } from 'react';
import axios from 'axios';

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      confirm_password: '',
    };
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = () => {
    const { email, password, confirm_password } = this.state;
    const data = { user: { email, password, confirm_password } };

    axios.post('/users.json', data).then(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      },
    );
  };

  clearInputs = () => {
    this.setState({ email: '', password: '', confirm_password: '' });
  };

  determineEnabled = () => {
    const { email, password, confirm_password } = this.state;

    if (email === '' || password === '' || confirm_password === '') {
      return false;
    }

    return false;
  };

  render() {
    const { email, password, confirm_password } = this.state;

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
            <input
              className="input-login"
              onChange={this.handleChange}
              value={confirm_password}
              name="confirm_password"
              type="password"
              placeholder="confirm password"
            />
            <button
              className="button-login"
              type="submit"
              disabled={this.determineEnabled()}
              onClick={this.handleSubmit}
            >
              register
            </button>
          </div>
        </fieldset>
      </article>
    );
  }
}
