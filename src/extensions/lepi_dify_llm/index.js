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
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxAAAAsQAa0jvXUAAAR7SURBVHhe7Zo9bBxFFMffm72zLSUEASGSURRAShxEAXF8SWgiRQoNARcoEqKggQJRIyoLqkBoKKCIFFFQUCCESGWgQHQIJLAtoEhEAQIRAQ0QICiWz955/GdnLneY/ZrZcxR59ie9e7uze559//l6s2cWQBGjnI+WVgDnoyV6ARpNgnxMbiWheRI5itM7Yeso/R7+E1niz8w9Ww2foC6tSo9S6iGaGTzPbbAOLtWKK1gAPiyPUEfOk1J3uyILw7Qx/T5dU0/LRbqalY8Z7kFwJc9RKk9Rog6G9uUgAXhWDlEiy6i4A+XzmYCt6UVZUfO2YHzwEXkGT/4K6p/O6jeCBxKmm5Iz1C0J3tCHddU8esrDtmA8cE+/SQm/hYeYNgOuSfAGbwH4Abodo+sEbbiCKpQ87o4ag+Dfg6jPZnU3DHyAfw9IZB+63i21phhzj6YD9qQZCP41BP9E1upjxF8ARVPuqB7seX8OPCcnIfoLtXudByEC/Jm1rJntq7D3XMk+A2GmBMvs69lJUa8zUQSa9yrAB2SKdsl3aJG9leOwC1uXl2SZz9gCf9D689TlxeLW1wJhfsTBOgSv0yz/IWwZ7OmzNKEWspm+CKNwqlPkCTOyRCY5CoLn9AWM/dO5AphwRa+hshlaocu20A/zmP6sqlepr5eztT5P88QZ8fONgu/RDrjjlT1NywaaUYdYkABZdpfwSYhwDrX/lsk4CNoIkuqvaU2elBV+A2fhaNmPHrSnUoDEyh1Co72AIcsLpuQ+jMPdCL4Puyxf8EV3uRHI+E6R4o8KE67BEGDMTEv8ky30o7EAWwmyyNOYAC9spQBhc8CNQvGY8r1ibm4BbgA3twAif7ujYkwW0Kc/3Jk31+cAJBwL2LhMj2uTkb2SSHkRSdDHtmAIttN7sKdYcKf5mMCY9hNjO102SwlyDaa38dxX4fMW5VJGBNC/0KS6a6wCrOqXZUW9aAuG8ENyPz4v2UnMluVirpVtuQeYugIZHQJXsmxrnEZ8zXz+D42wNpDC5n1n1OoEb8j7bk1rJ0Hno6UVwPloGRVgIjurY96LzSbMAseKr/+tMquDuW/zM9a04TI4qz/FcnKwdFkaRdMd2KkV78LM0rQuC9gRnrUFQ5BzYH2Xz/HgXFqfpknUscudFYDVRNPvCCZoAR8K8KDspJ2ZLtVo6mK7+xV11L7CassEMK+5jqK+KlJ6FNvudyo3Q6QO0aT8bAv9CN4NInH6gRJ1b4gAdUFPeYw6/EGlAErdI1/Sr7bQj3otvgnuYb4ISDu94Zo5noh5+xhEkADbiVYA56OlFcD5aGkFcD5aWgGcj5ZWAOejpRXA+WhpBXA+WloBnI+WIAFkmfpkXkVWs+p8GIr+cUflKPrLHXnDNJe+6449UBBOnyJWOwrf6tr3dd/g+iVbEADTXtRxvPxNtTYN8SEs/3fICpiOhb0UzX5crML0ryaDzDxZnR9IB/+cFQB6QKAA24R2EnQ+WloBnI8WpiNxT4JMs+m37jhKgn8c3S60k6DzkUL0L1oOxXTRXAELAAAAAElFTkSuQmCC'
const menuIconURI = blockIconURI;

function extractFirstJSON(str) {
    let stack = [];
    let startIndex = -1;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        // 处理转义字符
        if (inString && char === '\\' && !escapeNext) {
            escapeNext = true;
            continue;
        }

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        // 处理字符串内的内容（跳过）
        if (inString) {
            if (char === '"') {
                inString = false;
            }
            continue;
        }

        // 处理字符串开始
        if (char === '"') {
            inString = true;
            continue;
        }

        // 处理JSON结构
        if (char === '{' || char === '[') {
            if (stack.length === 0) {
                startIndex = i; // 记录JSON开始位置
            }
            stack.push(char);
        } else if (char === '}' && stack[stack.length - 1] === '{') {
            stack.pop();
        } else if (char === ']' && stack[stack.length - 1] === '[') {
            stack.pop();
        }

        // 当栈为空且已经开始解析时，找到完整的JSON
        if (stack.length === 0 && startIndex !== -1) {
            const jsonStr = str.substring(startIndex, i + 1);
            try {
                // 验证是否是有效的JSON
                JSON.parse(jsonStr);
                return { start: startIndex, end: i + 1 };
            } catch (e) {
                // 如果不是有效JSON，重置状态继续寻找
                stack = [];
                startIndex = -1;
            }
        }
    }

    return { start: 0, end: 0 }; // 没有找到完整的JSON
}


function base64ToBlob(base64Data) {
    let arr = base64Data.split(','),
        fileType = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        l = bstr.length,
        u8Arr = new Uint8Array(l);

    while (l--) {
        u8Arr[l] = bstr.charCodeAt(l);
    }
    return new Blob([u8Arr], {
        type: fileType
    });
}

async function fetchBlob(fileUrl) {
    // 发起fetch请求
    const response = await fetch(fileUrl);

    if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
    }

    // 获取内容长度用于计算进度
    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);

    // 获取响应体
    const reader = response.body.getReader();
    let receivedLength = 0;
    let chunks = [];

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        chunks.push(value);
        receivedLength += value.length;

        // 更新进度条
        if (total) {
            const percent = Math.round((receivedLength / total) * 100);
            console.log(`下载进度${percent}%`)
        }
    }

    // 合并所有chunks
    return new Blob(chunks);
}


class LepiDifyLLM extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.response = null
        this.runtime = runtime;
        this.payload = {
        }
        this.headers = {
            'Content-Type': 'application/json'
        }
        this.url = "https://agent.jsaiot.com/v1"
        this.key = "app-iuIBkCYdP1dJPlIvzVeGTMEx"
        // this.key = ''
        this.user_id = "user-123"
        this.conversation_id = ""
        this.headers['Authorization'] = `Bearer ${this.key}`
        this.response = ''
        this.responseFiles = []
        this.responseFinished = false
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
            id: 'lepiDifyLLM',
            name: formatMessage({
                id: 'lepi.lepiDifyLLM',
                default: 'Dify智能体',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: "setServerApi",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "https://agent.jsaiot.com/v1",
                        },
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: "app-...",
                        },
                        ID: {
                            type: ArgumentType.STRING,
                            defaultValue: "user-123",
                        },
                    },
                    text: formatMessage({
                        id: 'lepi.setServerApi',
                        default: '设置API服务器地址[URL] 密钥[KEY] 用户ID[ID]',
                    }),
                },
                {
                    opcode: "sendChatMessage",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MSG: {
                            type: ArgumentType.STRING,
                            defaultValue: `你好`,
                        },
                    },
                    text: formatMessage({
                        id: 'lepi.sendChatMessage',
                        default: '发送消息[MSG]',
                    }),
                },
                {
                    opcode: "uploadImageAndQeury",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        IMAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: ``,
                        },
                        MSG: {
                            type: ArgumentType.STRING,
                            defaultValue: `你好`,
                        },
                    },
                    text: formatMessage({
                        id: 'lepi.uploadImageAndQeury',
                        default: '上传图片[IMAGE]并发送消息[MSG]',
                    }),
                },
                // {
                //     opcode: "uploadFileAndQeury",
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         MSG: {
                //             type: ArgumentType.STRING,
                //             defaultValue: `你好`,
                //         },
                //     },
                //     text: formatMessage({
                //         id: 'lepi.uploadFileAndQeury',
                //         default: '上传文件并发送消息[MSG]',
                //     }),
                // },

                {
                    opcode: 'isResponseFinished',
                    text: formatMessage({
                        id: 'lepi.isResponseFinished',
                        default: '回复完成？',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'getResponseContent',
                    text: formatMessage({
                        id: 'lepi.getResponseContent',
                        default: '回复内容',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'imageURL',
                    text: formatMessage({
                        id: 'lepi.imageURL',
                        default: '图片链接',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'fileList',
                    text: formatMessage({
                        id: 'lepi.fileList',
                        default: '文件列表',
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
    setServerApi(args) {
        const url = Cast.toString(args.URL);
        const key = Cast.toString(args.KEY);
        const id = Cast.toString(args.ID);
        this.url = url;
        this.key = key;
        this.headers['Authorization'] = `Bearer ${this.key}`
        this.user_id = id;
        this.conversation_id = ''
    }

    async handleEventStream(res) {
        console.log(res)
        const reader = res.body.getReader();//获取ReadableStream
        const decoder = new TextDecoder(); //将Uint8Array解码

        let done = false;
        let buffer = ''
        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
                let line = decoder.decode(value, { stream: true });
                buffer += line
                let json = extractFirstJSON(buffer)
                while (json.end != 0) {
                    try {
                        let str = buffer.substring(json.start, json.end)
                        console.log(str, json.start, json.end)
                        buffer = buffer.slice(json.end)
                        json = extractFirstJSON(buffer)
                        let msg = JSON.parse(str)
                        if (msg.event == 'message') {
                            this.response += msg.answer
                        }
                        if (msg.event == 'message_end') {
                            this.conversation_id = msg.conversation_id
                            this.responseFiles = msg.files
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }

            }
        }
        this.responseFinished = true
    }

    sendChatMessage(args) {
        let query = args.MSG.trim()
        this.responseFinished = false
        if (query.length > 0) {
            let data = {
                "inputs": {},
                "query": query,
                "response_mode": "streaming",
                "conversation_id": this.conversation_id,
                "user": this.user_id,
            }
            this.response = ''
            this.responseFiles = []
            fetch(`${this.url}/chat-messages`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            }).then((res) => this.handleEventStream(res)).catch(error => {
                console.log('error', error)
                this.response = ''
            })

        }
    }

    async uploadImageAndQeury(args) {
        let image = args.IMAGE.trim()
        let query = args.MSG.trim()
        this.responseFinished = false
        if (query.length > 0 && image.length > 0) {
            if (image.indexOf('http') == 0) {
                let blob = await fetchBlob(image)
                this.uploadBlobAndQuery(blob, query)
                // let data = {
                //     "files": [
                //         {
                //             "type": "image",
                //             "transfer_method": "remote_url",
                //             "url": image,
                //             "upload_file_id": ""
                //         }
                //     ],
                //     "inputs": {},
                //     "query": query,
                //     "response_mode": "streaming",
                //     "conversation_id": this.conversation_id,
                //     "user": this.user_id,
                // }
                // this.response = ''
                // this.responseFiles = []

                // fetch(`${this.url}/chat-messages`, {
                //     method: 'POST',
                //     headers: this.headers,
                //     body: JSON.stringify(data)
                // }).then(this.handleEventStream.bind(this)).catch(error => {
                //     console.log('error', error)
                //     this.response = ''
                // })
            } else if (image.indexOf('data:image/') == 0) {

                let blob = base64ToBlob(image)

                this.uploadBlobAndQuery(blob, query)

            }
        }
    }

    uploadBlobAndQuery(blob, query) {
        // 创建 FormData
        const formData = new FormData();
        formData.append('file', blob, 'test.png');
        formData.append("user", this.user_id);

        // 使用 fetch 发送请求
        fetch(`${this.url}/files/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.key}` },
            body: formData
        })
            .then(response => response.json())
            .then(info => {
                console.log('上传成功:', info);
                let data = {
                    "files": [
                        {
                            "type": "image",
                            "transfer_method": "local_file",
                            "url": "",
                            "upload_file_id": info.id
                        }
                    ],
                    "inputs": {},
                    "query": query,
                    "response_mode": "streaming",
                    "conversation_id": this.conversation_id,
                    "user": this.user_id,
                }
                this.response = ''
                this.responseFiles = []

                fetch(`${this.url}/chat-messages`, {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify(data)
                }).then(this.handleEventStream.bind(this)).catch(error => {
                    console.log('error', error)
                    this.response = ''
                })

            })
            .catch((error) => {
                console.error('上传失败:', error);
            });
    }

    uploadFileAndQeury(args) {
        let file = {
            "id": "c0b709f8-7a86-40de-81b5-6534ac13cb8f",
            "name": "1_EYFejGUjvjPcc4PZTwoufw.jpeg",
            "size": 160514,
            "extension": "jpeg",
            "mime_type": "image\/jpeg",
            "created_by": "a6e12702-6e14-4953-871c-d4cc8eefdc18",
            "created_at": 1762509398,
            "preview_url": null
        }

        let query = args.MSG.trim()
        this.responseFinished = false
        if (query.length > 0) {
            let data = {
                "files": [
                    {
                        "type": "image",
                        "transfer_method": "local_file",
                        "url": "",
                        "upload_file_id": "4b4c42e2-8584-4e9f-997c-58fa97023960"
                    }
                ],
                "inputs": {},
                "query": query,
                "response_mode": "streaming",
                "conversation_id": this.conversation_id,
                "user": this.user_id,
            }
            this.response = ''
            this.responseFiles = []

            fetch(`${this.url}/chat-messages`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            }).then(this.handleEventStream.bind(this)).catch(error => {
                console.log('error', error)
                this.response = ''
            })

        }

    }

    isResponseFinished(args, util) {
        return this.responseFinished == true
    }

    getResponseContent(args, util) {
        if (typeof this.response == 'string') {
            return this.response
        } else if (typeof this.response == 'object') {
            return JSON.stringify(this.response)
        } else {
            return ''
        }
    }

    imageURL() {
        let images = this.responseFiles.filter(item => item.type == 'image')
        if (images.length > 0) {
            return images[0].url
        } else {
            return ''
        }
    }

    fileList(args, util) {
        let files = this.responseFiles.map(item => {
            return {
                "type": item.type,
                "transfer_method": item.transfer_method,
                "remote_url": item.remote_url,
                "filename": item.filename,
                "extension": item.extension,
                "mime_type": item.mime_type,
                "size": item.size,
                "url": item.url
            }
        })
        return JSON.stringify(files)
    }
}

module.exports = LepiDifyLLM;