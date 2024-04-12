const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
// const formatMessage = require('format-message');
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

// const classes = require('./classes')

class LepiUltraFace extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.faceDetections = []
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
            id: 'lepiUltraFace',
            name: '人脸检测',
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [{
                opcode: 'setThreshold',
                text: '将检测阈值设为 [VALUE]',
                blockType: BlockType.COMMAND,
                arguments: {
                    VALUE: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 70
                    }
                }
            },
            {
                opcode: 'setResize',
                blockType: BlockType.COMMAND,
                text: '设置缩放尺寸 宽:[W] 高:[H]',
                arguments: {
                    W: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 160,
                    },
                    H: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 120,
                    },
                }
            },
            {
                opcode: 'detectFaces',
                text: '检测人脸',
                blockType: BlockType.COMMAND,
            }, {
                opcode: 'faceData',
                text: '第 [I] 个人脸的 [DATA] ',
                blockType: BlockType.REPORTER,
                arguments: {
                    DATA: {
                        type: ArgumentType.NUMBER,
                        menu: 'faceParams'
                    },
                    I: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                }
            }, {
                opcode: 'faceCount',
                text: '人脸个数',
                blockType: BlockType.REPORTER,
            },

            ],
            menus: {
                // objects: Menu.formatMenu3(Object.values(classes), Object.keys(classes)),
                faceParams: Menu.formatMenu(['x坐标', 'y坐标', '宽度', '高度']),
            },

        };
    }

    setThreshold(args, util) {
        var value = parseInt(args.VALUE)
        return new Promise((resolve) => {
            this.runtime.ros.setUltraFaceThreshold(value).then(result => {
                console.log(result)
                resolve()
            })
        })
    }

    detectFaces(args, util) {
        return new Promise((resolve) => {
            this.runtime.ros.getUltraFaceInference().then(result => {
                this.faceDetections = result.detections
                resolve(result.detections.length)
            })
        })
    }

    faceCount(args, util) {
        return this.faceDetections.length
    }

    faceData(args, util) {
        var face_id = parseInt(args.I) - 1
        var face_data = parseInt(args.DATA)
        if (this.faceDetections.length > face_id) {
            this.detectedFace = this.faceDetections[face_id]
            var params = this.detectedFace.location
            var img_x = parseInt((params[0] + params[2]) / 2)
            var img_y = parseInt((params[1] + params[3]) / 2)
            // var scratch_x = img_x - 240
            // var scratch_y = -img_y + 180
            var width = params[2] - params[0]
            var height = params[3] - params[1]
            this.detectedFace.params = [img_x, img_y, width, height]
            return this.detectedFace.params[face_data]
        } else {
            return 0
        }
    }

    setResize(args, util) {
        const w = parseInt(args.W)
        const h = parseInt(args.H)
        return this.runtime.ros.setUltraFaceResize(w, h)
    }
}

(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        console.log('Blockly.Python not defined')
        return
    }
    const prefix = 'lepiUltraFace_'
    Blockly.Python[`${prefix}detectFaces`] = function (block) {
        // plain input
        // const key = Blockly.Python.valueToCode(block, 'DATA')

        // faceLabels: 'formatFaceLabels',
        // const key = block.getFieldValue('TAG')

        // faceParams: Menu.formatMenu(['x坐标', 'y坐标', '宽度', '高度']),
        // var param = block.getInputTargetBlock('DATA')
        // var id = param.getFieldValue('data')
        Blockly.Python.definitions_['import_ultraFaceInference'] = 'from face_recognizer import ultraFaceInference'
        Blockly.Python.definitions_['init_ultraFaceInference'] = 'ultraFaceInference = UltraFaceInference()'
        // console.log(key, key2)
        let code = `image_ultra_face = ultraFaceInference.detect(camera.getImage())\n`
        return code //Command
        //or return [`barcodeScanner.barcode[${id}]`, Blockly.Python.ORDER_FUNCTION_CALL] // Boolean Reporter
    };

    Blockly.Python[`${prefix}faceCount`] = function (block) {

        let code = `len(ultraFaceInference.faceData)`
        return [code, Blockly.Python.ORDER_FUNCTION_CALL] // Boolean Reporter
    };

    Blockly.Python[`${prefix}faceData`] = function (block) {

        var param = block.getInputTargetBlock('DATA')
        var id = param.getFieldValue('faceParams')
        const key = Blockly.Python.valueToCode(block, 'I')
        let code = `ultraFaceInference.faceData[${key}-1][${id}]`
        return [code, Blockly.Python.ORDER_FUNCTION_CALL] // Boolean Reporter
    };
    Blockly.Python[`${prefix}setThreshold`] = function (block) {

        const value = Blockly.Python.valueToCode(block, 'VALUE')
        let code = `ultraFaceInference.setThreshold(${value})\n`
        return code //Command
    };
    Blockly.Python[`${prefix}setResize`] = function (block) {

        const w = Blockly.Python.valueToCode(block, 'W')
        const h = Blockly.Python.valueToCode(block, 'H')
        let code = `ultraFaceInference.setResize([${w},${h}])\n`
        return code //Command
    };
    console.log('lepiUltraFace loaded')

})()

module.exports = LepiUltraFace;