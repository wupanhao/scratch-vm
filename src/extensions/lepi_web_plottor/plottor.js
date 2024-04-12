// let the editor know that `Chart` is defined by some code
// included in another file (in this case, `index.html`)
// Note: the code will still work without this line, but without it you
// will see an error in the editor
/* global Chart */
/* global Graph */
/* global TransformStream */
/* global TextEncoderStream */
/* global TextDecoderStream */
'use strict';

const { Chart, LineController, LineElement, PointElement, LinearScale, Title, Legend, CategoryScale, ScatterController } = require(`chart.js`)

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, Legend, CategoryScale, ScatterController);

console.log(Chart)
var Graph = function (canvas) {
    let adaChart;
    let plotType;

    this._canvas = canvas
    this.chart = canvas.getContext('2d');
    this.maxBufferSize = 100;

    this.XTConfig = {
        type: 'line', // make it a line chart
        data: {
            labels: [],
            datasets: []
        },
        options: {
            elements: {
                line: {
                    tension: 0,
                    fill: false
                },
            },
            animation: {
                duration: 0
            },
            hover: {
                enabled: false
            },
            tooltips: {
                enabled: false
            },
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'time',
                    bounds: 'data',
                    distribution: 'series',
                    gridLines: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        display: false,
                    },
                }],
                yAxes: [{
                    ticks: {
                        maxRotation: 0
                    }
                }]
            },
            plugins: {
                legend: {
                    title: {
                        display: false,
                        text: '',
                    },
                    labels: {
                        padding: 5
                    }
                },

            },
            responsive: false,
            maintainAspectRatio: false,
        }
    };

    this.XYConfig = {
        type: 'scatter', // make it a scatter chart
        data: {
            labels: [],
            datasets: []
        },
        options: {
            elements: {
                line: {
                    tension: 0,
                    fill: false
                },
            },
            animation: {
                duration: 0
            },
            hover: {
                enabled: false
            },
            tooltips: {
                enabled: false
            },
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'linear',
                    bounds: 'data',
                    distribution: 'series',
                    ticks: {
                        display: true,
                    },
                }],
                yAxes: [{
                    ticks: {
                        maxRotation: 0
                    }
                }]
            },
            plugins: {
                legend: {
                    title: {
                        display: false,
                        text: '',
                    },
                    labels: {
                        padding: 5
                    }
                },
            },
            responsive: false,
        }
    };
}

Graph.prototype = {
    create: function (plotType) {
        if (this.plotType == undefined) {
            if (plotType != undefined) {
                this.setPlotType(plotType);
            } else {
                this.plotType = "xt";
            }
        } else if (plotType != undefined) {
            this.setPlotType(plotType);
        }

        // Remove any existing chart
        if (this.adaChart != undefined) {
            this.adaChart.destroy();
            delete this.adaChart;
        }
        let config = this.getConfig();
        // this.adaChart = new Chart(this.chart, config);
        this.adaChart = new Chart(this._canvas.getContext('2d'), config);
        // console.log(this.adaChart)
    },
    getConfig: function () {
        if (this.plotType == 'xy') {
            return this.XYConfig;
        } else {
            return this.XTConfig;
        }
    },
    setPlotType: function (type) {
        if (!type) {
            return
        }
        if (type.toLowerCase() == "xy") {
            this.plotType = "xy";
        } else {
            this.plotType = "xt";
        }
    },
    updateLabelColor: function (color) {
        // V2.x API
        // this.adaChart.options.scales.xAxes[0].ticks.fontColor = color;
        // this.adaChart.options.scales.yAxes[0].ticks.fontColor = color;
        this.adaChart.options.scales.xAxes.ticks.color = color;
        this.adaChart.options.scales.yAxes.ticks.color = color;
        this.adaChart.update();
    },
    reset: function () {
        /*
        */
        if (!this.adaChart) {
            return
        }
        // Clear the data
        let dataSetLength = this.adaChart.data.datasets.length;
        for (let i = 0; i < dataSetLength; i++) {
            this.adaChart.data.datasets.pop();
        }
        this.adaChart.data.labels = [];
        // this.create();
    },
    addDataSet: function (label, color) {
        let dataConfig;
        if (this.plotType == 'xy') {
            dataConfig = {
                label: label,
                data: [],
                borderColor: color,
                backgroundColor: color,
                borderWidth: 1,
                pointBackgroundColor: color,
                pointBorderColor: color,
                pointRadius: 2,
                pointHoverRadius: 4,
                fill: false,
                tension: 0,
                showLine: false
            }
        } else {
            dataConfig = {
                label: label,
                data: [],
                borderColor: color,
                backgroundColor: color,
                borderWidth: 1,
                pointRadius: 0
            }
        }
        this.adaChart.data.datasets.push(dataConfig);
    },
    update: function () {
        this.adaChart.update();
    },

    addValue: function (dataSetIndex, value) {
        if (this.plotType == 'xy' && Array.isArray(value)) {
            this.adaChart.data.datasets[dataSetIndex].data.push({
                x: value[0],
                y: value[1]
            });
        } else if (this.plotType == 'xt') {
            let time = new Date();
            this.adaChart.data.datasets[dataSetIndex].data.push({
                t: time,
                y: value
            });
        }
        // this.flushBuffer();
    },
    flushBuffer: function () {
        // Make sure to shift out old data
        this.adaChart.data.datasets.forEach(
            dataset => {
                if (dataset.data.length > this.maxBufferSize) {
                    // dataset.data.shift()
                    dataset.data.splice(0, dataset.data.length - this.maxBufferSize)
                }
            }
        )
        if (this.adaChart.data.labels.length > this.maxBufferSize) {
            // this.adaChart.data.labels.shift()
            this.adaChart.data.labels.splice(0, this.adaChart.data.labels.length - this.maxBufferSize)
        }

        this.update();
    },
    dataset: function (dataSetIndex) {
        return this.adaChart.data.datasets[dataSetIndex];
    },
    setBufferSize: function (size) {
        this.maxBufferSize = size;
        this.adaChart.data.datasets.forEach(
            dataset => {
                if (dataset.data.length > this.maxBufferSize) {
                    dataset.data.splice(0, dataset.data.length - this.maxBufferSize)
                }
            }
        )
        if (this.adaChart.data.labels.length > this.maxBufferSize) {
            this.adaChart.data.labels.splice(0, this.adaChart.data.labels.length - this.maxBufferSize)
            this.update()
        }

    }
}


let addValue;

// const colors = ['#FF0000', '#009900', '#0000FF', '#FF9900', '#CC00CC', '#666666', '#00CCFF', '#000000'];
const colors = ['rgb(135,103,186)', 'rgb(70,93,124)', 'rgb(35,122,199)', 'rgb(59,167,214)', 'rgb(79,175,129)', '#FFFF00', '#FF7D00', '#FF0000', 'rgb(154,161,119)', 'rgb(238,157,166)'];

let dataSets = [];

// const baudRates = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200, 230400, 250000, 500000, 1000000, 2000000];
// const bufferSizes = [250, 500, 1000, 2500, 5000];
let graph;


/* V2.x
let addJSONValue = function (value) {

  for (let index = 0; index < dataSets.length; index++) {
    const dataSet = dataSets[index];
    let dataItem = value[dataSet.field];
    try {
      graph.addValue(index, dataItem);
      // graph.adaChart.addData([dataItem], dataSet.field)
    } catch (error) {
      console.log(error)
    }

  }

  // dataSets.forEach((dataSet, index) => {
  //   let dataItem = value[dataSet.field];
  //   graph.addValue(index, dataItem);
  // });
  graph.flushBuffer()
}
*/
// V3.0
let addJSONValue = (value) => {
    graph.adaChart.data.labels.push('');
    graph.adaChart.data.datasets.forEach((dataset, index) => {
        let data = value[dataSets[index].field]
        if (data.length >= 1) {
            dataset.data = dataset.data.concat(data);
            if (dataset.data.length != graph.adaChart.data.labels.length) {
                graph.adaChart.data.labels.pop()
                graph.adaChart.data.labels = graph.adaChart.data.labels.concat(data.map(() => ''))
            }
        } else {
            dataset.data.push(data);
        }
    });
    // chart.update();
    graph.flushBuffer()
}

let addCSVValue = function (value) {
    if (graph.plotType == 'xy') {
        graph.addValue(0, value.csvdata);
    } else {
        dataSets.forEach((dataSet, index) => {
            graph.addValue(index, value.csvdata[dataSet.field]);
        });
    }
}

addValue = addJSONValue



function setupOrUpdate(value) {
    // Initialize the chart if we haven't already
    if (dataSets.length < 1) {
        setupChart(value);
    }
    addValue(value);
    // controller.enqueue(new TextEncoder("utf-8").encode(JSON.stringify(value) + '\n'));
}



/**
 * @name LineBreakTransformer
 * TransformStream to parse the stream into lines.
 */
class LineBreakTransformer {
    constructor() {
        // A container for holding stream data until a new line.
        this.container = '';
    }

    transform(chunk, controller) {
        this.container += chunk;
        const lines = this.container.split('\n');
        this.container = lines.pop();
        lines.forEach(line => controller.enqueue(line));
    }

    flush(controller) {
        controller.enqueue(this.container);
    }
}

/**
 * @name ObjectTransformer
 * TransformStream to parse the stream into a valid object.
 */
class ObjectTransformer {
    transform(chunk, controller) {
        // Log Raw Data
        logData(chunk);

        let jsobj = convertJSON(chunk)
        // Define the correct function ahead of time
        if (jsobj == chunk) {
            jsobj = convertCSV(chunk)
            addValue = addCSVValue;
        } else {
            addValue = addJSONValue;
        }
        controller.enqueue(jsobj);
    }
}

function convertJSON(chunk) {
    try {
        let jsonObj = JSON.parse(chunk);
        return jsonObj;
    } catch (e) {
        return chunk;
    }
}

function convertCSV(chunk) {
    let jsobj = {};
    jsobj.csvdata = chunk.split(",");
    return jsobj;
}

function setupChart(value) {
    // Use the value as a template
    if (value.csvdata) {
        if (graph.plotType == "xt") {
            value.csvdata.forEach((item, index) => {
                dataSets.push({
                    label: "",
                    field: index,
                    borderColor: colors[index % colors.length]
                });
            });
        } else {
            dataSets.push({
                label: "",
                field: 0,
                borderColor: colors[0]
            });
        }
    } else {
        Object.entries(value).forEach(([key, item], index) => {
            dataSets.push({
                label: key,
                field: key,
                borderColor: colors[index % colors.length],
                // color: colors[index % colors.length],
                // backgroundColor: colors[index % colors.length],
                // pointBackgroundColor: colors[index % colors.length],
            });
        });
    }

    dataSets.forEach((dataSet) => {
        graph.addDataSet(dataSet.label, dataSet.borderColor);
    });
    // console.log(graph)
    graph.update();
}


function initGraph(canvas) {
    graph = new Graph(canvas);
    // loadAllSettings();
    graph.create();
}

function setPlotType(type) {
    if (type != graph.plotType) {
        reset();
        graph.setPlotType(type)
        graph.create()
    }
}

function setBufferSize(size) {
    graph.setBufferSize(size)
}

function setTitle(title, size) {
    if (title) {
        graph.adaChart.options.plugins.legend.title = {
            display: true,
            padding: { top: 10, bottom: 0 },
            font: { size },
            text: title
        }
    } else {
        graph.adaChart.options.plugins.legend.title = {
            display: false,
            text: title
        }
    }
    graph.update();
}

function update(width, height) {
    if (graph._canvas.width == width && graph._canvas.height == height) {
        return
    }
    let data = JSON.stringify(graph.adaChart.config._config)
    if (graph && graph.adaChart) {
        if (graph.adaChart != undefined) {
            graph.adaChart.destroy();
            delete graph.adaChart;
        }
    } else {
        console.log('graph or chart not define')
    }

    graph._canvas.width = width
    graph._canvas.height = height
    console.log('resize called')

    let config = JSON.parse(data)
    // console.log(config)
    graph.adaChart = new Chart(graph._canvas.getContext('2d'), config);
}

/**
 * @name reset
 * Reset the Plotter, Log, and associated data
 */
async function reset() {
    // Clear the data
    // console.log(graph.adaChart.data.datasets)
    dataSets = [];
    graph.reset();
    setTitle()
    graph.update()
}

module.exports = {
    initGraph, setupOrUpdate, reset, setPlotType, setBufferSize, setTitle, update
}