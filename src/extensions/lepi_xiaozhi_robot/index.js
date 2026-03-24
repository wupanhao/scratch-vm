const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');
const { pinyin } = require('pinyin-pro');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;


async function delay_ms(ms = 1000) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
}

class LepiXiaozhiRobot extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.recognitionResult = '';
        this.reply_text = ''
        this.reply_messages = []
        this.reply_updated = false

        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.subXiaozhiTopic()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            this.subXiaozhiTopic()
        })

        this.runtime.on('PROJECT_RUN_STOP', () => {

        });


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
            id: 'lepiXiaozhiRobot',
            name: formatMessage({
                id: 'lepi.LepiXiaozhiRobot',
                default: '小智机器人',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [

                {
                    opcode: 'startSpeechRecognition',
                    text: formatMessage({
                        id: 'lepi.startSpeechRecognition',
                        default: '启动语音识别',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'stopSpeechRecognition',
                    text: formatMessage({
                        id: 'lepi.stopSpeechRecognition',
                        default: '停止语音识别',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'isSpeechRecognized',
                    text: formatMessage({
                        id: 'lepi.isSpeechRecognized',
                        default: '识别到语音?',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'SpeechRecognitionResult',
                    text: formatMessage({
                        id: 'lepi.SpeechRecognitionResult',
                        default: '语音识别结果',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'isReplyUpdated',
                    text: formatMessage({
                        id: 'lepi.isReplyUpdated',
                        default: '回复有更新?',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'isReplyEnd',
                    text: formatMessage({
                        id: 'lepi.isReplyEnd',
                        default: '回复结束?',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'xiaozhi_reply_result',
                    text: formatMessage({
                        id: 'lepi.xiaozhi_reply_result',
                        default: '回复内容',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {

                    }
                },
                {
                    opcode: 'getXiaozhiState',
                    text: formatMessage({
                        id: 'lepi.getXiaozhiState',
                        default: '小智状态',
                    }),
                    blockType: BlockType.REPORTER,
                },
            ],
            menus: {
                name: Menu.formatMenu([formatMessage({
                    id: 'lepi.female',
                    default: '女声',
                }), formatMessage({
                    id: 'lepi.male',
                    default: '男声',
                })]),
                wait: Menu.formatMenu([formatMessage({
                    id: 'lepi.no_wait',
                    default: '不等待',
                }), formatMessage({
                    id: 'lepi.wait',
                    default: '等待',
                })]),
                action: Menu.formatMenu3([formatMessage({
                    id: 'lepi.close',
                    default: '关闭',
                }), formatMessage({
                    id: 'lepi.open',
                    default: '打开',
                })], ['close', 'open']),
                tone: Menu.formatMenu3([formatMessage({
                    id: 'lepi.withTone',
                    default: '带声调',
                }), formatMessage({
                    id: 'lepi.noTone',
                    default: '不带声调',
                })], ['num', 'none']),
            },

        };
    }

    subXiaozhiTopic() {
        console.log('LEPI_CONNECTED', 'subXiaozhiTopic')
        let onAsrResult = (result) => {
            console.log(result)
            this.recognitionResult = result.data
        }
        this.runtime.ros.subXiaozhiAsrResult(onAsrResult)
        let onXiaozhiReply = (result) => {
            console.log(result)
            this.reply_text = result.data
            this.reply_updated = true
        }
        this.runtime.ros.subXiaozhiReply(onXiaozhiReply)
    }


    startSpeechRecognition(args, util) {
        this.recognitionResult = ''
        this.reply_text = ''
        return this.runtime.ros.startXiaozhiAsr()
    }

    stopSpeechRecognition(args, util) {
        return this.runtime.ros.stopXiaozhiAsr()
    }

    isSpeechRecognized() {
        if (this.recognitionResult && this.recognitionResult.length > 0) {
            return true
        } else {
            return false
        }
    }

    SpeechRecognitionResult() {
        return this.recognitionResult
    }

    isReplyUpdated() {
        if (this.reply_updated) {
            this.reply_updated = false
            return true
        } else {
            return false
        }
    }

    async isReplyEnd() {
        let state = await this.runtime.ros.getXiaozhiState()
        return state == 'idle'
    }

    xiaozhi_reply_result() {
        return this.reply_text
    }

    getXiaozhiState() {
        return this.runtime.ros.getXiaozhiState()
    }

}



module.exports = LepiXiaozhiRobot;