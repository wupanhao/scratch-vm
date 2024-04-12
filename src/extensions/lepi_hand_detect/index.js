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

class LepiHandDetect extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.result = {
            keypoints: []
        }
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
            id: 'lepiHandDetect',
            name: formatMessage({
                id: 'lepi.lepiHandDetect',
                default: '手势检测',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [{
                opcode: 'detectHand',
                text: formatMessage({
                    id: 'lepi.detectHand',
                    default: '检测手势',
                }),
                blockType: BlockType.COMMAND,
            }, {
                opcode: 'detectedHand',
                text: formatMessage({
                    id: 'lepi.detectedHand',
                    default: '检测到手?',
                }),
                blockType: BlockType.BOOLEAN,
            }, {
                opcode: 'handCount',
                text: formatMessage({
                    id: 'lepi.handCount',
                    default: '手的数目',
                }),
                blockType: BlockType.REPORTER,
            },
            {
                opcode: 'handData',
                text: formatMessage({
                    id: 'lepi.handData',
                    default: '第[I]只手的 [DATA]',
                }),
                blockType: BlockType.REPORTER,
                arguments: {
                    I: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    DATA: {
                        type: ArgumentType.NUMBER,
                        menu: 'data',
                        defaultValue: 0
                    }
                }
            },
            {
                opcode: 'handKeypoints',
                text: formatMessage({
                    id: 'lepi.handKeypoints',
                    default: '第[I]只手[N]号关键点 [POINT]',
                }),
                blockType: BlockType.REPORTER,
                arguments: {
                    I: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                    },
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
                data: Menu.formatMenu([formatMessage({
                    id: 'lepi.left_right',
                    default: '左右',
                }), formatMessage({
                    id: 'lepi.left_right_mirror',
                    default: '左右(镜像)',
                }), formatMessage({
                    id: 'lepi.confidence',
                    default: '置信度',
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
                point: Menu.formatMenu([formatMessage({
                    id: 'lepi.x',
                    default: 'x坐标',
                }), formatMessage({
                    id: 'lepi.y',
                    default: 'y坐标',
                })]),
                pointId: Menu.formatMenu4(21),
            },
        };
    }



    detectHand(args, util) {
        return new Promise((resolve) => {
            this.runtime.ros.detectHand().then(data => {
                this.result = JSON.parse(data)
                resolve(this.result.length)
            })
        })
    }
    detectedHand() {
        return this.result.length >= 1
    }
    handCount() {
        return this.result.length
    }
    handData(args, util) {
        let i = parseInt(args.I) - 1
        let data_id = parseInt(args.DATA)
        if (this.result.length >= i && i >= 0) {
            let hand = this.result[i]
            console.log(hand)
            if (data_id == 0) {
                if (hand.label == 'Left') {
                    return '左'
                } else {
                    return '右'
                }
            } else if (data_id == 1) {
                if (hand.label == 'Left') {
                    return '右'
                } else {
                    return '左'
                }
            } else if (data_id == 2) {
                return parseInt(hand.score * 100)
            } else {
                let top = 360, left = 480, bottom = 0, right = 0
                for (let index = 0; index < hand.keypoints.length; index++) {
                    const p = hand.keypoints[index];
                    if (p[0] < left) {
                        left = p[0]
                    }
                    if (p[1] < top) {
                        top = p[1]
                    }
                    if (p[0] > right) {
                        right = p[0]
                    }
                    if (p[1] > bottom) {
                        bottom = p[1]
                    }
                }
                left = left > 0 ? left : 0
                top = top > 0 ? top : 0
                right = right < 480 ? right : 480
                bottom = bottom < 360 ? bottom : 360
                let x = parseInt((left + right) / 2)
                let y = parseInt((top + bottom) / 2)
                let w = parseInt(right - left)
                let h = parseInt(bottom - top)
                console.log(left, top, right, bottom, x, y, w, h)
                if (data_id == 3) {
                    return x
                } else if (data_id == 4) {
                    return y
                } else if (data_id == 5) {
                    return w
                } else if (data_id == 6) {
                    return h
                }
            }
        } else {
            return 0
        }
    }
    handKeypoints(args, util) {
        let i = parseInt(args.I) - 1
        let id = parseInt(args.N)
        let axis = parseInt(args.POINT)
        console.log(i, id, axis, this.result.length, this.result)
        if (this.result.length >= i && i >= 0) {
            return this.result[i].keypoints[id][axis]
        }
        return 0
    }

}

module.exports = LepiHandDetect;