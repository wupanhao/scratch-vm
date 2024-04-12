const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');
// require('./mqtt.min.js');
const mqtt = require('mqtt');
/**
 * 
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGNDU4OUZFMjdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGNDU4OUZFMTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1l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'
const blockIconURI = 'data:image/png;base64,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';
const menuIconURI = blockIconURI;

class LepiMQTT extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.joyState = {}
        this.runtime = runtime;
        this.latestMsg = {}
        this.currentMsg = {}
        this.newMsgFlag = false
        this.msgQueue = []
        this.client = null


        // if (this.runtime.ros && this.runtime.ros.isConnected()) {
        //     this.subJoyState()
        // }
        // this.runtime.on('LEPI_CONNECTED', () => {
        //     console.log('LEPI_CONNECTED', 'subJoyState')
        //     this.subJoyState()
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
            id: 'lepiMQTT',
            name: 'MQTT',
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'connectToEMQXBroker',
                    text: '连接到EMQX服务器',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'connectToMQTTBroker',
                    text: '连接到服务器 [URL] ID:[CLIENTID] 用户:[USERNAME] 密码:[PASSWORD]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ws://'
                        },
                        CLIENTID: {
                            type: ArgumentType.STRING,
                            defaultValue: Math.random().toString(16).substring(2, 8)
                        },
                        USERNAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'test'
                        },
                        PASSWORD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'test'
                        },
                    }
                },

                {
                    opcode: 'subscribeTopic',
                    text: '订阅话题 [TOPIC]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: 'lepi_test'
                        },
                    }
                }, {
                    opcode: 'publishMsgTo',
                    text: '向话题 [TOPIC] 发送 [MSG]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: 'lepi_test'
                        },
                        MSG: {
                            type: ArgumentType.STRING,
                            defaultValue: 'hello'
                        }
                    }
                },
                {
                    opcode: 'latestMsgValue',
                    text: '最新消息[ITEM]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ITEM: {
                            type: ArgumentType.NUMBER,
                            menu: 'msgItem'
                        }
                    }
                }, {
                    opcode: 'currentMsgValue',
                    text: '当前消息[ITEM]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ITEM: {
                            type: ArgumentType.NUMBER,
                            menu: 'msgItem'
                        }
                    }
                }, {
                    opcode: 'nextMsg',
                    text: '读取到下一条消息?',
                    blockType: BlockType.BOOLEAN,
                }, {
                    opcode: 'receiveNewMsg',
                    text: '接收到新消息',
                    blockType: BlockType.BOOLEAN,
                },],
            menus: {
                msgItem: Menu.formatMenu3(['内容', '话题'], ['msg', 'topic']),
                joyButtons: Menu.formatMenu(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
                joyAxes: Menu.formatMenu(['0', '1', '2', '3', '4', '5', '6', '7']),
            },

        };
    }

    latestMsgValue(args, util) {
        return this.latestMsg[args.ITEM]
    }
    currentMsgValue(args, util) {
        return this.currentMsg[args.ITEM]
    }
    nextMsg(args, util) {
        if (this.msgQueue.length >= 1) {
            this.currentMsg = this.msgQueue.shift()
            return true
        } else {
            this.currentMsg = {}
            return false
        }
    }
    receiveNewMsg(args, util) {
        if (this.newMsgFlag) {
            this.newMsgFlag = false
            return true
        } else {
            return false
        }
    }
    getJoyState(args, util) {
        // console.log(this.joyState)
        return JSON.stringify(this.joyState)
    }
    connectToEMQXBroker(args, util) {
        let cid = 'mqttjs_' + Math.random().toString(16).substring(2, 8)
        return this.connectToMQTTBroker({ URL: 'ws://broker.emqx.io:8083/mqtt', CLIENTID: cid, USERNAME: 'lepi_test', PASSWORD: 'lepi_test' })
    }
    connectToMQTTBroker(args, util) {

        return new Promise(resolve => {
            const url = args.URL
            // const url = 'ws://broker.emqx.io:8083/mqtt'
            // const url = 'mqtt://broker.emqx.io:1883'
            // 创建客户端实例
            const options = {
                // Clean session
                clean: true,
                connectTimeout: 15 * 1000,
                // 认证信息
                clientId: args.CLIENTID,
                username: args.USERNAME,
                password: args.PASSWORD,
                reconnectPeriod: 0,
            }
            if (this.client && this.client.connected) {
                this.client.end()
            }
            const client = mqtt.connect(url, options)
            this.client = client
            // 接收消息
            client.on('message', (topic, message) => {
                // message is Buffer
                console.log(topic, message.toString())
                let msg = { msg: message.toString(), topic }
                this.latestMsg = msg
                this.msgQueue.push(msg)
                this.newMsgFlag = true
                // client.end()
            })
            client.on('connect', function () {
                console.log('Connected', client)
                resolve('连接成功')
            })
            client.on('error', (err) => {
                console.log('Connection error: ', err)
                client.end()
            })

            client.on('reconnect', () => {
                console.log('Reconnecting...')
            })

        })
    }
    subscribeTopic(args, util) {
        let topic = args.TOPIC
        return new Promise(resolve => {
            // 订阅主题
            this.client.subscribe(topic, function (err) {
                if (!err) {
                    // 发布消息
                    resolve('订阅成功')
                }
            })
        })

    }
    publishMsgTo(args, util) {
        let topic = args.TOPIC
        let msg = args.MSG
        this.client.publish(topic, msg)
    }

}


module.exports = LepiMQTT;