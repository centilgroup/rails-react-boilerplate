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
      return true;
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
        <h1>IDB</h1>
        <div className="div-login">
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
            submit
          </button>
        </Link>
        </div>
      </fieldset>
      </article>
    );
  }
}
