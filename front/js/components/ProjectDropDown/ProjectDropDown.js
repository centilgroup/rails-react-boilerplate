/**
 * @file ProjectDropDown component.
 */

import React from 'react';

const ProjectDropDown = (props) => {
  return (
    <div>
      <button onClick={() => props.selectProject(1)}>
        {props.project1name}
      </button>
      <button onClick={() => props.selectProject(2)}>
        {props.project2name}
      </button>
    </div>
  );
};

export default ProjectDropDown;
