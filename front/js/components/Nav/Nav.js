<<<<<<< HEAD

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
=======
import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Nav = (props) => {
  const { toggleSettings } = props;
  const { logoutUser } = props;
  const { openProjectDropDown } = props;
  return (
    <nav>
      <Link to="/dashboard">home</Link>
      <span>
        <button onClick={openProjectDropDown}>projects</button>
        <button onClick={toggleSettings}> settings </button>
        <NavLink to="/" onClick={logoutUser}>
          logout
        </NavLink>
      </span>
    </nav>
  );
};

export default Nav;
>>>>>>> master
