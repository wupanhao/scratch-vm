const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Color = require('../../util/color');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-color max-len
// const blockIconURI = 'data:image/png;base64,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'
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGNDU4OUZERTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGNDU4OUZERDdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1l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'
const menuIconURI = blockIconURI;

const color_map = {
    '红色': () => formatMessage({
        id: 'lepi.red',
        default: '红色',
    }), '橙色': () => formatMessage({
        id: 'lepi.orange',
        default: '橙色',
    }), '黄色': () => formatMessage({
        id: 'lepi.yellow',
        default: '黄色',
    }), '绿色': () => formatMessage({
        id: 'lepi.green',
        default: '绿色',
    }), '青色': () => formatMessage({
        id: 'lepi.indigo',
        default: '靛青',
    }), '蓝色': () => formatMessage({
        id: 'lepi.blue',
        default: '蓝色',
    }), '紫色': () => formatMessage({
        id: 'lepi.purple',
        default: '紫色',
    }), '黑色': () => formatMessage({
        id: 'lepi.black',
        default: '黑色',
    }), '灰色': () => formatMessage({
        id: 'lepi.gray',
        default: '灰色',
    }), '白色': () => formatMessage({
        id: 'lepi.white',
        default: '白色',
    })
}

const color_map2 = {
    "红色": "红色",
    "橙色": "橙色",
    "黄色": "黄色",
    "绿色": "绿色",
    "蓝色": "蓝色",
    "青色": "青色",
    "紫色": "紫色",
    "黑色": "黑色",
    "灰色": "灰色",
    "白色": "白色",
    "red": "红色",
    "orange": "橙色",
    "yellow": "黄色",
    "green": "绿色",
    "blue": "蓝色",
    "indigo": "青色",
    "purple": "紫色",
    "black": "黑色",
    "gray": "灰色",
    "white": "白色",
}

class LepiColorDetect extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.colorList = []
        this.colorDetection = [0, 0, 0, 0, 0]
        this.runtime = runtime;
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.getColorList()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'getColorList')
            this.getColorList()
        })
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
            id: 'lepiColorDetect',
            name: formatMessage({
                id: 'lepi.lepiColorDetect',
                default: '颜色检测',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'detectColor',
                    text: formatMessage({
                        id: 'lepi.detectColor',
                        default: '检测（[X1],[Y1]）至（[X2],[Y2]）的[COLOR]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Y1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        X2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 480
                        },
                        Y2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 360
                        },
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu: 'colors'
                        }
                    }
                }, {
                    opcode: 'colorDetected',
                    text: formatMessage({
                        id: 'lepi.colorDetected',
                        default: '检测到对应颜色?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu: 'colors'
                        }
                    }
                }, {
                    opcode: 'getColorData',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'lepi.getColorData',
                        default: '检测到颜色的 [ID]',
                    }),
                    arguments: {
                        ID: {
                            type: ArgumentType.NUMBER,
                            menu: 'colorData'
                        }
                    }
                },
                {
                    opcode: 'getColorList',
                    text: formatMessage({
                        id: 'lepi.getColorList',
                        default: '更新颜色列表',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'getColorThreshold',
                    text: formatMessage({
                        id: 'lepi.getColorThreshold',
                        default: '查询 [COLOR] 检测范围',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu: 'colors'
                        }
                    }
                }, {
                    opcode: 'setColorThreshold',
                    text: formatMessage({
                        id: 'lepi.setColorThreshold',
                        default: '设置[COLOR] 检测范围 最低 [LOW],最高 [HIGH]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LOW: {
                            type: ArgumentType.COLOR,
                        },
                        HIGH: {
                            type: ArgumentType.COLOR,
                        },
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu: 'colors'
                        }
                    }
                }, {
                    opcode: 'setColorHsv',
                    text: formatMessage({
                        id: 'lepi.setColorHsv',
                        default: '设置[COLOR] 检测范围 最低(h[LOW_H],s[LOW_S],v[LOW_V],最高(h[HIGH_H],s[HIGH_S],v[HIGH_V])',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LOW_H: {
                            type: ArgumentType.NUMBER,
                        },
                        LOW_S: {
                            type: ArgumentType.NUMBER,
                        },
                        LOW_V: {
                            type: ArgumentType.NUMBER,
                        },
                        HIGH_H: {
                            type: ArgumentType.NUMBER,
                        },
                        HIGH_S: {
                            type: ArgumentType.NUMBER,
                        },
                        HIGH_V: {
                            type: ArgumentType.NUMBER,
                        },
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu: 'colors'
                        }
                    }
                },
            ],
            menus: {
                colors: 'formatColorList',
                // colors: Menu.formatMenu2(['黄线', '红线', '绿线']),
                colorData: Menu.formatMenu([formatMessage({
                    id: 'lepi.center_x',
                    default: '中心点x坐标',
                }), formatMessage({
                    id: 'lepi.center_y',
                    default: '中心点y坐标',
                }), formatMessage({
                    id: 'lepi.width',
                    default: '宽度',
                }), formatMessage({
                    id: 'lepi.height',
                    default: '高度',
                }), formatMessage({
                    id: 'lepi.angle',
                    default: '角度',
                })]),
            },

        };
    }

    formatColorList() {
        return Menu.formatMenu2(this.colorList.map(color => color_map[color]()))
    }
    getColorList() {
        return new Promise(resolve => {
            this.runtime.ros.getColorList({
                data: ""
            }).then(result => {
                this.colorList = result.data
                resolve(this.colorList.join(','))
            })
        })
    }

    setColorThreshold(args, util) {
        console.log(args)
        var params = {}
        params.color = color_map2[args.COLOR]
        var low = Color.rgbToHsv(Color.decimalToRgb(args.LOW))
        var high = Color.rgbToHsv(Color.decimalToRgb(args.HIGH))
        params.low_h = parseInt(low.h / 2)
        params.low_s = parseInt(low.s * 255)
        params.low_v = parseInt(low.v * 255)
        params.high_h = parseInt(high.h / 2)
        params.high_s = parseInt(high.s * 255)
        params.high_v = parseInt(high.v * 255)
        console.log(low, high, params)
        return this.runtime.ros.setColorThreshold(params)
    }

    setColorHsv(args, util) {
        console.log(args)
        var params = {}
        params.color = color_map2[args.COLOR]
        params.low_h = parseInt(parseInt(args.LOW_H) / 240 * 180)
        params.low_s = parseInt(parseInt(args.LOW_S) / 240 * 255)
        params.low_v = parseInt(parseInt(args.LOW_V) / 240 * 255)
        params.high_h = parseInt(parseInt(args.HIGH_H) / 240 * 180)
        params.high_s = parseInt(parseInt(args.HIGH_S) / 240 * 255)
        params.high_v = parseInt(parseInt(args.HIGH_V) / 240 * 255)
        console.log(params)
        return this.runtime.ros.setColorThreshold(params)
    }

    getColorThreshold(args, util) {
        var color = color_map2[args.COLOR]
        return this.runtime.ros.getColorThreshold(color)
    }

    detectColor(args, util) {
        var params = {}
        params.color = color_map2[args.COLOR]
        params.x1 = parseInt(args.X1)
        params.y1 = parseInt(args.Y1)
        params.x2 = parseInt(args.X2)
        params.y2 = parseInt(args.Y2)
        return new Promise(resolve => {
            this.runtime.ros.detectColor(params).then(result => {
                this.colorDetection = result.center.concat(result.size)
                this.colorDetection.push(result.angle)
                console.log(this.colorDetection)
                resolve(this.colorDetection.join(','))
            })
        })
    }
    colorDetected(args, util) {
        if (this.colorDetection.length > 4) {
            return this.colorDetection[2] + this.colorDetection[3] != 0
        } else {
            return false
        }
    }
    getColorData(args, util) {
        let i = parseInt(args.ID)
        return this.colorDetection[i]
    }
}

(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        return
    }
    console.log('lepiColorDetect loaded')

})()

module.exports = LepiColorDetect;