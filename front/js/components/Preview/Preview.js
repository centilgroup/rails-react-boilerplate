/**
 * @file Preview component.
 */

import React from 'react';
import { Bar } from 'react-chartjs-2';

const Preview = (props) => {
  return (
    <div>
      <h1>{props.closeTimeChart}</h1>
      <h2>{props.data}</h2>
      {/* <Bar 
        data={props.data}   
        width={100}
        height={10}
        options={{ maintainAspectRatio: false }}
      /> */}
      {/* <p>Feature: {props.chartData.datasets.data[0]}</p>
      <p>Risk: {props.chartData.datasets.data[1]}</p>
      <p>Debt: {props.chartData.datasets.data[2]}</p>
      
      <p>Defect: {props.chartData.datasets.data[3]}</p> */}
    </div>
  );
};

export default Preview;
