const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;

class LepiPupper extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.state = {
            "servo_angles": [7, 0, 3, -7, 0, -3, 7, 0, 3, -7, 0, -3],
            "foot_locations": [
                [0.1, 0.1, -0.1, -0.1],
                [-0.09, 0.09, -0.09, 0.09],
                [-0.16, -0.16, -0.16, -0.16]
            ]
        }
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.getRobotState()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'subPupperState')
            this.getRobotState()
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
            id: 'lepiPupper',
            name: formatMessage({
                id: 'lepi.lepiPupper',
                default: '四足机器人',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'setBehaviorState',
                    text: formatMessage({
                        id: 'lepi.setPupperBehaviorState',
                        default: '切换四足运动模式 [MODE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MODE: {
                            type: ArgumentType.STRING,
                            menu: 'behavior_state'
                        }
                    }
                },
                {
                    opcode: 'setCommandParam',
                    text: formatMessage({
                        id: 'lepi.setPupperCommandParam',
                        default: '设置四足 [PARAM] 为 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'command_param'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                    }
                },

                {
                    opcode: 'getRobotState',
                    text: formatMessage({
                        id: 'lepi.getPupperRobotState',
                        default: '读取四足状态',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'getServoAngle',
                    text: formatMessage({
                        id: 'lepi.getPupperServoAngle',
                        default: '四足 [NUMBER]号 舵机角度',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NUMBER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'getFootLocation',
                    text: formatMessage({
                        id: 'lepi.getPupperFootLocation',
                        default: '四足 [NUMBER]号 腿足端 [AXIS] 坐标',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NUMBER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        AXIS: {
                            type: ArgumentType.NUMBER,
                            menu: 'axis'
                        },
                    }
                },
                {
                    opcode: 'setServoAngle',
                    text: formatMessage({
                        id: 'lepi.setPupperServoAngle',
                        default: '设置四足 [NUMBER]号 舵机角度 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NUMBER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                    }
                },
                {
                    opcode: 'setFootLocation',
                    text: formatMessage({
                        id: 'lepi.setPupperFootLocation',
                        default: '设置四足 [NUMBER]号 腿足端坐标(x:[X],y:[Y],z:[Z])',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NUMBER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: -9
                        },
                        Z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: -16
                        },
                    }
                },
                {
                    opcode: 'setRobotState',
                    text: formatMessage({
                        id: 'lepi.setPupperRobotState',
                        default: '更新四足 [CHANNEL]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.NUMBER,
                            menu: 'channel'
                        }
                    }
                },
            ],
            menus: {
                axis: Menu.formatMenu([formatMessage({
                    id: 'lepi.x_axis',
                    default: 'x轴',
                }), formatMessage({
                    id: 'lepi.y_axis',
                    default: 'y轴',
                }), formatMessage({
                    id: 'lepi.z_axis',
                    default: 'z轴',
                })]),
                channel: Menu.formatMenu([formatMessage({
                    id: 'lepi.servo_angle',
                    default: '舵机角度',
                }), formatMessage({
                    id: 'lepi.foot_position',
                    default: '足端位置',
                })]),
                behavior_state: Menu.formatMenu3([formatMessage({
                    id: 'lepi.trot',
                    default: '运动',
                }), formatMessage({
                    id: 'lepi.rest',
                    default: '静止',
                }), formatMessage({
                    id: 'lepi.customize',
                    default: '自定义',
                })], ['1', '0', '4']),
                command_param: Menu.formatMenu3([formatMessage({
                    id: 'lepi.horizontal_velocity_x',
                    default: '水平速度x',
                }), formatMessage({
                    id: 'lepi.horizontal_velocity_y',
                    default: '水平速度y',
                }), formatMessage({
                    id: 'lepi.roll',
                    default: '横滚角',
                }), formatMessage({
                    id: 'lepi.pitch',
                    default: '俯仰角',
                }), formatMessage({
                    id: 'lepi.yaw_rate',
                    default: '航向角',
                }), formatMessage({
                    id: 'lepi.body_height',
                    default: '身体高度',
                })],
                    ['horizontal_velocity_x', 'horizontal_velocity_y', 'roll', 'pitch', 'yaw_rate', 'height']),
            },

        };
    }

    setBehaviorState(args, util) {
        let mode = parseInt(args.MODE)
        return this.runtime.ros.setPupperCommand(JSON.stringify({ behavior_state: mode }))
    }

    setCommandParam(args, utils) {
        let param = args.PARAM
        let value = parseInt(args.VALUE) / 100.0
        if (param == 'servo_speed') {
            value = value * 100
        }
        return this.runtime.ros.setPupperCommand(JSON.stringify({ [param]: value }))
    }

    getRobotState() {
        let promise = this.runtime.ros.getPupperState()
        promise.then(str => {
            this.state = JSON.parse(str)
            console.log(this.state)
        })
        return promise
    }

    getServoAngle(args) {
        let number = parseInt(args.NUMBER)
        if (number > 0 && number <= this.state.servo_angles.length) {
            return this.state.servo_angles[number - 1]
        } else {
            return 0
        }
    }
    getFootLocation(args) {
        let number = parseInt(args.NUMBER)
        let axis = parseInt(args.AXIS)
        if (number > 0 && number <= this.state.foot_locations[0].length) {
            return this.state.foot_locations[axis][number - 1] * 100
        } else {
            return 0
        }
    }

    setRobotState(args) {
        let channel = parseInt(args.CHANNEL)
        if (channel == 0) {
            this.runtime.ros.setPupperServoAngles(JSON.stringify(this.state.servo_angles))
        } else if (channel == 1) {
            this.runtime.ros.setPupperFootLocations(JSON.stringify(this.state.foot_locations))
        } else {
            return '参数错误'
        }
    }

    setServoAngle(args) {
        let number = parseInt(args.NUMBER)
        let value = parseInt(args.VALUE)
        if (number > 0 && number <= this.state.servo_angles.length) {
            this.state.servo_angles[number - 1] = value
        } else {
            return '舵机编号不在允许范围'
        }
    }
    setFootLocation(args) {
        let number = parseInt(args.NUMBER)
        let x = parseFloat(args.X) / 100.0
        let y = parseFloat(args.Y) / 100.0
        let z = parseFloat(args.Z) / 100.0
        if (number > 0 && number <= this.state.foot_locations[0].length) {
            this.state.foot_locations[0][number - 1] = x
            this.state.foot_locations[1][number - 1] = y
            this.state.foot_locations[2][number - 1] = z
        } else {
            return '舵机编号不在允许范围'
        }
    }

}


(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        console.log('Blockly.Python not defined')
        return
    }
    const prefix = 'lepiFaceRecognize_'
    Blockly.Python[`${prefix}block_function`] = function (block) {
        // plain input
        // const key = Blockly.Python.valueToCode(block, 'DATA')

        // faceLabels: 'formatFaceLabels',
        // const key = block.getFieldValue('TAG')

        // faceParams: Menu.formatMenu(['x坐标', 'y坐标', '宽度', '高度']),
        // var param = block.getInputTargetBlock('DATA')
        // var id = param.getFieldValue('data')
        Blockly.Python.definitions_['import_or_init_FaceRecognizer'] = 'from face_recognizer import FaceRecognizer'
        // console.log(key, key2)
        return `do something\n` //Command
        //or return [`barcodeScanner.barcode[${id}]`, Blockly.Python.ORDER_FUNCTION_CALL] // Boolean Reporter
    };
    console.log('scratch3_lepi loaded')

})()

module.exports = LepiPupper;