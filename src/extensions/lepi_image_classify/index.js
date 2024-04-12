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
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQzkxNUQ5MTlFNUQxMUVBOTNBQkUxQkVBQUU5NjcwNSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQzkxNUQ5MDlFNUQxMUVBOTNBQkUxQkVBQUU5NjcwNSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjOTQ2MmUyLTIwMDYtNDQyYi05Y2EwLWZlOTMyYTgzZDcxNCIgc3RSZWY6ZG9jdW1l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'
const menuIconURI = blockIconURI;

// const classes = require('./classes')

class LepiImageClassify extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.ImageClassifys = []
        this.object = null
        this.runtime = runtime;
        try {
            this.setSize({ W: 224, H: 224 })
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
            id: 'lepiImageClassify',
            name: formatMessage({
                id: 'lepi.lepiImageClassify',
                default: '图像分类',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'detectObject',
                    text: formatMessage({
                        id: 'lepi.classify_images',
                        default: '分类图像',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'detectedObject',
                    text: formatMessage({
                        id: 'lepi.classifiedAsObject',
                        default: '分类为 [CLASS] ?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        CLASS: {
                            type: ArgumentType.STRING,
                            defaultValue: 'background',
                            // menu: 'objects'
                        }
                    }
                }, {
                    opcode: 'detectResult',
                    text: formatMessage({
                        id: 'lepi.classifyResult',
                        default: '分类结果',
                    }),
                    blockType: BlockType.REPORTER,
                }, {
                    opcode: 'objectData',
                    text: formatMessage({
                        id: 'lepi.classifyConfidence',
                        default: '分类置信度',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'setThreshold',
                    text: formatMessage({
                        id: 'lepi.setClassifyThreshold',
                        default: '将分类阈值设为 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20
                        }
                    }
                },
                {
                    opcode: 'setSize',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'lepi.setSize',
                        default: '设置图像尺寸 宽:[W] 高:[H]',
                    }),
                    arguments: {
                        W: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 224,
                        },
                        H: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 224,
                        },
                    }
                },
            ],
            menus: {
                // objects: Menu.formatMenu3(Object.values(classes), Object.keys(classes)),
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

    detectObject(args, util) {
        return new Promise((resolve) => {
            this.runtime.ros.getImageClassify().then(result => {
                this.classes = result.detections
                // resolve(result)
                resolve(result.detections.map(e => `${e.class_}: ${parseInt(e.score)}%`).join(','))
            })
        })
    }
    detectResult(args, util) {
        if (this.classes.length > 0) {
            return this.classes[0].class_
        } else {
            return ''
        }
    }
    detectedObject(args, util) {
        var class_ = args.CLASS
        var id = this.classes
        if (this.classes.length > 0 && this.classes[0].class_ == class_) {
            this.object = this.classes[0]
            return true
        } else {
            this.object = null
            return false
        }
    }

    objectData(args, util) {
        if (this.classes.length > 0) {
            return this.classes[0].score
        } else {
            return 0
        }
    }

    setSize(args, util) {
        const w = parseInt(args.W)
        const h = parseInt(args.H)
        let x = parseInt(240 - w / 2)
        let y = parseInt(180 - h / 2)
        this.runtime.rect = [x, y, w, h]
        return this.runtime.ros.setClassifySize(w, h)
    }
}

module.exports = LepiImageClassify;