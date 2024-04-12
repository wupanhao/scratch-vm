const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAMtSURBVFhH7ZZbSFRRFIb/M86M4/0yjpeJUimzQi0EzSCFYvKSXaR6qPDB6AKVgUj1kAZFPSQoFUFG9FCRhQhFVE+RDyGBDBYIRpqF1YM6Nd7G0Zx0VuvsiQIxm5lzBKH5Yc3ea7PXOt/es8/ZS6IxEBaxNL/aRasAoFIFAJUqAKhUAUCl+s8AJbYgT1ctqQcow7HZBvhH5xlSQ+oBhgMVB6ORtNwEGNiXgVWQOoB6oL8XuNM8ibTUMFysZUIGVkPqlFsRwOpkPXbvO4ATVZVITMoCjXNaeRdnPFP8lXJA3qlH93XYVf4DRJ5UpYXrOXEnnj7/DjjEkN9SBijvEAPqpSDcbarH3v1VnnEagqQx4l2HBukZbmDKM+yPlJ1Bhjt/Wg+zKVbAXW04g2QTU0uxOFd7GFtKteJ8KpK8g36ZEzQzLHafurtf8L9L9LrjIR09slH0ZfH66cGtYLk3dw4vzH9ADi3apKWdxRsEjCxzrE4A32w8K/xnT66zr+Uez3fMivfS/AOcAnW1awQMO2S3f6CC3HjaU7aO4qMjaJtljQCUtSplKZ08ZuDerBxemn+AHJYQp6OGuhqadNpp2P5ewORmLaNUcxS9bK0Xfm/3Kxoa6hELmbBx3MSsPF6Y74Ac0nRDT+G6aOr72Ma+UwC0t7UwXCSVWHJpqyWHvnyyUmiQPN9NFeU7KD8vRMTOmXMe8w1wnI1DuCKgDutjMgaDRkf6qO5CNeWtDSNLQRplrkykws1mylyRQJ/72ik7I4FjOIoXYW3l8yh/LufK/RfzDZCnVx/X825kiocODnTS9pJs0S/ISRVtWVE+fbVZ6crlGurv76JD5cVEM6PU0txIcTE6njFH3nnM+w81l1GOEQmRS5KQnqJFkGYSWl0IjHHpsA32ID4hGfZvdsTExmB0xAaDIQQu1zTCwqMw7hjlBGN489aFa5eGUXnKBTg9af8l324S/ujeux0Mt9vNAG5eovwauyFJEreeNKKIYf+35HH2Jb4TpklCkWUaRhOPeXlH+37VhbLJz/ct6o/ka8+HAkJ5sbDAUrfkXwAFAJUqAKhUAUClCgAq1SIHBH4CS5yFQixuY8IAAAAASUVORK5CYII='
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;

let decoder = new TextDecoder("utf-8");

function format_rfid_block_id() {
    let ids = []
    for (let i = 1; i < 64; i++) {
        if (i % 4 != 3) {
            ids.push(String(i))
        }
    }
    return ids
}

var hexToArray = function (hex) {
    var arr = hex.replaceAll('0x', '').split("")
    var out = new Uint8Array(16)
    for (var i = 0; i < arr.length / 2; i++) {
        var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
        out[i] = parseInt(tmp, 16);
    }
    return out
}

var arrayToHex = function (arr) {
    var val = "";
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] < 0x10) {
            val += '0' + arr[i].toString(16);
        } else {
            val += arr[i].toString(16);
        }
    }
    return '0x' + val
}

var hexToUtf8String = function (hex) {
    var arr = hex.replaceAll('0x', '').replaceAll('00', '').split("")
    var out = []
    for (var i = 0; i < arr.length / 2; i++) {
        var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
        var charValue = parseInt(tmp, 16);
        out.push(charValue)
    }
    return decoder.decode(new Uint8Array(out))
}

var getByteValue = function (hex, i) {
    var arr = hex.replaceAll('0x', '').split("")
    var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
    return parseInt(tmp, 16);
}

var stringToHex = function (str) {
    var val = "";
    for (var i = 0; i < str.length; i++) {
        val += str.charCodeAt(i).toString(16);
    }
    return val
}

class LepiNfc extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.text = ''
        this.runtime = runtime;
        this.bytesArray = new Uint8Array(16)
        // try {
        //     this.setArea({ X1: 120, Y1: 120, X2: 360, Y2: 240 })
        // } catch (error) {
        //     console.log(error)
        // }
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
        let ids = format_rfid_block_id()
        console.log(ids)
        return {
            id: 'lepiRFID',
            name: formatMessage({
                id: 'lepi.lepiRFID',
                default: 'RFID读卡器',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'detectNfcId',
                    text: formatMessage({
                        id: 'lepi.detectNfcId',
                        default: '识别标签ID',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'readBlockDataChars',
                    text: formatMessage({
                        id: 'lepi.readBlockDataChars',
                        default: '读RFID第[NUM]区块字符数据',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            menu: 'block_ids',
                            // defaultValue: 1
                        },
                    }
                },
                {
                    opcode: 'writeBlockData',
                    text: formatMessage({
                        id: 'lepi.writeBlockData',
                        default: '写RFID第[NUM]区块字符数据[DATA]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            menu: 'block_ids',
                            // defaultValue: 1
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'abc'
                        },
                    }
                },

                {
                    opcode: 'readBlockDataBytes',
                    text: formatMessage({
                        id: 'lepi.readBlockDataBytes',
                        default: '读RFID第[NUM]区块字节数据',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            menu: 'block_ids',
                            // defaultValue: 1
                        },
                    }
                },
                {
                    opcode: 'writeBytesData',
                    text: formatMessage({
                        id: 'lepi.writeBytesData',
                        default: '写RFID第[NUM]区块字节数据[DATA]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            menu: 'block_ids',
                            // defaultValue: 1
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '0x0a09'
                        },
                    }
                },

                '---',
                {
                    opcode: 'initBytesData',
                    text: formatMessage({
                        id: 'lepi.initBytesData',
                        default: '初始化字节数据 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '0x00ff'
                        },
                    }
                },
                {
                    opcode: 'setBytesData',
                    text: formatMessage({
                        id: 'lepi.setBytesData',
                        default: '把第[NUM]字节数据设为[VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            menu: 'byte_ids',
                            // defaultValue: 1
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '255'
                        },
                    }
                },
                {
                    opcode: 'bytesData',
                    text: formatMessage({
                        id: 'lepi.bytesData',
                        default: '字节数据',
                    }),
                    blockType: BlockType.REPORTER,
                },
                '---',
                {
                    opcode: 'getByteData',
                    text: formatMessage({
                        id: 'lepi.getByteData',
                        default: '字节数据[DATA]第[NUM]字节',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NUM: {
                            type: ArgumentType.NUMBER,
                            menu: 'byte_ids',
                            defaultValue: 1
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '0x0a09'
                        },
                    }
                },
                {
                    opcode: 'bytesToChars',
                    text: formatMessage({
                        id: 'lepi.bytesToChars',
                        default: '字节数据[DATA]转字符',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '0x616263'
                        },
                    }
                },
                {
                    opcode: 'charsToBytes',
                    text: formatMessage({
                        id: 'lepi.charsToBytes',
                        default: '字符数据[DATA]转字节',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'abc'
                        },
                    }
                }, ,
                {
                    opcode: 'numberToChar',
                    text: formatMessage({
                        id: 'lepi.numberToChar',
                        default: '数字[DATA]转字符',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '97'
                        },
                    }
                },
                {
                    opcode: 'charToNumber',
                    text: formatMessage({
                        id: 'lepi.charToNumber',
                        default: '字符[DATA]转数字',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'a'
                        },
                    }
                },

            ],
            menus: {
                // objects: Menu.formatMenu3(Object.values(classes), Object.keys(classes)),
                block_ids: Menu.formatMenu2(ids),
                byte_ids: Menu.formatMenu4(16, 1)
            },

        };
    }

    detectNfcId(args, util) {
        return new Promise((resolve) => {
            this.runtime.ros.detectNfcId().then(result => {
                // resolve(result)
                resolve(result.data)
            })
        })
    }
    readBlockDataChars(args, util) {
        let param = {
            block_num: parseInt(args.NUM),
        }
        return new Promise((resolve) => {
            this.runtime.ros.readBlockData(JSON.stringify(param)).then(result => {
                // resolve(result)
                let data = JSON.parse(result.data)
                console.log(data)
                resolve(this.bytesToChars({ DATA: data.data }))
            })
        })
    }
    writeBlockData(args, util) {
        let param = {
            block_num: parseInt(args.NUM),
            data: String(args.DATA)
        }
        return new Promise((resolve) => {
            this.runtime.ros.writeBlockData(JSON.stringify(param)).then(result => {
                // resolve(result)
                resolve(result.data)
            })
        })
    }

    bytesToChars(args, util) {
        let data = String(args.DATA)
        if (data.length > 0 && data.length % 2 == 0) {
            return hexToUtf8String(data)
        } else {
            return ''
        }
    }
    charsToBytes(args, util) {
        let data = String(args.DATA)
        let encoder = new TextEncoder('utf8');
        return arrayToHex(encoder.encode(data));
    }

    numberToChar(args, util) {
        let out = []
        let value = parseInt(args.DATA)
        while (value > 0) {
            out.unshift(value & 0xff)
            value = value >> 8
        }
        return decoder.decode(new Uint8Array(out))
    }

    charToNumber(args, util) {
        let data = String(args.DATA)
        let encoder = new TextEncoder('utf8')
        let array = encoder.encode(data)
        let value = 0
        for (let i = 0; i < array.length; i++) {
            value = value << 8
            value = value + array[i]
        }
        return value
    }

    getByteData(args, util) {
        let data = String(args.DATA)
        if (data.length > 0 && data.length % 2 == 0) {
            return getByteValue(data, parseInt(args.NUM) - 1)
        } else {
            return 0
        }
    }

    initBytesData(args, util) {
        let value = String(args.VALUE)
        this.bytesArray = hexToArray(value)
        return arrayToHex(this.bytesArray)
    }

    setBytesData(args, util) {
        let value = 0
        try {
            if (String(args.VALUE).startsWith('0x')) {
                value = parseInt(args.VALUE, 16);
            } else {
                value = parseInt(args.VALUE)
            }
        } catch (error) {
            console.log(error)
        }

        this.bytesArray[parseInt(args.NUM) - 1] = value
        return arrayToHex(this.bytesArray)
    }

    bytesData(args, util) {
        return arrayToHex(this.bytesArray)
    }
    readBlockDataBytes(args, util) {
        let param = {
            block_num: parseInt(args.NUM),
        }
        return new Promise((resolve) => {
            this.runtime.ros.readBlockData(JSON.stringify(param)).then(result => {
                // resolve(result)
                let data = JSON.parse(result.data)
                console.log(data)
                resolve('0x' + data.data)
            })
        })
    }
    writeBytesData(args, util) {
        let param = {
            block_num: parseInt(args.NUM),
            bytes: String(args.DATA)
        }
        return new Promise((resolve) => {
            this.runtime.ros.writeBytesData(JSON.stringify(param)).then(result => {
                // resolve(result)
                resolve(result.data)
            })
        })
    }
}

module.exports = LepiNfc;