const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

// const axios = require('axios').default;


/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAMtSURBVFhH7ZZbSFRRFIb/M86M4/0yjpeJUimzQi0EzSCFYvKSXaR6qPDB6AKVgUj1kAZFPSQoFUFG9FCRhQhFVE+RDyGBDBYIRpqF1YM6Nd7G0Zx0VuvsiQIxm5lzBKH5Yc3ea7PXOt/es8/ZS6IxEBaxNL/aRasAoFIFAJUqAKhUAUCl+s8AJbYgT1ctqQcow7HZBvhH5xlSQ+oBhgMVB6ORtNwEGNiXgVWQOoB6oL8XuNM8ibTUMFysZUIGVkPqlFsRwOpkPXbvO4ATVZVITMoCjXNaeRdnPFP8lXJA3qlH93XYVf4DRJ5UpYXrOXEnnj7/DjjEkN9SBijvEAPqpSDcbarH3v1VnnEagqQx4l2HBukZbmDKM+yPlJ1Bhjt/Wg+zKVbAXW04g2QTU0uxOFd7GFtKteJ8KpK8g36ZEzQzLHafurtf8L9L9LrjIR09slH0ZfH66cGtYLk3dw4vzH9ADi3apKWdxRsEjCxzrE4A32w8K/xnT66zr+Uez3fMivfS/AOcAnW1awQMO2S3f6CC3HjaU7aO4qMjaJtljQCUtSplKZ08ZuDerBxemn+AHJYQp6OGuhqadNpp2P5ewORmLaNUcxS9bK0Xfm/3Kxoa6hELmbBx3MSsPF6Y74Ac0nRDT+G6aOr72Ma+UwC0t7UwXCSVWHJpqyWHvnyyUmiQPN9NFeU7KD8vRMTOmXMe8w1wnI1DuCKgDutjMgaDRkf6qO5CNeWtDSNLQRplrkykws1mylyRQJ/72ik7I4FjOIoXYW3l8yh/LufK/RfzDZCnVx/X825kiocODnTS9pJs0S/ISRVtWVE+fbVZ6crlGurv76JD5cVEM6PU0txIcTE6njFH3nnM+w81l1GOEQmRS5KQnqJFkGYSWl0IjHHpsA32ID4hGfZvdsTExmB0xAaDIQQu1zTCwqMw7hjlBGN489aFa5eGUXnKBTg9af8l324S/ujeux0Mt9vNAG5eovwauyFJEreeNKKIYf+35HH2Jb4TpklCkWUaRhOPeXlH+37VhbLJz/ct6o/ka8+HAkJ5sbDAUrfkXwAFAJUqAKhUAUClCgAq1SIHBH4CS5yFQixuY8IAAAAASUVORK5CYII='
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQzkxNUQ4RDlFNUQxMUVBOTNBQkUxQkVBQUU5NjcwNSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQzkxNUQ4QzlFNUQxMUVBOTNBQkUxQkVBQUU5NjcwNSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjOTQ2MmUyLTIwMDYtNDQyYi05Y2EwLWZlOTMyYTgzZDcxNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpkYWJmYjkwNy0zN2YxLTQ2OTktOGJkMi1mMjdjZmVjMjRlMWIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5XxQGFAAADN0lEQVRYR+2WXUhTYRjH/+fs7MO5udQZhdICkViFFBQlJWFd1Igggq66ikFf1k1EXVU3WTdBFBVE0YU3QUFF4YWBSgSKepNZifYhUlvZh+zMj82dbafnfT3TdNPNjoLQ+cHYeM7Zzu99vpjgarqqYgkjau9LFkNQL4agXgxBvRiCejEE9fJ/C44n45CVCGLJhBaZPwsiOE4CcjQMOSJPvcaGsMZejBebDmFVXsE/S+r+uxVNxFFqc+JT9Qktks4ACa9+eR0uS74WyZ1ZBZOqiuH4OKDSyQUTHJIFJmF6wvk9sVGovot4O/ITZ3qb4DRZ+LUolXff8gocKdvI49cG2uGUrPzafMgoyB9MvXPD60NNsQcdchD+dw1wmMyTkirdE6ayNlf5UVPkgdBYB1EQph1CIUkkkxBNUpocO7xE99pECQJ9bzbSBPmDKSvvq2vhdbi1KPA7FoG78RJgyZsIxGPwe7bg3vq9KH91G5+HBwE6QE7Qdy9796BNDuB5sBsS/aZdNGcUTRNUqJlXWp34WH1ci0zx7EcfwokYTZaASEKBv2wDfsXG8PB7DwrNNn6PQi2RoENaWWZ4JB1Wfp+7HCusDsiUybN9TagnUQu10kzJNEE2bR5bAXq2H9MiU/RHQvx66idGSZKVNY9kGIqaxDpHCf/cHgpMSs+E3VdhL4JFNGGUsnnuQwvuB7pgppJnFUyVOLjzNM9kCiZmbTgPSJkfyqHsleW78WXHKZzsacStvhZqCbt28S+oCnVrfeiUv+Fp8A0kM5WY2iOnEjMSdEKWnQeV+1FTSEMSDuJg12OYqLiSOPfqlKlXaz2bcdO7G5Wtd9FN080GgRGlwaMMUK9KlHmRDxTL/ryGJAWTHGFrhi1Y6o18s5VPXTZS09267SiqlpXyAWLZCSlRdG49zPvuyWAvDrx+BBdlLhuzCuqBH44yqfouaJHpNA8NYFdHPS3uDOWfwaIIMuK0/+Ik6qL9lwRb+jHcob4rIanW0Fdc6W+j3Tix1Odi0QQZbOEzuRRsYlkPijS9ucgxsjeVDtgKYn2berlo7bhoKecqx1hUwYXAENSLIagXQ1AvhqBeDEG9LHFB4A/z2FXZj/dFBgAAAABJRU5ErkJggg=='
// const menuIconURI = blockIconURI;

const portMap = {
    "/dev/ttyACM2": "S1",
    "/dev/ttyACM1": "S2",
    "/dev/ttyAMA4": "S3",
    "/dev/ttyAMA2": "S4",
    "/dev/ttyAMA0": "S5",
}

class LepiSerial extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.devices = {}
        this.serials = []
        this.runtime = runtime;
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.updateDeviceList()
            this.updateSerialList()
        } else {
            this.runtime.on('LEPI_CONNECTED', () => {
                console.log('LEPI_CONNECTED', 'updateDeviceList')
                this.updateDeviceList()
                this.updateSerialList()
            })
        }

    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'lepiSerial',
            name: formatMessage({
                id: 'lepi.lepiSerial',
                default: '串口通信',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                // {
                //     opcode: 'updateDeviceList',
                //     text: formatMessage({
                //         id: 'lepi.updateDeviceList',
                //         default: '更新设备列表',
                //     }),
                //     blockType: BlockType.COMMAND,
                // },
                {
                    opcode: 'updateSerialList',
                    text: formatMessage({
                        id: 'lepi.updateSerialList',
                        default: '更新串口列表',
                    }),
                    blockType: BlockType.COMMAND,
                },
                // {
                //     opcode: 'toggleListening',
                //     text: formatMessage({
                //         id: 'lepi.toggleListening',
                //         default: '[TOGGLE] 蓝牙监听模式',
                //     }),
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         TOGGLE: {
                //             type: ArgumentType.STRING,
                //             menu: 'toggle'
                //         }
                //     }
                // },
                // {
                //     opcode: 'bindDeviceMac',
                //     text: formatMessage({
                //         id: 'lepi.bindDeviceMac',
                //         default: '绑定地址 [MAC] 到端口 [PORT]',
                //     }),
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         MAC: {
                //             type: ArgumentType.STRING,
                //             defaultValue: '-'
                //         },
                //         PORT: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0
                //         }
                //     }
                // }, 
                // {
                //     opcode: 'bindDevice',
                //     text: formatMessage({
                //         id: 'lepi.bindDevice',
                //         default: '绑定设备 [NAME] 到端口 [PORT]',
                //     }),
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         NAME: {
                //             type: ArgumentType.STRING,
                //             menu: 'deviceList',
                //         },
                //         PORT: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0,
                //         },
                //     }
                // }, 
                {
                    opcode: 'connectDevice',
                    text: formatMessage({
                        id: 'lepi.connectDevice',
                        default: '连接串口 [PORT], 波特率[BAUDRATE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'serialList',
                        },
                        BAUDRATE: {
                            type: ArgumentType.STRING,
                            menu: 'baudRates',
                            defaultValue: '9600',
                        },
                    }
                },
                {
                    opcode: 'deviceConnected',
                    text: formatMessage({
                        id: 'lepi.deviceConnected',
                        default: '串口 [PORT] 已连接?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'serialList',
                        }
                    }
                },

                {
                    opcode: 'disconnectDevice',
                    text: formatMessage({
                        id: 'lepi.disconnectDevice',
                        default: '断开连接 [PORT]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'serialList',
                        }
                    }
                },
                {
                    opcode: 'sendData',
                    text:
                        '向串口 [PORT] 发送文本 [DATA], [NEWLINE]',
                    // formatMessage({
                    //     id: 'lepi.sendData',
                    //     default: '向串口 [PORT] 发送文本数据 [DATA], [NEWLINE]',
                    // }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'serialList',
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ABC',
                        },
                        NEWLINE: {
                            type: ArgumentType.STRING,
                            menu: 'newline',
                            defaultValue: '\n'
                        }
                    }
                },
                {
                    opcode: 'sendBytes',
                    text: formatMessage({
                        id: 'lepi.sendBytes',
                        default: '向串口 [PORT] 发送字节数组 [DATA]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'serialList',
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '[65, 66, 67]',
                        }
                    }
                },
                {
                    opcode: 'receiveData',
                    text: formatMessage({
                        id: 'lepi.receiveData',
                        default: '接收串口 [PORT] 文本, 长度 [COUNT]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'serialList',
                        },
                        COUNT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        }
                    }
                },
                {
                    opcode: 'receiveBytes',
                    text: formatMessage({
                        id: 'lepi.receiveBytes',
                        default: '接收串口 [PORT] 字节数组, 长度 [COUNT]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'serialList',
                        },
                        COUNT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        }
                    }
                },
                {
                    opcode: 'clearFlush',
                    text: formatMessage({
                        id: 'lepi.clearFlush',
                        default: '清空串口 [PORT] 缓冲区数据',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'serialList',
                        },
                    }
                },
                {
                    opcode: 'toggleUSBSwitch',
                    text: formatMessage({
                        id: 'lepi.toggleUSBSwitch',
                        default: '[TOGGLE] USB开关',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TOGGLE: {
                            type: ArgumentType.STRING,
                            menu: 'toggle',
                        },
                    }
                },
                {
                    opcode: 'readSoilTHSensor',
                    text: formatMessage({
                        id: 'lepi.readSoilTHSensor',
                        default: '读取土壤温湿度传感器数据',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                {
                    opcode: 'getSoilTHSensorData',
                    text: formatMessage({
                        id: 'lepi.getSoilTHSensorData',
                        default: '土壤 [TH]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TH: {
                            type: ArgumentType.STRING,
                            menu: 'th',
                        },
                    }
                },
            ],
            menus: {
                deviceList: 'formatDeviceList',
                serialList: 'formatSerialList',
                baudRates: {
                    acceptReporters: true,
                    items: [
                        '300', '600', '1200', '2400', '4800',
                        '9600', '14400', '19200', '28800', '38400',
                        '57600', '115200', '230400', '460800', '921600'
                    ]
                },
                toggle: Menu.formatMenu([formatMessage({
                    id: 'lepi.close',
                    default: '关闭',
                }), formatMessage({
                    id: 'lepi.open',
                    default: '打开',
                })]),
                newline: {
                    acceptReporters: false,
                    items: [
                        { text: '不带换行', value: '' },
                        { text: '带换行符\\n', value: '\n' },
                        { text: '带换行符\\r', value: '\r' },
                        { text: '带换行符\\r\\n', value: '\r\n' },
                    ]
                },
                th: Menu.formatMenu2(['温度', '湿度'])
            },
        };
    }

    updateDeviceList() {
        const url = `http://${this.runtime.ros.ip}:8000/bluetooth/devices`

        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(url), 'GET', '{}').then(data => {
                this.devices = JSON.parse(data)
                resolve(data)
            }).catch(error => {
                console.log('error', error)
                this.devices = []
                resolve('请求出错')
            })
        })

        return new Promise(resolve => {
            axios.get(url).then(res => {
                this.devices = res.data
                resolve()
            })
        })
    }
    updateSerialList() {
        const url = `http://${this.runtime.ros.ip}:8000/serial/list`
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(url), 'GET', '{}').then(data => {
                let serials = JSON.parse(data)

                this.serials = serials
                resolve(data)
            }).catch(error => {
                console.log('error', error)
                this.serials = []
                resolve('请求出错')
            })
        })
        return new Promise(resolve => {
            axios.get(url).then(res => {
                this.serials = res.data
                resolve()
            })
        })
    }
    formatDeviceList() {
        const devices = Object.keys(this.devices)
        const names = devices.map(device => `${this.devices[device].name}(${device})`)
        return Menu.formatMenu3(names, devices)
    }
    formatSerialList() {
        let values = this.serials.map(serial => `${serial.path}`)
        let index = values.indexOf("/dev/ttyACM0");
        if (index > -1) {
            values.splice(index, 1); // 第二个参数为删除的次数，设置只删除一次
        }
        index = values.indexOf("/dev/ttyAMA10");
        if (index > -1) {
            values.splice(index, 1); // 第二个参数为删除的次数，设置只删除一次
        }
        let labels = values.map(value => `${portMap[value] || value}`)
        return Menu.formatMenu3(labels, values)
    }
    bindDevice(args, util) {
        var device = args.NAME
        var port = args.PORT
        const URL = `http://${this.runtime.ros.ip}:8000/serial/bind?mac=${encodeURI(device)}&id=${encodeURI(port)}`

        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(URL), 'GET', '{}').then(res => {
                resolve('已执行')
            }).catch(error => {
                console.log('error', error)
                resolve('请求出错')
            })
        })

        return new Promise(resolve => {
            axios.get(URL).then(response => {
                console.log('response', response)
                this.runtime.emit('SAY', util.target, 'say', '已执行');
                resolve()
            }).catch(error => {
                console.log('error', error)
                this.runtime.emit('SAY', util.target, 'say', '执行失败');
                resolve()
            })
        })
    }
    bindDeviceMac(args, util) {
        var device = args.MAC
        var port = args.PORT
        const URL = `http://${this.runtime.ros.ip}:8000/serial/bind?mac=${encodeURI(device)}&id=${encodeURI(port)}`
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(URL), 'GET', '{}').then(res => {
                resolve('已执行')
            }).catch(error => {
                console.log('error', error)
                resolve('请求出错')
            })
        })
        return new Promise(resolve => {
            axios.get(URL).then(response => {
                console.log('response', response)
                this.runtime.emit('SAY', util.target, 'say', '已执行');
                resolve()
            }).catch(error => {
                console.log('error', error)
                this.runtime.emit('SAY', util.target, 'say', '执行失败');
                resolve()
            })
        })
    }
    async connectDevice(args, util) {
        var port = args.PORT
        var baudrate = parseInt(args.BAUDRATE)
        const URL = `http://${this.runtime.ros.ip}:8000/serial/connect?name=${encodeURI(port)}&baudrate=${baudrate}`
        if (portMap[args.PORT]) {
            await this.runtime.ros.disableSensorPort(portMap[args.PORT])

        }
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(URL), 'GET', '{}').then(res => {
                resolve('已执行')
            }).catch(error => {
                console.log('error', error)
                resolve('请求出错')
            })
        })
        return new Promise(resolve => {
            axios.get(URL).then(response => {
                console.log('response', response)
                this.runtime.emit('SAY', util.target, 'say', '已执行');
                resolve()
            }).catch(error => {
                console.log('error', error)
                this.runtime.emit('SAY', util.target, 'say', '执行失败');
                resolve()
            })
        })
    }

    async disconnectDevice(args, util) {
        var port = args.PORT
        const URL = `http://${this.runtime.ros.ip}:8000/serial/disconnect?name=${encodeURI(port)}`
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(URL), 'GET', '{}').then(async (res) => {
                if (portMap[args.PORT]) {
                    await this.runtime.ros.enableSensorPort(portMap[args.PORT])
                }
                resolve('已执行')
            }).catch(error => {
                console.log('error', error)
                resolve('请求出错')
            })
        })
        return new Promise(resolve => {
            axios.get(URL).then(response => {
                console.log('response', response)
                this.runtime.emit('SAY', util.target, 'say', '已执行');
                resolve()
            }).catch(error => {
                console.log('error', error)
                this.runtime.emit('SAY', util.target, 'say', '执行失败');
                resolve()
            })
        })
    }
    sendData(args, util) {
        var port = args.PORT
        var data = args.DATA + args.NEWLINE
        const URL = `http://${this.runtime.ros.ip}:8000/serial/send?name=${encodeURI(port)}&data=${data}`
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(URL), 'GET', '{}').then(res => {
                resolve('已执行')
            }).catch(error => {
                console.log('error', error)
                resolve('请求出错')
            })
        })
        return new Promise(resolve => {
            axios.get(URL).then(response => {
                console.log('response', response)
                this.runtime.emit('SAY', util.target, 'say', '已执行');
                resolve()
            }).catch(error => {
                console.log('error', error)
                this.runtime.emit('SAY', util.target, 'say', '执行失败');
                resolve()
            })
        })
    }
    sendBytes(args, util) {
        var port = args.PORT
        var data = args.DATA
        const URL = `http://${this.runtime.ros.ip}:8000/serial/sendBytes?name=${encodeURI(port)}&data=${data}`
        let param = {
            name: port,
            data: data
        }
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(URL), 'POST', JSON.stringify(param)).then(res => {
                resolve(JSON.parse(res))
            }).catch(error => {
                console.log('error', error)
                resolve({ code: -99, msg: '请求出错' })
            })
        })
    }
    receiveData(args, util) {
        var port = args.PORT
        var count = parseInt(args.COUNT)
        const URL = `http://${this.runtime.ros.ip}:8000/serial/receive?name=${encodeURI(port)}&count=${count}`
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(URL), 'GET', '{}').then(result => {
                const data = JSON.parse(result)
                resolve(data.value)
            }).catch(error => {
                console.log('error', error)
                resolve('')
            })
        })
        return new Promise(resolve => {
            axios.get(URL).then(response => {
                console.log('response', response)
                this.runtime.emit('SAY', util.target, 'say', '已执行');
                resolve(response.data.value)
            }).catch(error => {
                console.log('error', error)
                this.runtime.emit('SAY', util.target, 'say', '执行失败');
                resolve('')
            })
        })
    }
    receiveBytes(args, util) {
        var port = args.PORT
        var count = parseInt(args.COUNT)
        const URL = `http://${this.runtime.ros.ip}:8000/serial/receiveBytes?name=${encodeURI(port)}&count=${count}`
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(URL), 'GET', '{}').then(result => {
                const data = JSON.parse(result)
                resolve(data.value)
            }).catch(error => {
                console.log('error', error)
                resolve('')
            })
        })
    }
    clearFlush(args, util) {
        var port = args.PORT
        const URL = `http://${this.runtime.ros.ip}:8000/serial/clearFlush?name=${encodeURI(port)}`
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(URL), 'GET', '{}').then(result => {
                resolve('已执行')
            }).catch(error => {
                console.log('error', error)
                resolve('')
            })
        })
    }
    bindDeviceMac(args, util) {
        var device = args.MAC
        var port = args.PORT
        const URL = `http://${this.runtime.ros.ip}:8000/serial/bind?mac=${encodeURI(device)}&id=${encodeURI(port)}`
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(URL), 'GET', '{}').then(res => {
                resolve('')
            }).catch(error => {
                console.log('error', error)
                resolve('')
            })
        })
        return new Promise(resolve => {
            axios.get(URL).then(response => {
                console.log('response', response)
                this.runtime.emit('SAY', util.target, 'say', '已执行');
                resolve()
            }).catch(error => {
                console.log('error', error)
                this.runtime.emit('SAY', util.target, 'say', '执行失败');
                resolve()
            })
        })
    }
    toggleListening(args, util) {
        var value = parseInt(args.TOGGLE)
        console.log(value)
        const SERVER_URL = `http://${this.runtime.ros.ip}:8000`
        return new Promise((resolve) => {
            if (value == 1) {
                return new Promise(resolve => {
                    this.runtime.ros.proxyPost(encodeURI(`${SERVER_URL}/serial/startListening`), 'GET', '{}').then(res => {
                        resolve('已执行')
                    }).catch(error => {
                        console.log('error', error)
                        resolve('')
                    })
                })
                axios.get(`${SERVER_URL}/serial/startListening`).then(res => {
                    const data = res.data
                    console.log(data)
                    resolve('已执行')
                })
            } else {
                return new Promise(resolve => {
                    this.runtime.ros.proxyPost(encodeURI(`${SERVER_URL}/serial/stopListening`), 'GET', '{}').then(res => {
                        resolve('已执行')
                    }).catch(error => {
                        console.log('error', error)
                        resolve('')
                    })
                })
                axios.get(`${SERVER_URL}/serial/stopListening`).then(res => {
                    const data = res.data
                    console.log(data)
                    resolve('已执行')
                })
            }
        })
    }

    deviceConnected(args, util) {
        var device = args.PORT
        const SERVER_URL = `http://${this.runtime.ros.ip}:8000`
        return new Promise(resolve => {
            this.runtime.ros.proxyPost(encodeURI(`${SERVER_URL}/serial/connected?name=${device}`), 'GET', '{}').then(result => {
                const data = JSON.parse(result)
                console.log(data)
                resolve(data && data.code == 0)
            }).catch(error => {
                console.log('error', error)
                resolve('')
            })
        })
        return new Promise((resolve) => {
            axios.get(`${SERVER_URL}/serial/connected?name=${device}`).then(res => {
                const data = res.data
                console.log(data)
                resolve(data && data.code == 0)
            })
        })
    }

    async sendToggleSwitchData(port, action) {
        await this.connectDevice({ PORT: port, BAUDRATE: 9600 })
        let result = {}
        if (action == 0) {
            result = await this.sendBytes({ PORT: port, DATA: '[160, 1, 2, 163]' })
        } else {
            result = await this.sendBytes({ PORT: port, DATA: '[160, 1, 3, 164]' })
        }
        await this.disconnectDevice({ PORT: port })
        return result
    }

    async toggleUSBSwitch(args) {
        let action = parseInt(args.TOGGLE)
        await this.updateSerialList()
        let port = this.serials.filter(item => item.vendorId == "1a86" && item.productId == "5523")
        if (port.length > 0) {
            let result = await this.sendToggleSwitchData(port[0].path, action)
            let count = 5
            while (count > 0) {
                count--
                if (result.code != 0) {
                    result = await this.sendToggleSwitchData(port[0].path, action)
                } else {
                    break
                }
            }

        }
    }
    async readSoilTHSensor(args) {
        await this.updateSerialList()
        let port = this.serials.filter(item => item.vendorId == "1a86" && item.productId == "7523")
        this.soil_humidity = ''
        this.soil_temperature = ''
        if (port.length > 0) {
            await this.connectDevice({ PORT: port[0].path, BAUDRATE: 4800 })
            await this.sendBytes({ PORT: port[0].path, DATA: '[1, 3, 0, 0, 0, 3, 5, 203]' })
            let value = JSON.parse(await this.receiveBytes({ PORT: port[0].path, COUNT: 11 }))
            let count = 10
            while (count > 0) {
                if (value.length == 0) {
                    value = JSON.parse(await this.receiveBytes({ PORT: port[0].path, COUNT: 11 }))
                    count--
                }
                if (value.length == 11) {
                    this.soil_humidity = (value[3] * 256 + value[4]) / 10
                    this.soil_temperature = (value[5] * 256 + value[6]) / 10
                    break
                }
            }

            await this.disconnectDevice({ PORT: port[0].path })
        }
    }

    getSoilTHSensorData(args) {
        if (args.TH == '温度') {
            return this.soil_temperature
        } else if (args.TH == '湿度') {
            return this.soil_humidity
        }
    }
}


module.exports = LepiSerial;