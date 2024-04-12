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
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDNzJCNkI3QTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDNzJCNkI3OTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1l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'
const menuIconURI = blockIconURI;

class LepiApriltag extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.apriltagDetections = []
        this.apriltag = null
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
            id: 'lepiApriltagDetect',
            name: formatMessage({
                id: 'lepi.lepiApriltagDetect',
                default: '标签检测',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [{
                opcode: 'detectAprilTag',
                text: formatMessage({
                    id: 'lepi.detectAprilTag',
                    default: '检测标志物',
                }),
                blockType: BlockType.COMMAND,
            }, {
                opcode: 'detectAprilTagIDs',
                text: formatMessage({
                    id: 'lepi.detectAprilTagIDs',
                    default: '检测到的标志物ID',
                }),
                blockType: BlockType.REPORTER,
            }, {
                opcode: 'detectedAprilTag',
                text: formatMessage({
                    id: 'lepi.detectedAprilTag',
                    default: '检测到id为 [TAG] 的标志物?',
                }),
                blockType: BlockType.BOOLEAN,
                arguments: {
                    TAG: {
                        type: ArgumentType.NUMBER,
                        menu: 'apriltags'
                    }
                }
            }, {
                opcode: 'aprilTagTranslation',
                text: formatMessage({
                    id: 'lepi.aprilTagTranslation',
                    default: '标志物 [AXIS] 偏移距离',
                }),
                blockType: BlockType.REPORTER,
                arguments: {
                    AXIS: {
                        type: ArgumentType.NUMBER,
                        menu: 'axes',
                        // defaultValue: 0
                    }
                }
            }, {
                opcode: 'aprilTagRotation',
                text: formatMessage({
                    id: 'lepi.aprilTagRotation',
                    default: '标志物 [AXIS] 偏移角度',
                }),
                blockType: BlockType.REPORTER,
                arguments: {
                    AXIS: {
                        type: ArgumentType.NUMBER,
                        menu: 'axes',
                        // defaultValue: 0
                    }
                }
            },],
            menus: {
                apriltags: Menu.formatMenu4(587),
                // apriltags: _formatMenu1(['停止', '机动车道', '前方学校', '单行道', '等待行人']),
                axes: Menu.formatMenu([formatMessage({
                    id: 'lepi.x_axis',
                    default: 'x轴',
                }), formatMessage({
                    id: 'lepi.y_axis',
                    default: 'y轴',
                }), formatMessage({
                    id: 'lepi.z_axis',
                    default: 'z轴',
                })]),
            },

        };
    }

    detectAprilTag(args, util) {
        return new Promise((resolve) => {
            this.runtime.ros.detectAprilTag().then(result => {
                this.apriltagDetections = result.detections
                if (this.apriltagDetections.length > 0) {
                    this.apriltag = this.apriltagDetections[0]
                }
                // resolve(result)
                resolve(result.detections.map(e => e.id).join(','))
            })

        })
    }

    detectAprilTagIDs() {
        return JSON.stringify(this.apriltagDetections.map(item => item.id))
    }

    detectedAprilTag(args, util) {
        var tag_id = parseInt(args.TAG)
        var id = this.apriltagDetections.findIndex(e => e.id == tag_id)
        if (id >= 0) {
            this.apriltag = this.apriltagDetections[id]
            return true
        } else {
            this.apriltag = null
            return false
        }
    }
    aprilTagTranslation(args, util) {
        var axis_id = parseInt(args.AXIS)
        if (this.apriltag) {
            return this.apriltag.pose_t[axis_id]
        } else {
            return null
        }
    }
    aprilTagRotation(args, util) {
        var axis_id = parseInt(args.AXIS)
        if (this.apriltag) {
            return this.apriltag.pose_r[axis_id]
        } else {
            return null
        }
    }
}

(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        console.log('Blockly.Python not defined')
        return
    }
    const prefix = 'lepiApriltagDetect_'
    Blockly.Python[`${prefix}detectAprilTag`] = function (block) {
        // plain input
        // const key = Blockly.Python.valueToCode(block, 'DATA')

        // faceLabels: 'formatFaceLabels',
        // const key = block.getFieldValue('TAG')

        // faceParams: Menu.formatMenu(['x坐标', 'y坐标', '宽度', '高度']),
        // var param = block.getInputTargetBlock('DATA')
        // var id = param.getFieldValue('data')
        Blockly.Python.definitions_['import_ApriltagDetector'] = 'from apriltag_detector import ApriltagDetector'
        Blockly.Python.definitions_['init_ApriltagDetector'] = 'apriltagDetector = ApriltagDetector()'
        // console.log(key, key2)
        let code = `image_apriltag = apriltagDetector.detect(camera.getImage())\n`
        return code //Command
        //or return [`barcodeScanner.barcode[${id}]`, Blockly.Python.ORDER_FUNCTION_CALL] // Boolean Reporter
    };

    Blockly.Python[`${prefix}detectedAprilTag`] = function (block) {

        var param = block.getInputTargetBlock('TAG')
        var id = param.getFieldValue('apriltags')
        let code = `apriltagDetector.isDetected(${id})`
        // return [code,] //Command
        return [code, Blockly.Python.ORDER_FUNCTION_CALL] // Boolean Reporter
    };

    Blockly.Python[`${prefix}aprilTagTranslation`] = function (block) {

        var param = block.getInputTargetBlock('AXIS')
        var id = param.getFieldValue('axes')
        let code = `apriltagDetector.tag[1][${id}]`
        // return [code,] //Command
        return [code, Blockly.Python.ORDER_FUNCTION_CALL] // Boolean Reporter
    };
    Blockly.Python[`${prefix}aprilTagRotation`] = function (block) {

        var param = block.getInputTargetBlock('AXIS')
        var id = param.getFieldValue('axes')
        let code = `apriltagDetector.tag[2][${id}]`
        // return [code,] //Command
        return [code, Blockly.Python.ORDER_FUNCTION_CALL] // Boolean Reporter
    };

    console.log('lepiApriltagDetect loaded')



})()

module.exports = LepiApriltag;