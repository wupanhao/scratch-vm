const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const JSZip = require('jszip');
const tf = require('@tensorflow/tfjs');
const tmImage = require('@teachablemachine/image');
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
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADhmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFRTBFMTdDNUNGRDQxMUVBOTUxN0FEN0Y3Mzg2QUYzMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFRTBFMTdDNENGRDQxMUVBOTUxN0FEN0Y3Mzg2QUYzMSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmUwNmFhYzhjLTI0ODgtNDUxOS1iYWRkLTRkMTQ1NjhhZTUwYiIgc3RSZWY6ZG9jdW1l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'
const menuIconURI = blockIconURI;

// const classes = require('./classes')

const IMAGE_SIZE = 224

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

class LepiLearningMachineImage extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.model = null
        this.model_dir = "/home/pi/Lepi_Data/ros/learning_machine/image"
        this.classes = []
        this.ImageClassifys = []
        this.object = null
        this.threshold = 60
        this.runtime = runtime;
        this.canvas = document.createElement('canvas')
        this.canvas.width = IMAGE_SIZE
        this.canvas.height = IMAGE_SIZE
        this.canvas.style.display = 'absolute'
        this.canvas.style.top = '0'
        this.canvas.style.left = '0'



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
            id: 'lepiLearningMachineImage',
            name: formatMessage({
                id: 'lepi.lepiLearningMachineImage',
                default: '机器学习-图像',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'openLearningMachineImage',
                    text: formatMessage({
                        id: 'lepi.openLearningMachineImage',
                        default: '打开彩色图像训练工具',
                    }),
                    blockType: BlockType.COMMAND,
                },
                /*{
                    opcode: 'openLearningMachineTinyImage',
                    text: formatMessage({
                        id: 'lepi.openLearningMachineTinyImage',
                        default: '打开灰度图像训练工具',
                    }) ,
                    blockType: BlockType.COMMAND,
                },*/
                {
                    opcode: 'loadModelFromFile',
                    text: formatMessage({
                        id: 'lepi.loadImageModelFromFile',
                        default: '从文件导入图像模型',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'updateModelList',
                    text: formatMessage({
                        id: 'lepi.updateImageModelList',
                        default: '更新图像模型列表',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'loadModelFromList',
                    text: formatMessage({
                        id: 'lepi.loadImageModelFromList',
                        default: '加载图像模型 [MODEL]',
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
                        id: 'lepi.setImageClassifyThreshold',
                        default: '将图像识别阈值设为 [VALUE]',
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
                        id: 'lepi.predictImage',
                        default: '进行图像识别',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'detectedClass',
                    text: formatMessage({
                        id: 'lepi.detectedImageClass',
                        default: '识别到图像 [CLASS] ?',
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
                        id: 'lepi.getImageClassProbability',
                        default: '图像分类 [CLASS] 置信度',
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
                        id: 'lepi.imageDetectResult',
                        default: '图像识别结果',
                    }),
                    blockType: BlockType.REPORTER,
                }, {
                    opcode: 'objectData',
                    text: formatMessage({
                        id: 'lepi.imageDetectConfidence',
                        default: '图像识别置信度',
                    }),
                    blockType: BlockType.REPORTER,
                },

            ],
            menus: {
                models: 'formatModels',
                labels: 'formatLabels'
            },

        };
    }

    openLearningMachineImage(args, util) {
        let url = `../learning-machine/image.html`
        // if (window.location.protocol == 'https:') {
        //     url = `https://innovation.huaweiapaas.com/edu/machineImage`
        // }
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            url = `${url}#lepi=${this.runtime.vm.LEPI_IP}`
        }
        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
    }
    openLearningMachineTinyImage(args, util) {
        let url = `../learning-machine/tiny_image.html#lepi=${this.runtime.vm.LEPI_IP}`
        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
    }


    loadModel(file) {
        return new Promise(async (resolve) => {
            try {
                let zip = await JSZip.loadAsync(file, { base64: true })
                let model_json = await zip.file('model.json').async('Blob')
                let weights = await zip.file('weights.bin').async('Blob')
                let metadata = await zip.file('metadata.json').async('Blob')
                // console.log(model_json)
                this.model = await tmImage.loadFromFiles(new File([model_json], 'model.json'), new File([weights], 'weights.bin'), new File([metadata], 'metadata.json'))
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
                    if (this.model._metadata.grayscale) {
                        resolve('加载灰度模型成功')
                    } else {
                        resolve('加载彩色模型成功')
                    }
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
                    if (this.model._metadata.grayscale) {
                        resolve('加载灰度模型成功')
                    } else {
                        resolve('加载彩色模型成功')
                    }
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
            let result = await this.model.predict(this.canvas)
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

    objectData(args, util) {
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



}

module.exports = LepiLearningMachineImage;