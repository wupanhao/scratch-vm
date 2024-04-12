const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
// const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

// const WebSocket = require('ws');

const plottor = require('./plottor');
const { setTimeout, setInterval } = require('timers');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAVcSURBVFhH7VZtSJtXFH7yZWKy1A/Y2CR1zq2Jioxqp62jtTBk4qibsNFBYVAm7OdSHa3Iyib90z/F0cE6Zd2XHYLVtZtsdCDWjlHsplhR1uJErZ0fc/MjiSYxJm+yc27ySleavAkZrIw8cEje+5733Oc+55x7ryp0FCE8xFBHfh9apAgmixTBZJEimCxSBJPF/5AgH4z3Ho7y84OMIc8gPyeIxAkGgVtbO/DFigW31ug5cJ/5I0Z+d13A6XEtfnEaxDMksgSJxn9ZoODn5nbgdrkdJeUV2JW3E99+dwW5lhzMzy9QJBVCoRD/QAoEEQj4odUbUFG2B3+uOvH77AxKpy/iNc8NQEfxyC8exEeQlFnc8SR+e3sQB21P0OQBSJIEvV5Pv0FoNPElYsolwXdqP4oWiKQ+MqgAZYL81g0snVtBZmYGQpJfKGUwGODz+YQFg0GkpaVBrVaTgir4/X4xZjKZoNVqceT1V6AzLuHLz2/gry0g+y0VNBw3jnUpu1A9OZ57CTBnY/D6TygpKYHNZsPVq1eh0+kEAf5l0qwqE2OSTM7jcaP78mU0vHMSBdYXMXPnLoKU+rWDxwBfJL4CYhPkVW6SgC80QOvbwKVLl2C1WpGTk4Oenh5KrUYQYbLr6+si5axoX1+fIP7Zp+dx2P4Bch7LRnPzKRx+Kg9dLe8jeKg53EjKxaWQYmoMSavBH+cC0G8sY2pqCo2Njdja2sKFCxdQUFAQdiPlGLJ6nGo2xujQzxi/PQGVQcKeon3UzBIetRXD/G4B0hcmwg0TA7EVpFU699XDSF6sSH5+Pnp7e3Ht2jVBbnh4GK2trUJJJscmN9DAwADGx8exu2wvRieG0XDSjsLiQlipPHTk49j7ZlhFBURXkEfXgfn3riPDVkZFHRDqsDEhl8uFhoYGdHV1YXR0VNSlTK6trQ2dnZ1YWlrC2bNnUVdXJ0Jubm6K9xLFXl5dQ37jTuARehFjy4muIAUJmShtu56HOugXxMQwNQOrmZubi46ODlRXV6Ompgb9/f2iWVjFsbExoXZ6ejpGRkYEMe5sOf0qiqHLzoHPQgTD1REV0QnS3ucqPgSDKiQmZcgKMgYHB1FbW4uhoSG0t7ejsrJSKOjxeNDU1ASv14vS0lLU19cLcjLCMUBxJYr/cvj0iQFNy260RP7/E7QNrB2ohya/jBQMbNeYXGcWiwVZWVlCUbvdLrpXpI+MVWJVq6qqxP5oNBrFN/L+yAiQn9cvIePGxZgnS/QapPqbPf4DzIX7t1PMJo4zLW3KpnRoyE1L5rxHBSpP8iEjHirKj44s5KXN3OcV38rd7acTyLG2hmdOPE17LA0kRJBHiOD0mRlkZmdDFQwXCk8Q1BnhW5yE6fwRqBzz4biRScV3xIyWgRCzI3/JmAXvG59AW3CA9lIKGgEruRIywnaMCj1hBXlkA5g8MwszFTqdb+H0qXVwL06j8HQFkEY+LKESOKMcy/41dIUHoQ14tzPh0mWh6AS3MSGyxvsRZZjAK1qdg4dqy+12w7XhxuzSKqwfEjm6PW0TVDJWJwPY9fGrmJuZhMuzKeJ5vLTlrC+LkyqaeowHE+QPqLjMw51Y9qngdK1jyhHAs1/VQcMNyYWXCHgWur2Ud9Tgzkp4sc6ABuab3THJMaIrSAEfH/gIqqFu3JxzoOh7OzLmlY+mqKBFpTkdKPvmKEbmXHD/+iPyeo+Hr10xSMY+i/kNbTc+vRp6uoQK5RRWHBMcj/rNTbuAyUf3Ll5sdIkEYr9mMrRCPVd6suQY/D3VpSlE5LiGFcgxlF04qGz/BhKMF8ca/lukCCaLFMFkkSKYHIC/AZpfWt/JEqxtAAAAAElFTkSuQmCC'
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;


class LepiWebPlottor extends EventEmitter {
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
        this.payload = {}

        /*
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
        }
        this.runtime.on('LEPI_CONNECTED', () => {
        })
        */

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
        plottor.initGraph(this.canvas)

        this.openWebPlottor()
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
    getInfo() {
        return {
            id: 'lepiWebPlottor',
            name: formatMessage({
                id: 'lepi.lepiWebPlottor',
                default: '图表绘制',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [

                // setPlotType, setBufferSize, setTitle
                {
                    opcode: 'setPlotType',
                    text: formatMessage({
                        id: 'lepi.setPlotType',
                        default: '设置图表类型 [TYPE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'plotType',
                        }
                    }
                },
                {
                    opcode: 'setBufferSize',
                    text: formatMessage({
                        id: 'lepi.setBufferSize',
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
                    opcode: 'setTitle',
                    text: formatMessage({
                        id: 'lepi.setTitle',
                        default: '设置图表标题 [TITLE], 大小 [SIZE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TITLE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'title',
                        },
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 16,
                        }
                    }
                },
                '---',
                {
                    opcode: 'getData',
                    text: formatMessage({
                        id: 'lepi.sampleData',
                        default: '样本数据',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'initPayload',
                    text: formatMessage({
                        id: 'lepi.initPayload',
                        default: '新建样本数据',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'appendXTData',
                    text: formatMessage({
                        id: 'lepi.appendXTData',
                        default: '添加 折线图 数据 [KEY] 数值 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'key',
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'value'
                        }
                    }
                }, {
                    opcode: 'appendXYData',
                    text: formatMessage({
                        id: 'lepi.appendXYData',
                        default: '添加 散点图 数据 [KEY] 数值 (x:[X] y:[Y])',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'key',
                        },
                        X: {
                            type: ArgumentType.STRING,
                            defaultValue: 0
                        },
                        Y: {
                            type: ArgumentType.STRING,
                            defaultValue: 0
                        }
                    }
                }, {
                    opcode: 'sendPayload',
                    text: formatMessage({
                        id: 'lepi.sendPayload',
                        default: '保存样本数据',
                    }),
                    blockType: BlockType.COMMAND,
                }, 
                '---',
                {
                    opcode: 'sendJSONData',
                    text: formatMessage({
                        id: 'lepi.sendJSONData',
                        default: '添加并保存样本数据 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '{}'
                        }
                    }
                },

                {
                    opcode: 'resetPlottor',
                    text: formatMessage({
                        id: 'lepi.resetPlottor',
                        default: '清空图表数据',
                    }),
                    blockType: BlockType.COMMAND,
                },
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
                /*
                {
                    opcode: 'updatePlottor',
                    text: '调整分辨率',
                    blockType: BlockType.COMMAND,
                },
                */


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
                plotType: Menu.formatMenu3([formatMessage({
                    id: 'lepi.line_chart',
                    default: '折线图',
                }), formatMessage({
                    id: 'lepi.scatter',
                    default: '散点图',
                })], ['xt', 'xy']),
            },

        };
    }

    openWebPlottor(args, util) {
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
            this.updatePlottor()
        }, 200)

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

    initPayload() {
        this.payload = {}
    }

    getData(args, util) {
        if (typeof this.payload == 'string') {
            return this.payload
        } else if (typeof this.payload == 'object') {
            return JSON.stringify(this.payload)
        } else {
            return ''
        }
    }

    appendXTData(args, util) {
        let key = args.KEY
        let value = Number(args.VALUE)
        if (isNaN(value)) {
            return formatMessage({
                id: 'lepi.isNaN',
                default: 'is NaN',
            })
        }
        try {
            this.payload[key] = value
        } catch (error) {
            console.log(error)
            return formatMessage({
                id: 'lepi.error',
                default: 'Error',
            })
        }
    }
    appendXYData(args, util) {
        let key = args.KEY
        let x = Number(args.X)
        let y = Number(args.Y)
        if (isNaN(x) || isNaN(y)) {
            return formatMessage({
                id: 'lepi.isNaN',
                default: 'is NaN',
            })
        }
        try {
            this.payload[key] = [x, y]
        } catch (error) {
            console.log(error)
            return formatMessage({
                id: 'lepi.error',
                default: 'Error',
            })
        }
    }
    sendPayload() {
        plottor.setupOrUpdate(this.payload)
        let tick = new Date().getTime()
        // console.log(tick, this.lastUpdate)
        if (tick - this.lastUpdate > 16) {
            setTimeout(() => {
                this.drawStamp(this.canvas)
            }, 15)
            this.lastUpdate = tick
        }
        return
    }
    sendJSONData(args, util) {
        try {
            let data = JSON.parse(args.VALUE)
            if (Array.isArray(data)) {
                plottor.setupOrUpdate({ data })
            } else {
                plottor.setupOrUpdate(data)
            }
            let tick = new Date().getTime()
            // console.log(tick, this.lastUpdate)
            if (tick - this.lastUpdate > 16) {
                setTimeout(() => {
                    this.drawStamp(this.canvas)
                }, 15)
                this.lastUpdate = tick
            }
        } catch (error) {
            console.log(error)
        }

        return
    }
    resetPlottor() {
        plottor.reset()
        this.drawStamp(this.canvas)
        return
    }

    drawStamp(stampElement) {
        if (this._skinId != -1) {
            setTimeout(() => {
                this.runtime.renderer.updateBitmapSkin(this._skinId, stampElement, stampElement.width * 1.0 / this.runtime.renderer._nativeSize[0]);
            }, 15)
        }

        /*
        const ctx = this._skin._canvas.getContext('2d');

        ctx.drawImage(stampElement, this._skin._rotationCenter[0] + x, this._skin._rotationCenter[1] - y);

        this._skin._canvasDirty = true;
        this._skin._silhouetteDirty = true;
        */

    }

    setPlotType(args, util) {
        plottor.setPlotType(args.TYPE)
        this.drawStamp(this.canvas)
    }
    setTitle(args, util) {
        let size = parseInt(args.SIZE)
        plottor.setTitle(args.TITLE, size > 0 ? size : 16)
        this.drawStamp(this.canvas)
    }
    setBufferSize(args, util) {
        let size = parseInt(args.SIZE)
        if (size > 0) {
            plottor.setBufferSize(size)
        }
        this.drawStamp(this.canvas)
    }

    updatePlottor() {
        const { width, height } = this.runtime.renderer.canvas
        if (this.canvas.width != width || this.canvas.height != height) {
            console.log('update')
            plottor.update(width, height)
            this.drawStamp(this.canvas)
        }
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

    console.log('LepiWebPlottor loaded')

})()

module.exports = LepiWebPlottor;