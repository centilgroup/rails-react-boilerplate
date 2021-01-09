/**
 * @file Password component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default class Password extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
    };
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = () => {
    const { email } = this.state;
    const data = { user: { email } };

    axios.post('/users/password.json', data).then(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      },
    );
  };

  clearInputs = () => {
    this.setState({ email: '' });
  };

  determineEnabled = () => {
    const { email } = this.state;

    if (email === '') {
      return false;
    }

    return false;
  };

  render() {
    const { email } = this.state;

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
            <button
              className="button-login"
              type="submit"
              disabled={this.determineEnabled()}
              onClick={this.handleSubmit}
            >
              reset your password
            </button>
            <Link to="/">
              <p className="nav-link">Go to login</p>
            </Link>
          </div>
        </fieldset>
      </article>
    );
  }
}
