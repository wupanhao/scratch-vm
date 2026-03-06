const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
// const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

const axios = require('axios').default;
console.log(axios)
axios.defaults.crossDomain = true
axios.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAVcSURBVFhH7VZtSJtXFH7yZWKy1A/Y2CR1zq2Jioxqp62jtTBk4qibsNFBYVAm7OdSHa3Iyib90z/F0cE6Zd2XHYLVtZtsdCDWjlHsplhR1uJErZ0fc/MjiSYxJm+yc27ySleavAkZrIw8cEje+5733Oc+55x7ryp0FCE8xFBHfh9apAgmixTBZJEimCxSBJPF/5AgH4z3Ho7y84OMIc8gPyeIxAkGgVtbO/DFigW31ug5cJ/5I0Z+d13A6XEtfnEaxDMksgSJxn9ZoODn5nbgdrkdJeUV2JW3E99+dwW5lhzMzy9QJBVCoRD/QAoEEQj4odUbUFG2B3+uOvH77AxKpy/iNc8NQEfxyC8exEeQlFnc8SR+e3sQB21P0OQBSJIEvV5Pv0FoNPElYsolwXdqP4oWiKQ+MqgAZYL81g0snVtBZmYGQpJfKGUwGODz+YQFg0GkpaVBrVaTgir4/X4xZjKZoNVqceT1V6AzLuHLz2/gry0g+y0VNBw3jnUpu1A9OZ57CTBnY/D6TygpKYHNZsPVq1eh0+kEAf5l0qwqE2OSTM7jcaP78mU0vHMSBdYXMXPnLoKU+rWDxwBfJL4CYhPkVW6SgC80QOvbwKVLl2C1WpGTk4Oenh5KrUYQYbLr6+si5axoX1+fIP7Zp+dx2P4Bch7LRnPzKRx+Kg9dLe8jeKg53EjKxaWQYmoMSavBH+cC0G8sY2pqCo2Njdja2sKFCxdQUFAQdiPlGLJ6nGo2xujQzxi/PQGVQcKeon3UzBIetRXD/G4B0hcmwg0TA7EVpFU699XDSF6sSH5+Pnp7e3Ht2jVBbnh4GK2trUJJJscmN9DAwADGx8exu2wvRieG0XDSjsLiQlipPHTk49j7ZlhFBURXkEfXgfn3riPDVkZFHRDqsDEhl8uFhoYGdHV1YXR0VNSlTK6trQ2dnZ1YWlrC2bNnUVdXJ0Jubm6K9xLFXl5dQ37jTuARehFjy4muIAUJmShtu56HOugXxMQwNQOrmZubi46ODlRXV6Ompgb9/f2iWVjFsbExoXZ6ejpGRkYEMe5sOf0qiqHLzoHPQgTD1REV0QnS3ucqPgSDKiQmZcgKMgYHB1FbW4uhoSG0t7ejsrJSKOjxeNDU1ASv14vS0lLU19cLcjLCMUBxJYr/cvj0iQFNy260RP7/E7QNrB2ohya/jBQMbNeYXGcWiwVZWVlCUbvdLrpXpI+MVWJVq6qqxP5oNBrFN/L+yAiQn9cvIePGxZgnS/QapPqbPf4DzIX7t1PMJo4zLW3KpnRoyE1L5rxHBSpP8iEjHirKj44s5KXN3OcV38rd7acTyLG2hmdOPE17LA0kRJBHiOD0mRlkZmdDFQwXCk8Q1BnhW5yE6fwRqBzz4biRScV3xIyWgRCzI3/JmAXvG59AW3CA9lIKGgEruRIywnaMCj1hBXlkA5g8MwszFTqdb+H0qXVwL06j8HQFkEY+LKESOKMcy/41dIUHoQ14tzPh0mWh6AS3MSGyxvsRZZjAK1qdg4dqy+12w7XhxuzSKqwfEjm6PW0TVDJWJwPY9fGrmJuZhMuzKeJ5vLTlrC+LkyqaeowHE+QPqLjMw51Y9qngdK1jyhHAs1/VQcMNyYWXCHgWur2Ud9Tgzkp4sc6ABuab3THJMaIrSAEfH/gIqqFu3JxzoOh7OzLmlY+mqKBFpTkdKPvmKEbmXHD/+iPyeo+Hr10xSMY+i/kNbTc+vRp6uoQK5RRWHBMcj/rNTbuAyUf3Ll5sdIkEYr9mMrRCPVd6suQY/D3VpSlE5LiGFcgxlF04qGz/BhKMF8ca/lukCCaLFMFkkSKYHIC/AZpfWt/JEqxtAAAAAElFTkSuQmCC'
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;
let serverUrl = 'http://106.14.203.61:9001/test'
if (location.protocol == "https:") {
    serverUrl = serverUrl = `${location.origin}/chat-api/test`
}
// 最大上下文长度,这里设定-11为保留11条上下文，即和大模型的之前11条互动文本，6问5答
const maxLength = -11
class LepiChat extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.response = null
        this.runtime = runtime;
        this.payload = {};
        this.messageList = []
        this.runtime.vm.on('PROJECT_RUN_STOP', () => {
            this.messageList.length = 0
        })
        this.runtime.on('PROJECT_RUN_STOP', () => {
            this.messageList.length = 0
        })
        /*
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
        }
        this.runtime.on('LEPI_CONNECTED', () => {
        })
        */
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
            id: 'lepiChat',
            name: formatMessage({
                id: 'lepi.lepiChat',
                default: '大模型对话',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                /*    
                {
                    opcode: 'sendRequest',
                    text: formatMessage({
                        id: 'lepi.sendRequest',
                        default: '以 [METHOD] 方法请求网页 [URL]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        METHOD: {
                            type: ArgumentType.STRING,
                            menu: 'method',
                        },
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'http://'
                        }
                    }
                },
                */
                {
                    opcode: 'sendMessage',
                    text: formatMessage({
                        id: 'lepi.sendMessage',
                        default: '向大模型发送消息： [MESSAGE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: '你好'
                        }
                    }
                },
                {
                    opcode: 'clearMessageList',
                    text: formatMessage({
                        id: 'lepi.clearMessageList',
                        default: '清空消息记录',
                    }),
                    blockType: BlockType.COMMAND,
                },
                // {
                //     opcode: 'initBodyData',
                //     text: '初始化请求哒哒哒哒         哒据 [VALUE]',
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         VALUE: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '{}'
                //         },
                //     }
                // },
                // {
                //     opcode: 'appendBodyData',
                //     text: formatMessage({
                //         id: 'lepi.appendBodyData',
                //         default: '添加请求数据[KEY] [VALUE]',
                //     }),
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         KEY: {
                //             type: ArgumentType.STRING,
                //             defaultValue: 'key'
                //         },
                //         VALUE: {
                //             type: ArgumentType.STRING,
                //             defaultValue: 'value'
                //         },
                //     }
                // },
                // {
                //     opcode: 'bodyData',
                //     text: formatMessage({
                //         id: 'lepi.bodyData',
                //         default: '请求数据',
                //     }),
                //     blockType: BlockType.REPORTER,
                // },
                {
                    opcode: 'requestSuccess',
                    text: '收到回复？',
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'getMessageList',
                    text: formatMessage({
                        id: 'lepi.getMessageList',
                        default: '消息历史记录',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'getResponse',
                    text: '收到的消息',
                    blockType: BlockType.REPORTER,
                },

                // {
                //     opcode: 'parseJSON',
                //     text: formatMessage({
                //         id: 'lepi.parseJSON',
                //         default: '解析JSON [STR] 参数 [PARAM]',
                //     }),
                //     blockType: BlockType.REPORTER,
                //     arguments: {
                //         STR: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '{}',
                //         },
                //         PARAM: {
                //             type: ArgumentType.STRING,
                //             defaultValue: 'key'
                //         }
                //     }
                // },
            ],
            menus: {
                method: Menu.formatMenu2(['GET', 'POST']),
            },

        };
    }
    sendMessage(args, util) {
        this.response = null
        let message = args.MESSAGE
        this.messageList.push({
            content: message,
            mode: '智能对话',
            type: 'user'
        }
        )
        this.messageList.push({}
        )
        let sendMessageList;
        if (this.messageList.length <= (0 - maxLength)) {
            sendMessageList = this.messageList
        }
        else {
            sendMessageList = this.messageList.slice(maxLength)
        }
        let sendData = { message: JSON.stringify(sendMessageList) }
        return new Promise(resolve => {
            axios.post(encodeURI(serverUrl), sendData).then(res => {
                this.response = res.data.data.text
                this.messageList.pop()
                this.messageList.push({
                    content: this.response,
                    mode: '智能对话',
                    type: 'assistant'
                })
                console.log(this.response)
                try {
                    resolve(JSON.stringify(res.data))
                } catch (error) {
                    resolve(res.data)
                }
            }).catch(error => {
                console.log('error', error)
                this.response = null
                resolve('请求出错')
            })
        })

        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(serverUrl), 'post', JSON.stringify(sendData)).then(data => {
                resolve(data)
                console.log(JSON.parse(data).data.text)
                this.response = JSON.parse(data).data.text
                this.messageList.pop()
                this.messageList.push({
                    content: this.response,
                    mode: '智能对话',
                    type: 'assistant'
                })
            }).catch(error => {
                console.log('error', error)
                this.response = null
                resolve('请求出错')
            })
        })
    }
    // sendJsonRequest(args, util) {
    //     let method = args.METHOD
    //     let url = args.URL
    //     if (!(this.runtime.ros && this.runtime.ros.isConnected())) {
    //         let data = JSON.parse(args.DATA)
    //         return new Promise(resolve => {
    //             if (method == 'GET') {
    //                 axios.get(encodeURI(url), { params: data }).then(res => {
    //                     this.response = res.data
    //                     resolve(res.data)
    //                 }).catch(error => {
    //                     console.log('error', error)
    //                     this.response = null
    //                     resolve('请求出错')
    //                 })
    //             } else if (method == 'POST') {
    //                 axios.post(encodeURI(url), JSON.stringify(data)).then(res => {
    //                     this.response = res.data
    //                     try {
    //                         resolve(JSON.stringify(res.data))
    //                     } catch (error) {
    //                         resolve(res.data)
    //                     }
    //                 }).catch(error => {
    //                     console.log('error', error)
    //                     this.response = null
    //                     resolve('请求出错')
    //                 })
    //             }
    //         })
    //     }

    //     return new Promise(resolve => {
    //         this.runtime.ros.proxyPost(encodeURI(url), method, args.DATA).then(data => {
    //             this.response = data
    //             resolve(data)
    //         }).catch(error => {
    //             console.log('error', error)
    //             this.response = null
    //             resolve('请求出错')
    //         })
    //     })
    // }

    bodyData(args, util) {
        return JSON.stringify(this.payload)
    }

    initBodyData(args, util) {
        let value = args.VALUE
        try {
            this.payload = JSON.parse(value)
        } catch (error) {
            console.log(error)
            this.payload = {}
        }
    }

    appendBodyData(args, util) {
        let key = args.KEY
        let value = args.VALUE
        if (Array.isArray(this.payload[key])) {
            this.payload[key].push(value)
        } else {
            this.payload[key] = value
        }
    }

    requestSuccess(args, util) {
        return this.response != null && this.response != 'error'
    }

    getMessageList(args, util) {
        return JSON.stringify(this.messageList);
    }
    clearMessageList(args, util) {
        this.messageList.length = 0
    }
    getResponse(args, util) {
        if (typeof this.response == 'string') {
            return this.response
        } else if (typeof this.response == 'object') {
            return JSON.stringify(this.response)
        } else {
            return ''
        }
    }
    parseJSON(args, util) {
        let str = args.STR
        let param = args.PARAM
        try {
            let obj = JSON.parse(str)
            let value = obj[param]
            if (typeof value == 'string') {
                return value
            } else if (typeof value == 'object') {
                return JSON.stringify(value)
            } else {
                return value
            }
        } catch (error) {
            console.log(error)
            return '解析出错'
        }
    }
}

(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        return
    }

    console.log('LepiHttp loaded')

})()

module.exports = LepiChat;