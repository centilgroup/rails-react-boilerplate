/**
 * @file Main component.
 */

import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";


export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username:'',
      //navigate: false
    }
  }

  render() {

    return (
      <div>
        <h1>IDB</h1>
        <p>Welcome, {props.username}</p>
      </div>
    )
  }
}

export default Main;