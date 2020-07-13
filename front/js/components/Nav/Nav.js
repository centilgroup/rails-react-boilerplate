
/**
 * @file Nav component.
 */

export default Nav;
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
