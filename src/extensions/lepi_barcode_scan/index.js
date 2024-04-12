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

class LepiBarcodeScan extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.barcodeDetections = []
        this.result = []
        this.runtime = runtime;
        this.defaultValue = ['', 0, 0, 0, 0]
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
            id: 'lepiBarcodeScan',
            name: formatMessage({
                id: 'lepi.lepiBarcodeScan',
                default: '二维码扫描',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [{
                opcode: 'detectBarcode',
                text: formatMessage({
                    id: 'lepi.detectBarcode',
                    default: '检测二维码',
                }),
                blockType: BlockType.COMMAND,
            }, {
                opcode: 'detectedBarcode',
                text: formatMessage({
                    id: 'lepi.detectedBarcode',
                    default: '检测到内容包含 [TAG] 的二维码?',
                }),
                blockType: BlockType.BOOLEAN,
                arguments: {
                    TAG: {
                        type: ArgumentType.STRING,
                        defaultValue: 'tag'
                    }
                }
            }, {
                opcode: 'barcodeData',
                text: formatMessage({
                    id: 'lepi.barcodeData',
                    default: '二维码 [DATA]',
                }),
                blockType: BlockType.REPORTER,
                arguments: {
                    DATA: {
                        type: ArgumentType.NUMBER,
                        menu: 'data',
                        // defaultValue: 0
                    }
                }
            },],
            menus: {
                data: Menu.formatMenu([formatMessage({
                    id: 'lepi.text_content',
                    default: '文本内容',
                }), formatMessage({
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
                })]),
            },

        };
    }

    getBarcodeById(id) {
        const target = this.barcodeDetections[id]
        if (target) {
            var data = {}
            data.x = parseInt(target.box[0] + target.box[2] / 2)
            data.y = parseInt(target.box[1] + target.box[3] / 2)
            data.w = target.box[2]
            data.h = target.box[3]
            return [target.class_, data.x, data.y, data.w, data.h]
        } else {
            return null
        }

    }

    detectBarcode(args, util) {
        return new Promise((resolve) => {
            this.runtime.ros.detectBarcode().then(result => {
                this.barcodeDetections = result.detections
                if (this.barcodeDetections.length > 0) {
                    this.barcode = this.getBarcodeById(0)
                } else {
                    this.barcode = null
                }
                // resolve(result)
                resolve(result.detections.map(e => e.class_).join(','))
            })
        })
    }
    detectedBarcode(args, util) {
        var tag = args.TAG
        var id = this.barcodeDetections.findIndex(e => e.class_.indexOf(tag) >= 0)
        if (id >= 0) {
            this.barcode = this.getBarcodeById(id)
            return true
        } else {
            this.barcode = null
            return false
        }
    }

    barcodeData(args, util) {
        var data_id = parseInt(args.DATA)
        if (this.barcode) {
            return this.barcode[data_id]
        } else {
            return this.defaultValue[data_id]
        }
    }

}



module.exports = LepiBarcodeScan;