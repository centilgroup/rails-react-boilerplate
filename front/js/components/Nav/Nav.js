import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Nav = (props) => {
  const { toggleSettings } = props;
  const { logoutUser } = props;
  const { openProjectDropDown } = props;
  return (
    <nav>
      <Link to="/">
        <img
          className="logo-nav"
          src="https://user-images.githubusercontent.com/38546045/87486176-f1a5f280-c5f7-11ea-90de-1e80393d15a0.png"
        
        />
      </Link>
      <span>
        <button className="button-nav" onClick={openProjectDropDown}>projects</button>
        <button className="button-nav" onClick={toggleSettings}> settings </button>
        <NavLink to="/" onClick={logoutUser}>
          <button className="button-nav">
            logout
          </button>
        </NavLink>
      </span>
    </nav>
  );
};

export default Nav;
