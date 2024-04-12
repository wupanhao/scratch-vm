const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');

const axios = require('axios').default

const testDevice = require('./test.json')

// const StageLayering = require('../../engine/stage-layering')
const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');
// require('./mqtt.min.js');
/**
 * 
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGNDU4OUZFMjdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGNDU4OUZFMTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpkYWJmYjkwNy0zN2YxLTQ2OTktOGJkMi1mMjdjZmVjMjRlMWIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7m78D2AAAHRElEQVRYR+1XaWxUVRg901naKe2U0kLFAhVRKFoQLbghbqzBaCDGRIxECcYdfxBiDJuK2w8XEmMQNOJGxIUYIy5AFATKLhRoWcUKFMoiUDpdZqbtzHjO7Qyd5bVV+SEmnOZ13rv3vu+e++3PlvXzG2FcwEiJ/F6wuEjwfHGR4Pni/08wzL/mcAgNwSbUNjeinr/NoRDC4b+fnbRW7+hdyZAsyZTsjtBuHgyEgvA3NqBLmgcjc3sjPzUTJxrrsfxUBU75a5DmdCM1xRFZbY1AqBn+Jh9y07IwOvdy5Lk6oSpQixWn/8AZnxdprvZlWBLUib1NfvTNyMGK4gdQ4M6KzLTioO8sxmz9HPtqTwB2Z2Q0AdRUv8w8LCu+H5e5O0cGW3HYV4NRWxdjX92f8PCwNpstMtOKJIKGHLX2VMH1eOeqMdhcU4XJu75HefVhrrZzQRADsgvwwdV3YUhWd3x8dCcOUZsOW7y3yIQF1NpD+QOxpeaYkVFWfeicjKLsXnj/qrG4sXM+puxZjncOboLHlZ5EMolgbXMA47v1w5JB9xqhCw9uhMuVgSA31JVCAXaSaeIhxl06EIsHjjNmTDSDtpHpJuz8Bt9U7UQqTWuPbK7DNJKkP1CHh6mID4vuxn07vsbXJ/Yi05Fq1kQRR1AE6ujE4dEz8GrFeszYuwJunspH0tLoIJprf8MZvMnTOriZXmziXHtwckM3iWrtJamdEKKFjgfqz5H1kuScfiMwq88tsC1/BRkOl1FAFHEEvdzsxT63tiz+fjbcqRlIo/Azd06NrGhF37XvojLg7TBIBEVwtjMVlbc9Y55tP845Z07jUn4vwnfNwcsVJZh9YA08MVqMc5xwsBmP9BiE+ZVbaQcXfIy+bTdNNnPT9v0EHgYTy741z/uHPWEivKN0Ux9kamLUVlFT58BnaU6uYXyOe83jnpPzBxkOsYj3bPpFd2ptTfURvpiCnLRMRl8Wvjy+B2/+tto4/iIKeqVinVl+Q05v40ttQeQe71FM7byI03e0WuE0tRUe+wKu83Q3JB0pdpRUV5q9xSEWlom6UU5PzeQ4082z/E6ndFKQfg/omdB8qB0Fyt+yHWm8s6GzU78t6MKUIsh9Wgxg457WB40nqOjiwqLMruZxv3IcMfPyoZyzoYa+wvDF632Hm/GfmGxdKZZnNHAzP356rAzDNn+Ckb9+FhkFrl63ALdvWYTyupN8324sMyCzm9GmOMQi4cluzPl0ryH0bD8fXZhU/p2ZCo+eifU3P2rMlUsHf41mbgw1xUVcIpRO/mxqwIazR7E9clhhN5815qO/mVimr0/pNdjsjYSgi5OeTkLP/bYKuTTBnXmFULX86Mg2jCv9CqcYEDcxqRq/2v0jpjNoPMZ8JE87SfMmIHjpPho8Ium2t2z6aVUZFhwpZeFx07x2k1O9TGsj8vobs2vv9ISqlJSoa1hr3y+6x0Rz/uq3Uc2SJxOYfMdfmcDOg3SiIEWgn1oIUAOFdPih2T2MjBIG2T7vMaSKSIRcNMcKSiN6VwfpQt88wvTzXmUpHtu1FFlM6LGwLnX0tdJbn8KAjK5wLHsJWYouC9SQ/DVM3ptvnGR8KRbafMjGD7GTps2KCZBY1DDVBMfMNuYvXjsPHjYliaUuyYGieUn1c3fdKQ1EZuKhkqjuZPvNj+CXM4eQs/It2H543ly5K+diNevuDs6N4hq1WJag7F1sFLZ5j5s9E8kJ1h5OLV5LzeypF8HkJTK5k0V/WfEEU/ZGb1wIPyPQw3ZMl4/BM2rDQszl3HKukR/KxEnguPZQCY3kmyS0QTCEQrZae+tP81TJS+qpkbmFI8z9tPKl8LCVUo6UBnTpXmNTOSdobdT/YiHZe7hH/4zcFv+2QNLu0ejLYCDs5ukS04iZZ6Q+0bMYz+1fBZtFiyQYspybzsh8kmv1TlR2FJItJSjgKDlpXkgmqH+RXHSYHS/1Yu6j8NP5b+t6pbl/69CmiHBraE4uIAzregUTcXy1UEckguaeKSuZngVBQ0cZnZBvJAptZHDMYmUpqz1pUk97iVpzWq9AmNl7KALB+NYshX/qzAV9Cqg0JiKZoMxFDS48ugPz2FHLNEq+cnIfW3guwHA2CXPYGjkSmksraM1Lv5eYaJaKlDdlSl0NrFajcjhOHGX7r8SdCMvjq6udXN7SVqnruKVzT+PkPZinzg5/1px0Cbvk9ISyZAWt+YJrhRPDp5mK4VW7xVw7IrcPvrhmPOZXbjOmsyKYlKijaKJpG5guVg1+ELd3KYiMtnwsFZYsMOZzttMoxEKyxKBi2JPIY1cdi0XHyjGxdAnTU4Z1sLVFUDDliWXMQWcvYlWp8tfhJD+QOjE6Ez+SOoL5LmYZ7cmUUqCKwT8l6Hqaua0vOqFdglEEaVKRNR9MEt2GsI4gv1OSZythnp08ZHtBJvwtNegDR7VWWvu35AS9qySuRlVXR+SEf2an/wAXCZ4vLhI8X1zgBIG/AIAuXSLcx8kuAAAAAElFTkSuQmCC'
const blockIconURI = 'data:image/jpeg;base64,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'
const menuIconURI = blockIconURI;

class LepiSmartClassroom extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.user = []
        this.course = []
        this.deviceList = []
        this.commandDevice = []
        this.sensorDevice = []
        this.runtime = runtime;
        this.latestMsg = {}
        this.currentMsg = {}
        this.newMsgFlag = false
        this.msgQueue = []
        this.client = null

        this.connectToMQTTBroker()

        this.course = ['1737017057672577026']
        this.user = ['1731939323598532610']


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
            id: 'lepiSmartClassroom',
            name: '智慧教室',
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'updateDeviceList',
                    text: '更新课程 [COURSE] 用户[USERNAME]的设备列表',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COURSE: {
                            type: ArgumentType.STRING,
                            menu: 'course'
                        },
                        USERNAME: {
                            type: ArgumentType.STRING,
                            menu: 'user'
                        },
                    }
                },
                // {
                //     opcode: 'updateTestDevice',
                //     text: '更新测试设备列表',
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         COURSE: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '1737017057672577026'
                //         },
                //         USERNAME: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '1731939323598532610'
                //         },
                //     }
                // },
                {
                    opcode: 'toggleDevice',
                    text: '设备[DEVICE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DEVICE: {
                            type: ArgumentType.STRING,
                            menu: 'switchDevice'
                        },
                    }
                }, {
                    opcode: 'deviceState',
                    text: '设备[DEVICE]状态',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DEVICE: {
                            type: ArgumentType.STRING,
                            menu: 'sensorDevice'
                        },
                    }
                },],
            menus: {
                openClose: Menu.formatMenu3(['打开', '关闭'], ['ON', 'OFF']),
                switchDevice: 'formatSwitchDevice',
                sensorDevice: 'formatSensorDevice',
                user: 'formatUserList',
                course: 'formatCourseList',
            },

        };
    }


    async updateDeviceList(args, util) {
        let res = await axios.get(`https://risebnu.com/prod-api/iot/open/authorizedEquipmentList?userId=${args.USERNAME}&courseArrangementId=${args.COURSE}`)
        this.deviceList = res.data.data
        console.log(this.deviceList)

        let models = ['QBKG40LM']
        let devices = this.deviceList.filter(dev => models.indexOf(dev.model.trim()) >= 0)
        this.commandDevice = []
        for (let i = 0; i < devices.length; i++) {
            const dev = devices[i];
            if (models.indexOf(dev.model.trim()) >= 0) {
                this.commandDevice.push({
                    name: dev.alias + '-打开',
                    topic: `zigbee2mqtt/${dev.ieee}/set`,
                    payload: {
                        state: "ON"
                    }
                })
                this.commandDevice.push({
                    name: dev.alias + '-关闭',
                    topic: `zigbee2mqtt/${dev.ieee}/set`,
                    payload: {
                        state: "OFF"
                    }
                })
            }
        }

        this.sensorDevice = []
        for (let i = 0; i < devices.length; i++) {
            const dev = devices[i];
            if (models.indexOf(dev.model.trim()) >= 0) {
                this.sensorDevice.push({
                    name: dev.alias,
                    topic: `zigbee2mqtt/${dev.alias}`,
                    key: "state",
                    state: '',
                })
                this.subscribeTopic({ TOPIC: `zigbee2mqtt/${dev.alias}` })
                this.publishMsgTo({
                    TOPIC: `zigbee2mqtt/${dev.alias}/get`,
                    MSG: JSON.stringify({
                        state: ""
                    })
                })
            }
        }
        return this.deviceList.map(ele => ele.alias).join(',')
    }
    async updateTestDevice(args, util) {
        // let res = await axios.get(`https://risebnu.com/prod-api/iot/open/authorizedEquipmentList?userId=${args.USERNAME}&courseArrangementId=${args.COURSE}`)
        this.deviceList = testDevice.filter(dev => dev.definition).map(dev => {
            dev.model = dev.definition.model
            dev.alias = dev.friendly_name
            dev.ieee = dev.ieee_address
            return dev
        })
        console.log(this.deviceList)

        let models = []
        let devices = []
        this.commandDevice = []
        this.sensorDevice = []
        models = ['QBKG40LM']
        devices = this.deviceList.filter(dev => dev.model && models.indexOf(dev.model.trim()) >= 0)

        for (let i = 0; i < devices.length; i++) {
            const dev = devices[i];
            if (dev.model && models.indexOf(dev.model.trim()) >= 0) {
                this.commandDevice.push({
                    name: dev.alias + '-打开',
                    topic: `zigbee2mqtt/${dev.ieee}/set`,
                    payload: {
                        state: "ON"
                    }
                })
                this.commandDevice.push({
                    name: dev.alias + '-关闭',
                    topic: `zigbee2mqtt/${dev.ieee}/set`,
                    payload: {
                        state: "OFF"
                    }
                })
            }
        }

        for (let i = 0; i < devices.length; i++) {
            const dev = devices[i];
            if (dev.model && models.indexOf(dev.model.trim()) >= 0) {
                this.sensorDevice.push({
                    name: dev.alias,
                    topic: `zigbee2mqtt/${dev.alias}`,
                    key: "state",
                    state: '',
                })
                this.subscribeTopic({ TOPIC: `zigbee2mqtt/${dev.alias}` })
                this.publishMsgTo({
                    TOPIC: `zigbee2mqtt/${dev.alias}/get`,
                    MSG: JSON.stringify({
                        state: ""
                    })
                })
            }
        }

        models = ["TS0003_switch_module_2"]
        devices = this.deviceList.filter(dev => dev.model && models.indexOf(dev.model.trim()) >= 0)
        for (let i = 0; i < devices.length; i++) {
            const dev = devices[i];
            if (dev.model && models.indexOf(dev.model.trim()) >= 0) {
                this.commandDevice.push({
                    name: dev.alias + 'l1-打开',
                    topic: `zigbee2mqtt/${dev.ieee}/set`,
                    payload: {
                        state_l1: "ON"
                    }
                })
                this.commandDevice.push({
                    name: dev.alias + '-l1-关闭',
                    topic: `zigbee2mqtt/${dev.ieee}/set`,
                    payload: {
                        state_l1: "OFF"
                    }
                })
                this.commandDevice.push({
                    name: dev.alias + 'l2-打开',
                    topic: `zigbee2mqtt/${dev.ieee}/set`,
                    payload: {
                        state_l2: "ON"
                    }
                })
                this.commandDevice.push({
                    name: dev.alias + '-l2-关闭',
                    topic: `zigbee2mqtt/${dev.ieee}/set`,
                    payload: {
                        state_l2: "OFF"
                    }
                })
                this.commandDevice.push({
                    name: dev.alias + 'l3-打开',
                    topic: `zigbee2mqtt/${dev.ieee}/set`,
                    payload: {
                        state_l3: "ON"
                    }
                })
                this.commandDevice.push({
                    name: dev.alias + '-l3-关闭',
                    topic: `zigbee2mqtt/${dev.ieee}/set`,
                    payload: {
                        state_l3: "OFF"
                    }
                })
            }
        }

        for (let i = 0; i < devices.length; i++) {
            const dev = devices[i];
            if (dev.model && models.indexOf(dev.model.trim()) >= 0) {
                this.sensorDevice.push({
                    name: dev.alias + '-l1',
                    topic: `zigbee2mqtt/${dev.alias}`,
                    key: "state_l1",
                    state: '',
                })
                this.sensorDevice.push({
                    name: dev.alias + '-l2',
                    topic: `zigbee2mqtt/${dev.alias}`,
                    key: "state_l2",
                    state: '',
                })
                this.sensorDevice.push({
                    name: dev.alias + '-l3',
                    topic: `zigbee2mqtt/${dev.alias}`,
                    key: "state_l3",
                    state: '',
                })
                this.subscribeTopic({ TOPIC: `zigbee2mqtt/${dev.alias}` })
                this.publishMsgTo({
                    TOPIC: `zigbee2mqtt/${dev.alias}/get`,
                    MSG: JSON.stringify({
                        state_l1: ""
                    })
                })
            }
        }

        return this.deviceList.map(ele => ele.alias).join(',')
    }


    formatSwitchDevice() {
        return Menu.formatMenu2(this.commandDevice.map(ele => ele.name))
    }

    formatSensorDevice() {
        return Menu.formatMenu2(this.sensorDevice.map(ele => ele.name))
    }

    formatUserList() {
        return Menu.formatMenu2(this.user)
    }

    formatCourseList() {
        return Menu.formatMenu2(this.course)
    }

    toggleDevice(args, util) {
        let dev = this.commandDevice.filter(device => device.name == args.DEVICE)[0]
        console.log(dev)
        if (dev) {
            this.publishMsgTo({
                TOPIC: dev.topic,
                MSG: JSON.stringify(dev.payload)
            })
        }
    }

    deviceState(args, util) {
        let dev = this.sensorDevice.filter(device => device.name == args.DEVICE)[0]
        if (dev) {
            return dev.state
        }
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
            const url = 'ws://sensor.risebnu.com:8083/mqtt'
            // const url = 'ws://192.168.50.232:8083/mqtt'
            // const url = 'ws://broker.emqx.io:8083/mqtt'
            // const url = 'mqtt://broker.emqx.io:1883'
            // 创建客户端实例
            const options = {
                // Clean session
                clean: true,
                connectTimeout: 15 * 1000,
                // 认证信息1733708091341340673
                clientId: '173370809134134067333',
                // clientId: args.CLIENTID,
                // username: args.USERNAME,
                // password: args.PASSWORD,
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

                let devs = this.sensorDevice.filter(sensor => sensor.topic == topic)
                for (let i = 0; i < devs.length; i++) {
                    const ele = devs[i];
                    let state = JSON.parse(message.toString())
                    if (state[ele.key]) {
                        ele.state = state[ele.key]
                    }
                }
                let msg = { msg: message.toString(), topic }
                this.latestMsg = msg
                this.msgQueue.push(msg)
                this.newMsgFlag = true
                // client.end()
            })
            client.on('connect', () => {
                console.log('Connected', client)
                resolve('连接成功')
                this.subscribeTopic({ TOPIC: 'zigbee2mqtt/bridge/devices' })
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


module.exports = LepiSmartClassroom;