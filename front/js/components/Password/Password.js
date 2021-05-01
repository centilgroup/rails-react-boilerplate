/**
 * @file Password component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Footer from '../Shared/Footer';

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

    axios.post('/users/password.json', data).then();
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
            <img className="logo-login" alt="logo-login" src="/logo.png" />
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

        <Footer />
      </article>
    );
  }
}
