/**
 * @file Preview component.
 */

import React from 'react';

const Preview = (props) => {
  return (
    <div>
      <h1>{props.title}</h1>
      <p>Feature: {props.data[0]}</p>
      <p>Risk: {props.data[1]}</p>
      <p>Debt: {props.data[2]}</p>
      <p>Defect: {props.data[3]}</p>
    </div>
  );
};

export default Preview;
