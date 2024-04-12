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

class LepiHttp extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.response = null
        this.runtime = runtime;
        this.payload = {}
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
            id: 'lepiHttp',
            name: formatMessage({
                id: 'lepi.lepiHttp',
                default: 'HTTP通信',
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
                    opcode: 'sendJsonRequest',
                    text: formatMessage({
                        id: 'lepi.sendJsonRequest',
                        default: '以 [METHOD] 方法向 [URL] 发送数据 [DATA]',
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
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '{}'
                        }
                    }
                }, {
                    opcode: 'initBodyData',
                    text: formatMessage({
                        id: 'lepi.initBodyData',
                        default: '初始化请求数据 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '{}'
                        },
                    }
                },
                {
                    opcode: 'appendBodyData',
                    text: formatMessage({
                        id: 'lepi.appendBodyData',
                        default: '添加请求数据[KEY] [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'key'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'value'
                        },
                    }
                },
                {
                    opcode: 'bodyData',
                    text: formatMessage({
                        id: 'lepi.bodyData',
                        default: '请求数据',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'requestSuccess',
                    text: formatMessage({
                        id: 'lepi.requestSuccess',
                        default: '请求成功？',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'getResponse',
                    text: formatMessage({
                        id: 'lepi.getResponse',
                        default: '响应结果',
                    }),
                    blockType: BlockType.REPORTER,
                }, {
                    opcode: 'parseJSON',
                    text: formatMessage({
                        id: 'lepi.parseJSON',
                        default: '解析JSON [STR] 参数 [PARAM]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        STR: {
                            type: ArgumentType.STRING,
                            defaultValue: '{}',
                        },
                        PARAM: {
                            type: ArgumentType.STRING,
                            defaultValue: 'key'
                        }
                    }
                },
            ],
            menus: {
                method: Menu.formatMenu2(['GET', 'POST']),
            },

        };
    }

    sendJsonRequest(args, util) {
        let method = args.METHOD
        let url = args.URL
        if (!(this.runtime.ros && this.runtime.ros.isConnected())) {
            let data = JSON.parse(args.DATA)
            return new Promise(resolve => {
                if (method == 'GET') {
                    axios.get(encodeURI(url), { params: data }).then(res => {
                        this.response = res.data
                        resolve(res.data)
                    }).catch(error => {
                        console.log('error', error)
                        this.response = null
                        resolve('请求出错')
                    })
                } else if (method == 'POST') {
                    axios.post(encodeURI(url), JSON.stringify(data)).then(res => {
                        this.response = res.data
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
                }
            })
        }

        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(url), method, args.DATA).then(data => {
                this.response = data
                resolve(data)
            }).catch(error => {
                console.log('error', error)
                this.response = null
                resolve('请求出错')
            })
        })
    }

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

module.exports = LepiHttp;