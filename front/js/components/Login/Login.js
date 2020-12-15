/**
 * @file Login component.
 */

import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      email: '',
    };
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = () => {
    this.props.loginUser(this.state.username, this.state.email);
  };

  clearInputs = () => {
    this.setState({ username: '', email: '' });
  };

  determineEnabled = () => {
    const { username } = this.state;
    const { email } = this.state;
    if (username === '' || email === '') {
      return false;
    } else {
      return false;
    }
  };

  render() {
    const { username } = this.state;
    const { email } = this.state;
    return (
      <article className="article-login">
        <fieldset>
          <div className="div-login">
          <img
              className="logo-login"
              src="https://user-images.githubusercontent.com/38546045/87486176-f1a5f280-c5f7-11ea-90de-1e80393d15a0.png"
            />
            <input
              className="input-login"
              onChange={this.handleChange}
              value={username}
              name="username"
              type="text"
              placeholder="name"
            />
            <input
              className="input-login"
              onChange={this.handleChange}
              value={email}
              name="email"
              type="text"
              placeholder="email"
            />
            <Link to="/">
              <button
                className="button-login"
                type="submit"
                disabled={this.determineEnabled()}
                onClick={this.handleSubmit}
              >
                login
              </button>
            </Link>
          
          </div>
        </fieldset>
      </article>
    );
  }
}
