/**
 * @file Register component.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import Footer from '../Shared/Footer';

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      password_confirmation: '',
      redirect: false,
    };
  }

  handleChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = () => {
    const { email, password, password_confirmation } = this.state;
    const data = { user: { email, password, password_confirmation } };

    axios.post('/users.json', data).then(() => {
      this.setState({ redirect: true });
    });
  };

  clearInputs = () => {
    this.setState({ email: '', password: '', password_confirmation: '' });
  };

  determineEnabled = () => {
    const { email, password, password_confirmation } = this.state;

    if (email === '' || password === '' || password_confirmation === '') {
      return false;
    }

    return false;
  };

  render() {
    const { email, password, password_confirmation, redirect } = this.state;

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
              value={password_confirmation}
              name="password_confirmation"
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
