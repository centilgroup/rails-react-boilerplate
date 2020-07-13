/**
 * @file Main component.
 */

import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import React from 'react';
import Nav from '../Nav/Nav';
import Settings from '../Settings/Settings';
import ProjectSelector from '../ProjectSelector/ProjectSelector';
import ProjectDropDown from '../ProjectDropDown/ProjectDropDown';

const Main = (props) => {
  const { settingsSelected } = props;
  const { username } = props;
  const { logoutUser } = props;
  const { toggleSettings } = props;
  const { openProjectDropDown } = props;
  const { clickedProjectDropDown } = props;

  return (
    <main>
      <Nav
        toggleSettings={toggleSettings}
        logoutUser={logoutUser}
        openProjectDropDown={openProjectDropDown}
      />
      <section>
        <ProjectSelector username={username} />
        {settingsSelected ? <Settings /> : null}
        {clickedProjectDropDown ? <ProjectDropDown /> : null}
      </section>
    </main>
  );
};
>>>>>>> master

export default Main;
