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

const fft = require('fft-js').fft
const fftUtil = require('fft-js').util

const {
    volumeAudioProcess,
    createAudioMeter
} = require('./soundmeter')

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAQWSURBVFhH7ZZNbBtVFIXPmx+P7Tp2YsdJnJYkbVNoFYgQBURUmsICIVVC6qKIJesuWqQuWLNDAoRQxRLBAiGxAlWVgBVC/LRFqFAKBLU0iWMSXKexY8c/GY89M9w7rqtISYit8YQufKQrZ+a92N+c896bK67asPEAS7r3+cCqC+hWXUC36gK6VRfQrbqAbtUWIL+0Tar6huJrvu/VC73lZoEnSaaKyNowIqXDkCsZAqygGEpiddCGodSg8BxndufUMmCNavLGCYST/wCVv2DJBGM1xvgb8kMaZqcEdE0HDUE0RlyrLQd9a4CqCxQGBEVrkVsy9pRkxFISRmaqEKaNueMHsDQ8B5XmdwKyrX6QDVPrAfTmE5ANG1Ulj9WBEqrkr0K4h79T0J8WSB07gtTe607kbiHbAuQNEb8Tx6Gvq/SfZCcvOKLOjYVxa8rAOnRMXJEwkHsUvz23jNKeO67XZFuAPJHLn1dQjQj4ygLxeYGHKF6rZww/v7iCslzCMxcVyInT+PHpT12vx7YAWfxjTVAudlWtq3jiUg1q6FlcfuF7+IsyjB4ecQfHaisBYfWjuvIliqVpaHTN5aMy6Yj543kVM5M/OUCdgmO17CAv+L/TH+Hq/EtQhAxZqmBs8AM8su9d+JSCcwyxGKoTYE21Bfj5lVX4fVn4yfcyvUbqZhCW1YcT+2fQmzja2he1qZYi5oWevHuaAOp4LKJiOqwg4pdxKGZCVhZxMzPpPIAXagmQD93b6dfgV8q4ll/HZ5kK+okoVCrAtkPo6XvLE/dYOwLyeioYUayVjtKFAcWW0KOpmC3XcMPUYFs9GB1639nNXmhHQI7udvochZuDj2j7KNqCUaPYBWRbQSgwg6iW9szBHTcJHyWf/LCEU/s1HBuOOfey6xW8/esCNBHHxNh5HBj8+P9xkDfHwuo0QkrgPhwrFghiKt4Lve7zFI71n4Ac73z6LMLaeuPGBhm0WRKxi85DeKltAXlz6BT+3fxJZPQiksuZxoAjE1/8nsGRkfecrtpLbbsG2b1b6TO4mXoDqlrEcjaL8WoOQXqkbxZyGH/qOE49OUL9i7faFtBPdenan3TOaWQz+SRJ5Bv9ZdahyjGMDr6Jib3veO7glhHzzeXKw6ga+yAJs/EEtk3HiglNorZeD2B86IKnm6OpLQE53tml8+QUvSkYT4j7kJblQzT8LYKysbX1HdaWgNzaL2ZfoVR1CPteb0JwNoHWzRAODnu/OZraBMjHxjw1BgpFKwShEh8jCoIjQuK0MRr9alfiZW0C5HiTmdchU+vOaBtjNK0ARoY+3JVom9oEqFN21y/3QchBCElx3GPXuGr1CA4mLuxavKzNDpKFr778OOSVc8im5qhbsWknM6aKcOgXRP2Lu+gg8C8fV3oo2z7dwAAAAABJRU5ErkJggg=='
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEREQ3NTJBMzdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEREQ3NTJBMjdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1l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'
const menuIconURI = blockIconURI;

class FakeAudioEvent {
    constructor(buffer) {
        this.buffer = buffer
        this.inputBuffer = {
            'numberOfChannels': 1,
            'sampleRate': 48000,
            'getChannelData': () => {
                return this.buffer
            }
        }
    }
}

class LepiSensor extends EventEmitter {
    constructor(runtime) {
        super();

        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.acc = { x: 0, y: 0, z: 0 };
        this.gyro = { x: 0, y: 0, z: 0 };
        this.magn = { x: 0, y: 0, z: 0 };
        this.estimatePose = { x: 0, y: 0, z: 0 };
        this.gAngle = { x: 0, y: 0, z: 0 };
        this.sensorData = {
            1: { updated: false, data: 0 },
            2: { updated: false, data: 0 },
            3: { updated: false, data: 0 },
            4: { updated: false, data: 0 },
            5: { updated: false, data: 0 },
            // 1-5 for S1-S5 6-10 for M1-M5 encoder
            6: { updated: false, data: 0 },
            7: { updated: false, data: 0 },
            8: { updated: false, data: 0 },
            9: { updated: false, data: 0 },
            10: { updated: false, data: 0 },
        }
        this.nineAxisData = {
            1: { updated: false, port: 1, x: 0, y: 0, z: 0 },
            2: { updated: false, port: 2, x: 0, y: 0, z: 0 },
            3: { updated: false, port: 3, x: 0, y: 0, z: 0 },
        }
        this.audio_buffer = []
        this.db = 0
        this.frequence = 0
        this.audio_buffer_updated = false
        this.recording = false
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.subSensorValueChange()
            this.subNineAxisValueChange()
            this.setNineAxisUpdateFrequence({ FREQUENCE: 30 })
            this.setUpdateFrequence({ FREQUENCE: 30 })
            this.subAudioTopic()

        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'subSensorValueChange')
            this.subSensorValueChange()
            this.subNineAxisValueChange()
            this.setNineAxisUpdateFrequence({ FREQUENCE: 30 })
            this.setUpdateFrequence({ FREQUENCE: 30 })
            this.subAudioTopic()
        })
        this.deviceArray = []

        this.constraints = {
            audio: {
                sampleRate: 48000, // not working, still 48000
                // deviceId: { exact: deviceArray[item.value].deviceId }
            },
        };
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        // this.audioContext = audioContext
        createAudioMeter(audioContext, ![])
        this.getMicrophoneList()
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
            id: 'lepiSensor',
            name: formatMessage({
                id: 'lepi.lepiSensor',
                default: '乐派传感器',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                // {
                //     opcode: 'motorReadPosition',
                //     text: formatMessage({
                //         id: 'lepi.motorReadPosition',
                //         default: '读取电机 [PORT] 编码器数值',
                //     }) ,
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         PORT: {
                //             type: ArgumentType.NUMBER,
                //             menu: 'motorPorts',
                //         },
                //     }
                // },
                {
                    opcode: 'motorGetPosition',
                    text: formatMessage({
                        id: 'lepi.motorGetPosition',
                        default: '电机 [PORT] 编码器的值',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'motorPorts',
                        },
                    }
                },
                // {
                //     opcode: 'sensorReadValue',
                //     text: formatMessage({
                //         id: 'lepi.sensorReadValue',
                //         default: '读取传感器[PORT]数值',
                //     }) ,
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         PORT: {
                //             type: ArgumentType.NUMBER,
                //             menu: 'sensorPorts',
                //         },
                //     }
                // },
                {
                    opcode: 'sensorGetID',
                    text: formatMessage({
                        id: 'lepi.sensorGetID',
                        default: '[PORT] 传感器ID',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                    }
                },
                {
                    opcode: 'sensorGetMode',
                    text: formatMessage({
                        id: 'lepi.sensorGetMode',
                        default: '[PORT] 传感器工作模式',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                    }
                }, {
                    opcode: 'sensorGetBrightness',
                    text: formatMessage({
                        id: 'lepi.sensorGetValue',
                        default: '[PORT] 传感器 数值',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                    }
                }, {
                    opcode: 'sensorSetMode',
                    text: formatMessage({
                        id: 'lepi.sensorSetMode',
                        default: '设置 [PORT] 传感器工作模式 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                    }
                }, '---',
                {
                    opcode: 'sensorGetDistance',
                    text: formatMessage({
                        id: 'lepi.sensorGetDistance',
                        default: '[PORT] 超声波传感器 距离 [UNIT]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                        UNIT: {
                            type: ArgumentType.NUMBER,
                            menu: 'distance',
                        }
                    }
                }, '---',
                {
                    opcode: 'sensorGetColor',
                    text: formatMessage({
                        id: 'lepi.sensorGetColor',
                        default: '[PORT] 颜色传感器检测到 [COLOR]',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                        COLOR: {
                            type: ArgumentType.NUMBER,
                            menu: 'color',
                        },
                    }
                },
                {
                    opcode: 'sensorGetColorRGB',
                    text: formatMessage({
                        id: 'lepi.sensorGetColorRGB',
                        default: '[PORT] 颜色传感器 [RGBC]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                        RGBC: {
                            type: ArgumentType.NUMBER,
                            menu: 'rgbc',
                        },
                    }
                }, {
                    opcode: 'sensorSetColor',
                    text: formatMessage({
                        id: 'lepi.sensorSetColor',
                        default: '[PORT] 颜色传感器 设置彩灯颜色[COLOR]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                        },
                    }
                }, {
                    opcode: 'sensorSetColorRGB',
                    text: formatMessage({
                        id: 'lepi.sensorSetColorRGB',
                        default: '[PORT] 颜色传感器 设置彩灯颜色(R:[R] G:[G] B:[B])',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                        R: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 255
                        },
                        G: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 255
                        },
                        B: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 255
                        },
                        C: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100
                        },
                    }
                }, '---',
                {
                    opcode: 'sensorGetPyroInfrared',
                    text: formatMessage({
                        id: 'lepi.sensorGetPyroInfrared',
                        default: '[PORT] 热释传感器 [CHANNEL]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                        CHANNEL: {
                            type: ArgumentType.NUMBER,
                            menu: 'channel',
                        },
                    }
                },
                {
                    opcode: 'sensorGetPyroInfraredMotion',
                    text: formatMessage({
                        id: 'lepi.sensorGetPyroInfraredMotion',
                        default: '[PORT] 热释传感器 检测到运动?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                    }
                }, '---',
                {
                    opcode: 'accSensorData',
                    text: formatMessage({
                        id: 'lepi.accSensorData',
                        default: '[AXIS] 加速度',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.NUMBER,
                            menu: 'axis',
                        },
                    }
                },
                {
                    opcode: 'gyroSensorData',
                    text: formatMessage({
                        id: 'lepi.gyroSensorData',
                        default: '[AXIS] 角速度',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.NUMBER,
                            menu: 'axis',
                        },
                    }
                }, {
                    opcode: 'magnSensorData',
                    text: formatMessage({
                        id: 'lepi.magnSensorData',
                        default: '[AXIS] 磁场强度',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.NUMBER,
                            menu: 'axis',
                        },
                    }
                },
                {
                    opcode: 'openMic',
                    text: formatMessage({
                        id: 'lepi.openMic',
                        default: '打开主机麦克风',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'openLocalMicrophone',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'lepi.openLocalMicrophone',
                        default: '打开电脑麦克风 [DEVICE]',
                    }),
                    arguments: {
                        DEVICE: {
                            type: ArgumentType.STRING,
                            menu: 'microphoneList'
                        },
                    }
                },

                {
                    opcode: 'closeMic',
                    text: formatMessage({
                        id: 'lepi.closeMic',
                        default: '关闭麦克风',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'audioDataUpdated',
                    text: formatMessage({
                        id: 'lepi.audioDataUpdated',
                        default: '麦克风数据有更新?',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'getAudioAttr',
                    text: formatMessage({
                        id: 'lepi.getAudioAttr',
                        default: '声音[ATTR]',
                    }),
                    arguments: {
                        ATTR: {
                            type: ArgumentType.NUMBER,
                            menu: 'audio_attr',
                        },
                    },
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'openNineAxis',
                    text: formatMessage({
                        id: 'lepi.openNineAxis',
                        default: '打开九轴传感器',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'closeNineAxis',
                    text: formatMessage({
                        id: 'lepi.closeNineAxis',
                        default: '关闭九轴传感器',
                    }),
                    blockType: BlockType.COMMAND,
                },

                // {
                //     opcode: 'readSensorData',
                //     text: formatMessage({
                //         id: 'lepi.readSensorData',
                //         default: '读取 [SENSOR] 数据, [OFFSET] 偏移量',
                //     }) ,
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         SENSOR: {
                //             type: ArgumentType.NUMBER,
                //             menu: 'nineAxis',
                //         }, OFFSET: {
                //             type: ArgumentType.NUMBER,
                //             menu: 'offset',
                //             defaultValue: 1
                //         },
                //     }
                // }, {
                //     opcode: 'getOffset',
                //     text: formatMessage({
                //         id: 'lepi.getOffset',
                //         default: '查询 [SENSOR] 偏移量',
                //     }) ,
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         SENSOR: {
                //             type: ArgumentType.NUMBER,
                //             menu: 'nineAxis',
                //         }
                //     }
                // }, {
                //     opcode: 'setOffset',
                //     text: formatMessage({
                //         id: 'lepi.setOffset',
                //         default: '设置 [SENSOR] 偏移量 x:[X],y:[Y],z:[Z]',
                //     }),
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         SENSOR: {
                //             type: ArgumentType.NUMBER,
                //             menu: 'nineAxis',
                //         },
                //         X: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0
                //         }, Y: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0
                //         }, Z: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0
                //         },
                //     }
                // },

                // {
                //     opcode: 'getGravityAngle',
                //     text: '读更新重力倾角',
                //     blockType: BlockType.COMMAND,
                // },
                {
                    opcode: 'getEstimatePose',
                    text: formatMessage({
                        id: 'lepi.getEstimatePose',
                        default: '读取方位姿态',
                    }),
                    blockType: BlockType.COMMAND,
                },
                // {
                //     opcode: 'gravityAngleData',
                //     text: '[AXIS] 重力倾角',
                //     blockType: BlockType.REPORTER,
                //     arguments: {
                //         AXIS: {
                //             type: ArgumentType.NUMBER,
                //             menu: 'axis',
                //         },
                //     }
                // },
                {
                    opcode: 'estimatePoseData',
                    text: formatMessage({
                        id: 'lepi.estimatePoseData',
                        default: '[AXIS] 方位姿态',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.NUMBER,
                            menu: 'estimatePose',
                        },
                    }
                },
                '---',
                {
                    opcode: 'setNineAxisUpdateFrequence',
                    text: formatMessage({
                        id: 'lepi.setNineAxisUpdateFrequence',
                        default: '设置九轴自动更新频率[FREQUENCE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        FREQUENCE: {
                            type: ArgumentType.NUMBER,
                            menu: 'frequence',
                            defaultValue: '30',
                        }
                    }
                },
                {
                    opcode: 'nineAxisDataUpdated',
                    text: formatMessage({
                        id: 'lepi.nineAxisDataUpdated',
                        default: '九轴[PORT]数据有更新?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'nineAxis',
                        },
                    }
                },
                {
                    opcode: 'setUpdateFrequence',
                    text: formatMessage({
                        id: 'lepi.setSensorUpdateFrequence',
                        default: '设置传感器自动更新频率[FREQUENCE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        FREQUENCE: {
                            type: ArgumentType.NUMBER,
                            menu: 'frequence2',
                            defaultValue: '30',
                        }
                    }
                }, {
                    opcode: 'sensorDataUpdated',
                    text: formatMessage({
                        id: 'lepi.sensorDataUpdated',
                        default: '传感器[PORT]数据有更新?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'sensorPorts',
                        },
                    }
                },
                {
                    opcode: 'motorPositionUpdated',
                    text: formatMessage({
                        id: 'lepi.motorPositionUpdated',
                        default: '电机[PORT]编码器有更新?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PORT: {
                            type: ArgumentType.NUMBER,
                            menu: 'motorPorts',
                        },
                    }
                },

            ],
            menus: {
                sensorPorts: Menu.formatMenu(['S1', 'S2', 'S3', 'S4', 'S5'], start = 1),
                motorPorts: Menu.formatMenu(['M1', 'M2', 'M3', 'M4', 'M5'], start = 1),
                axis: Menu.formatMenu3([formatMessage({
                    id: 'lepi.x_axis',
                    default: 'x轴',
                }), formatMessage({
                    id: 'lepi.y_axis',
                    default: 'y轴',
                }), formatMessage({
                    id: 'lepi.z_axis',
                    default: 'z轴',
                })], ['x', 'y', 'z']),
                estimatePose: Menu.formatMenu3([formatMessage({
                    id: 'lepi.roll',
                    default: '横滚角',
                }), formatMessage({
                    id: 'lepi.pitch',
                    default: '俯仰角',
                }), formatMessage({
                    id: 'lepi.yaw',
                    default: '方位角',
                })], ['x', 'y', 'z']),
                color: Menu.formatMenu([formatMessage({
                    id: 'lepi.no_color',
                    default: '无颜色',
                }), formatMessage({
                    id: 'lepi.black',
                    default: '黑色',
                }), formatMessage({
                    id: 'lepi.blue',
                    default: '蓝色',
                }), formatMessage({
                    id: 'lepi.green',
                    default: '绿色',
                }), formatMessage({
                    id: 'lepi.yellow',
                    default: '黄色',
                }), formatMessage({
                    id: 'lepi.red',
                    default: '红色',
                }), formatMessage({
                    id: 'lepi.white',
                    default: '白色',
                }), formatMessage({
                    id: 'lepi.brown',
                    default: '棕色',
                })]),
                rgbc: Menu.formatMenu([formatMessage({
                    id: 'lepi.r',
                    default: 'R分量',
                }), formatMessage({
                    id: 'lepi.g',
                    default: 'G分量',
                }), formatMessage({
                    id: 'lepi.b',
                    default: 'B分量',
                }), formatMessage({
                    id: 'lepi.brightness',
                    default: '亮度',
                })]),
                distance: Menu.formatMenu([formatMessage({
                    id: 'lepi.cm',
                    default: '厘米',
                }), formatMessage({
                    id: 'lepi.mm',
                    default: '毫米',
                })]),
                // toggle: Menu.formatMenu3(['关闭', '打开'],[0x00,0x47]),
                nineAxis: Menu.formatMenu([formatMessage({
                    id: 'lepi.acc',
                    default: '加速度',
                }), formatMessage({
                    id: 'lepi.gyro',
                    default: '角速度',
                }), formatMessage({
                    id: 'lepi.magn',
                    default: '磁力计',
                })], start = 1),
                offset: Menu.formatMenu([formatMessage({
                    id: 'lepi.no_offset',
                    default: '不修正',
                }), formatMessage({
                    id: 'lepi.with_offset',
                    default: '修正',
                })]),
                channel: Menu.formatMenu([formatMessage({
                    id: 'lepi.ambient_temperature',
                    default: '环境温度',
                }), formatMessage({
                    id: 'lepi.measured_temperature',
                    default: '测量温度',
                })]),
                // 必须用字符串，数字会报错
                frequence: Menu.formatMenu3([formatMessage({
                    id: 'lepi.not_update',
                    default: '不更新',
                }), '15hz', '30hz', '60hz', '100hz'], ['0', '15', '30', '60', '100']),
                frequence2: Menu.formatMenu3([formatMessage({
                    id: 'lepi.not_update',
                    default: '不更新',
                }), '15hz', '30hz'], ['0', '15', '30']),
                audio_attr: Menu.formatMenu([formatMessage({
                    id: 'lepi.audio_db',
                    default: '分贝',
                }), formatMessage({
                    id: 'lepi.audio_freq',
                    default: '频率',
                }), formatMessage({
                    id: 'lepi.audio_buffer',
                    default: '数据',
                })

                ]),
                microphoneList: 'formatMicrophoneList'
            },
        };
    }

    /*
    getMonitored() {
        return {
            estimatePoseData: {
                // This is different from the default toolbox xml id in order to support
                // importing multiple monitors from the same opcode from sb2 files,
                // something that is not currently supported in scratch 3.
                getId: (_, fields) => {
                    console.log(fields)
                    return getMonitorIdForBlockWithArgs('lepiSensor', fields) // _${param}`
                }
            }
        };
    }
    */

    sensorGetID(args, util) {
        var port = parseInt(args.PORT)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        return this.runtime.ros.getSensorType(port)
    }

    sensorGetMode(args, util) {
        var port = parseInt(args.PORT)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        return this.runtime.ros.getSensorMode(port)
    }

    sensorSetMode(args, util) {
        var port = parseInt(args.PORT)
        var value = parseInt(args.VALUE)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        return this.runtime.ros.setSensorMode(port, value)
    }

    sensorGetDistance(args, util) {
        var port = parseInt(args.PORT)
        var unit = parseInt(args.UNIT)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        let value = this.sensorData[port].data
        if (unit) {
            return value
        } else {
            return value / 10.0
        }
        /*
        return new Promise(resolve => {
            this.runtime.ros.getSensorValue(port).then(value => {
                if (unit) {
                    resolve(value)
                } else {
                    resolve(value / 10.0)
                }
            })
        })
        */
    }

    sensorReadValue(args, util) {
        var port = parseInt(args.PORT)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        return new Promise(resolve => {
            this.runtime.ros.getSensorValue(port).then(value => {
                this.sensorData[port].data = value
                resolve(value)
            })
        })
    }

    sensorGetBrightness(args, util) {
        var port = parseInt(args.PORT)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        // console.log(port)
        return this.sensorData[port].data
        /*
        return new Promise(resolve => {
            this.runtime.ros.getSensorValue(port).then(value => {
                resolve(value)
            })
        })
        */
    }

    sensorGetColor(args, util) {
        var port = parseInt(args.PORT)
        var color = parseInt(args.COLOR)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        let value = this.sensorData[port].data
        return value == color
    }
    sensorGetColorRGB(args, util) {
        var port = parseInt(args.PORT)
        var channel = parseInt(args.RGBC)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        let value = this.sensorData[port].data
        if (channel == 0) {
            return value & 0xFF
        } else if (channel == 1) {
            return value >> 8 & 0xFF
        } else if (channel == 2) {
            return value >> 16 & 0xFF
        } else if (channel == 3) {
            return value >> 24 & 0xFF
        } else {
            return value
        }
        /*
        return new Promise(resolve => {
            this.runtime.ros.getSensorValue(port).then(value => {
                if (channel == 0) {
                    resolve(value & 0xFF)
                } else if (channel == 1) {
                    resolve(value >> 8 & 0xFF)
                } else if (channel == 2) {
                    resolve(value >> 16 & 0xFF)
                } else if (channel == 3) {
                    resolve(value >> 24 & 0xFF)
                } else {
                    resolve(value)
                }
            })
        })
        */
    }

    sensorGetPyroInfrared(args) {
        var port = parseInt(args.PORT)
        var channel = parseInt(args.CHANNEL)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        let value = this.sensorData[port].data
        if (channel == 0) {
            return ((value >> 16) & 0x7fff) / 100.0 // env
        } else if (channel == 1) {
            return (value & 0xffff) / 100.0 // measure
        } else {
            return value
        }
    }


    sensorGetPyroInfraredMotion(args) {
        var port = parseInt(args.PORT)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        let value = this.sensorData[port].data
        return ((value >> 31) & 0x01) == 0x01 // active
    }

    sensorSetColor(args, util) {
        let port = parseInt(args.PORT)
        console.log(args.COLOR)
        let color = Color.hexToRgb(args.COLOR)
        console.log(color)
        return this.sensorSetColorRGB({ PORT: port, R: color.r, G: color.g, B: color.b })
    }

    sensorSetColorRGB(args, util) {
        let port = parseInt(args.PORT)
        let r = parseInt(args.R)
        let g = parseInt(args.G)
        let b = parseInt(args.B)
        r = parseInt(r / 5)
        g = parseInt(g / 20)
        b = parseInt(b / 10)
        if (r == 2) {
            r = 1
        }
        if (g == 2) {
            g = 1
        }
        if (b == 2) {
            b = 1
        }
        // let c = parseInt(args.C)
        let value = (r << 16) | (g << 8) | b

        console.log(r, g, b, value)
        return this.runtime.ros.setSensorValue(port, value)
    }

    openNineAxis() {
        return this.runtime.ros.nineAxisSetEnable(0x57)
    }

    closeNineAxis() {
        return this.runtime.ros.nineAxisSetEnable(0x00)
    }

    readSensorData(args, util) {
        let id = Number(args.SENSOR)
        let offset = Number(args.OFFSET)
        console.log(id)
        return new Promise((resolve, reject) => {
            this.runtime.ros.get3AxesData(id, offset).then(value => {
                if (value && value.data) {
                    Object.assign(this.nineAxisData[id], value.data)
                    resolve(JSON.stringify(value.data))
                } else {
                    reject('read data error')
                }
            })
        })
    }
    accSensorData(args, util) {
        var id = args.AXIS
        // console.log(id, this.acc)
        return this.nineAxisData[1][id]
    }
    gyroSensorData(args, util) {
        var id = args.AXIS
        return this.nineAxisData[2][id]
    }
    magnSensorData(args, util) {
        var id = args.AXIS
        return this.nineAxisData[3][id]
    }

    getGravityAngle() {
        return new Promise(resolve => {
            this.runtime.ros.getGravityAngle().then(res => {
                this.gAngle = res.data
                resolve(JSON.stringify(res.data))
            })
        })
    }

    getEstimatePose() {
        return new Promise(resolve => {
            this.runtime.ros.estimatePose().then(res => {
                this.estimatePose = res.data
                resolve(JSON.stringify(res.data))
            })
        })
    }

    gravityAngleData(args, util) {
        var id = args.AXIS
        return this.gAngle[id]
    }
    estimatePoseData(args, util) {
        var id = args.AXIS
        return this.estimatePose[id]
    }

    getOffset(args) {
        let id = Number(args.SENSOR)
        return this.runtime.ros.getOffset(id)
    }
    setOffset(args) {
        let id = Number(args.SENSOR)
        let x = Number(args.X)
        let y = Number(args.Y)
        let z = Number(args.Z)
        return this.runtime.ros.setOffset(id, { x, y, z })
    }

    subSensorValueChange() {
        let onSensorValueChange = (msg) => {
            // console.log(msg)
            for (let i = 0; i < msg.data.length; i++) {
                const ele = msg.data[i];
                this.sensorData[ele.port].data = ele.value
                this.sensorData[ele.port].updated = true
            }
        }
        this.runtime.ros.subSensorValueChange(onSensorValueChange)
    }

    subNineAxisValueChange() {
        let onNineAxisValueChange = (msg) => {
            // console.log(msg)
            for (let i = 0; i < msg.data.length; i++) {
                const ele = msg.data[i];
                Object.assign(this.nineAxisData[ele.port], ele)
                this.nineAxisData[ele.port].updated = true
            }
        }
        this.runtime.ros.subNineAxisValueChange(onNineAxisValueChange)
    }

    sensorDataUpdated(args) {
        var port = parseInt(args.PORT)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        // console.log(port)
        if (this.sensorData[port].updated) {
            this.sensorData[port].updated = false
            return true
        } else {
            return false
        }
    }

    motorPositionUpdated(args) {
        var port = parseInt(args.PORT)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        // console.log(port)
        if (this.sensorData[port + 5].updated) {
            this.sensorData[port + 5].updated = false
            return true
        } else {
            return false
        }
    }
    nineAxisDataUpdated(args) {
        var port = parseInt(args.PORT)
        if (!(port >= 1 && port <= 3)) {
            return
        }
        // console.log(port)
        if (this.nineAxisData[port].updated) {
            this.nineAxisData[port].updated = false
            return true
        } else {
            return false
        }
    }
    setUpdateFrequence(args) {
        let FREQ = parseInt(args.FREQUENCE)
        return this.runtime.ros.setUpdateFrequence(FREQ)
    }

    setNineAxisUpdateFrequence(args) {
        let FREQ = parseInt(args.FREQUENCE)
        return this.runtime.ros.setNineAxisUpdateFrequence(FREQ)
    }

    motorReadPosition(args, util) {
        var port = parseInt(args.PORT)
        if (!(port >= 1 && port <= 5)) {
            return 0
        }
        return new Promise(resolve => {
            this.runtime.ros.motorGetEncoder(port).then(value => {
                this.sensorData[port + 5].data = value
                resolve(value)
            })
        })
    }

    motorGetPosition(args, util) {
        var port = parseInt(args.PORT)
        if (!(port >= 1 && port <= 5)) {
            return 0
        }
        return this.sensorData[port + 5].data
        // return this.runtime.ros.motorGetEncoder(port)
    }

    subAudioTopic() {
        let onAudioBuffer = (msg) => {
            console.log(msg)
            this.audio_buffer = msg.data
            this.audio_buffer_updated = true
            let db = volumeAudioProcess(new FakeAudioEvent(this.audio_buffer))
            this.db = Number(db + 0x82 - 30).toFixed(0x0)
            this.frequence = this.computeFrequency(this.audio_buffer)
        }
        this.runtime.ros.subAudioTopic(onAudioBuffer)
    }

    computeFrequency(buffer) {
        var phasors = fft(buffer);

        var frequencies = fftUtil.fftFreq(phasors, 48000), // Sample rate and coef is just used for length, and frequency step
            magnitudes = fftUtil.fftMag(phasors);
        let max_value = 0
        let max_frequency = 0
        var both = frequencies.map((f, ix) => {
            if (magnitudes[ix] > max_value) {
                max_frequency = f
                max_value = magnitudes[ix]
            }
            // return { frequency: f, magnitude: magnitudes[ix] };
        });

        console.log(max_value, max_frequency);
        return max_frequency
    }

    async openMic() {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            if (this.recording) {
                await this.audioContext.close()
                this.recording = false
            }
            this.runtime.ros.openMic()
        }
    }
    async closeMic() {
        if (this.recording) {
            await this.audioContext.close()
            this.recording = false
        }
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.runtime.ros.closeMic()
        }
    }
    audioDataUpdated() {
        if (this.audio_buffer_updated) {
            this.audio_buffer_updated = false
            return true
        } else {
            return false
        }
    }

    getAudioAttr(args, util) {
        let id = parseInt(args.ATTR)
        if (id == 0) {
            return this.db
        } else if (id == 1) {
            return this.frequence
        } else {
            return JSON.stringify(this.audio_buffer)
        }

    }

    getMicrophoneList(args, util) {
        try {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                console.log(devices)
                const videoDevices = devices.filter(device => device.kind == 'audioinput')
                console.log(videoDevices)
                this.deviceArray = videoDevices.map((device, index) => {
                    return {
                        text: device.label || '麦克风 ' + index,
                        deviceId: device.deviceId,
                        value: index,
                    }
                })
            })
        } catch (e) {
            console.log(e)
        }
    }

    formatMicrophoneList(args, util) {
        this.getMicrophoneList()

        if (this.deviceArray.length > 0) {
            return this.deviceArray
        } else {
            return [{
                text: '默认',
                value: ' '
            }]
        }
    }
    openLocalMicrophone(args, util) {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.runtime.ros.closeMic()
        }
        if (this.recording) {
            return '正在录音'
        }
        if (args.DEVICE.length > 1) {
            this.constraints.audio = {
                sampleRate: 48000,
                deviceId: args.DEVICE
            }
        } else {
            this.constraints.audio = {
                sampleRate: 48000
            }
        }
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        this.audioContext = audioContext
        const bufferSize = 4096

        const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1)

        navigator.mediaDevices.getUserMedia(this.constraints).then((stream) => {
            this.recording = true
            audioContext.createMediaStreamSource(stream).connect(scriptProcessor)
            scriptProcessor.connect(audioContext.destination)
            scriptProcessor.addEventListener('audioprocess', async (event) => {
                console.log(event)
                this.audio_buffer = Array.from(event.inputBuffer.getChannelData(0))
                this.audio_buffer_updated = true
                let db = volumeAudioProcess(event)
                this.db = Number(db + 0x82).toFixed(0x0)
                this.frequence = this.computeFrequency(this.audio_buffer)
            })
        })
    }


}

(() => {

    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        return
    }
    let prefix = 'lepiSensor_'
    Blockly.Python[`${prefix}readSensorData`] = function (block) {
        Blockly.Python.definitions_['import_i2cdriver'] = 'from pi_driver import I2cDriver';
        Blockly.Python.definitions_['init_i2cdriver'] = 'i2c_driver = I2cDriver()';
        let sensor = ['acc', 'gyro', 'magn']
        var id = block.getMenuItem('SENSOR', 'nineAxis')
        var rectify = block.getMenuItem('OFFSET', 'offset') ? 'True' : 'False'
        // var id = Blockly.Python.valueToCode(block, 'AXIS');
        return `${sensor[id - 1]}Data = i2c_driver.readSensorData(${id},${rectify})\n`
    };
    Blockly.Python[`${prefix}accSensorData`] = function (block) {
        Blockly.Python.definitions_['init_accData'] = 'accData = [0,0,0]';
        let axisMap = { x: 0, y: 1, z: 2 }
        var axis = block.getFieldValue('AXIS');
        // var id = Blockly.Python.valueToCode(block, 'AXIS');
        return [`accData[${axisMap[axis]}]`, Blockly.Python.ORDER_FUNCTION_CALL]
    };
    Blockly.Python[`${prefix}gyroSensorData`] = function (block) {
        Blockly.Python.definitions_['init_gyroData'] = 'gyroData = [0,0,0]';
        let axisMap = { x: 0, y: 1, z: 2 }
        var axis = block.getFieldValue('AXIS');
        // var id = Blockly.Python.valueToCode(block, 'AXIS');
        return [`gyroData[${axisMap[axis]}]`, Blockly.Python.ORDER_FUNCTION_CALL]
    };
    Blockly.Python[`${prefix}magnSensorData`] = function (block) {
        Blockly.Python.definitions_['init_magnData'] = 'magnData = [0,0,0]';
        let axisMap = { x: 0, y: 1, z: 2 }
        var axis = block.getFieldValue('AXIS');
        // var id = Blockly.Python.valueToCode(block, 'AXIS');
        return [`magnData[${axisMap[axis]}]`, Blockly.Python.ORDER_FUNCTION_CALL]
    };
    Blockly.Python[`${prefix}getEstimatePose`] = function (block) {
        Blockly.Python.definitions_['import_i2cdriver'] = 'from pi_driver import I2cDriver';
        Blockly.Python.definitions_['init_i2cdriver'] = 'i2c_driver = I2cDriver()';
        // var id = Blockly.Python.valueToCode(block, 'AXIS');
        return `poseData = i2c_driver.estimatePose()\n`
    };

    Blockly.Python[`${prefix}estimatePoseData`] = function (block) {
        Blockly.Python.definitions_['init_poseData'] = 'poseData = [0,0,0]';
        // var id = block.getMenuItem('AXIS', 'estimatePose');
        let axisMap = { x: 0, y: 1, z: 2 }
        var axis = block.getFieldValue('AXIS');
        return [`poseData[${axisMap[axis]}]`, Blockly.Python.ORDER_FUNCTION_CALL]
    };
    Blockly.Python[`${prefix}setOffset`] = function (block) {
        Blockly.Python.definitions_['init_poseData'] = 'poseData = [0,0,0]';
        var id = block.getMenuItem('SENSOR', 'nineAxis');
        var x = Blockly.Python.valueToCode(block, 'X')
        var y = Blockly.Python.valueToCode(block, 'Y');
        var z = Blockly.Python.valueToCode(block, 'Z');
        return `i2c_driver.setOffset(${id},[${x},${y},${z}])\n`
    };
    console.log('lepiSensor loaded')

})()

module.exports = LepiSensor;