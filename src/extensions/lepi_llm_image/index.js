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
let serverUrl = 'https://www.jszcai.com/chat-api/doubao'
// if (location.protocol == "https:") {
//     serverUrl = `${location.origin}/chat-api/doubao`
// }

// 最大上下文长度,这里设定-11为保留11条上下文，即和大模型的之前11条互动文本，6问5答
const maxLength = -11
class LepiLLMImage extends EventEmitter {
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
            id: 'lepiLLMImage',
            name: formatMessage({
                id: 'lepi.lepiLLMImage',
                default: '大模型绘图',
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
                    opcode: 'sendImageMessage',
                    text: formatMessage({
                        id: 'lepi.sendImageMessage',
                        default: '文生图： [MESSAGE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: '一只可爱的小猫'
                        }
                    }
                },
                // {
                //     opcode: 'clearMessageList',
                //     text: formatMessage({
                //         id: 'lepi.clearMessageList',
                //         default: '清空消息记录',
                //     }),
                //     blockType: BlockType.COMMAND,
                // }, 
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
                    text: '图片生成完成？',
                    blockType: BlockType.BOOLEAN,
                },
                // {
                //     opcode: 'getMessageList',
                //     text: formatMessage({
                //         id: 'lepi.getMessageList',
                //         default: '消息历史记录',
                //     }),
                //     blockType: BlockType.REPORTER,
                // }, 
                {
                    opcode: 'getImageUrl',
                    text: '图片链接',
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
    sendImageMessage(args, util) {
        this.response = null
        let message = args.MESSAGE
        this.messageList.push({
            content: message,
            mode: '图像生成',
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
        if (true) {//未连主机
            return new Promise(resolve => {
                axios.post(encodeURI(serverUrl), sendData).then(res => {
                    this.response = res.data.data.text
                    // this.messageList.pop()
                    // this.messageList.push({
                    //     content: this.response,
                    //     mode: '智能对话',
                    //     type: 'assistant'
                    // })
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
        }

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
    getImageUrl(args, util) {
        if (typeof this.response == 'string') {
            try {
                let data = JSON.parse(this.response)
                if (data && data.data.image_urls) {
                    return data.data.image_urls[0]
                } else {
                    return '生成出错'
                }
            } catch (error) {
                console.log(error)
                return this.response
            }
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


module.exports = LepiLLMImage;