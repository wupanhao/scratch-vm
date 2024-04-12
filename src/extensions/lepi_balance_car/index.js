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

class LepiBalanceCar extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.state = {
            'A': { 'speed': 0, 'angle': 0, 'torque': 0, 'limit': 12 },
            'B': { 'speed': 0, 'angle': 0, 'torque': 0, 'limit': 12 },
            'C': { 'speed': 0, 'angle': 0, 'torque': 0, 'limit': 12 },
            'D': { 'speed': 0, 'angle': 0, 'torque': 0, 'limit': 12 },
        }
        this.car = {
            'L':null,
            'R':null
        }
        // if (this.runtime.ros && this.runtime.ros.isConnected()) {
        //     this.getRobotState()
        // }
        // this.runtime.on('LEPI_CONNECTED', () => {
        //     console.log('LEPI_CONNECTED', 'subHexapodState')
        //     this.getRobotState()
        // })

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
            id: 'lepiBalanceCar',
            name: formatMessage({
                id: 'lepi.lepiBalanceCar',
                default: '平衡车',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'setBalanceCarMotor',
                    text: formatMessage({
                        id: 'lepi.setBalanceCarMotor',
                        default: '平衡车[LR]连接端口[PORT]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LR: {
                            type: ArgumentType.STRING,
                            menu:'motor'
                        },
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'port'
                        },
                    }
                },
                {
                    opcode: 'toggleBalanceCar',
                    text: formatMessage({
                        id: 'lepi.toggleBalanceCar',
                        default: '[ACTION]平衡车',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ACTION: {
                            type: ArgumentType.STRING,
                            menu:'action'
                        }
                    }
                },
                {
                    opcode: 'setThrottle',
                    text: formatMessage({
                        id: 'lepi.setThrottle',
                        default: '设置平衡车速度 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setSteering',
                    text: formatMessage({
                        id: 'lepi.setSteering',
                        default: '设置平衡车转向 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setBrushlessValue',
                    text: formatMessage({
                        id: 'lepi.setBrushlessValue',
                        default: '设置[PORT]口无刷电机[TYPE]为[VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'port'
                        },
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'type'
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                    }
                },
                {
                    opcode: 'getBrushlessState',
                    text: formatMessage({
                        id: 'lepi.getBrushlessState',
                        default: '更新[PORT]口无刷电机状态',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'port'
                        },
                    }
                },
                {
                    opcode: 'brushlessValue',
                    text: formatMessage({
                        id: 'lepi.brushlessValue',
                        default: '[PORT]口无刷电机[TYPE]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'port'
                        },
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'va'
                        },
                    }
                },
            ],
            menus: {
                'port': Menu.formatMenu2(['A', 'B', 'C', 'D']),
                'type': Menu.formatMenu3([formatMessage({
                    id: 'lepi.speed',
                    default: '速度',
                }), formatMessage({
                    id: 'lepi.angle',
                    default: '角度',
                }), formatMessage({
                    id: 'lepi.torque',
                    default: '扭矩',
                }), formatMessage({
                    id: 'lepi.voltage_limit',
                    default: '电压限制',
                })], ['V', 'A', 'T', 'L']),
                'motor': Menu.formatMenu3([formatMessage({
                    id: 'lepi.motor_L',
                    default: 'L轮',
                }), formatMessage({
                    id: 'lepi.motor_R',
                    default: 'R轮',
                }) , ], ['L', 'R']),
                'va': Menu.formatMenu3([formatMessage({
                    id: 'lepi.speed',
                    default: '速度',
                }), formatMessage({
                    id: 'lepi.angle',
                    default: '角度',
                }) ], ['speed', 'angle',]),
                'action': Menu.formatMenu3([formatMessage({
                    id: 'lepi.run',
                    default: '运行',
                }), formatMessage({
                    id: 'lepi.stop',
                    default: '停止',
                })], ['run', 'stop']),
            },

        };
    }

    setBalanceCarMotor(args,util){
        let motor = args.LR
        let port = args.PORT
        this.car[motor] = port
    }

    toggleBalanceCar(args,util){
        let active = args.ACTION == 'run'
        if(active){
            if (this.car['L'] && this.car['R'] && this.car['L'] != this.car['R']){
                return this.runtime.ros.toggleBalanceCar(JSON.stringify({...this.car,active}))
            }else{
                return 'Failed'
            }
        }else{
            return this.runtime.ros.toggleBalanceCar(JSON.stringify({ active }))
        }
    }

    setThrottle(args, util) {
        let value = parseInt(args.VALUE)
        return this.runtime.ros.setBalanceCarThrottle(value)
    }

    setSteering(args, util) {
        let value = parseInt(args.VALUE)
        return this.runtime.ros.setBalanceCarSteering(value)
    }
    setBrushlessValue(args, util) {
        let port = args.PORT
        let type = args.TYPE
        let value = parseFloat(args.VALUE)
        return this.runtime.ros.setMotorValue(JSON.stringify({ port, type, value }))
    }
    async getBrushlessState(args, util) {
        let port = args.PORT
        let state = await this.runtime.ros.getMotorState(port)
        this.state[port] = JSON.parse(state)
        return JSON.stringify(this.state[port])
    }
    brushlessValue(args, util) {
        let port = args.PORT
        let type = args.TYPE
        return this.state[port][type]
    }
}

module.exports = LepiBalanceCar;
