const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

const axios = require('axios').default;
axios.defaults.crossDomain = true
axios.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAVdEVYdENvbW1lbnQATGF2YzU3LjI0LjEwMhl5BO8AAAQlSURBVFhH7ZhLbFRVHMa/O3depfOo6BBUIqSFpCVNCFGxIYKmDZVXWKpJXchCownBIIpAYhmkhMSqG1LdGKMrF24YEgQLLaHVRF246EYwRCsLjQrU0k5rpzNz/f6nd8hte+88zhTSRX+Tk3vOnfv4+n+eqRG59L6FRYzPPi5algRWy5LAavHMYtNw1z6aScPa3mmvFoZA7ymETb+9mk1FFhzLTi24uOl8DtPtR+zVfCqyoNN6xoUTiAVq1FyHPCz4DRMjrW+qdbSvWx3noh+DVl69RHcI/05PoGMopeZe6AukhcXK1Q0TcX/IfqA7RQVKzIlbCwOZCfsb4jhf7tDBMwbHp8ZxsGErXly5Hv/ls+rcFAO67cE1at53axghn6nm5ZAILkMj4yweSdhn+I5sBq+u2oiP12/3jEFPgW88tgld656xVwvDtfRNNA5+gjjFClUJHGt7Wx0tfl4aOotYiVhxQ+4N0MqnG9vV+tuRG9jywxcLK/CB/g+ZbZOsCzm+0fVSPoVlyZz/B8jV+VwG+9a04HTTc1oCS2ZxluVEFFg7jsHamXQfO5KqdET8wVkjyuEzgyzG8gw9Sgo0DZqHSXLTmcEuWLlpezYb3g2fPEOTsupghC5JfNMF48wh95F6h0qMeWUlTfdWS8kYrOv/gC+bZIt7V60rxTj/Hl5fvUnF2dwYlDq795EN+LR51z1odVViMeHyDJ3HYw/bZ9wpy4I5Pmx8YgTIzRTssgnVMruDdzPVacHRyVF81LwbB2hdQbvMKBdPpfEP1w/ZrqkE43ySLm5RAi/fHkbr95/DYHZ3rX0WR+s329ccV3HuRkkXi/Xg82uJU3BDkLfrZzPbXEN0BSzWv6DdJo2zhxEL1qq5G6UL9WUWaiaJKtRSNLz6r1uZkWtZRwuFuoCv9yQ667ciuXYLjK+TiIejNIR7rfQUmNr4PFqXr1btyuBn/9VeDI39jQHGkbPtiXUkGw9SxMQckVK8na3uBuMuxK19IrAMX/11FS+sbNIXmObLhja/otzipGGwB38wJmUno8Qxeb58skPtekrx050/0cIkyWw7PHOC90v8aQkUxqUHq8zlJdxgjmw7grpAGMa5TkTDMWW5S090qC3YxVu/IcxY9UK2W03M1EBNHYKMyzttb6kOo21B2fE6GZUfTO1H1dw4x6LN/pp66mXsWbEOx68PIMkQALOzGHE7GcQ79RR67enXZiwYingKLLtQm6qr2lBsqmVG3KFf+pG8fgUxvlAEFBsFas0AhhmPslOKOM67odVJPqNb9yREXB+6aT35dWdUuCGoYbJkGYNqM1IELYF7H91Atw6i+9fvEKN7KhVXoJQ4QUvgvp8vIEnrxVgudMWVS9kC5V8T9QM9at7z+48q8+61OKFomVkMaLn4frIksFqWBFYH8D9pcBFXlXgEgAAAAABJRU5ErkJggg=='
const menuIconURI = blockIconURI;

class LepiComm extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.latestMsg = {}
        this.currentMsg = {}
        this.newMsgFlag = false
        this.msgQueue = []
        this.hosts = []
        this.runtime = runtime;
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.subNewMessage()
            this.updateHostList()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'subNewMessage')
            this.subNewMessage()
            this.updateHostList()
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
            id: 'lepiComm',
            name: '主机通信',
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [{
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
            },
            /*
            {
                opcode: 'receiveNewMsgFrom',
                text: '接收到来自[HOST]的新消息',
                blockType: BlockType.BOOLEAN,
                arguments: {
                    HOST: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                    }
                }
            },
            */ {
                opcode: 'sendMsgTo',
                text: '向 [HOST] 发送 [MSG]',
                blockType: BlockType.COMMAND,
                arguments: {
                    HOST: {
                        type: ArgumentType.STRING,
                        defaultValue: '127.0.0.1'
                    },
                    MSG: {
                        type: ArgumentType.STRING,
                        defaultValue: 'hello'
                    }
                }
            },
            {
                opcode: 'broadcastMsg',
                text: '群发 [MSG]',
                blockType: BlockType.COMMAND,
                arguments: {
                    MSG: {
                        type: ArgumentType.STRING,
                        defaultValue: 'hello'
                    }
                }
            },
            {
                opcode: 'updateHostList',
                text: '更新主机列表',
                blockType: BlockType.COMMAND,
            },
            {
                opcode: 'hostIP',
                text: '主机[IP]',
                blockType: BlockType.REPORTER,
                arguments: {
                    IP: {
                        type: ArgumentType.NUMBER,
                        menu: 'hostList'
                    }
                }
            },
            ],
            menus: {
                hostList: 'formatHostList',
                msgItem: Menu.formatMenu3(['内容', '来源'], ['msg', 'from']),
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
    receiveNewMsgFrom(args, util) {

    }
    async sendMsgTo(args, util) {
        let host = args.HOST
        let msg = args.MSG
        if (msg.length == 0) {
            return '消息不能为空'
        }

        if (this.runtime.ros && this.runtime.ros.isConnected()) {

            try {
                await this.runtime.ros.sendMsgTo(host, msg)
                return '发送完成'
            } catch (error) {
                console.log(error)
                return '发送失败'
            }
        } else {
            let data = {
                to: host,
                msg: msg
            }
            let url = `http://${host}:8000/variable/message`
            try {
                let res = await axios.post(encodeURI(url), JSON.stringify(data))
                return '发送完成'
            }
            catch (error) {
                console.log('error', error)
                return '发送出错'
            }
        }
    }

    subNewMessage() {
        this.runtime.ros.subNewMessage((message) => {
            console.log(message)
            let msg = JSON.parse(message.data)
            if (msg.from != 'localhost') {
                this.latestMsg = msg
                this.msgQueue.push(msg)
                this.newMsgFlag = true
            }

        })
    }
    async updateHostList() {
        let res = await this.runtime.ros.proxyPost(`http://${this.runtime.ros.ip}:8000/system/hosts_list`, 'GET')
        this.hosts = JSON.parse(res)
        return res
    }
    formatHostList() {
        return Menu.formatMenu3(this.hosts, this.hosts)
    }
    hostIP(args) {
        return args.IP
    }
    async broadcastMsg(args) {
        let msg = args.MSG
        if (msg.length == 0) {
            return '消息不能为空'
        }
        await this.updateHostList()
        this.hosts.map(host => {
            try {
                this.runtime.ros.sendMsgTo(host, msg).then(console.log).catch(console.log)
            } catch (error) {
                console.log(error)
            }
        })
    }
}


module.exports = LepiComm;