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
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2NDFDOTJGMjlFNjAxMUVBOTNBQkUxQkVBQUU5NjcwNSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NDFDOTJGMTlFNjAxMUVBOTNBQkUxQkVBQUU5NjcwNSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjOTQ2MmUyLTIwMDYtNDQyYi05Y2EwLWZlOTMyYTgzZDcxNCIgc3RSZWY6ZG9jdW1l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'
const menuIconURI = blockIconURI;

const classes = require('./classes')

class LepiObjectDetection extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.objectDetections = []
        this.object = null
        this.runtime = runtime;

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
            id: 'lepiObjectDetection',
            name: formatMessage({
                id: 'lepi.lepiObjectDetection',
                default: '目标检测',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'detectObject',
                    text: formatMessage({
                        id: 'lepi.detectObject',
                        default: '检测目标',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'detectedObject',
                    text: formatMessage({
                        id: 'lepi.detectedObject',
                        default: '检测到 [CLASS] ?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        CLASS: {
                            type: ArgumentType.NUMBER,
                            menu: 'objects'
                        }
                    }
                }, {
                    opcode: 'objectData',
                    text: formatMessage({
                        id: 'lepi.objectData',
                        default: '目标 [DATA]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DATA: {
                            type: ArgumentType.NUMBER,
                            menu: 'objectData',
                            // defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'setThreshold',
                    text: formatMessage({
                        id: 'lepi.setDetectThreshold',
                        default: '将检测阈值设为 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
            ],
            menus: {
                objects: Menu.formatMenu3(Object.values(classes).map(item => item()), Object.keys(classes)),
                // apriltags: _formatMenu1(['停止', '机动车道', '前方学校', '单行道', '等待行人']),
                objectData: Menu.formatMenu([formatMessage({
                    id: 'lepi.center_x',
                    default: '中心点x坐标',
                }), formatMessage({
                    id: 'lepi.center_y',
                    default: '中心点y坐标',
                }), formatMessage({
                    id: 'lepi.width',
                    default: '宽度',
                }), formatMessage({
                    id: 'lepi.height',
                    default: '高度',
                }), formatMessage({
                    id: 'lepi.confidence',
                    default: '置信度',
                })]),
            },

        };
    }

    setThreshold(args, util) {
        var value = parseInt(args.VALUE)
        return new Promise((resolve) => {
            this.runtime.ros.setObjectDetectionThreshold(value).then(result => {
                console.log(result)
                resolve()
            })
        })
    }

    detectObject(args, util) {
        return new Promise((resolve) => {
            this.runtime.ros.getObjectDetections().then(result => {
                this.objectDetections = result.detections
                // resolve(result)
                resolve(result.detections.map(e => classes[e.class_]).join(','))
            })
        })
    }

    detectedObject(args, util) {
        var class_ = args.CLASS
        var id = this.objectDetections.findIndex(e => e.class_ == class_)
        if (id >= 0) {
            this.object = this.objectDetections[id]
            var img_x = parseInt((this.object.box[1] + this.object.box[3]) / 2)
            var img_y = parseInt((this.object.box[0] + this.object.box[2]) / 2)
            var height = this.object.box[2] - this.object.box[0]
            var width = this.object.box[3] - this.object.box[1]
            // this.object.data = [img_x - 240, -img_y + 180, width, height, this.object.score]
            this.object.data = [img_x, img_y, width, height, this.object.score]
            return true
        } else {
            this.object = null
            return false
        }
    }

    objectData(args, util) {
        var data_id = parseInt(args.DATA)
        if (this.object) {
            return this.object.data[data_id]
        } else {
            return 0
        }
    }
}

module.exports = LepiObjectDetection;