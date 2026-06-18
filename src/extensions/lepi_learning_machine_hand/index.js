const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const JSZip = require('jszip');
const tf = require('@tensorflow/tfjs');
const JSZipUtils = require('jszip-utils');
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

// 提取特征（21点 * 3坐标 = 63维）
function extractFeatures(landmarks) {
    const wrist = landmarks[0];
    let maxDist = 0;

    for (const lm of landmarks) {
        const dist = Math.sqrt(
            Math.pow(lm.x - wrist.x, 2) +
            Math.pow(lm.y - wrist.y, 2) +
            Math.pow((lm.z || 0) - wrist.z, 2)
        );
        if (dist > maxDist) maxDist = dist;
    }

    const features = [];
    for (const lm of landmarks) {
        features.push((lm.x - wrist.x) / (maxDist || 1));
        features.push((lm.y - wrist.y) / (maxDist || 1));
        features.push(((lm.z || 0) - (wrist.z || 0)) / (maxDist || 1));
    }

    return features;
}

class LepiLearningMachineHand extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.model = null
        this.modelHand = null
        this.model_dir = "/home/pi/Lepi_Data/ros/learning_machine/hand"
        this.classes = []
        this.ImageClassifys = []
        this.object = null
        this.threshold = 60
        this.runtime = runtime;
        this.canvas = document.createElement('canvas')
        this.canvas.width = IMAGE_SIZE
        this.canvas.height = IMAGE_SIZE
        this.canvas.style.display = 'none'
        // this.canvas.style.top = '0'
        // this.canvas.style.left = '0'
        this.canvas.id = 'lepi_hand'
        document.querySelector('body').appendChild(this.canvas)
        this.hand = null
        if (false) {
            // if ((navigator.platform != 'Win32') && location.hostname == 'localhost') {
            const usePlatformFetch = true;
            let wasm_path = 'node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm'
            setWasmPath(wasm_path, usePlatformFetch);
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
        } else {

            try {
                tf.setBackend('webgl').then((fulfilled) => {
                    if (fulfilled) {
                        console.log('webgl backend loaded')
                    } else {
                        const usePlatformFetch = true;
                        let wasm_path = 'node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm'
                        setWasmPath(wasm_path, usePlatformFetch);

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
        }


        try {
            // this.setSize({ W: 360, H: 360 })
            this.updateModelList()
            // setInterval(() => {
            //     this.updateModelList()
            // }, 3000)
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
            id: 'lepiLearningMachineHand',
            name: formatMessage({
                id: 'lepi.lepiLearningMachineHand',
                default: '机器学习-手势',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'openLearningMachineHand',
                    text: formatMessage({
                        id: 'lepi.openLearningMachineHand',
                        default: '打开手势分类训练工具',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'loadModelFromFile',
                    text: formatMessage({
                        id: 'lepi.loadHandModelFromFile',
                        default: '从文件导入手势模型',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'updateModelList',
                    text: formatMessage({
                        id: 'lepi.updateHandModelList',
                        default: '更新手势模型列表',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'loadModelFromList',
                    text: formatMessage({
                        id: 'lepi.loadHandModelFromList',
                        default: '加载手势模型 [MODEL]',
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
                        id: 'lepi.setHandGuestureThreshold',
                        default: '将手势分类阈值设为 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 60
                        }
                    }
                },
                // {
                //     opcode: 'setSize',
                //     blockType: BlockType.COMMAND,
                //     text: formatMessage({
                //         id: 'lepi.setImageSize',
                //         default: '设置图像尺寸 宽:[W] 高:[H]',
                //     }),
                //     arguments: {
                //         W: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 360,
                //         },
                //         H: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 360,
                //         },
                //     }
                // },
                {
                    opcode: 'predict',
                    text: formatMessage({
                        id: 'lepi.predictHand',
                        default: '进行手势分类',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'detectedClass',
                    text: formatMessage({
                        id: 'lepi.detectedHandClass',
                        default: '识别到手势 [CLASS] ?',
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
                    opcode: 'getProbability',
                    text: formatMessage({
                        id: 'lepi.getHandClassProbability',
                        default: '手势分类 [CLASS] 置信度',
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
                        id: 'lepi.handDetectResult',
                        default: '手势分类结果',
                    }),
                    blockType: BlockType.REPORTER,
                }, {
                    opcode: 'detectScore',
                    text: formatMessage({
                        id: 'lepi.handDetectScore',
                        default: '手势分类置信度',
                    }),
                    blockType: BlockType.REPORTER,
                },

            ],
            menus: {
                models: 'formatModels',
                labels: 'formatLabels',
            },

        };
    }

    openLearningMachineHand(args, util) {

        if (window.EditorPreload && EditorPreload.openLearningMachineHand) {
            EditorPreload.openLearningMachineHand()
            return
        }

        let url = `../learning-machine/hand.html`

        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            url = `${url}#lepi=${this.runtime.vm.LEPI_IP}`
        }
        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
    }


    loadModel(file, base64 = false) {
        return new Promise(async (resolve) => {
            try {

                if (!this.modelHand) {

                    this.modelHand = new Hands({
                        locateFile: (file) => {
                            return `static/node_modules/@mediapipe/hands/${file}`;
                        }
                    });
                    this.modelHand.setOptions({
                        maxNumHands: 1,
                        modelComplexity: 1,
                        minDetectionConfidence: 0.7,
                        minTrackingConfidence: 0.5
                    });

                    await this.modelHand.initialize()
                }

                let zip = await JSZip.loadAsync(file, { base64: base64 })
                let model_json = await zip.file('model.json').async('Blob')
                let weights_bin = await zip.file('weights.bin').async('Blob')
                let metadata_json = await zip.file('metadata.json').async('Blob')
                console.log(model_json, weights_bin, metadata_json)
                let modelTopologyAndWeightManifest = JSON.parse(await model_json.text())
                let metadata = JSON.parse(await metadata_json.text())
                let weights = await weights_bin.arrayBuffer()
                console.log(modelTopologyAndWeightManifest, metadata)
                // model = await window.loadPoseModelFromFiles(new File([model_json], 'model.json'), new File([weights], 'weights.bin'), new File([metadata], 'metadata.json'))
                let model = await tf.loadLayersModel(tf.io.fromMemory(
                    modelTopologyAndWeightManifest.modelTopology,
                    modelTopologyAndWeightManifest.weightsManifest[0].weights,
                    weights
                ));
                model.compile({
                    optimizer: tf.train.adam(0.001),
                    loss: 'categoricalCrossentropy',
                    metrics: ['accuracy']
                });
                model.labels = metadata.labels
                this.model = model
                console.log(this.model)
                this.labels = this.model.labels
                if (base64 == false && this.runtime.ros && this.runtime.ros.isConnected()) {
                    var reader = new FileReader();
                    reader.onload = async (e) => {
                        await this.runtime.ros.saveFileData(file.name, e.target.result, '/home/pi/Lepi_Data/ros/learning_machine/hand');
                        await this.updateModelList()
                    }
                    reader.readAsDataURL(file);
                }
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
        if (!(this.runtime.ros && this.runtime.ros.isConnected())) {
            return '没有连接主机'
        }
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
            await this.loadModel(data, true)
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

    async predict_single() {
        return new Promise((resolve) => {
            let onResultsStatic = async (results) => {
                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                    const features = extractFeatures(results.multiHandLandmarks[0]);
                    let result = await this.predict_features(features)
                    resolve(result)
                } else {
                    resolve([])
                }
            }
            this.modelHand.onResults(onResultsStatic)
            setTimeout(async () => {
                let canvas = document.querySelector('#lepi_camera')
                this.modelHand.send({ image: canvas })
            }, 50)
        })

    }


    async predict_features(features) {

        const labels = this.model.labels
        const input = tf.tensor2d([features]);
        const prediction = this.model.predict(input);
        const probabilities = await prediction.data();

        const results = labels.map((label, i) => ({
            className: label,
            probability: probabilities[i]
        }))
        // .sort((a, b) => b.confidence - a.confidence);

        input.dispose();
        prediction.dispose();
        return results
    }


    async predict(args, util) {
        let img_src = document.querySelector('#lepi_camera')
        if (this.model && img_src) {
            return new Promise(async (resolve) => {
                // let ctx = this.canvas.getContext('2d')
                // let x = this.runtime.rect[0]
                // let y = this.runtime.rect[1]
                // let w = this.runtime.rect[2]
                // let h = this.runtime.rect[3]
                // ctx.drawImage(img_src, x, y, w, h, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
                let result = await this.predict_single()
                // let result = await this.predict_tiny(this.canvas)
                this.classes = result
                console.log(result)
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
                    resolve(result[id].className)
                } else {
                    this.object = null
                    resolve('')
                }
            })

        } else {
            this.object = null
            return '没有摄像头图像'
        }
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

    keyPointsScore() {
        if (this.hand) {
            return parseInt(this.hand.score * 100)
        } else {
            return 0
        }
    }
}

module.exports = LepiLearningMachineHand;