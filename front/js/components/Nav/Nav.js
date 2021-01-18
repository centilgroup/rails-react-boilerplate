import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Nav = (props) => {
  const { toggleSettings, logoutUser, openProjectDropDown } = props;
  return (
    <nav>
      <div className="row">
        <div className="col-md-10">
          <Link to="/" className="top-nav-1">
            <img
              alt="logo"
              className="logo-nav"
              src="https://user-images.githubusercontent.com/38546045/87486176-f1a5f280-c5f7-11ea-90de-1e80393d15a0.png"
            />
            <span className="top-version">Alpha</span>
          </Link>
        </div>
        <div className="col-md-10">
          <span>
            {/* <button className="button-nav" onClick={openProjectDropDown}>projects</button>
            <button className="button-nav" onClick={toggleSettings}> settings </button> */}
            <button
              type="button"
              className="button-nav"
              onClick={toggleSettings}
            >
              Settings
            </button>
            {/* <a */}
            {/*  href="/vpi-demo" */}
            {/*  className="top-nav-1" */}
            {/*  style={{ color: 'white', display: 'inline' }} */}
            {/* > */}
            {/*  VPI Test Harness */}
            {/* </a> */}
            <NavLink to="/profile">
              <button className="button-nav" type="button">
                Profile
              </button>
            </NavLink>
            <NavLink to="/" onClick={logoutUser}>
              <button className="button-nav" type="button">
                Logout
              </button>
            </NavLink>
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
