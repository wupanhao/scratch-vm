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
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQzkxNUQ4RDlFNUQxMUVBOTNBQkUxQkVBQUU5NjcwNSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQzkxNUQ4QzlFNUQxMUVBOTNBQkUxQkVBQUU5NjcwNSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjOTQ2MmUyLTIwMDYtNDQyYi05Y2EwLWZlOTMyYTgzZDcxNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpkYWJmYjkwNy0zN2YxLTQ2OTktOGJkMi1mMjdjZmVjMjRlMWIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5XxQGFAAADWklEQVRYR+2Yy0tUURzHv/N0RudFDy2txCRNymyjohChLmYhRQUFbVxEEVQULVqUbapV4c4KCob+gCCCiKmFSERYtKikspCoAaWHkzbNOM/76HeOd7AGW3jOKVz4Abn3ntE7H36/8zu/c7QFhwZMLGHs1nXJsiwoi1JB0zT5j0qUCTKxvKmjYBpKJZUJpo0C+qqbcaimBWm9YI3Ko0SQRUzLZ3CloQeXN3VBK2SURVGJYNbQsIuiF3SWocLpxp7qbcjQmAqUCGo07zqCNfiSSyFv6GgNroVOYwmKZCKfRlLLW7+5eJQI+ily58YeIBr/gPH0NPrfRmGQ4J3t+zHU1oezdR3CksqKBJRaj90Jl41e6XADuoa9VY3oXlGLztA6GBRZEdQJlmKz8ZQzpijN7FkEYUE21xL5WUpdzhr5E4/Li9ant/j9UUo5Kx4RhASZ3AZvAJ92nsLp2va/SoZcHn71C8oxhAQzeh6Dm8Oo9QYx0NgDg+ZbKWzpKS7YdoillyEk6HG4cOb9EL+/OfGC3lLyGppzzb7V+LDjGH9MUIRFJYUEy6haX01/5Pf3vo3DRc8M1jtmClkcb+jCaOcRjPyYhC16EU6qbPv/LhLYHPzClpYiOUpre6gGV5vCODH2EJ1PbsDn9sJZGuFFIP6XC+CworT+0SCuxZ4j4AnQmNxXSAsmqWBYW2O4KKpvUlOYmI0jSJGzCab1dyRSPPflvIrZzsWqWN5JrPSrQFjQ465A/ePr2ErVaob7sdFfxQtENcKCZXYHJrNJqtILGJ6O8SXlwJomZdusIlJz0ONwwk+R7B6J4PDr+1jlLp9Lt0KkBBlsfWPVGok9Q2TiJSpoEVeJtCCDVyv1W69iOYYSwSJ0nuPdRCVKBPk6SIemAG1U3VQ80LLQjLm1URZpQSaXojUwHj6P3ZUNqPOGkOu9BJ3iyc4qskgLpuisEdnSi5XUOYqwKN5u2YfZwsL7xMUgn2JTR1uw2nqYpy1AY/SZLPKC1NaGv8esh3mGZ2iMzUdJpAXZkfPkWBRjqbg1AnzOJXFw9C589JksSv7DyrpHkg5Q9b5K2izY8C75lfaB5dJbLYb8GwjeTajlscjFsj/5vQo5hpq3EKybuGjOsQpWsQ8sokzwX7EsKAfwC91vJumcJw3DAAAAAElFTkSuQmCC'
const menuIconURI = blockIconURI;

class LepiWebSerial extends EventEmitter {
    constructor(runtime) {

        super();

        this.runtime = runtime;
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.inputBuffer = '';
        this.onDataCallback = null;
        this.isConnected = false;
        this.baudRate = 9600; // 默认波特率
        this.hexMode = false; // 默认文本模式
        this.white_list = []
        this.keepReading = false;

        if (runtime) {
            runtime.registerPeripheralExtension('lepiWebSerial', this);
            // 添加串口状态监控
            this._updateConnectionStatus();
        }
    }

    getInfo() {
        return {
            id: 'lepiWebSerial',
            name: '网页串口',
            // color1: '#4C97FF',
            // color2: '#3373CC',
            menuIconURI: menuIconURI, // 简化的串口图标base64
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: '连接串口设备 波特率 [BAUD]',
                    arguments: {
                        BAUD: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '9600',
                            menu: 'baudRates'
                        }
                    }
                },
                {
                    opcode: 'isSerialConnected',
                    blockType: BlockType.BOOLEAN,
                    text: '已连接?',
                    arguments: {}
                },
                {
                    opcode: 'disconnect',
                    blockType: BlockType.COMMAND,
                    text: '断开串口连接',
                    arguments: {}
                },
                '---', // 分隔线

                {
                    opcode: 'writeText',
                    blockType: BlockType.COMMAND,
                    text: '发送文本 [DATA] [NEWLINE]',
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello'
                        },
                        NEWLINE: {
                            type: ArgumentType.STRING,
                            menu: 'newline',
                            defaultValue: '\n'
                        }
                    }
                },
                {
                    opcode: 'writeBytes',
                    blockType: BlockType.COMMAND,
                    text: '发送字节数组 [DATA]',
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '[72, 101, 108, 108, 111]'
                        }
                    }
                },
                {
                    opcode: 'writeHex',
                    blockType: BlockType.COMMAND,
                    text: '发送十六进制 [HEX]',
                    arguments: {
                        HEX: {
                            type: ArgumentType.STRING,
                            defaultValue: '48 65 6C 6C 6F' // Hello的十六进制
                        }
                    }
                },
                '---', // 分隔线

                {
                    opcode: 'dataAvailable',
                    blockType: BlockType.BOOLEAN,
                    text: '有数据可读?',
                    arguments: {}
                },
                {
                    opcode: 'readLine',
                    blockType: BlockType.REPORTER,
                    text: '读取一行文本 [LINE]',
                    arguments: {
                        LINE: {
                            type: ArgumentType.NUMBER,
                            menu: 'line',
                            defaultValue: '\n'
                        },
                    }
                },
                {
                    opcode: 'readText',
                    blockType: BlockType.REPORTER,
                    text: '读取文本,长度 [BYTES]',
                    arguments: {
                        BYTES: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'readBytes',
                    blockType: BlockType.REPORTER,
                    text: '读取字节数组,长度 [BYTES]',
                    arguments: {
                        BYTES: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },

                {
                    opcode: 'readHex',
                    blockType: BlockType.REPORTER,
                    text: '读取十六进制数据,长度 [BYTES]',
                    arguments: {
                        BYTES: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                // {
                //     opcode: 'onData',
                //     blockType: BlockType.HAT,
                //     text: '当收到数据时',
                //     arguments: {}
                // },

                // {
                //     opcode: 'setHexMode',
                //     blockType: BlockType.COMMAND,
                //     text: '设置十六进制模式 [MODE]',
                //     arguments: {
                //         MODE: {
                //             type: ArgumentType.STRING,
                //             menu: 'hexMode'
                //         }
                //     }
                // },
                {
                    opcode: 'clearBuffer',
                    blockType: BlockType.COMMAND,
                    text: '清空接收缓冲区',
                    arguments: {}
                },
                '---', // 分隔线
                // {
                //     opcode: 'getBaudRate',
                //     blockType: BlockType.REPORTER,
                //     text: '当前波特率',
                //     arguments: {}
                // }
                {
                    opcode: 'view_device_id',
                    blockType: BlockType.REPORTER,
                    text: "查看设备ID",
                },
                {
                    opcode: 'set_white_list',
                    blockType: BlockType.COMMAND,
                    text: "设置白名单[LIST]",
                    arguments: {
                        LIST: {
                            type: ArgumentType.STRING,
                            defaultValue: '[]',
                        },
                    }
                },

            ],
            menus: {
                baudRates: {
                    acceptReporters: true,
                    items: [
                        '300', '600', '1200', '2400', '4800',
                        '9600', '14400', '19200', '28800', '38400',
                        '57600', '115200', '230400', '460800', '921600'
                    ]
                },
                hexMode: {
                    acceptReporters: false,
                    items: [
                        { text: '文本模式', value: 'text' },
                        { text: '十六进制模式', value: 'hex' }
                    ]
                },
                line: {
                    acceptReporters: false,
                    items: [
                        { text: '换行符\\n', value: '\n' },
                        { text: '换行符\\r', value: '\r' },
                        { text: '换行符\\r\\n', value: '\r\n' },
                    ]
                },
                newline: {
                    acceptReporters: false,
                    items: [
                        { text: '不带换行', value: '' },
                        { text: '带换行符\\n', value: '\n' },
                        { text: '带换行符\\r', value: '\r' },
                        { text: '带换行符\\r\\n', value: '\r\n' },
                    ]
                },
            }
        };
    }

    async connect(args) {
        if (this.isConnected) {
            return
        }
        try {
            if (!navigator.serial) {
                throw new Error('WebSerial API not supported in this browser.');
            }
            this.baudRate = Number(args.BAUD) || 9600;

            if (navigator.appVersion && navigator.appVersion.indexOf('lepi-desktop') > 0) {
                let filter = []
                if (this.white_list.length > 0) {
                    filter = this.white_list.map(usbVendorId => {
                        return { usbVendorId }
                    })
                }
                let ports = await navigator.serial.getPorts()
                if (ports.length == 0) {
                    return
                }
                else if (ports.length == 1) {
                    this.port = ports[0]
                } else {
                    if (this.white_list.length > 0) {
                        this.port = ports[0]
                        for (let index = 0; index < ports.length; index++) {
                            const port = ports[index];
                            console.log(port.getInfo())
                            if (this.white_list.indexOf(port.getInfo().usbVendorId) >= 0) {
                                this.port = port
                            }
                        }
                    } else {
                        this.port = ports[0]
                    }

                }
            } else {
                this.port = await navigator.serial.requestPort();
            }

            console.log(this.port)

            await this.port.open({
                baudRate: this.baudRate,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                flowControl: 'none'
            });

            this.writer = this.port.writable.getWriter();
            this.isConnected = true;
            this._updateConnectionStatus();

            // 开始读取数据
            this.keepReading = true;

            this._readLoop();

            return true;
        } catch (error) {
            console.error('Serial connection error:', error);
            this.isConnected = false;
            this.keepReading = false;
            this._updateConnectionStatus();
            return false;
        }
    }

    async disconnect() {
        this.keepReading = false;
        if (this.reader) {
            try {
                await this.reader.cancel();
            } catch (error) {
                // 忽略取消错误
            }
            this.reader = null;
        }

        if (this.writer) {
            try {
                await this.writer.close();
            } catch (error) {
                console.error('Error closing writer:', error);
            }
            this.writer = null;
        }

        if (this.port) {
            try {
                await this.port.close();
            } catch (error) {
                console.error('Error closing port:', error);
            }
            this.port = null;
        }

        this.isConnected = false;
        this._updateConnectionStatus();
    }

    async writeText(args) {
        if (!this.isConnected || !this.writer) return;

        try {
            const data = args.DATA + args.NEWLINE; // 添加换行符
            const encoder = new TextEncoder();
            await this.writer.write(encoder.encode(data));
        } catch (error) {
            console.error('Write error:', error);
            this.disconnect();
        }
    }

    async writeBytes(args) {
        if (!this.isConnected || !this.writer) return;

        try {
            const data = JSON.parse(args.DATA); // 添加换行符
            await this.writer.write(Uint8Array.from(data));
        } catch (error) {
            console.error('Write error:', error);
            this.disconnect();
        }
    }

    async writeHex(args) {
        if (!this.isConnected || !this.writer) return;

        try {
            const hexStr = args.HEX.replace(/\s+/g, '');
            if (hexStr.length % 2 !== 0) {
                throw new Error('Hex string length must be even');
            }

            const bytes = [];
            for (let i = 0; i < hexStr.length; i += 2) {
                const byte = parseInt(hexStr.substr(i, 2), 16);
                if (isNaN(byte)) {
                    throw new Error('Invalid hex string');
                }
                bytes.push(byte);
            }

            await this.writer.write(new Uint8Array(bytes));
        } catch (error) {
            console.error('Hex write error:', error);
            this.disconnect();
        }
    }

    dataAvailable() {
        return this.inputBuffer.length > 0;
    }

    readLine(args) {
        if (!this.dataAvailable()) return '';
        let line = ''
        const newlineIndex = this.inputBuffer.indexOf(args.LINE);
        if (newlineIndex === -1) {
            // line = this.inputBuffer;
            // this.inputBuffer = '';
        } else {
            line = this.inputBuffer.substring(0, newlineIndex);
            this.inputBuffer = this.inputBuffer.substring(newlineIndex + args.LINE.length);
        }
        return line
    }

    readText(args) {
        let line = ''
        let len = parseInt(args.BYTES)
        if (len == 0) {
            line = this.inputBuffer;
            this.inputBuffer = '';
        } else if (this.inputBuffer.length >= len) {
            line = this.inputBuffer.substring(0, len);
            this.inputBuffer = this.inputBuffer.substring(len);
        }
        return line
    }

    readBytes(args) {
        let line = ''
        let len = parseInt(args.BYTES)
        if (len == 0) {
            line = this.inputBuffer;
            this.inputBuffer = '';
        } else if (this.inputBuffer.length >= len) {
            line = this.inputBuffer.substring(0, len);
            this.inputBuffer = this.inputBuffer.substring(len);
        }
        let encoder = new TextEncoder('utf8');
        return JSON.stringify(Array.from(encoder.encode(line)));
    }

    readHex(args) {
        if (!this.dataAvailable()) return '';
        let line = ''
        let len = parseInt(args.BYTES)
        if (len == 0) {
            line = this.inputBuffer;
            this.inputBuffer = '';
        } else if (this.inputBuffer.length >= len) {
            line = this.inputBuffer.substring(0, len);
            this.inputBuffer = this.inputBuffer.substring(len);
        }
        if (line.length > 0) {
            let encoder = new TextEncoder('utf8');
            const view = encoder.encode(line);
            console.log(line, view)
            const result = [];
            for (let i = 0; i < line.length; i++) {
                result.push(view[i].toString(16).padStart(2, '0'));
            }

            return result.join(' ');
        } else {
            return ''
        }

    }

    onData() {
        return this.dataAvailable();
    }

    isSerialConnected() {
        return this.isConnected;
    }

    setHexMode(args) {
        this.hexMode = args.MODE === 'hex';
    }

    clearBuffer() {
        this.inputBuffer = '';
    }

    getBaudRate() {
        return this.baudRate;
    }

    async _readLoop() {
        while (this.port && this.port.readable && this.keepReading) {
            try {
                this.reader = this.port.readable.getReader();

                while (this.keepReading) {
                    const { value, done } = await this.reader.read();
                    if (done) break;

                    if (this.hexMode) {
                        // 十六进制模式，直接存储原始数据
                        this.inputBuffer += value;
                    } else {
                        // 文本模式，解码为字符串
                        const decoder = new TextDecoder();
                        this.inputBuffer += decoder.decode(value);
                    }

                    // 如果有回调且数据可用，触发事件
                    if (this.onDataCallback && this.dataAvailable()) {
                        this.onDataCallback();
                    }
                }
            } catch (error) {
                console.error('Read error:', error);
                this.disconnect();
            } finally {
                if (this.reader) {
                    this.reader.releaseLock();
                    this.reader = null;
                }
            }
        }
    }

    _updateConnectionStatus() {
        // 更新Scratch中的连接状态显示
        if (this.runtime) {
            this.runtime.emit('PERIPHERAL_CONNECTED', 'lepiWebSerial', this.isConnected);
        }
    }

    async view_device_id() {
        await navigator.serial.requestPort()
        let ports = await navigator.serial.getPorts()
        let ids = ports.map(port => {
            return port.getInfo().usbVendorId
        })
        console.log(ids)
        return JSON.stringify(ids)
    }
    set_white_list(args) {
        let ids = JSON.parse(args.LIST)
        if (ids.length > 0) {
            this.white_list = ids
        }
    }

}



module.exports = LepiWebSerial;