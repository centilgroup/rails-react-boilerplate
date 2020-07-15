/**
 * @file ProjectSelector component.
 */

import React from 'react';

const ProjectSelector = (props) => {
  return (
    <div className="project-selector-div">
    <section className="project-selector-section">
      <h4 className="project-selector-h4">Welcome, {props.username}!</h4>
      <article>
        <img className="project-selector-preview" src='https://user-images.githubusercontent.com/38546045/87496103-27ef6c00-c610-11ea-92b7-e1c466b64dd2.png'/>
      <button 
        className="project-selector-button"
        onClick={() => props.selectProject(1)}>
        {props.project1name}
      </button>
      </article>
      <article>
      <img className="project-selector-preview" src='https://user-images.githubusercontent.com/38546045/87496103-27ef6c00-c610-11ea-92b7-e1c466b64dd2.png'/>
      <button 
        className="project-selector-button"
        onClick={() => props.selectProject(2)}>
        {props.project2name}
      </button>
      </article>
      <h3 className="project-selector-h3">select a project to visualize its data</h3>
    </section>
    </div>
  );
};

export default ProjectSelector;
