/**
 * @file Login component.
 */

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
    };
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = () => {
    const { email, password } = this.state;
    const data = { email, password };
    const self = this;

    axios.post('/users/sign_in.json', data).then(
      (response) => {
        self.props.loginUser(email);
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
    const { email, password } = this.state;

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
