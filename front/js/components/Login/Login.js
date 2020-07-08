/**
 * @file Login component.
 */

import React, { Component } from 'react';
import { Link } from "react-router-dom";


export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: ''
    }
  }
  render() {
    return (
        <fieldset>
            <h1>IDB</h1>
            <input onChange={this.handleChange} value={this.state.username} name="username" type="text" placeholder="name" />
            <input onChange={this.handleChange} value={this.state.email} name="email" type="text" placeholder="email" />
            <Link to='/home'><button disabled={this.determineEnabled()} onClick={this.handleChange}>submit</button></Link>
        </fieldset>
    )
}
};

export default Login;
