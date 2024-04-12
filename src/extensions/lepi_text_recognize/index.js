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

const languages = require('./languages')

class LepiTextRecognize extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.text = ''
        this.runtime = runtime;
        try {
            this.setArea({ X1: 120, Y1: 120, X2: 360, Y2: 240 })
        } catch (error) {
            console.log(error)
        }
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
            id: 'lepiTextRecognize',
            name: formatMessage({
                id: 'lepi.lepiTextRecognize',
                default: '文本识别',
            }) ,
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                //     {
                //     opcode: 'setThreshold',
                //     text: '将检测阈值设为 [VALUE]',
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         VALUE: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 20
                //         }
                //     }
                // },
                {
                    opcode: 'setArea',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'lepi.setDetectArea',
                        default: '设置识别区域 (x1:[X1],y1:[Y1]) (x2:[X2],y2:[Y2])',
                    }) ,
                    arguments: {
                        X1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 120
                        },
                        Y1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 120
                        },
                        X2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 360
                        },
                        Y2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 240
                        },
                    }
                },
                {
                    opcode: 'detectText',
                    text: formatMessage({
                        id: 'lepi.detectText',
                        default: '识别 [LANG] 文本',
                    }) ,
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LANG: {
                            type: ArgumentType.STRING,
                            menu: 'lang',
                        }
                    }
                }, {
                    opcode: 'detectResult',
                    text: formatMessage({
                        id: 'lepi.detectResult',
                        default: '识别结果',
                    }) ,
                    blockType: BlockType.REPORTER,
                },

            ],
            menus: {
                // objects: Menu.formatMenu3(Object.values(classes), Object.keys(classes)),
                lang: Menu.formatMenu3(Object.values(languages), Object.keys(languages)),
            },

        };
    }

    setThreshold(args, util) {
        var value = parseInt(args.VALUE)
        return new Promise((resolve) => {
            this.runtime.ros.setImageClassifyThreshold(value).then(result => {
                console.log(result)
                resolve()
            })
        })
    }

    detectText(args, util) {
        var lang = args.LANG
        return new Promise((resolve) => {
            this.runtime.ros.recognizeText(lang).then(result => {
                this.text = result.data
                // resolve(result)
                resolve(result.data)
            })
        })
    }
    detectResult(args, util) {
        return this.text
    }

    setArea(args, util) {
        var param = {}
        param.x1 = parseInt(args.X1)
        param.y1 = parseInt(args.Y1)
        param.x2 = parseInt(args.X2)
        param.y2 = parseInt(args.Y2)
        this.runtime.rect = [param.x1, param.y1, param.x2 - param.x1, param.y2 - param.y1]
        return this.runtime.ros.setTextRoi(param)
    }
}

module.exports = LepiTextRecognize;