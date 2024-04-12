const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Menu = require('../../util/menu');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAMtSURBVFhH7ZZbSFRRFIb/M86M4/0yjpeJUimzQi0EzSCFYvKSXaR6qPDB6AKVgUj1kAZFPSQoFUFG9FCRhQhFVE+RDyGBDBYIRpqF1YM6Nd7G0Zx0VuvsiQIxm5lzBKH5Yc3ea7PXOt/es8/ZS6IxEBaxNL/aRasAoFIFAJUqAKhUAUCl+s8AJbYgT1ctqQcow7HZBvhH5xlSQ+oBhgMVB6ORtNwEGNiXgVWQOoB6oL8XuNM8ibTUMFysZUIGVkPqlFsRwOpkPXbvO4ATVZVITMoCjXNaeRdnPFP8lXJA3qlH93XYVf4DRJ5UpYXrOXEnnj7/DjjEkN9SBijvEAPqpSDcbarH3v1VnnEagqQx4l2HBukZbmDKM+yPlJ1Bhjt/Wg+zKVbAXW04g2QTU0uxOFd7GFtKteJ8KpK8g36ZEzQzLHafurtf8L9L9LrjIR09slH0ZfH66cGtYLk3dw4vzH9ADi3apKWdxRsEjCxzrE4A32w8K/xnT66zr+Uez3fMivfS/AOcAnW1awQMO2S3f6CC3HjaU7aO4qMjaJtljQCUtSplKZ08ZuDerBxemn+AHJYQp6OGuhqadNpp2P5ewORmLaNUcxS9bK0Xfm/3Kxoa6hELmbBx3MSsPF6Y74Ac0nRDT+G6aOr72Ma+UwC0t7UwXCSVWHJpqyWHvnyyUmiQPN9NFeU7KD8vRMTOmXMe8w1wnI1DuCKgDutjMgaDRkf6qO5CNeWtDSNLQRplrkykws1mylyRQJ/72ik7I4FjOIoXYW3l8yh/LufK/RfzDZCnVx/X825kiocODnTS9pJs0S/ISRVtWVE+fbVZ6crlGurv76JD5cVEM6PU0txIcTE6njFH3nnM+w81l1GOEQmRS5KQnqJFkGYSWl0IjHHpsA32ID4hGfZvdsTExmB0xAaDIQQu1zTCwqMw7hjlBGN489aFa5eGUXnKBTg9af8l324S/ujeux0Mt9vNAG5eovwauyFJEreeNKKIYf+35HH2Jb4TpklCkWUaRhOPeXlH+37VhbLJz/ct6o/ka8+HAkJ5sbDAUrfkXwAFAJUqAKhUAUClCgAq1SIHBH4CS5yFQixuY8IAAAAASUVORK5CYII='
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;

class LepiMoveNetPose extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.result = []
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
            id: 'lepiMoveNetPose',
            name: formatMessage({
                id: 'lepi.lepiMoveNetPose',
                default: '姿态估计(快速)',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [{
                opcode: 'detectPose',
                text: formatMessage({
                    id: 'lepi.detectPose',
                    default: '检测身体姿态',
                }),
                blockType: BlockType.COMMAND,
            }, {
                opcode: 'detectedPose',
                text: formatMessage({
                    id: 'lepi.detectedPose',
                    default: '检测到人?',
                }),
                blockType: BlockType.BOOLEAN,
            },
            {
                opcode: 'detectPercentage',
                text: formatMessage({
                    id: 'lepi.detectPercentage',
                    default: '检测完整度',
                }),
                blockType: BlockType.REPORTER,
            },
            {
                opcode: 'poseKeypoints',
                text: formatMessage({
                    id: 'lepi.poseKeypoints',
                    default: '人体[N]号关键点 [POINT]',
                }),
                blockType: BlockType.REPORTER,
                arguments: {
                    N: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0,
                        menu: 'pointId'
                    },
                    POINT: {
                        type: ArgumentType.NUMBER,
                        menu: 'point',
                        defaultValue: 0
                    }
                }
            },
            ],
            menus: {
                point: Menu.formatMenu([formatMessage({
                    id: 'lepi.x',
                    default: 'x坐标',
                }), formatMessage({
                    id: 'lepi.y',
                    default: 'y坐标',
                }), formatMessage({
                    id: 'lepi.confidence',
                    default: '置信度',
                })]),
                pointId: Menu.formatMenu([
                    formatMessage({
                        id: 'lepi.nose',
                        default: '鼻子',
                    }),
                    formatMessage({
                        id: 'lepi.left_eye',
                        default: '左眼',
                    }),
                    formatMessage({
                        id: 'lepi.right_eye',
                        default: '右眼',
                    }),
                    formatMessage({
                        id: 'lepi.left_ear',
                        default: '左耳',
                    }),
                    formatMessage({
                        id: 'lepi.right_ear',
                        default: '右耳',
                    }),
                    formatMessage({
                        id: 'lepi.left_shoulder',
                        default: '左肩',
                    }),
                    formatMessage({
                        id: 'lepi.right_shoulder',
                        default: '右肩',
                    }),
                    formatMessage({
                        id: 'lepi.left_elbow',
                        default: '左肘',
                    }),
                    formatMessage({
                        id: 'lepi.right_elbow',
                        default: '右肘',
                    }),
                    formatMessage({
                        id: 'lepi.left_wrist',
                        default: '左手腕',
                    }),
                    formatMessage({
                        id: 'lepi.right_wrist',
                        default: '右手腕',
                    }),
                    formatMessage({
                        id: 'lepi.left_hip',
                        default: '左臀',
                    }),
                    formatMessage({
                        id: 'lepi.right_hip',
                        default: '右臀',
                    }),
                    formatMessage({
                        id: 'lepi.left_knee',
                        default: '左膝',
                    }),
                    formatMessage({
                        id: 'lepi.right_knee',
                        default: '右膝',
                    }),
                    formatMessage({
                        id: 'lepi.left_ankle',
                        default: '左脚踝',
                    }),
                    formatMessage({
                        id: 'lepi.right_ankle',
                        default: '右脚踝',
                    })]),
            },

        };
    }



    detectPose(args, util) {
        return new Promise((resolve) => {
            this.runtime.ros.detectPoseNet().then(data => {
                this.result = JSON.parse(data)
                resolve(this.result.length)
            })
        })
    }
    detectedPose() {
        return this.detectPercentage > 50
    }

    detectPercentage(args, util) {
        if (this.result && this.result.length > 0) {
            let sum = this.result.reduce((acc, item) => acc + item[2], 0)
            let percentage = sum / this.result.length
            return percentage
        } else {
            return 0
        }
    }
    poseKeypoints(args, util) {
        let id = parseInt(args.N)
        let axis = parseInt(args.POINT)
        console.log(id, axis, this.result.length, this.result)
        if (this.result.length >= 1) {
            return this.result[id][axis]
        }
        return 0
    }
}



module.exports = LepiMoveNetPose;