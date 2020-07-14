/**
 * @file Preview component.
 */

import React from 'react';

const Preview = (props) => {
  return (
    <div>
      <h1>{props.title}</h1>
      <p>Feature: {props.chartData.datasets.data[0]}</p>
      <p>Risk: {props.chartData.datasets.data[1]}</p>
      <p>Debt: {props.chartData.datasets.data[2]}</p>
      
      <p>Defect: {props.chartData.datasets.data[3]}</p>
    </div>
  );
};

export default Preview;
