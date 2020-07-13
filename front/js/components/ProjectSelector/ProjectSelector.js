/**
 * @file ProjectSelector component.
 */

import React from 'react';

const ProjectSelector = (props) => {
  return (
    <div>
      <h4>Welcome, {props.username}! </h4>
      <p>please select a project to visualize its data</p>
      <button onClick={() => props.selectProject(1)}>
        {props.project1name}
      </button>
      <button onClick={() => props.selectProject(2)}>
        {props.project2name}
      </button>
    </div>
  );
};

export default ProjectSelector;
