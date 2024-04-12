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

class LepiHexapod extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.getRobotState()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'subHexapodState')
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
            id: 'lepiHexapod',
            name: formatMessage({
                id: 'lepi.lepiHexapod',
                default: '六足机器人',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'setBehaviorState',
                    text: formatMessage({
                        id: 'lepi.setHexpodBehaviorState',
                        default: '切换六足运动模式 [MODE]',
                    }) ,
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
                        id: 'lepi.setHexapodCommandParam',
                        default: '设置六足 [PARAM] 为 [VALUE]',
                    }) ,
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
                        id: 'lepi.getHexapodRobotState',
                        default: '读取六足状态',
                    }) ,
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'getServoAngle',
                    text: formatMessage({
                        id: 'lepi.getHexapodServoAngle',
                        default: '六足 [NUMBER]号 舵机角度',
                    }) ,
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
                        id: 'lepi.getHexapodFootLocation',
                        default: '六足 [NUMBER]号 腿足端 [AXIS] 坐标',
                    }) ,
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
                        id: 'lepi.setHexapodServoAngle',
                        default: '设置六足 [NUMBER]号 舵机角度 [VALUE]',
                    }) ,
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
                        id: 'lepi.setHexapodFootLocation',
                        default: '设置六足 [NUMBER]号 腿足端坐标(x:[X],y:[Y],z:[Z])',
                    }) ,
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NUMBER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 22
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 16
                        },
                        Z: {
                            type: ArgumentType.NUMBER,
                            defaultValue: -10
                        },
                    }
                },
                {
                    opcode: 'setRobotState',
                    text: formatMessage({
                        id: 'lepi.setHexapodRobotState',
                        default: '更新六足 [CHANNEL]',
                    }) ,
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
                }) , formatMessage({
                    id: 'lepi.y_axis',
                    default: 'y轴',
                }) , formatMessage({
                    id: 'lepi.z_axis',
                    default: 'z轴',
                }) ]),
                channel: Menu.formatMenu([formatMessage({
                    id: 'lepi.servo_angle',
                    default: '舵机角度',
                }) , formatMessage({
                    id: 'lepi.foot_position',
                    default: '足端位置',
                }) ]),
                behavior_state: Menu.formatMenu3([formatMessage({
                    id: 'lepi.trot',
                    default: '运动',
                }) , formatMessage({
                    id: 'lepi.rest',
                    default: '静止',
                }) , formatMessage({
                    id: 'lepi.customize',
                    default: '自定义',
                }) ], ['1', '0', '4']),
                command_param: Menu.formatMenu3([formatMessage({
                    id: 'lepi.horizontal_velocity_x',
                    default: '水平速度x',
                }) , formatMessage({
                    id: 'lepi.horizontal_velocity_y',
                    default: '水平速度y',
                }) , formatMessage({
                    id: 'lepi.roll',
                    default: '横滚角',
                }) , formatMessage({
                    id: 'lepi.pitch',
                    default: '俯仰角',
                }) , formatMessage({
                    id: 'lepi.yaw_rate',
                    default: '航向角',
                }) , formatMessage({
                    id: 'lepi.body_height',
                    default: '身体高度',
                }) ],
                    ['horizontal_velocity_x', 'horizontal_velocity_y', 'roll', 'pitch', 'yaw_rate', 'height']),
            },

        };
    }

    setBehaviorState(args, util) {
        let mode = parseInt(args.MODE)
        return this.runtime.ros.setHexapodCommand(JSON.stringify({ behavior_state: mode }))
    }

    setCommandParam(args, utils) {
        let param = args.PARAM
        let value = parseInt(args.VALUE) / 100.0
        return this.runtime.ros.setHexapodCommand(JSON.stringify({ [param]: value }))
    }

    getRobotState() {
        let promise = this.runtime.ros.getHexapodState()
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
            this.runtime.ros.setHexapodServoAngles(JSON.stringify(this.state.servo_angles))
        } else if (channel == 1) {
            this.runtime.ros.setHexapodFootLocations(JSON.stringify(this.state.foot_locations))
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

module.exports = LepiHexapod;
