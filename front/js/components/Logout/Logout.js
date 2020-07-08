/**
 * @file Login component.
 */

import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";


export default class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navigate: false
    }
  }

  //logout = () => {

  //}

  render() {
    const { navigate } = this.state
    if (navigate) {
      return <Redirect to="/" push={true} />
    }

    return (
      <div>
        <button onClick={() => this.setState({navigate: true})}>
          Login
        </button>
      </div>
    )
  }
}

export default Logout;
