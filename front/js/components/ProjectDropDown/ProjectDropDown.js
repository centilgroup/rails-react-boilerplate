/**
 * @file ProjectDropDown component.
 */

import React from 'react';

const ProjectDropDown = (props) => {
  const { openProjectDropDown } = props;
  return (
    <div className="project-drop-div-outer">
      <div className="project-drop-div-inner">
        <img
          onClick={openProjectDropDown}
          className="project-drop-close"
          src="https://user-images.githubusercontent.com/38546045/87554381-4df92880-c671-11ea-8ad5-9d747cf5532e.png"
        />
        <button
          className="project-drop-button"
          onClick={() => {
            props.selectProject(1);
            openProjectDropDown();
          }}
        >
          {props.project1name}
        </button>
        <button
          className="project-drop-button"
          onClick={() => {
            props.selectProject(2);
            openProjectDropDown();
          }}
        >
          {props.project2name}
        </button>
      </div>
    </div>
  );
};

export default ProjectDropDown;
