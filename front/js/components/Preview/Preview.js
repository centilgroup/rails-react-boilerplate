/**
 * @file Preview component.
 */

import React from 'react';
<<<<<<< HEAD
import Nav from '../Nav/Nav';
import Data from '../Data/Data';

const Preview = () => {
  class Preveiw extends Component {
    constructor(props) {
      super(props);
      this.state = {
        
      };
    }
  
    $(data).ready(function() {
      var $time1 = $("#start");
      var $time2 = $("#end");
      var $diff = $("#totalTime");
    }

    $(data).ready(inProgress() {
      var dtTime1 = getHours(), getMinutes(), getSeconds()
      var dtTime2 = new Time("#inProgress");
      var dtTime3 = $("#end");
      var $diff = $("#inProgressTime");
    }



    

  return (
    <div>
      <chart1>
        
        <h5>${eficancy}</h5> 
      </chart1>

    
      <chart2>
        <h5>${closetime}</h5>
        debt= 
      </chart2>
      
=======
import { Bar } from 'react-chartjs-2';

const Preview = (props) => {
  return (
    <div>
      <h1>{props.title}</h1>
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
>>>>>>> master
    </div>
  );
  render() {
    
  }
};

export default Preview;
