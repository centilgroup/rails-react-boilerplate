
/**
 * @file Nav component.
 */

import React, { Component } from 'react';
import {NavLink} from 'react-router-dom';


export default class Nav extends Component {
    constructor(props) {
      super(props);
      this.state = {
        username:'',
        //navigate: false
      }
    }

    render(){
        return(
            <nav className="navBar">
                <ul>
                    <li><NavLink exact to="/">Main</NavLink></li>
                    <li><NavLink to="/projects/">Projects</NavLink></li>
                    <li><NavLink to="/settings/">Settings</NavLink></li>
                    <li><NavLink to="/logout/">Logout</NavLink></li>
                </ul>
            </nav>
    );
  }
}
export default Nav;