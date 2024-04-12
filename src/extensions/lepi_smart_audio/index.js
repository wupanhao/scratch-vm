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
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADhmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpERUFCRkU3RUNGQjcxMUVBOTUxN0FEN0Y3Mzg2QUYzMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpERUFCRkU3RENGQjcxMUVBOTUxN0FEN0Y3Mzg2QUYzMSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjg3MzNiMzAzLTFlN2UtNDZlNC1hMWU1LWVjMTUyOWU1OTU0OCIgc3RSZWY6ZG9jdW1l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'
const menuIconURI = blockIconURI;

let voicesMap = {}

class LepiSmartAudio extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.commandResult = ''
        this.recognitionEnd = false;

        /*
        this.recognition = new webkitSpeechRecognition();
        this.recognition.lang = 'cmn-Hans-CN'; //普通话 (中国大陆)
        this.recognitionResult = '';
        this.recognitionConfidence = false;
        this.recognition.onresult = (event) => {
            this.recognitionEnd = true;
            console.log(event);
            this.recognitionResult = event.results[0][0].transcript
            this.recognitionConfidence = event.results[0][0].confidence
        }
        this.recognition.onerror = function(event) { 
            console.log(event);
        }
        this.hotwordDetected = false
        this.commandResult = {
            confidence: 0,
            grammar: 0,
            input: ""
        }
        this.grammer = {
            name: '',
            grammer: '',
            slot: {
            }
        }
        */
        this.hotwordList = []
        this.model_dir = `/home/pi/Lepi_Data/ros/smart_audio_node/resources/models`

        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.subHotwordDetect()
            this.updateHotwordList()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            this.subHotwordDetect()
            this.updateHotwordList()
        })
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
            id: 'lepiSmartAudio',
            name: formatMessage({
                id: 'lepi.lepiSmartAudio',
                default: '智能语音',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [


                /*
                {
                    opcode: 'declareGrammer',
                    text: '声明语法规则 [GRAMMER]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        GRAMMER: {
                            type: ArgumentType.STRING,
                            defaultValue: '你好<name>'
                        }
                    }
                },
                {
                    opcode: 'addSlot',
                    text: '添加语法槽 [SLOT] [VALUE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SLOT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'name'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '小明|小蒙'
                        },
                    }
                },
                {
                    opcode: 'saveGrammer',
                    text: '保存语法规则 [NAME]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: '问候'
                        }
                    }
                },
                {
                    opcode: 'updateGrammerList',
                    text: '更新语法规则',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'deleteGrammer',
                    text: '删除语法规则[GRAMMER]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'grammer'
                        }
                    }
                },

                {
                    opcode: 'commandConfidence',
                    text: '命令词置信度',
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'detectedCommand',
                    text: '命令词',
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'detectCommand',
                    text: '离线语音识别, 时长[LEN]秒',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LEN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 2
                        }
                    }
                },
                */

                {
                    opcode: 'SpeakOffline',
                    text: formatMessage({
                        id: 'lepi.SpeakOffline',
                        default: '电脑离线语音朗读[TEXT], 发音人[SPEAKER], 音量[VOLUME] 速度[RATE] 音调[PITCH]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.hello',
                                default: '你好',
                            })
                        }, SPEAKER: {
                            type: ArgumentType.STRING,
                            menu: 'speakers',
                        }, VOLUME: {
                            type: ArgumentType.STRING,
                            defaultValue: 100
                        }, RATE: {
                            type: ArgumentType.STRING,
                            defaultValue: 10
                        }, PITCH: {
                            type: ArgumentType.STRING,
                            defaultValue: 50
                        },
                    }
                },
                {
                    opcode: 'SpeakEnd',
                    text: formatMessage({
                        id: 'lepi.SpeakEnd',
                        default: '朗读结束?',
                    }),
                    blockType: BlockType.BOOLEAN,
                },

                {
                    opcode: 'SpeechRecognitionOffline',
                    text: formatMessage({
                        id: 'lepi.SpeechRecognitionOffline',
                        default: '离线语音识别',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'SpeechRecognitionEnd',
                    text: formatMessage({
                        id: 'lepi.SpeechRecognitionEnd',
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
                    opcode: 'Text2Pinyin',
                    text: formatMessage({
                        id: 'lepi.Text2Pinyin',
                        default: '汉字[TEXT]转拼音[TONE]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: '中文'
                        },
                        TONE: {
                            type: ArgumentType.STRING,
                            menu: 'tone',
                            defaultValue: 'none'
                        },
                    }
                },
                // {
                //     opcode: 'SpeechRecognitionConfidence',
                //     text: '语音识别置信度',
                //     blockType: BlockType.REPORTER,
                // },
                {
                    opcode: 'TTSOffline',
                    text: formatMessage({
                        id: 'lepi.TTSOffline',
                        default: '离线语音合成[TEXT], [WAIT]读完',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.hello',
                                default: '你好',
                            })
                        }, WAIT: {
                            type: ArgumentType.STRING,
                            menu: 'wait',
                            defaultValue: 1
                        },
                    }
                },
                '---',
                {
                    opcode: 'toggleHotwordDetect',
                    text: formatMessage({
                        id: 'lepi.toggleHotwordDetect',
                        default: '[ACTION] 关键词检测',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ACTION: {
                            type: ArgumentType.STRING,
                            menu: 'action',
                            defaultValue: 'open'
                        }
                    }
                },
                {
                    opcode: 'isHotwordDetect',
                    text: formatMessage({
                        id: 'lepi.isHotwordDetect',
                        default: '检测到关键词?',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'switchHotwordModel',
                    text: formatMessage({
                        id: 'lepi.switchHotwordModel',
                        default: '切换关键词模型[HOTWORD]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        HOTWORD: {
                            type: ArgumentType.STRING,
                            menu: 'hotword'
                        }
                    }
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
                speakers: 'formatSpeakerList',
                grammer: 'formatGrammerList',
                hotword: 'formatHotwordList',
            },

        };
    }

    async updateHotwordList() {
        let ip = this.runtime.vm.LEPI_IP
        if (ip) {
            let data = await this.runtime.ros.getFileList(this.model_dir)
            let files = data.files.filter(file => file.endsWith('.umdl') || file.endsWith('.pmdl'))
            this.hotwordList = files
            return Promise.resolve(files.join(','))
        } else {
            return formatMessage({
                id: 'lepi.msg.lepi not connected',
                default: 'lepi not connected',
            })
        }
    }

    formatHotwordList() {
        return Menu.formatMenu3(this.hotwordList.map(filename => {
            if (filename.endsWith('.umdl')) {
                return filename.replace('.umdl', '')
            } else {
                return filename.replace('.pmdl', '')
            }
        }), this.hotwordList)
    }

    subHotwordDetect() {
        console.log('LEPI_CONNECTED', 'subHotwordDetect')
        let callback = (hotword) => {
            console.log(hotword)
            this.hotwordDetected = true
        }
        this.runtime.ros.subHotwordDetect(callback)
    }

    isHotwordDetect() {
        if (this.hotwordDetected) {
            this.hotwordDetected = false
            return true
        } else {
            return false
        }
    }

    toggleHotwordDetect(args, util) {
        let action = args.ACTION
        return this.runtime.ros.toggleHotwordDetect(action)
    }

    switchHotwordModel(args) {
        var file_name = args.HOTWORD
        return this.runtime.ros.switchHotwordModel(file_name)
    }


    detectCommand(args, util) {
        let length = args.LEN
        return new Promise(resolve => {
            this.runtime.ros.detectCommand('' + length).then(result => {
                console.log(result)
                this.commandResult = result.data
                resolve(result.data)
            })
        })
    }

    detectedCommand() {
        return this.commandResult
    }

    TTSOffline(args, util) {
        // console.log(this.joyState)
        let text = args.TEXT
        text = text.toString()
        let wait = parseInt(args.WAIT)
        text = text.trim()
        if (text.length == 0) {
            return
        }

        if (wait == 0) {
            this.runtime.ros.TTSOffline(text)
            return
        } else {
            return this.runtime.ros.TTSOffline(text)
        }
    }


    /*

    declareGrammer(args) {
        let grammar = args.GRAMMER
        this.grammer.grammer = grammar
    }
    addSlot(args) {
        let name = args.SLOT
        let value = args.VALUE
        this.grammer.slot[name] = value
    }
    saveGrammer(args) {
        let name = args.NAME
        this.grammer.name = name
        let bnf = this.grammar2BNF()
        console.log(bnf)
        if (!bnf) {
            return '语法规则不全,请确认语法槽添加完整'
        } else {
            let content = new Blob([bnf])
            this.downloadBlob(`${name}.bnf`, content)
            return '保存成功'
        }
    }
    grammar2BNF() {
        let re = /<(\w+)>/g;
        let res;
        let head = '#BNF+IAT 1.0 UTF-8;\n\n!grammar command;\n'
        let slots = ''
        while (res = re.exec(this.grammer.grammer)) {
            console.log(res);
            head += `!slot ${res[0]};\n`
            let name = res[1]
            if (!this.grammer.slot[name]) {
                return false
            }
            slots += `${res[0]}:${this.grammer.slot[name]};`
        }
        head += `!start <commandstart>;\n<commandstart>:${this.grammer.grammer};\n`
        let bnf = head + slots
        return bnf
    }
    */

    SpeechRecognitionOffline() {
        this.recognitionEnd = false
        this.recognitionResult = ''
        this.recognitionConfidence = 0
        return new Promise(resolve => {
            this.runtime.ros.detectCommand().then(result => {
                this.recognitionResult = result.data
                this.recognitionEnd = true
                resolve(result.data)
            })
        })
    }
    SpeechRecognitionEnd() {
        return this.recognitionEnd
    }
    SpeechRecognitionResult() {
        return this.recognitionResult
    }
    Text2Pinyin(args) {
        return pinyin(args.TEXT, { toneType: args.TONE })
    }
    SpeechRecognitionConfidence() {
        return parseInt(this.recognitionConfidence * 100)
    }
    formatSpeakerList() {
        try {
            window.speechSynthesis.getVoices().map(item => {
                if (item.localService) {
                    voicesMap[item.name] = item
                }
                // console.log(item, item.localService, voicesMap)
            })
        } catch (error) {
            console.log(error)
        }

        // console.log(window.speechSynthesis.getVoices(), voicesMap)
        return Menu.formatMenu2(Object.keys(voicesMap))
    }

    SpeakOffline(args) {
        try {
            let msg = new SpeechSynthesisUtterance();

            // Set the text.
            msg.text = args.TEXT;

            // Set the attributes.
            msg.volume = parseFloat(args.VOLUME) / 100;
            msg.rate = parseFloat(args.RATE) / 10;
            msg.pitch = parseFloat(args.PITCH) / 100 * 2;
            if (voicesMap[args.SPEAKER]) {
                msg.voice = voicesMap[args.SPEAKER];
            }
            window.speechSynthesis.speak(msg);
        } catch (error) {
            console.log(error)
        }

    }

    SpeakEnd() {
        return window.speechSynthesis.speaking == false
    }

}


(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        console.log('Blockly.Python not defined')
        return
    }
    const prefix = 'lepiFaceRecognize_'
    Blockly.Python[`${prefix}block_function`] = function (block) {
        // plain input
        // const key = Blockly.Python.valueToCode(block, 'DATA')

        // faceLabels: 'formatFaceLabels',
        // const key = block.getFieldValue('TAG')

        // faceParams: Menu.formatMenu(['x坐标', 'y坐标', '宽度', '高度']),
        // var param = block.getInputTargetBlock('DATA')
        // var id = param.getFieldValue('data')
        Blockly.Python.definitions_['import_or_init_FaceRecognizer'] = 'from face_recognizer import FaceRecognizer'
        // console.log(key, key2)
        return `do something\n` //Command
        //or return [`barcodeScanner.barcode[${id}]`, Blockly.Python.ORDER_FUNCTION_CALL] // Boolean Reporter
    };
    console.log('scratch3_lepi loaded')

})()

module.exports = LepiSmartAudio;