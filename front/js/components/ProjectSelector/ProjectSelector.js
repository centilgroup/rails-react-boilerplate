/**
 * @file ProjectSelector component.
 */

import React from 'react';

const ProjectSelector = (props) => {
  return (
    <div className="project-selector-div">
    <section className="project-selector-section">
      <h4 className="project-selector-h4">Welcome, {props.username}!</h4>
      <section className="project-selector-project-section">
      <article className="project-selector-project-article">
        <img onClick={() => props.selectProject(1)} className="project-selector-preview" src='https://user-images.githubusercontent.com/38546045/87547013-b5aa7600-c667-11ea-9169-74b578afdcc6.png'/>
      <button 
        className="project-selector-button"
        onClick={() => props.selectProject(1)}>
        {props.project1name}
      </button>
      </article>
      <article className="project-selector-project-article"
      >
      <img onClick={() => props.selectProject(2)} className="project-selector-preview" src='https://user-images.githubusercontent.com/38546045/87547013-b5aa7600-c667-11ea-9169-74b578afdcc6.png'/>
      <button 
        className="project-selector-button"
        onClick={() => props.selectProject(2)}>
        {props.project2name}
      </button>
      </article>
      </section>
      <h3 className="project-selector-h3">select a project to visualize its data</h3>
    </section>
    </div>
  );
};

export default ProjectSelector;
