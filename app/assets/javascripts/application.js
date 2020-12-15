// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .

setTimeout(function(){



    // Create chart
    var ctx = document.getElementsByClassName("bottom4");
    var chart = new Chart(ctx, {
        type:"bar",
        data: {
            labels : ["Arrival","Departure"],
            datasets: [{
                label: "Development",
                data : [90, 10],
                backgroundColor: [
                    "#e5e5e5",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)"
                ]
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    },
                    ticks: {
                        beginAtZero: true
                    }   
                }]
            },

            
            
            legend: {
                display: true
            },
            tooltips: {
                enabled: true
            }
        }
    });
    
    
    // DEMO Code: not relevant to example
    function change_gauge(chart, label, data){
      chart.data.datasets.forEach((dataset) => {
        if(dataset.label == label){
          dataset.data = data;
        }  
      });
      chart.update();
    }
    
    var accelerating = false;
    function accelerate(){
      accelerating = false;
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[20,140])
      }, 1000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[60,140])
      }, 2000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[100,100])
      }, 3000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[180,20])
      }, 4000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[200,0])
      }, 5000);
    }
    
    // // Start sequence
    // accelerate();
    // window.setInterval(function(){
    //   if(!accelerating){
    //     acelerating = true;
    //     accelerate();
    //   }
    // }, 6000);
    
    
    
    },5000);



setTimeout(function(){



    // Create chart
    var ctx = document.getElementsByClassName("bottom3");
    var chart = new Chart(ctx, {
        type:"bar",
        data: {
            labels : ["Arrival","Departure"],
            datasets: [{
                label: "QA/Test",
                data : [60, 42],
                backgroundColor: [
                    "#e5e5e5",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)"
                ]
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    },
                    ticks: {
                        beginAtZero: true
                    }   
                }]
            },

            
            
            legend: {
                display: true
            },
            tooltips: {
                enabled: true
            }
        }
    });
    
    
    // DEMO Code: not relevant to example
    function change_gauge(chart, label, data){
      chart.data.datasets.forEach((dataset) => {
        if(dataset.label == label){
          dataset.data = data;
        }  
      });
      chart.update();
    }
    
    var accelerating = false;
    function accelerate(){
      accelerating = false;
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[20,140])
      }, 1000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[60,140])
      }, 2000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[100,100])
      }, 3000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[180,20])
      }, 4000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[200,0])
      }, 5000);
    }
    
    // // Start sequence
    // accelerate();
    // window.setInterval(function(){
    //   if(!accelerating){
    //     acelerating = true;
    //     accelerate();
    //   }
    // }, 6000);
    
    
    
    },5000);




setTimeout(function(){




    // Create chart
    var ctx = document.getElementsByClassName("bottom2");
    var chart = new Chart(ctx, {
        type:"bar",
        data: {
            labels : ["Arrival","Departure"],
            datasets: [{
                label: "Deploy",
                data : [100, 95],
                backgroundColor: [
                    "#e5e5e5",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)"
                ]
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    },
                    ticks: {
                        beginAtZero: true
                    }   
                }]
            },

            
            
            legend: {
                display: true
            },
            tooltips: {
                enabled: true
            }
        }
        
    });
    
    
    // DEMO Code: not relevant to example
    function change_gauge(chart, label, data){
      chart.data.datasets.forEach((dataset) => {
        if(dataset.label == label){
          dataset.data = data;
        }  
      });
      chart.update();
    }
    
    var accelerating = false;
    function accelerate(){
      accelerating = false;
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[20,140])
      }, 1000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[60,140])
      }, 2000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[100,100])
      }, 3000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[180,20])
      }, 4000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[200,0])
      }, 5000);
    }
    
    // // Start sequence
    // accelerate();
    // window.setInterval(function(){
    //   if(!accelerating){
    //     acelerating = true;
    //     accelerate();
    //   }
    // }, 6000);
    
    
    
    },5000);




setTimeout(function(){



    // Create chart
    var ctx = document.getElementsByClassName("bottom1");
    var chart = new Chart(ctx, {
        type:"bar",
        data: {
            labels : ["Arrival","Departure"],
            datasets: [{
                label: "Execution",
                data : [90, 35],
                backgroundColor: [
                    "#e5e5e5",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)"
                ]
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: "rgba(0, 0, 0, 0)",
                    },
                    ticks: {
                        beginAtZero: true
                    }   
                }]
            },

            
            
            legend: {
                display: true
            },
            tooltips: {
                enabled: true
            }
        }
    });
    
    
    // DEMO Code: not relevant to example
    function change_gauge(chart, label, data){
      chart.data.datasets.forEach((dataset) => {
        if(dataset.label == label){
          dataset.data = data;
        }  
      });
      chart.update();
    }
    
    var accelerating = false;
    function accelerate(){
      accelerating = false;
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[20,140])
      }, 1000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[60,140])
      }, 2000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[100,100])
      }, 3000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[180,20])
      }, 4000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[200,0])
      }, 5000);
    }
    
    // // Start sequence
    // accelerate();
    // window.setInterval(function(){
    //   if(!accelerating){
    //     acelerating = true;
    //     accelerate();
    //   }
    // }, 6000);
    
    
    
    },5000);

/************************************* */


setTimeout(function(){



    // Create chart
    var ctx = document.getElementsByClassName("chartjs-gauge4");
    var chart = new Chart(ctx, {
        type:"doughnut",
        data: {
            labels : ["Executed","Failed"],
            datasets: [{
                label: "Gauge",
                data : [90, 3],
                backgroundColor: [
                    "#e5e5e5",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)"
                ]
            }]
        },
        options: {
            circumference: Math.PI,
            rotation : Math.PI,
            cutoutPercentage : 90, // precent
            plugins: {
                          datalabels: {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              borderColor: '#ffffff',
                  color: function(context) {
                                  return context.dataset.backgroundColor;
                              },
                              font: function(context) {
                    var w = context.chart.width;
                    return {
                      size: w < 512 ? 18 : 20
                    }
                  },
                  align: 'start',
                  anchor: 'start',
                  offset: 10,
                              borderRadius: 4,
                              borderWidth: 1,
                  formatter: function(value, context) {
                                  var i = context.dataIndex;
                    var len = context.dataset.data.length - 1;
                    if(i == len){
                      return null;
                    }
                                  return value+' %';
                              }
                }
            },
            legend: {
                display: true
            },
            tooltips: {
                enabled: true
            }
        }
    });
    
    
    // DEMO Code: not relevant to example
    function change_gauge(chart, label, data){
      chart.data.datasets.forEach((dataset) => {
        if(dataset.label == label){
          dataset.data = data;
        }  
      });
      chart.update();
    }
    
    var accelerating = false;
    function accelerate(){
      accelerating = false;
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[20,140])
      }, 1000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[60,140])
      }, 2000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[100,100])
      }, 3000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[180,20])
      }, 4000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[200,0])
      }, 5000);
    }
    
    // // Start sequence
    // accelerate();
    // window.setInterval(function(){
    //   if(!accelerating){
    //     acelerating = true;
    //     accelerate();
    //   }
    // }, 6000);
    
    
    
    },5000);


//******************************* */

setTimeout(function(){



    // Create chart
    var ctx = document.getElementsByClassName("chartjs-gauge3");
    var chart = new Chart(ctx, {
        type:"doughnut",
        data: {
            labels : ["Deployed","Failed"],
            datasets: [{
                label: "Gauge",
                data : [95, 20],
                backgroundColor: [
                    "#e5e5e5",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)"
                ]
            }]
        },
        options: {
            circumference: Math.PI,
            rotation : Math.PI,
            cutoutPercentage : 90, // precent
            plugins: {
                          datalabels: {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              borderColor: '#ffffff',
                  color: function(context) {
                                  return context.dataset.backgroundColor;
                              },
                              font: function(context) {
                    var w = context.chart.width;
                    return {
                      size: w < 512 ? 18 : 20
                    }
                  },
                  align: 'start',
                  anchor: 'start',
                  offset: 10,
                              borderRadius: 4,
                              borderWidth: 1,
                  formatter: function(value, context) {
                                  var i = context.dataIndex;
                    var len = context.dataset.data.length - 1;
                    if(i == len){
                      return null;
                    }
                                  return value+' %';
                              }
                }
            },
            legend: {
                display: true
            },
            tooltips: {
                enabled: true
            }
        }
    });
    
    
    // DEMO Code: not relevant to example
    function change_gauge(chart, label, data){
      chart.data.datasets.forEach((dataset) => {
        if(dataset.label == label){
          dataset.data = data;
        }  
      });
      chart.update();
    }
    
    var accelerating = false;
    function accelerate(){
      accelerating = false;
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[20,140])
      }, 1000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[60,140])
      }, 2000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[100,100])
      }, 3000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[180,20])
      }, 4000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[200,0])
      }, 5000);
    }
    
    // // Start sequence
    // accelerate();
    // window.setInterval(function(){
    //   if(!accelerating){
    //     acelerating = true;
    //     accelerate();
    //   }
    // }, 6000);
    
    
    
    },5000);



//************************************************************************* */

setTimeout(function(){



    // Create chart
    var ctx = document.getElementsByClassName("chartjs-gauge2");
    var chart = new Chart(ctx, {
        type:"doughnut",
        data: {
            labels : ["In-Test","Total"],
            datasets: [{
                label: "Gauge",
                data : [98, 80],
                backgroundColor: [
                    "#e5e5e5",
                    "rgb(54, 162, 235)",
                    "rgb(255, 205, 86)"
                ]
            }]
        },
        options: {
            circumference: Math.PI,
            rotation : Math.PI,
            cutoutPercentage : 90, // precent
            plugins: {
                          datalabels: {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              borderColor: '#ffffff',
                  color: function(context) {
                                  return context.dataset.backgroundColor;
                              },
                              font: function(context) {
                    var w = context.chart.width;
                    return {
                      size: w < 512 ? 18 : 20
                    }
                  },
                  align: 'start',
                  anchor: 'start',
                  offset: 10,
                              borderRadius: 4,
                              borderWidth: 1,
                  formatter: function(value, context) {
                                  var i = context.dataIndex;
                    var len = context.dataset.data.length - 1;
                    if(i == len){
                      return null;
                    }
                                  return value+' %';
                              }
                }
            },
            legend: {
                display: true
            },
            tooltips: {
                enabled: true
            }
        }
    });
    
    
    // DEMO Code: not relevant to example
    function change_gauge(chart, label, data){
      chart.data.datasets.forEach((dataset) => {
        if(dataset.label == label){
          dataset.data = data;
        }  
      });
      chart.update();
    }
    
    var accelerating = false;
    function accelerate(){
      accelerating = false;
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[20,140])
      }, 1000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[60,140])
      }, 2000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[100,100])
      }, 3000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[180,20])
      }, 4000);
    
      window.setTimeout(function(){
          change_gauge(chart,"Gauge",[200,0])
      }, 5000);
    }
    
    // // Start sequence
    // accelerate();
    // window.setInterval(function(){
    //   if(!accelerating){
    //     acelerating = true;
    //     accelerate();
    //   }
    // }, 6000);
    
    
    
    },7000);






//************************************************************** */





setTimeout(function(){



// Create chart
var ctx = document.getElementsByClassName("chartjs-gauge");
var chart = new Chart(ctx, {
    type:"doughnut",
    data: {
        labels : ["Completed","Planned"],
        datasets: [{
            label: "Gauge",
            data : [68, 100],
            backgroundColor: [
                "#e5e5e5",
                "rgb(54, 162, 235)",
                "rgb(255, 205, 86)"
            ]
        }]
    },
    options: {
        circumference: Math.PI,
        rotation : Math.PI,
        cutoutPercentage : 90, // precent
        plugins: {
					  datalabels: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
						  borderColor: '#ffffff',
              color: function(context) {
							  return context.dataset.backgroundColor;
						  },
						  font: function(context) {
                var w = context.chart.width;
                return {
                  size: w < 512 ? 18 : 20
                }
              },
              align: 'start',
              anchor: 'start',
              offset: 10,
						  borderRadius: 4,
						  borderWidth: 1,
              formatter: function(value, context) {
							  var i = context.dataIndex;
                var len = context.dataset.data.length - 1;
                if(i == len){
                  return null;
                }
							  return value+' %';
						  }
            }
        },
        legend: {
            display: true
        },
        tooltips: {
            enabled: true
        }
    }
});


// DEMO Code: not relevant to example
function change_gauge(chart, label, data){
  chart.data.datasets.forEach((dataset) => {
    if(dataset.label == label){
      dataset.data = data;
    }  
  });
  chart.update();
}

var accelerating = false;
function accelerate(){
  accelerating = false;
  window.setTimeout(function(){
      change_gauge(chart,"Gauge",[20,140])
  }, 1000);

  window.setTimeout(function(){
      change_gauge(chart,"Gauge",[60,140])
  }, 2000);

  window.setTimeout(function(){
      change_gauge(chart,"Gauge",[100,100])
  }, 3000);

  window.setTimeout(function(){
      change_gauge(chart,"Gauge",[180,20])
  }, 4000);

  window.setTimeout(function(){
      change_gauge(chart,"Gauge",[200,0])
  }, 5000);
}

// // Start sequence
// accelerate();
// window.setInterval(function(){
//   if(!accelerating){
//     acelerating = true;
//     accelerate();
//   }
// }, 6000);



},7000);