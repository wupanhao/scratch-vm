const EventEmitter = require('events');
const echarts=require('echarts')
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
// const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');
// const WebSocket = require('ws');

// const plottor = require('./plottor');
const { setTimeout, setInterval } = require('timers');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAVcSURBVFhH7VZtSJtXFH7yZWKy1A/Y2CR1zq2Jioxqp62jtTBk4qibsNFBYVAm7OdSHa3Iyib90z/F0cE6Zd2XHYLVtZtsdCDWjlHsplhR1uJErZ0fc/MjiSYxJm+yc27ySleavAkZrIw8cEje+5733Oc+55x7ryp0FCE8xFBHfh9apAgmixTBZJEimCxSBJPF/5AgH4z3Ho7y84OMIc8gPyeIxAkGgVtbO/DFigW31ug5cJ/5I0Z+d13A6XEtfnEaxDMksgSJxn9ZoODn5nbgdrkdJeUV2JW3E99+dwW5lhzMzy9QJBVCoRD/QAoEEQj4odUbUFG2B3+uOvH77AxKpy/iNc8NQEfxyC8exEeQlFnc8SR+e3sQB21P0OQBSJIEvV5Pv0FoNPElYsolwXdqP4oWiKQ+MqgAZYL81g0snVtBZmYGQpJfKGUwGODz+YQFg0GkpaVBrVaTgir4/X4xZjKZoNVqceT1V6AzLuHLz2/gry0g+y0VNBw3jnUpu1A9OZ57CTBnY/D6TygpKYHNZsPVq1eh0+kEAf5l0qwqE2OSTM7jcaP78mU0vHMSBdYXMXPnLoKU+rWDxwBfJL4CYhPkVW6SgC80QOvbwKVLl2C1WpGTk4Oenh5KrUYQYbLr6+si5axoX1+fIP7Zp+dx2P4Bch7LRnPzKRx+Kg9dLe8jeKg53EjKxaWQYmoMSavBH+cC0G8sY2pqCo2Njdja2sKFCxdQUFAQdiPlGLJ6nGo2xujQzxi/PQGVQcKeon3UzBIetRXD/G4B0hcmwg0TA7EVpFU699XDSF6sSH5+Pnp7e3Ht2jVBbnh4GK2trUJJJscmN9DAwADGx8exu2wvRieG0XDSjsLiQlipPHTk49j7ZlhFBURXkEfXgfn3riPDVkZFHRDqsDEhl8uFhoYGdHV1YXR0VNSlTK6trQ2dnZ1YWlrC2bNnUVdXJ0Jubm6K9xLFXl5dQ37jTuARehFjy4muIAUJmShtu56HOugXxMQwNQOrmZubi46ODlRXV6Ompgb9/f2iWVjFsbExoXZ6ejpGRkYEMe5sOf0qiqHLzoHPQgTD1REV0QnS3ucqPgSDKiQmZcgKMgYHB1FbW4uhoSG0t7ejsrJSKOjxeNDU1ASv14vS0lLU19cLcjLCMUBxJYr/cvj0iQFNy260RP7/E7QNrB2ohya/jBQMbNeYXGcWiwVZWVlCUbvdLrpXpI+MVWJVq6qqxP5oNBrFN/L+yAiQn9cvIePGxZgnS/QapPqbPf4DzIX7t1PMJo4zLW3KpnRoyE1L5rxHBSpP8iEjHirKj44s5KXN3OcV38rd7acTyLG2hmdOPE17LA0kRJBHiOD0mRlkZmdDFQwXCk8Q1BnhW5yE6fwRqBzz4biRScV3xIyWgRCzI3/JmAXvG59AW3CA9lIKGgEruRIywnaMCj1hBXlkA5g8MwszFTqdb+H0qXVwL06j8HQFkEY+LKESOKMcy/41dIUHoQ14tzPh0mWh6AS3MSGyxvsRZZjAK1qdg4dqy+12w7XhxuzSKqwfEjm6PW0TVDJWJwPY9fGrmJuZhMuzKeJ5vLTlrC+LkyqaeowHE+QPqLjMw51Y9qngdK1jyhHAs1/VQcMNyYWXCHgWur2Ud9Tgzkp4sc6ABuab3THJMaIrSAEfH/gIqqFu3JxzoOh7OzLmlY+mqKBFpTkdKPvmKEbmXHD/+iPyeo+Hr10xSMY+i/kNbTc+vRp6uoQK5RRWHBMcj/rNTbuAyUf3Ll5sdIkEYr9mMrRCPVd6suQY/D3VpSlE5LiGFcgxlF04qGz/BhKMF8ca/lukCCaLFMFkkSKYHIC/AZpfWt/JEqxtAAAAAElFTkSuQmCC'
const blockIconURI='data:image/png;base64,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'
const menuIconURI = blockIconURI;


class LepiEcharts extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */

        this.runtime = runtime;

        /**
         * Id representing a Scratch Renderer skin the video is rendered to for
         * previewing.
         * @type {number}
         */
        this._skinId = -1;

        /**
         * The Scratch Renderer Skin object.
         * @type {Skin}
         */
        this._skin = null;

        /**
         * Id for a drawable using the video's skin that will render as a video
         * preview.
         * @type {Drawable}
         */
        this._drawable = -1;

        /**
         * Store the last state of the video transparency ghost effect
         * @type {number}
         */
        this._ghost = 0;

        this.client = null
        this.chartData = {data1:[]}
        /*
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
        }
        this.runtime.on('LEPI_CONNECTED', () => {
        })
        */
        this.myChart=null
        this.div = document.createElement('div')
        this.div.width = '480'
        this.div.height = '360'
        // this.div.style.display = 'block'
        this.div.style.display = 'none'
        this.div.style.marginTop = '1080px'

        const { renderer } = this.runtime
        this.canvas = document.createElement('canvas')
        this.canvas.width = renderer.canvas.width
        this.canvas.height = renderer.canvas.height
        this.canvas.style.width = renderer._nativeSize[0] + 'px'
        this.canvas.style.height = renderer._nativeSize[1] + 'px'

        // this.ctx = this.canvas.getContext('2d')
        // this.canvas.style.display = 'block'

        this.div.appendChild(this.canvas)
        document.querySelector('body').appendChild(this.div)
        //  runtime.ioDevices.clock.projectTimer()
        this.lastUpdate = 0
        this.count=0
        this.dataBufferSize=100//默认保存最近100个
        this.xType='category'//图表x轴类型，默认为种类型
        this.initChart()
        // plottor.initGraph(this.canvas)

        this.startRender()
    }

    /**
     * The key to load & store a target's pen-related state.
     * @type {string}
    static get STATE_KEY() {
        return 'Lepi.joystick';
    }
     */

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    initChart(){
        
        this.myChart = echarts.init(this.canvas);          
              window.addEventListener("resize", () => {
                  this.myChart.resize()
        });
      }
      
    getInfo() {
        return {
            id: 'lepiEcharts',
            name: formatMessage({
                id: 'lepi.lepiEcharts',
                default: 'echarts图表',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [

                // setPlotType, setBufferSize, setTitle
                {
                    opcode: 'setChartType',
                    text: formatMessage({
                        id: 'lepi.setEchartType',
                        default: '设置图表类型 [TYPE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'chartType',
                        }
                    }
                },
                {
                    opcode: 'setChartXType',
                    text: formatMessage({
                        id: 'lepi.setEchartXType',
                        default: '设置图表X轴类型 [XTYPE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        XTYPE: {
                            type: ArgumentType.STRING,
                            menu: 'XType',
                        }
                    }
                },
                {
                    opcode: 'setChartDataSize',
                    text: formatMessage({
                        id: 'lepi.setEchartDataSize',
                        default: '设置样本数量 [SIZE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        }
                    }
                },
                {
                    opcode: 'setChartTitle',
                    text: formatMessage({
                        id: 'lepi.setEchartTitle',
                        default: '设置图表标题 [TITLE],距离顶部位置[TOP]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TITLE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'title',
                        },
                        TOP: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        }
                    }
                },
                '---',
                {
                    opcode: 'getData',
                    text: formatMessage({
                        id: 'lepi.EchartData',
                        default: '样本数据',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'clearChartData',
                    text: formatMessage({
                        id: 'lepi.clearEchartData',
                        default: '清空图表数据',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'appendChartData',
                    text: formatMessage({
                        id: 'lepi.appendEchartData',
                        default: '添加图表数据：名称：[SERIES] x轴:[XAXIS] y轴:[YAXIS]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SERIES: {
                            type: ArgumentType.STRING,
                            defaultValue: 'data1',
                        },
                        XAXIS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        YAXIS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'appendArrayChartData',
                    text: formatMessage({
                        id: 'lepi.appendArrayEchartData',
                        default: '添加数组图表数据 名称：[SERIES] 数据值：[ARRAY]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SERIES: {
                            type: ArgumentType.STRING,
                            defaultValue: 'data1',
                        },
                        ARRAY: {
                            type: ArgumentType.STRING,
                            defaultValue: [],
                        }
                    }
                },
                // , {
                //     opcode: 'appendXYData',
                //     text: formatMessage({
                //         id: 'lepi.appendXYData',
                //         default: '添加 散点图 数据 [KEY] 数值 (x:[X] y:[Y])',
                //     }),
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         KEY: {
                //             type: ArgumentType.STRING,
                //             defaultValue: 'key',
                //         },
                //         X: {
                //             type: ArgumentType.STRING,
                //             defaultValue: 0
                //         },
                //         Y: {
                //             type: ArgumentType.STRING,
                //             defaultValue: 0
                //         }
                //     }
                // },
                //  {
                //     opcode: 'sendPayload',
                //     text: formatMessage({
                //         id: 'lepi.sendPayload',
                //         default: '保存样本数据',
                //     }),
                //     blockType: BlockType.COMMAND,
                // }, 
                '---',
                // {
                //     opcode: 'setChartData',
                //     text: formatMessage({
                //         id: 'lepi.setEchartData',
                //         default: '将图表数据设置为 名称：[data1] [VALUE]',
                //     }),
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         VALUE: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '[]'
                //         }
                //     }
                // },

                // {
                //     opcode: 'resetChartData',
                //     text: formatMessage({
                //         id: 'lepi.resetChartData',
                //         default: '清空图表数据',
                //     }),
                //     blockType: BlockType.COMMAND,
                // },
                {
                    opcode: 'toggleDisplay',
                    text: formatMessage({
                        id: 'lepi.toggleDisplay',
                        default: '[TOGGLE] 图表',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TOGGLE: {
                            type: ArgumentType.NUMBER,
                            menu: 'display'
                        }
                    }
                },

            ],
            menus: {
                method: Menu.formatMenu2(['GET', 'POST']),
                display: Menu.formatMenu([formatMessage({
                    id: 'lepi.hide',
                    default: '隐藏',
                }), formatMessage({
                    id: 'lepi.show',
                    default: '显示',
                })]),
                chartType: Menu.formatMenu3([formatMessage({
                    id: 'lepi.line_chart',
                    default: '折线图',
                }), formatMessage({
                    id: 'lepi.bar_chart',
                    default: '柱状图',
                }), formatMessage({
                    id: 'lepi.scatter',
                    default: '散点图',
                })], ['lineChart','barChart','scatter']),
                XType: Menu.formatMenu3([formatMessage({
                    id: 'lepi.echartCategory',
                    default: '类别',
                }), formatMessage({
                    id: 'lepi.echartValue',
                    default: '数值',
                })], ['category','value']),
            },

        };
    }


    startRender(args, util) {
        const {
            renderer
        } = this.runtime;
        if (!renderer) return;
        console.log(renderer)

        if (this._skinId === -1 && this._skin === null && this._drawable === -1) {
            this._skinId = renderer.createBitmapSkin(this.canvas, { width: renderer.canvas.width, height: renderer.canvas.width });
            this._skin = renderer._allSkins[this._skinId];
            this._drawable = renderer.createDrawable(StageLayering.VIDEO_LAYER);
            renderer.updateDrawableProperties(this._drawable, {
                skinId: this._skinId
            });

            this.drawStamp(this.canvas)

            /* 高级设置 使用高清画笔 和 修改舞台尺寸
            renderer.on('UseHighQualityRenderChanged', (state) => {
                console.log('UseHighQualityRenderChanged', state)
            })
            renderer.on('NativeSizeChanged', (size) => {
                console.log('NativeSizeChanged', size)
            })
            */

        }

        // if we haven't already created and started a preview frame render loop, do so
        if (!this._renderPreviewFrame) {
            renderer.updateDrawableProperties(this._drawable, {
                ghost: this._forceTransparentPreview ? 100 : this._ghost,
                visible: true
            });

            this._renderPreviewFrame = true

        }

        setInterval(() => {
            this.updateChartSize()
        }, 200)

    }

    setChartXType(args){
        console.log(args)
        this.xType=args.XTYPE
        try{
            let option=this.myChart.getOption()
            option.xAxis[0].type=this.xType
            console.log(option)
            option&&this.myChart.setOption(option,true)
            this.drawStamp(this.canvas)
        }
        catch(err){
            console.log(err)
        }
    }



    /**
     * Set the preview ghost effect
     * @param {number} ghost from 0 (visible) to 100 (invisible) - ghost effect
     */
    setPreviewGhost(ghost) {
        this._ghost = ghost;
        // Confirm that the default value has been changed to a valid id for the drawable
        if (this._drawable !== -1) {
            this.runtime.renderer.updateDrawableProperties(this._drawable, {
                ghost: ghost,
                visible: true
            });
        }
    }

    clearChartData() {
        let myChartData=this.chartData
        Object.keys(myChartData).forEach(function(key) {
            myChartData[key]=[]
          });
        this.count=0
        try{
            let option=this.myChart.getOption()
            for(let i=0;i<option.series.length;i++){
                let myName= option.series[i].name
                option.series[i].data=this.chartData[myName]
            }
            console.log(option)
            option&&this.myChart.setOption(option,true)
        }
        catch(err){
            console.log(err)
        }

    }
    saveSeriesData(series){
        let option=this.myChart.getOption()
        let hasSeries=false
        for(let i=0;i<option.series.length;i++){
            if(option.series[i].name==series){
                hasSeries=true
                option.series[i].data=this.chartData[series]
            }
        }
        if(!hasSeries){
            let newSeries=JSON.parse(JSON.stringify(option.series[0])) 
            newSeries.name=series
            newSeries.data=this.chartData[series]
            option.series.push(newSeries)
        }
        console.log(option)
        option&&this.myChart.setOption(option,true)
    }

    getData(args, util) {
        if (typeof this.chartData == 'string') {
            return this.chartData
        } else if (typeof this.chartData == 'object') {
            return JSON.stringify(this.chartData)
        } 
        else if (typeof this.chartData == 'array') {
            return JSON.stringify(this.chartData)
        }
        else {
            return ''
        }
    }

    appendChartData(args, util) {
        let series=args.SERIES
        let xAxis = args.XAXIS
        let yAxis=args.YAXIS
        if (isNaN(yAxis)) {
            return formatMessage({
                id: 'lepi.isNaN',
                default: 'is NaN',
            })
        }
        try {
            if(this.chartData.hasOwnProperty(series)){
                this.chartData[series].push([xAxis,yAxis])
            }
            else{
                this.chartData[series]=[]
                this.chartData[series].push([xAxis,yAxis])
            }
            if(this.chartData[series].length>this.dataBufferSize){
                this.chartData[series].shift()
            }
            this.saveSeriesData(series)
            this.drawStamp(this.canvas)
        } catch (error) {
            console.log(error)
            return formatMessage({
                id: 'lepi.error',
                default: 'Error',
            })
        }
    }
    
    appendArrayChartData(args, util) {
        let series=args.SERIES
        let array = JSON.parse(args.ARRAY)
        if (!Array.isArray(array)) {
            return formatMessage({
                id: 'lepi.isNaN',
                default: 'is NaN',
            })
        }
        try {
            for(let i=0;i<array.length;i++){
                if(this.chartData.hasOwnProperty(series)){
                    this.chartData[series].push([this.count,array[i]])
                }
                else{
                    this.chartData[series]=[]
                    this.chartData[series].push([this.count,array[i]])
                }
                this.count++
                if(this.chartData[series].length>this.dataBufferSize){
                    this.chartData[series].shift()
                }
            }
            this.saveSeriesData(series)
            this.drawStamp(this.canvas)
        } catch (error) {
            console.log(error)
            return formatMessage({
                id: 'lepi.error',
                default: 'Error',
            })
        }
    }
    // appendXYData(args, util) {
    //     let key = args.KEY
    //     let x = Number(args.X)
    //     let y = Number(args.Y)
    //     if (isNaN(x) || isNaN(y)) {
    //         return formatMessage({
    //             id: 'lepi.isNaN',
    //             default: 'is NaN',
    //         })
    //     }
    //     try {
    //         this.payload[key] = [x, y]
    //     } catch (error) {
    //         console.log(error)
    //         return formatMessage({
    //             id: 'lepi.error',
    //             default: 'Error',
    //         })
    //     }
    // }
    // sendPayload() {
    //     // plottor.setupOrUpdate(this.payload)
    //     let tick = new Date().getTime()
    //     // console.log(tick, this.lastUpdate)
    //     if (tick - this.lastUpdate > 16) {
    //         setTimeout(() => {
    //             this.drawStamp(this.canvas)
    //         }, 15)
    //         this.lastUpdate = tick
    //     }
    //     return
    // }

    // setChartData(args, util) {
    //     let series=args.series
    //     try {
    //         let data = JSON.parse(args.VALUE)
    //         if (Array.isArray(data)) {
    //             this.chartData[series]=data
    //             let option=this.myChart.getOption()
    //             for(let i=0;i<option.series.length;i++){
    //                 if(option.series[i].name==series){
    //                     option.series[i].data=this.chartData[series]
    //                 }
    //             }
    //             option && this.myChart.setOption(option,true);
    //             // plottor.setupOrUpdate({ data })
    //         } else {
    //             // plottor.setupOrUpdate(data)
    //         }
    //         this.drawStamp(this.canvas)
    //         // let tick = new Date().getTime()
    //         // // console.log(tick, this.lastUpdate)
    //         // if (tick - this.lastUpdate > 16) {
    //         //     setTimeout(() => {
    //         //         this.drawStamp(this.canvas)
    //         //     }, 15)
    //         //     this.lastUpdate = tick
    //         // }
    //     } catch (error) {
    //         console.log(error)
    //     }

    //     return
    // }
    // resetChartData() {
    //     this.chartData=[]
    //     this.drawStamp(this.canvas)
    //     return
    // }

    drawStamp(stampElement) {
        if (this._skinId != -1) {
            // let option=this.myChart.getOption()
            // option&&this.myChart.setOption(option,true)
            // setTimeout(() => {
                this.runtime.renderer.updateBitmapSkin(this._skinId, stampElement, stampElement.width * 1.0 / this.runtime.renderer._nativeSize[0]);
            // }, 15)
        }

        /*
        const ctx = this._skin._canvas.getContext('2d');

        ctx.drawImage(stampElement, this._skin._rotationCenter[0] + x, this._skin._rotationCenter[1] - y);

        this._skin._canvasDirty = true;
        this._skin._silhouetteDirty = true;
        */

    }

    setChartType(args, util) {
        console.log(args.TYPE)
        var option;
        switch(args.TYPE){
            case 'lineChart':
                option= {
                    animation:false,
                    legend: {        left: 'center',
                    top: 'bottom'},
                    xAxis: {
                      type: this.xType,
                      min:function(value) {
                        return value.min  
                  },
                      max: function(value) {
                        return value.max
                  }, 
                    },
                    yAxis: {
                      type: 'value',
                      min:function(value) {
                        return value.min  
                  },
                      max: function(value) {
                        return value.max
                  }, 
                    },
                    series: [
                      {
                        name:'data1',
                        data: this.chartData['data1'],
                        type: 'line',
                        showSymbol: false // 在 tooltip hover 的时候显示
                      }
                    ]
                  };
                break;
        case 'barChart':
            option = {
                animation:false,
                legend: {        left: 'center',
                top: 'bottom'},
                xAxis: {
                  type: this.xType,
                  min:function(value) {
                    return value.min  
              },
                  max: function(value) {
                    return value.max
              }, 
                },
                yAxis: {
                  type: 'value',
                  min:function(value) {
                    return value.min  
              },
                  max: function(value) {
                    return value.max
              }, 
                },
                series: [
                  {
                    name:'data1',
                    data: this.chartData['data1'],
                    type: 'bar'
                  }
                ]
              };
            break;
            case 'scatter':
                option = {
                    animation:false,
                    legend: {        left: 'center',
                    top: 'bottom'},
                    xAxis: {
                        type: this.xType,
                        min:function(value) {
                          return value.min  
                    },
                        max: function(value) {
                          return value.max
                    }, 
                      },
                      yAxis: {
                        type: 'value',
                        min:function(value) {
                          return value.min  
                    },
                        max: function(value) {
                          return value.max
                    }, 
                      },
                    series: [
                      {
                        symbolSize: 20,
                        name:'data1',
                        data: this.chartData['data1'],
                        type: 'scatter'
                      }
                    ]
                  };
                break;
        }
        option && this.myChart.setOption(option,true);
        this.drawStamp(this.canvas)
    }
    setChartTitle(args, util) {
        let option=this.myChart.getOption()
        console.log(args.TITLE)
        option.title={text:args.TITLE,   left: 'center',top: args.TOP}
        console.log(option.title)
        option&&this.myChart.setOption(option,true)
        this.drawStamp(this.canvas)
    }
    setChartDataSize(args, util) {
        this.dataBufferSize=args.SIZE
    }

    updateChartSize() {
        // const { width, height } = this.runtime.renderer.canvas
        // if (this.canvas.width != width || this.canvas.height != height) {
        //     console.log('update')
        //     plottor.update(width, height)
        //     this.drawStamp(this.canvas)
        // }
    }

    toggleDisplay(args) {
        let show = parseInt(args.TOGGLE)
        if (show) {
            this.setPreviewGhost(0)
        } else {
            this.setPreviewGhost(100)
        }
    }

}

(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        return
    }

    console.log('LepiEcharts loaded')

})()

module.exports = LepiEcharts;