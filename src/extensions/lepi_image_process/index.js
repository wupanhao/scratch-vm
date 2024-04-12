const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;

class LepiImageProcess extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.joyState = {}
        this.runtime = runtime;
        this.houghCirclesData = []
    }

    /**
     * The key to load & store a target's pen-related state.
     * @type {string}
    static get STATE_KEY() {
        return 'Lepi.joystick';
    }
     */

    /*
    "cvtColor": cv2.cvtColor,
    "threshold": cv2.threshold,
    "adaptiveThresholdGaussian": cv2.adaptiveThreshold,
    "medianBlur": cv2.medianBlur,
    "GaussianBlur": cv2.GaussianBlur,
    "blur": cv2.blur,
    "erode": cv2.erode,
    "dilate": cv2.dilate,
    "Canny": cv2.Canny,
    */
    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'lepiImageProcess',
            name: formatMessage({
                id: 'lepi.lepiImageProcess',
                default: '图像处理',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [{
                opcode: 'clearProcess',
                text: formatMessage({
                    id: 'lepi.clearProcess',
                    default: '清空处理过程',
                }),
                blockType: BlockType.COMMAND,
            }, {
                opcode: 'cvtColor',
                text: formatMessage({
                    id: 'lepi.cvtColor',
                    default: '添加灰度转换',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    ID: {
                        type: ArgumentType.NUMBER,
                        menu: 'joyButtons'
                    }
                }
            }, {
                opcode: 'threshold',
                text: formatMessage({
                    id: 'lepi.threshold',
                    default: '添加阈值分割,阈值[THRESH],类型[CODE]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    THRESH: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                    },
                    CODE: {
                        type: ArgumentType.NUMBER,
                        menu: 'code'
                    },
                }
            }, {
                opcode: 'medianBlur',
                text: formatMessage({
                    id: 'lepi.medianBlur',
                    default: '添加中值滤波,内核大小[SIZE]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    SIZE: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 3
                    }
                }
            }, {
                opcode: 'GaussianBlur',
                text: formatMessage({
                    id: 'lepi.GaussianBlur',
                    default: '添加高斯滤波,宽[X],高[Y],标准差X[SIGMA_X],Y[SIGMA_Y]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    X: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 5
                    },
                    Y: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 5
                    },
                    SIGMA_X: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                    },
                    SIGMA_Y: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                    }
                }
            }, {
                opcode: 'blur',
                text: formatMessage({
                    id: 'lepi.blur',
                    default: '添加均值滤波,宽[X],高[Y]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    X: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 5
                    },
                    Y: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 5
                    },
                }
            }, {
                opcode: 'erode',
                text: formatMessage({
                    id: 'lepi.erode',
                    default: '添加腐蚀处理,宽[X],高[Y],迭代次数[N]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    X: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 5
                    },
                    Y: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 5
                    },
                    N: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                }
            }, {
                opcode: 'dilate',
                text: formatMessage({
                    id: 'lepi.dilate',
                    default: '添加膨胀处理,宽[X],高[Y],迭代次数[N]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    X: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 5
                    },
                    Y: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 5
                    },
                    N: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                }
            }, {
                opcode: 'Canny',
                text: formatMessage({
                    id: 'lepi.Canny',
                    default: '添加Canny边缘提取,最小值[MIN],最大值[MAX]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    MIN: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 30
                    },
                    MAX: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 120
                    },
                }
            },
            {
                opcode: 'execProc',
                text: formatMessage({
                    id: 'lepi.execProc',
                    default: '执行图像处理',
                }),
                blockType: BlockType.COMMAND,
            },
            {
                opcode: 'houghCircles',
                text: formatMessage({
                    id: 'lepi.houghCircles',
                    default: '检测霍夫圆,最小半径[MIN],最大半径[MAX]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    MIN: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 10
                    },
                    MAX: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 50
                    },
                }
            },
            {
                opcode: 'houghCirclesNumber',
                text: formatMessage({
                    id: 'lepi.houghCirclesNumber',
                    default: '霍夫圆数量',
                }),
                blockType: BlockType.REPORTER,
            },
            {
                opcode: 'houghCirclesParam',
                text: formatMessage({
                    id: 'lepi.houghCirclesParam',
                    default: '第[ID]个霍夫圆的[PARAM]',
                }),
                blockType: BlockType.REPORTER,
                arguments: {
                    ID: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    PARAM: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0,
                        menu: 'circle'
                    },
                }
            },
            ],

            menus: {
                method: Menu.formatMenu2(['0', '1']),
                code: Menu.formatMenu([formatMessage({
                    id: 'lepi.thresh_binary',
                    default: '黑白',
                }), formatMessage({
                    id: 'lepi.thresh_binary_inv',
                    default: '黑白反相',
                })]),
                circle: Menu.formatMenu([formatMessage({
                    id: 'lepi.x',
                    default: 'x坐标',
                }), formatMessage({
                    id: 'lepi.y',
                    default: 'y坐标',
                }), formatMessage({
                    id: 'lepi.radius',
                    default: '半径',
                })]),
            },
        };
    }

    clearProcess(args, util) {
        // console.log(this.joyState)
        return this.runtime.ros.addProc('clearProcess', '')
    }
    cvtColor(args, util) {
        // cv2.COLOR_BGR2GRAY 6
        return this.runtime.ros.addProc('cvtColor', JSON.stringify({ code: 6 }))
    }
    threshold(args, util) {
        let thresh = parseInt(args.THRESH)
        let code = parseInt(args.CODE)
        // cv2.COLOR_BGR2GRAY 6
        return this.runtime.ros.addProc('threshold', JSON.stringify({ thresh, code }))
    }
    medianBlur(args, util) {
        let ksize = parseInt(args.SIZE)
        // cv2.COLOR_BGR2GRAY 6
        return this.runtime.ros.addProc('medianBlur', JSON.stringify({ ksize }))
    }
    GaussianBlur(args, util) {
        let size = [parseInt(args.X), parseInt(args.Y)]
        let sigmaX = parseInt(args.SIGMA_X)
        let sigmaY = parseInt(args.SIGMA_Y)
        return this.runtime.ros.addProc('GaussianBlur', JSON.stringify({ size, sigmaX, sigmaY }))
    }
    blur(args, util) {
        let size = [parseInt(args.X), parseInt(args.Y)]
        return this.runtime.ros.addProc('blur', JSON.stringify({ size }))
    }
    erode(args, util) {
        let size = [parseInt(args.X), parseInt(args.Y)]
        let iterations = parseInt(args.N)
        return this.runtime.ros.addProc('erode', JSON.stringify({ size, iterations }))
    }
    dilate(args, util) {
        let size = [parseInt(args.X), parseInt(args.Y)]
        let iterations = parseInt(args.N)
        return this.runtime.ros.addProc('dilate', JSON.stringify({ size, iterations }))
    }
    Canny(args, util) {
        let min = parseInt(args.MIN)
        let max = parseInt(args.MAX)
        return this.runtime.ros.addProc('Canny', JSON.stringify({ min, max }))
    }
    execProc() {
        return this.runtime.ros.execProc()
    }
    houghCircles(args, util) {
        let min = parseInt(args.MIN)
        let max = parseInt(args.MAX)
        return new Promise(resolve => {
            this.runtime.ros.houghCircles(JSON.stringify({
                "dp": 1, "minDist": 20, "param1": 50, "param2": 30, "minRadius": min, "maxRadius": max
            })).then(data => {
                this.houghCirclesData = JSON.parse(data)
                this.houghCirclesData = this.houghCirclesData[0]
                resolve(this.houghCirclesData.length)
            })
        })
    }
    houghCirclesNumber(args, util) {
        return this.houghCirclesData.length
    }
    houghCirclesParam(args, util) {
        let id = parseInt(args.ID) - 1
        let param = parseInt(args.PARAM)
        if (this.houghCirclesData.length > id && id >= 0) {
            return this.houghCirclesData[id][param]
        } else {
            return 0
        }
    }
}


module.exports = LepiImageProcess;