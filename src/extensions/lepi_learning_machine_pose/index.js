const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const JSZip = require('jszip');
const tf = require('@tensorflow/tfjs');
const tmPose = require('@teachablemachine/pose');
const { THREAD_STEP_INTERVAL } = require('../../engine/runtime');
const JSZipUtils = require('jszip-utils');
const { parse } = require('path');
const { setWasmPath, setWasmPaths } = require('@tensorflow/tfjs-backend-wasm');

// const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEREQ3NTI5QjdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEREQ3NTI5QTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpkYWJmYjkwNy0zN2YxLTQ2OTktOGJkMi1mMjdjZmVjMjRlMWIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz651DiSAAAEU0lEQVRYR+2XX0xbdRTHvy20UCgtjEKQvy4wgblkYQ5BmdMJzuEWn9REt4clmkwTzTadJgsPmswHDYiSGDMSH4w+6B5dIoxNx5wQ0MXFZakMxjYw04UA2/p3tKW9nnP3Yytye+9tKZGHfpoLv/v7XX58e875nXOuwf5Th4RVjFH8XrWkBC6XlMDlkhIoSRLCUkS+eBwvKyYwQmJcoTm4A14SxyIluINeeY7XFuAxr8VCM1HzBv5wCNlpJhgMBjGrTigSgT/kx0c1z+CdBxuRbrhvh67JczgwcoL+M+0VnofJlInyTBumgn6kKeyvKpDF8fVG+SZ0XBmAzZytKXKeXMlfyPX0IeSkm8XsYlzzAbRfG8bBikeRb7bA0f8pApF5ErjUoaouDkbCaMgtRvtDzdi/9nG459yL3PNfOMZ8AR9GmvbFFMfY0zPw4bonZXEPD3Zj1n9LFqcUo6oCQ2SNDdYCefwZuevYIy/DE/DARxZS2myOvtBTBVWozs4XM+qwtb/a8DwubH0THrKqEjoOyX2XvlRUi1Dr+9iSWypbk10ZLTQYCeG10jpxpw3HZr39AWwc+hKWGDGuKpA3GPHOiLu78Fx//R5c3nYArY5K+ZS6KMDdbAESXJaRI57UR+UvX8BMe0YfpGhUBZqMRpyaGRd3i6nKWoPv616E9NwH6Nn8Ct6uaEBdXjmCUlg8oY3TO42rninZerGIKZATa3GGlTxsxMHRU2JWGbZkR3Uzzj/2Klry14pZbSbvuEhBurhTJqZAA33G6XRJz7ahJktf0MfLH2Q9NoAaMVeNImBf/7MX+8o2yeNkM3j7OszGNHGnjKr8nDQzuieGlxyUZNEzPY6MRF3M8LG3UhyuHziKO1SWksnZm39RqQprVib1ACA4w1uoKmT1HZFPXbJoGz8DM1UUdXk6BHIi5vL2ce0O7L90EsO3/xYriTPmm8XAzBVkasQfoymQXUCdnBzQP27ejcbcErGSONt//w4WHY0HoymQyaJEenxqFDvPHxMzifPWSB8mKX1xEdCDvqcIO3UefOqKznThUoKnuoMywufXhmCjHpDzrB50C+RYtFFQz1IjWtvfiQLq4b694RSr2pycvYp3nT2wUVbQ49oFFBtWPhTecJBERUgZz9APHtO3rqL2a1fhOrxQWIOmvFJe1OSTiV9xyPkDbNQ5xyOOWSKQxXEV6axuQREFspc6FIfJgvVWB4q4NscB1/MnfvsGQzcndHXjSihakDfmxHyYuugj1PnGC//9e2On0UmvCfzOwYcsUWK+k9xzM/V5Wx1V2FuyETsLKlFIllDiBvWFvZTbvv7nIn6evgwDxauVSuVCTU8U1Zcmhg9HgEpSgLplLk3cfeSRyDKKJ4k+1+c8uBX03Y1RSrxmo0lOwIm4UwlNgdGwWH6YE/fCyxNbyCiSRrJERaM7zTAsgAVxe85tEl885rmVEMfEJfD/ICVwuaQELpdVLhD4FxWUqvAa18UEAAAAAElFTkSuQmCC'
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;

// const classes = require('./classes')

const IMAGE_SIZE = 224
const DEFAULT_CHECK_POINT_URL_POSE = 'static/models/pose/model-stride16.json'

function capture(rasterElement) {
    return tf.tidy(() => {
        const pixels = tf.browser.fromPixels(rasterElement);

        // crop the image so we're using the center square
        const cropped = cropTensor(pixels);

        // Expand the outer most dimension so we have a batch size of 1
        const batchedImage = cropped.expandDims(0);

        // Normalize the image between -1 and a1. The image comes in between 0-255
        // so we divide by 127 and subtract 1.
        return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    });
}


function cropTensor(img) {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - (size / 2);
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - (size / 2);
    return img.slice([beginHeight, beginWidth, 0], [size, size, 1]);
}

class LepiLearningMachinePose extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.model = null
        this.model_dir = "/home/pi/Lepi_Data/ros/learning_machine/pose"
        this.classes = []
        this.ImageClassifys = []
        this.object = null
        this.threshold = 60
        this.runtime = runtime;
        this.canvas = document.createElement('canvas')
        this.canvas.width = IMAGE_SIZE
        this.canvas.height = IMAGE_SIZE
        // this.canvas.style.display = 'absolute'
        // this.canvas.style.top = '0'
        // this.canvas.style.left = '0'
        this.canvas.id = 'lepi_pose'
        document.querySelector('body').appendChild(this.canvas)
        this.pose = null
        try {
            tf.setBackend('webgl').then((fulfilled) => {
                if (fulfilled) {
                    console.log('webgl backend loaded')
                } else {
                    const usePlatformFetch = true;
                    let wasm_path = 'node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm'
                    setWasmPath(wasm_path, usePlatformFetch);
                    /*
                    setWasmPaths(
                        {
                            'tfjs-backend-wasm.wasm': '/learning-machine/node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm',
                            'tfjs-backend-wasm-simd.wasm': '/learning-machine/node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-simd.wasm',
                            'tfjs-backend-wasm-threaded-simd.wasm': '/learning-machine/node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-threaded-simd.wasm'
                        }
                    )
                    */
                    tf.setBackend('wasm').then((fulfilled) => {
                        if (fulfilled) {
                            console.log('wasm backend loaded')
                        } else {
                            tf.setBackend('cpu').then((fulfilled) => {
                                if (fulfilled) {
                                    console.log('cpu backend loaded')
                                } else {
                                    console.log('cpu backend not load')
                                }
                            });
                        }
                    });
                }
            });
        } catch (e) {
            console.log(e)
        }


        try {
            this.setSize({ W: 360, H: 360 })
            this.updateModelList()
        } catch (error) {
            console.log(error)
        }



        // document.querySelector('body').appendChild(this.canvas)
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
            id: 'lepiLearningMachinePose',
            name: formatMessage({
                id: 'lepi.lepiLearningMachinePose',
                default: '机器学习-姿态',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'openLearningMachinePose',
                    text: formatMessage({
                        id: 'lepi.openLearningMachinePose',
                        default: '打开姿态分类训练工具',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'loadPoseModel',
                    text: formatMessage({
                        id: 'lepi.loadPoseModel',
                        default: '加载人体关键点模型',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'loadModelFromFile',
                    text: formatMessage({
                        id: 'lepi.loadPoseModelFromFile',
                        default: '从文件导入姿态模型',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'updateModelList',
                    text: formatMessage({
                        id: 'lepi.updatePoseModelList',
                        default: '更新姿态模型列表',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'loadModelFromList',
                    text: formatMessage({
                        id: 'lepi.loadPoseModelFromList',
                        default: '加载姿态模型 [MODEL]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MODEL: {
                            type: ArgumentType.NUMBER,
                            menu: 'models'
                        }
                    }
                },
                {
                    opcode: 'setThreshold',
                    text: formatMessage({
                        id: 'lepi.setPoseEstimateThreshold',
                        default: '将姿态识别阈值设为 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 60
                        }
                    }
                },
                {
                    opcode: 'setSize',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'lepi.setImageSize',
                        default: '设置图像尺寸 宽:[W] 高:[H]',
                    }),
                    arguments: {
                        W: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 360,
                        },
                        H: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 360,
                        },
                    }
                },
                {
                    opcode: 'predict',
                    text: formatMessage({
                        id: 'lepi.predictPose',
                        default: '进行姿态识别',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'detectedClass',
                    text: formatMessage({
                        id: 'lepi.detectedPoseClass',
                        default: '识别到姿态 [CLASS] ?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        CLASS: {
                            type: ArgumentType.STRING,
                            // defaultValue: '分类1',
                            menu: 'labels'
                        }
                    }
                },
                {
                    opcode: 'detectKeyPoints',
                    text: formatMessage({
                        id: 'lepi.detectKeyPoints',
                        default: '进行关键点识别',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'detectedKeyPoints',
                    text: formatMessage({
                        id: 'lepi.detectedKeyPoints',
                        default: '识别到关键点 ?',
                    }),
                    blockType: BlockType.BOOLEAN,
                }, {
                    opcode: 'keyPointsData',
                    text: formatMessage({
                        id: 'lepi.keyPointsData',
                        default: '[KEYPOINT] 关键点 [DATA]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        KEYPOINT: {
                            type: ArgumentType.STRING,
                            // defaultValue: '分类1',
                            menu: 'keypoints'
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            // defaultValue: '分类1',
                            menu: 'keypointsValue'
                        },
                    }
                },
                {
                    opcode: 'getProbability',
                    text: formatMessage({
                        id: 'lepi.getPoseClassProbability',
                        default: '姿态分类 [CLASS] 置信度',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        CLASS: {
                            type: ArgumentType.STRING,
                            // defaultValue: '分类1',
                            menu: 'labels'
                        }
                    }
                }, {
                    opcode: 'detectResult',
                    text: formatMessage({
                        id: 'lepi.poseDetectResult',
                        default: '姿态识别结果',
                    }),
                    blockType: BlockType.REPORTER,
                }, {
                    opcode: 'detectScore',
                    text: formatMessage({
                        id: 'lepi.poseDetectScore',
                        default: '姿态识别置信度',
                    }),
                    blockType: BlockType.REPORTER,
                }, {
                    opcode: 'keyPointsScore',
                    text: formatMessage({
                        id: 'lepi.keyPointsScore',
                        default: '关键点识别信度',
                    }),
                    blockType: BlockType.REPORTER,
                },

            ],
            menus: {
                models: 'formatModels',
                labels: 'formatLabels',
                keypoints: Menu.formatMenu([
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
                keypointsValue: Menu.formatMenu([formatMessage({
                    id: 'lepi.x',
                    default: 'x坐标',
                }), formatMessage({
                    id: 'lepi.y',
                    default: 'y坐标',
                }), formatMessage({
                    id: 'lepi.confidence',
                    default: '置信度',
                })]),
            },

        };
    }

    openLearningMachinePose(args, util) {
        let url = `../learning-machine/pose.html`
        // if (window.location.protocol == 'https:') {
        //     url = `https://innovation.huaweiapaas.com/edu/machinePose`
        // }
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            url = `${url}#lepi=${this.runtime.vm.LEPI_IP}`
        }
        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
    }

    async loadPoseModel() {
        this.model = await tmPose.createTeachable(
            {
                tfjsVersion: tf.version.tfjs,
                tmVersion: tmPose.version,
                modelSettings: {
                    modelUrl: DEFAULT_CHECK_POINT_URL_POSE
                }
            },
        )
        return '加载成功'
    }

    loadModel(file) {
        return new Promise(async (resolve) => {
            try {
                let zip = await JSZip.loadAsync(file)
                let model_json = await zip.file('model.json').async('Blob')
                let weights = await zip.file('weights.bin').async('Blob')
                let metadata = await zip.file('metadata.json').async('Blob')
                // console.log(model_json)
                this.model = await tmPose.loadFromFiles(new File([model_json], 'model.json'), new File([weights], 'weights.bin'), new File([metadata], 'metadata.json'))
                console.log(this.model)
                this.labels = this.model._metadata.labels
            } catch (error) {
                console.log(error)
            } finally {
                resolve()
            }
        })
    }

    loadModelFromFile() {
        return new Promise(resolve => {
            let upload = document.createElement('input')
            upload.type = 'file'
            upload.accept = 'application/zip'
            upload.onchange = async () => {
                try {
                    let file = upload.files[0]
                    await this.loadModel(file)
                    resolve('加载姿态模型成功')
                } catch (error) {
                    console.log(error)
                    resolve('加载失败')
                }
            }
            upload.click()
        })
    }

    formatModels() {
        return Menu.formatMenu2(this.models)
    }

    formatLabels() {
        return Menu.formatMenu2(this.labels)
    }

    async updateModelList() {
        // let url = `http://${this.runtime.vm.LEPI_IP}:8000/explore?dir=${this.model_dir}`
        let data = await this.runtime.ros.getFileList(this.model_dir)
        this.models = data.files.filter(item => item.endsWith('.zip'))
        // this.model_dir = data.current
        return this.models.join(',')
    }

    async loadModelFromList(args, utils) {
        let model_name = args.MODEL
        // let file = '/home/pi/Lepi_Data/ros/learning_machine/image/test2.zip'
        let data = await this.runtime.ros.getFileData(`${this.model_dir}/${model_name}`)
        try {
            await this.loadModel(data)
            return Promise.resolve('加载成功')
        } catch (error) {
            console.log(error)
            return Promise.resolve('加载失败')
        }
        /*
        return new Promise(resolve => {
            JSZipUtils.getBinaryContent(`http://${this.runtime.vm.LEPI_IP}:8000${this.model_dir.replace('/home/pi/Lepi_Data', '/explore')}/${model_name}`, async (err, data) => {
                if (err) {
                    throw err; // or handle err
                }
                try {
                    await this.loadModel(data)
                    resolve('加载姿态模型成功')
                } catch (error) {
                    console.log(error)
                    resolve('加载失败')
                }
            });
        })
        */
    }

    setThreshold(args, util) {
        var value = parseInt(args.VALUE)
        this.threshold = value
    }

    async predict(args, util) {
        let img_src = document.querySelector('#lepi_camera')
        if (img_src) {
            let ctx = this.canvas.getContext('2d')
            let x = this.runtime.rect[0]
            let y = this.runtime.rect[1]
            let w = this.runtime.rect[2]
            let h = this.runtime.rect[3]
            ctx.drawImage(img_src, x, y, w, h, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
            const { pose, posenetOutput } = await this.model.estimatePose(this.canvas)
            this.pose = pose
            let result = await this.model.predict(posenetOutput)
            // let result = await this.predict_tiny(this.canvas)
            this.classes = result
            console.log(pose, result)
            let probability = 0
            let id = -1
            for (let index = 0; index < result.length; index++) {
                const element = result[index];
                if (element.probability > probability) {
                    probability = element.probability
                    id = index
                }
            }
            if (probability * 100 > this.threshold) {
                this.object = result[id]
                return result[id].className
            } else {
                this.object = null
                return ''
            }
        } else {
            this.object = null
            return '没有摄像头图像'
        }
    }

    async predict_tiny(image, flipped = false) {

        const logits = tf.tidy(() => {
            const captured = capture(image);
            return this.model.model.predict(captured);
        });


        console.log(logits)
        const values = await logits.data();

        const classes = [];
        for (let i = 0; i < values.length; i++) {
            classes.push({
                className: this.model._metadata.labels[i],
                probability: values[i]
            });
        }

        tf.dispose(logits);

        return classes;
    }


    detectedClass(args, util) {
        var class_ = args.CLASS
        var object = this.classes.filter(item => item.className == class_)[0]
        if (object && object.probability * 100 > this.threshold) {
            return true
        } else {
            return false
        }
    }

    detectResult(args, util) {
        if (this.object) {
            return this.object.className
        } else {
            return ''
        }
    }
    getProbability(args, util) {
        var class_ = args.CLASS
        var object = this.classes.filter(item => item.className == class_)[0]
        if (object) {
            return parseInt(object.probability * 100)
        } else {
            return 0
        }
    }

    detectScore(args, util) {
        if (this.object) {
            return parseInt(this.object.probability * 100)
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
    }

    async detectKeyPoints() {
        let img_src = document.querySelector('#lepi_camera')
        if (img_src) {
            let ctx = this.canvas.getContext('2d')
            let x = this.runtime.rect[0]
            let y = this.runtime.rect[1]
            let w = this.runtime.rect[2]
            let h = this.runtime.rect[3]
            ctx.drawImage(img_src, x, y, w, h, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
            const { pose, posenetOutput } = await this.model.estimatePose(this.canvas)
            console.log(pose)
            this.pose = pose
            if (this.pose) {
                return '识别到关键点'
            } else {
                return '未识别到关键点'
            }
        } else {
            return '没有摄像头图像'
        }
    }

    detectedKeyPoints() {
        if (this.pose) {
            return true
        } else {
            return false
        }
    }
    keyPointsData(args, util) {
        let id = parseInt(args.KEYPOINT)
        let param = parseInt(args.DATA)
        if (this.pose) {
            if (param == 0) {
                return this.pose.keypoints[id].position.x
            } else if (param == 1) {
                return this.pose.keypoints[id].position.y
            } else if (param == 2) {
                return parseInt(this.pose.keypoints[id].score * 100)
            }
        } else {
            return 0
        }
    }

    keyPointsScore() {
        if (this.pose) {
            return parseInt(this.pose.score * 100)
        } else {
            return 0
        }
    }
}
/*
['nose',
 'leftEye',
 'rightEye',
 'leftEar',
 'rightEar',
 'leftShoulder',
 'rightShoulder',
 'leftElbow',
 'rightElbow',
 'leftWrist',
 'rightWrist',
 'leftHip',
 'rightHip',
 'leftKnee',
 'rightKnee',
 'leftAnkle',
 'rightAnkle']
*/
module.exports = LepiLearningMachinePose;