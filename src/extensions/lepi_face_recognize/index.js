const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,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'
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGNDU4OUZEQTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGNDU4OUZEOTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1l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'
const menuIconURI = blockIconURI;

class LepiFaceRecognize extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.detectedFace = null
        this.addedFaceLabel = false
        this.faceLabels = []
        this.faceDetections = []
        this.runtime = runtime;
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            try {
                this.getFaceLabels()
            } catch (error) {
                console.log(error)
            }
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'getFaceLabels')
            this.getFaceLabels()
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
            id: 'lepiFaceRecognize',
            name: formatMessage({
                id: 'lepi.lepiFaceRecognize',
                default: '人脸识别',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [

                {
                    opcode: 'detectFaces',
                    text: formatMessage({
                        id: 'lepi.detectFaces',
                        default: '检测人脸',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'faceCount',
                    text: formatMessage({
                        id: 'lepi.faceCount',
                        default: '人脸个数',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'faceData',
                    text: formatMessage({
                        id: 'lepi.faceData',
                        default: '第 [I] 个人脸的 [DATA] ',
                    }),
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
                },

                {
                    opcode: 'setThreshold',
                    text: formatMessage({
                        id: 'lepi.setThreshold',
                        default: '将检测阈值设为 [VALUE]',
                    }),
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
                    text: formatMessage({
                        id: 'lepi.setResize',
                        default: '设置缩放尺寸 宽:[W] 高:[H]',
                    }),
                    arguments: {
                        W: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 240,
                        },
                        H: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 180,
                        },
                    }
                },
                '---',
                {
                    opcode: 'detectFaceLabels',
                    text: formatMessage({
                        id: 'lepi.detectFaceLabels',
                        default: '识别人脸',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'faceDetected',
                    text: formatMessage({
                        id: 'lepi.faceDetected',
                        default: '识别到人脸?',
                    }),
                    blockType: BlockType.BOOLEAN
                },
                {
                    opcode: 'detectedFaceLabel',
                    text: formatMessage({
                        id: 'lepi.detectedFaceLabel',
                        default: '识别到 [LABEL] ?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            // defaultValue: formatMessage({
                            //     id: 'lepi.xiao_ming',
                            //     default: "小明",
                            // }),
                            menu: "faceLabels",
                        }
                    }
                },
                {
                    opcode: 'detectedFaceLabel2',
                    text: formatMessage({
                        id: 'lepi.detectedFaceLabel2',
                        default: '识别到 [LABEL] ?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            // defaultValue: formatMessage({
                            //     id: 'lepi.xiao_ming',
                            //     default: "小明",
                            // }),
                        }
                    }
                },
                {
                    opcode: 'faceParams',
                    text: formatMessage({
                        id: 'lepi.faceParams',
                        default: '人脸的 [ID]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ID: {
                            type: ArgumentType.NUMBER,
                            // defaultValue: 0,
                            menu: "faceParams",
                        }
                    }
                },
                {
                    opcode: 'addFaceLabel',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'lepi.addFaceLabel',
                        default: '标记人脸 [LABEL] ',
                    }),
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.xiao_ming',
                                default: "小明",
                            }),
                        }
                    }
                },
                // {
                //     opcode: 'addFaceLabelSuccess',
                //     text: '标记成功?',
                //     blockType: BlockType.BOOLEAN
                // },
                {
                    opcode: 'hasFaceLabel',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'lepi.hasFaceLabel',
                        default: '有 [LABEL] 的标记?',
                    }),
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.xiao_ming',
                                default: "小明",
                            }),
                        }
                    }
                },
                {
                    opcode: 'removeFaceLabel',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'lepi.removeFaceLabel',
                        default: '删除标记 [LABEL] ',
                    }),
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.xiao_ming',
                                default: "小明",
                            }),
                            menu: "faceLabels"
                        }
                    }
                },
                {
                    opcode: 'removeFaceLabel2',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'lepi.removeFaceLabel2',
                        default: '删除标记 [LABEL] ',
                    }),
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.xiao_ming',
                                default: "小明",
                            }),
                        }
                    }
                },
                '---',
                {
                    opcode: 'detectFaceMesh',
                    text: formatMessage({
                        id: 'lepi.detectFaceMesh',
                        default: '检测人脸网格',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'detectedFaceMesh',
                    text: formatMessage({
                        id: 'lepi.detectedFaceMesh',
                        default: '检测到人脸网格?',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'FaceMeshKeypoints',
                    text: formatMessage({
                        id: 'lepi.FaceMeshKeypoints',
                        default: '人脸网格[N]号关键点 [POINT]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        N: {
                            type: ArgumentType.NUMBER,
                            // defaultValue: 0,
                        },
                        POINT: {
                            type: ArgumentType.NUMBER,
                            menu: 'point',
                            // defaultValue: 0
                        }
                    }
                },
            ],
            menus: {
                faceLabels: 'formatFaceLabels',
                faceParams: Menu.formatMenu([formatMessage({
                    id: 'lepi.x',
                    default: 'x坐标',
                }), formatMessage({
                    id: 'lepi.y',
                    default: 'y坐标',
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
                }), formatMessage({
                    id: 'lepi.z',
                    default: 'z坐标',
                })]),
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
                this.getFaceData(0)
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


    formatFaceLabels() {
        return Menu.formatMenu2(this.faceLabels)
    }

    getFaceLabels() {
        return new Promise(resolve => {
            this.runtime.ros.getFaceLabels().then(result => {
                this.faceLabels = result.data
                resolve(this.faceLabels.join(','))
            })
        })
    }

    addFaceLabel(args, util) {
        this.addedFaceLabel = false

        return new Promise(resolve => {
            var label = args.LABEL.toString().replace(/\s+/g, "");
            if (label.length > 0) {
                this.runtime.ros.addFaceLabel(label).then(data => {
                    if (data == '标记成功') {
                        this.addedFaceLabel = true
                    }
                    this.getFaceLabels().then(() => {
                        resolve(data)
                    })
                })
            } else {
                // this.runtime.emit('SAY', util.target, 'say', '请填写不带符号和空格的合法值');
                resolve('请填写不带符号和空格的合法值')
            }
        })
    }

    addFaceLabelSuccess() {
        return this.addedFaceLabel
    }

    hasFaceLabel(args, util) {
        console.log(args)
        var label = args.LABEL.toString().replace(/\s+/g, "");
        return this.faceLabels.findIndex(item => item == label) >= 0
    }

    removeFaceLabel(args, util) {
        var label = args.LABEL.toString().replace(/\s+/g, "");
        if (label.length > 0) {
            return new Promise(resolve => {
                this.runtime.ros.removeFaceLabel(label).then(data => {
                    this.getFaceLabels().then(() => {
                        resolve(data)
                    })
                })
            })
        } else {
            // this.runtime.emit('SAY', util.target, 'say', '错误的标签');
            return '错误的标签'
        }
    }

    removeFaceLabel2(args, util) {
        return this.removeFaceLabel(args, util)
    }

    detectFaceLocations() {
        return new Promise(resolve => {
            this.runtime.ros.detectFaceLocations().then(result => {
                this.faceDetections = result.detections
                this.getFaceData(0)
                resolve(result.detections.length)
            })
        })
    }

    detectFaceLabels() {
        return new Promise(resolve => {
            this.runtime.ros.detectFaceLabels().then(result => {
                this.faceDetections = result.detections
                this.getFaceData(0)
                resolve(result.detections.map(detection => {
                    return detection.id
                }).join(','))
            })
        })
    }


    getFaceData(id) {
        if (id >= 0 && this.faceDetections.length > id) {
            this.detectedFace = this.faceDetections[id]
            var params = this.detectedFace.location
            var x = parseInt((params[0] + params[2]) / 2)
            var y = parseInt((params[1] + params[3]) / 2)
            var width = params[2] - params[0]
            var height = params[3] - params[1]
            this.detectedFace.params = [x, y, width, height]
        } else {
            this.detectedFace = null
        }
    }

    detectedFaceLabel(args, util) {
        var label = args.LABEL
        var id = this.faceDetections.findIndex(e => e.id == label)
        if (id >= 0 && this.faceDetections.length > id) {
            this.getFaceData(id)
            return true
        } else {
            this.detectedFace = null
            return false
        }
    }

    detectedFaceLabel2(args, util) {
        return this.detectedFaceLabel(args, util)
    }

    faceDetected(args, util) {
        var label = args.LABEL
        if (this.faceDetections.length > 0) {
            this.getFaceData(0)
            return true
        } else {
            this.detectedFace = null
            return false
        }
    }

    faceParams(args, util) {
        var param_id = parseInt(args.ID)
        if (this.detectedFace) {
            return this.detectedFace.params[param_id]
        } else {
            return 0
        }
    }

    detectFaceMesh(args, util) {
        return new Promise((resolve) => {
            this.runtime.ros.detectFaceMesh().then(data => {
                this.result = data
                resolve(this.result.length)
            })
        })
    }
    detectedFaceMesh() {
        return this.result && this.result.length >= 1
    }


    FaceMeshKeypoints(args, util) {
        let wh = [480, 360, 480]
        let key = ['x', 'y', 'z']
        let id = parseInt(args.N)
        let axis = parseInt(args.POINT)
        let k = key[axis]
        console.log(id, axis, k, this.result)
        if (this.result.length >= 1 && id <= 477) {
            return parseInt(this.result[id][k] * wh[axis])
        }
        return 0
    }

}

(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        return
    }

    console.log('LepiFace loaded')

    function autoQuote(key, block) {
        var workspace = block.workspace;
        var variables = Blockly.Variables.allUsedVarModels(workspace) || [];
        let keyIsVariable = false
        for (let i = 0; i < variables.length; i++) {
            const variable = variables[i];
            if (key == Blockly.Python.variableDB_.getName(variable.name, Blockly.Variables.NAME_TYPE)) {
                keyIsVariable = true
                break
            }
        }
        if (!keyIsVariable) {
            key = `"${key}"`
        }
        return key
    }

    const prefix = 'lepiFaceRecognize_'
    Blockly.Python[`${prefix}addFaceLabel`] = function (block) {
        // const key = block.getFieldValue('ID')
        let key = Blockly.Python.valueToCode(block, 'LABEL')
        key = autoQuote(key, block)
        // console.log(variables)
        Blockly.Python.definitions_['import_FaceRecognizer'] = 'from face_recognizer import FaceRecognizer'
        Blockly.Python.definitions_['init_FaceRecognizer'] = 'faceRecognizer = FaceRecognizer()'
        // console.log(key, key2)
        return `faceRecognizer.add_face_label(camera.getImage(), ${key}, save=True)\n`
    };

    Blockly.Python[`${prefix}removeFaceLabel`] = function (block) {
        const key = block.getFieldValue('LABEL')
        // const key = Blockly.Python.valueToCode(block, 'LABEL')
        // console.log(key, key2)
        Blockly.Python.definitions_['import_FaceRecognizer'] = 'from face_recognizer import FaceRecognizer'
        Blockly.Python.definitions_['init_FaceRecognizer'] = 'faceRecognizer = FaceRecognizer()'
        return `faceRecognizer.remove_face_label("${key}")\n`
    };
    Blockly.Python[`${prefix}removeFaceLabel2`] = function (block) {
        // console.log(key, key2)
        let key = Blockly.Python.valueToCode(block, 'LABEL')
        key = autoQuote(key, block)

        Blockly.Python.definitions_['import_FaceRecognizer'] = 'from face_recognizer import FaceRecognizer'
        Blockly.Python.definitions_['init_FaceRecognizer'] = 'faceRecognizer = FaceRecognizer()'
        return `faceRecognizer.remove_face_label(${key})\n`
    };
    Blockly.Python[`${prefix}detectedFaceLabel2`] = function (block) {
        let name = Blockly.Python.valueToCode(block, 'LABEL')
        name = autoQuote(name, block)
        return [`faceRecognizer.detectedFaceLabel(${name})`, Blockly.Python.ORDER_FUNCTION_CALL]
    };

    Blockly.Python[`${prefix}addFaceLabelSuccess`] = function (block) {
        return [`faceRecognizer.add_label_success`, Blockly.Python.ORDER_FUNCTION_CALL]
    };

    Blockly.Python[`${prefix}hasFaceLabel`] = function (block) {
        let key = Blockly.Python.valueToCode(block, 'LABEL')
        key = autoQuote(key, block)
        return [`(${key} in faceRecognizer.known_faces.keys())`, Blockly.Python.ORDER_FUNCTION_CALL]
    };

})()

module.exports = LepiFaceRecognize;