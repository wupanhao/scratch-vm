const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const JSZip = require('jszip');
const JSZipUtils = require('jszip-utils');

const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEREQ3NTI5QjdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEREQ3NTI5QTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpkYWJmYjkwNy0zN2YxLTQ2OTktOGJkMi1mMjdjZmVjMjRlMWIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz651DiSAAAEU0lEQVRYR+2XX0xbdRTHvy20UCgtjEKQvy4wgblkYQ5BmdMJzuEWn9REt4clmkwTzTadJgsPmswHDYiSGDMSH4w+6B5dIoxNx5wQ0MXFZakMxjYw04UA2/p3tKW9nnP3Yytye+9tKZGHfpoLv/v7XX58e875nXOuwf5Th4RVjFH8XrWkBC6XlMDlkhIoSRLCUkS+eBwvKyYwQmJcoTm4A14SxyIluINeeY7XFuAxr8VCM1HzBv5wCNlpJhgMBjGrTigSgT/kx0c1z+CdBxuRbrhvh67JczgwcoL+M+0VnofJlInyTBumgn6kKeyvKpDF8fVG+SZ0XBmAzZytKXKeXMlfyPX0IeSkm8XsYlzzAbRfG8bBikeRb7bA0f8pApF5ErjUoaouDkbCaMgtRvtDzdi/9nG459yL3PNfOMZ8AR9GmvbFFMfY0zPw4bonZXEPD3Zj1n9LFqcUo6oCQ2SNDdYCefwZuevYIy/DE/DARxZS2myOvtBTBVWozs4XM+qwtb/a8DwubH0THrKqEjoOyX2XvlRUi1Dr+9iSWypbk10ZLTQYCeG10jpxpw3HZr39AWwc+hKWGDGuKpA3GPHOiLu78Fx//R5c3nYArY5K+ZS6KMDdbAESXJaRI57UR+UvX8BMe0YfpGhUBZqMRpyaGRd3i6nKWoPv616E9NwH6Nn8Ct6uaEBdXjmCUlg8oY3TO42rninZerGIKZATa3GGlTxsxMHRU2JWGbZkR3Uzzj/2Klry14pZbSbvuEhBurhTJqZAA33G6XRJz7ahJktf0MfLH2Q9NoAaMVeNImBf/7MX+8o2yeNkM3j7OszGNHGnjKr8nDQzuieGlxyUZNEzPY6MRF3M8LG3UhyuHziKO1SWksnZm39RqQprVib1ACA4w1uoKmT1HZFPXbJoGz8DM1UUdXk6BHIi5vL2ce0O7L90EsO3/xYriTPmm8XAzBVkasQfoymQXUCdnBzQP27ejcbcErGSONt//w4WHY0HoymQyaJEenxqFDvPHxMzifPWSB8mKX1xEdCDvqcIO3UefOqKznThUoKnuoMywufXhmCjHpDzrB50C+RYtFFQz1IjWtvfiQLq4b694RSr2pycvYp3nT2wUVbQ49oFFBtWPhTecJBERUgZz9APHtO3rqL2a1fhOrxQWIOmvFJe1OSTiV9xyPkDbNQ5xyOOWSKQxXEV6axuQREFspc6FIfJgvVWB4q4NscB1/MnfvsGQzcndHXjSihakDfmxHyYuugj1PnGC//9e2On0UmvCfzOwYcsUWK+k9xzM/V5Wx1V2FuyETsLKlFIllDiBvWFvZTbvv7nIn6evgwDxauVSuVCTU8U1Zcmhg9HgEpSgLplLk3cfeSRyDKKJ4k+1+c8uBX03Y1RSrxmo0lOwIm4UwlNgdGwWH6YE/fCyxNbyCiSRrJERaM7zTAsgAVxe85tEl885rmVEMfEJfD/ICVwuaQELpdVLhD4FxWUqvAa18UEAAAAAElFTkSuQmCC'
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAX9SURBVFhH7Vd9TJR1HP/ccffcAcedHHKwFGElsTAReyFrYfQyJ/WHKU5dfzSt8UctW2+zuZX06lpz648alrm1ci2nq2wEywqTCZJuTjLEqcgAwWmKwsm9cK99vz/u4U54nufuwT+izc/4jT2/e57v7/P7vn8NjuZtUcxgGGP/ZyxuEbxZ/H8JhiIRuENjU9ZYJBR7Qz+CkbCizADtq0ExipncHKsNa/MXwB8JxnYByWBC+8gADg8PwGI0xXZTA5Obn+HECtedU2QeuNqLjuuXIBnTYrtxKBL0hUN4IqcQjfesi+3EsXOgA7VdjXCYrOI5FI3AGw4iKrTAogz0ZxQXsNCBBgM9Ezz0znNzFuGL0mrxnIi3ug9ia89h2E2W2E4cqgSrnAXYf+8zMPzyPhAOiEMFTJIgF41G4Q764LJm4c2iB/GosxAuKZO0ExLa+HLgOPZfOo0MKQPmmGaYZIi+mYDfjeiqT7DpTDO29R5RJJg0SFyWLGRa7XDISyZHwvcsXo3+pRtx1nsVNR3fY35rPSqOfIUd54/j9aIlCFVvEZr004UZmWnmuBxa4JUEuqNYkBu7jq6ql9HrG4G1qQ47BztwKeCF2ZAmHL7lWj+WHd2F4tbtuPrYa8K32BWmA1WCaTGTGsddaAJsphfIpL3eYWw62QR7+izSjERmNNK7BvGdNc0EhyUT/T43FrbtQN/Sl+AZ84jLKUGii6lBkaCJDhrwX8e+f84gSEIN7PgEPiAcHkN96XI8eWw3sshEchAowUb+2um+QJoexn3OeSRrkhbpYnsvnsIx90XFCGYoEmSnPue9hpXH91LeC5NWxknwAWWOufhzZJCeokJjySCRz77b04pX5lVQ8MXTC8NhtmLNXz/gj2t9sKqkLVUTM0kWIJNjsH8tn307fiLNGlPMg6yZA0O9qMwuoDtN9UM+Q40cQ5WgEiKkNReljUEyfyJxLbB7eChNCRNOI1B0EWQfzLfYxK31gAOHv5Moz4V1ktRFEJSE1+WX4rNzrUhP0cTsp1zmtva0YQNVEvZpPdAkKKKWbiwvDgxxAGmEzZ34m9Zi8Pvj8m78Ti31yFAlyB9yoHD5yiW/42WTbKKU5WbMQo55fC+VlW1Ox0KbC0NU5vIpP8r7LJtzphZJdYK0TKQpJwnPplTBK4+Edo5exiMUkdwIyPtai0sjV5Gq7EKc8gwJUvJvzlgEa+lQc2iK0M14yfBSm7SWfPDVwgqs72xAN+VKrSrAZuXcua98NR5w3Ibc3z9GJhFMBPuoVj7V9EH+0EQlTF5ZlPl3X/hb9G8/L16LIDWbib9PXqy5GlcJCqjilLR9LshNfidZstcVxVzW7GTyzScbRUNrITPJQaCEYNCPD4ursIIq0mgoIAjphe4vmKSZWrDnOxvxY3kNRgMJ/V0CuOqU2PNFj9dLfptOrdZ0oP9KBM6B354/hlJbLu6ngFGaKXwhP44u2YAF1M1w0zpdqBJk03FxTwySGxAN0ztRjSg0iLRyB7VjPo1Bi8/gGUgNigSZHKeHVXklwokTSQZ52qNGtf3hF9F0pRuHKGCkWO+YCBulkOJD29G+ZD3uJk2PkCtMzndMjoeoAhob1EgqEgzQy+V2F74rW4kM0pBcBfgQbhK81XU4SC3SRko1HDRKPSHXX24QpN8+womHavH2/EoxJiSOrQHS8J5Fq7CGUhenMCWompjrJ4PNyBf3kuBdZU/D/fgbqDz6DTafboY9ScMqCFKeNDS9g2IaOaNPvUf5cM6U2dqnQo6hSlBGYs38daiHDqtDp+cyHOT4qTRcnFrs1Mk8e2IfClo+nUj+wqQavicjKUFu23nlSOlouHwWTqtDs3oogbWcRa4wTIm9y3MFs8g/M02UdsxTx8zJUJ2Ll80uQgNVi8n4evCEKHN6e0IetmrnlqP+ruWxnTi2dLfgA2rHUh7c2aT88uKsPBEwMthcfRTBPATJw3iqYJk5pMUFFNGcCWTwNMhz9QX/qGKlUW0WWKBSAuYORy85GWoyeZ5WK4Oa3cxMQNIg+a9xi+DNYoYTBP4FaBvNzAf0F84AAAAASUVORK5CYII='
const menuIconURI = blockIconURI;

// const classes = require('./classes')

const IMAGE_SIZE = 224

class LepiLearningMachineFace extends EventEmitter {
    constructor(runtime) {
        super();
        this._skinId = -1;
        this._skin = null;
        this._drawable = -1;
        this._ghost = 0;
        this._forceTransparentPreview = false;

        this.model = {}
        this.modelLoaded = false
        this.model_dir = "/home/pi/Lepi_Data/ros/learning_machine/face"
        this.classes = []
        this.registeredFaces = []
        this.faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.6 });
        this.ImageClassifys = []
        this.object = null
        this.threshold = 40
        this.runtime = runtime;
        this.canvas = document.createElement('canvas')
        this.canvas.width = 480
        this.canvas.height = 360
        this.canvas.style.display = 'none'
        // this.canvas.style.top = '0'
        // this.canvas.style.left = '0'
        this.canvas.id = 'lepi_face'
        this.drawResults = true
        document.querySelector('body').appendChild(this.canvas)
        this.ctx = this.canvas.getContext('2d')
        this.hand = null

        try {
            // this.setSize({ W: 360, H: 360 })
            this.updateModelList()
            // setInterval(() => {
            //     this.updateModelList()
            // }, 3000)
        } catch (error) {
            console.log(error)
        }
        this._setupPreview()
        // document.querySelector('body').appendChild(this.canvas)
    }

    drawResult() {
        if (this._skinId != -1) {
            console.log('called drawResult', this._skinId, this.canvas)
            this.runtime.renderer.updateBitmapSkin(this._skinId, this.canvas, 1);
            this.runtime.requestRedraw();
        }
    }

    _setupPreview(args, util) {

        const {
            renderer
        } = this.runtime;
        if (!renderer) return;

        if (this._skinId === -1 && this._skin === null && this._drawable === -1) {
            this._skinId = renderer.createBitmapSkin(this.canvas);
            this._skin = renderer._allSkins[this._skinId];

            this._drawable = renderer.createDrawable(StageLayering.DRAW_LAYER);
            renderer.updateDrawableProperties(this._drawable, {
                skinId: this._skinId
            });
        }

        // if we haven't already created and started a preview frame render loop, do so
        if (!this._renderPreviewFrame) {
            renderer.updateDrawableProperties(this._drawable, {
                ghost: this._forceTransparentPreview ? 100 : this._ghost,
                visible: true
            });

        }
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
            id: 'lepiLearningMachineFace',
            name: formatMessage({
                id: 'lepi.lepiLearningMachineFace',
                default: '机器学习-人脸',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'openLearningMachineFace',
                    text: formatMessage({
                        id: 'lepi.openLearningMachineFace',
                        default: '打开人脸识别采集工具',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'loadModelFromFile',
                    text: formatMessage({
                        id: 'lepi.loadHandModelFromFile',
                        default: '从文件导入人脸模型',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'updateModelList',
                    text: formatMessage({
                        id: 'lepi.updateFaceModelList',
                        default: '更新人脸模型列表',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'loadModelFromList',
                    text: formatMessage({
                        id: 'lepi.loadHandModelFromList',
                        default: '加载人脸模型 [MODEL]',
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
                        id: 'lepi.setFaceRecognizeThreshold',
                        default: '将人脸识别阈值设为 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 40
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
                        id: 'lepi.predictFace',
                        default: '进行人脸识别',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'detectedFace',
                    text: formatMessage({
                        id: 'lepi.detectedFace',
                        default: '识别到人脸 [CLASS] ?',
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
                        id: 'lepi.getFaceRecognizeProbability',
                        default: '人脸识别 [CLASS] 置信度',
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
                        id: 'lepi.faceRecognizeResult',
                        default: '人脸识别结果',
                    }),
                    blockType: BlockType.REPORTER,
                },

                // {
                //     opcode: 'detectScore',
                //     text: formatMessage({
                //         id: 'lepi.FaceRecognizeScore',
                //         default: '人脸识别置信度',
                //     }),
                //     blockType: BlockType.REPORTER,
                // },
                {
                    opcode: 'setDrawResults',
                    text: '检测结果绘制 [ACTION] ',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ACTION: {
                            type: ArgumentType.NUMBER,
                            menu: 'toggle',
                            defaultValue: 1
                        },
                    }
                },
            ],
            menus: {
                models: 'formatModels',
                labels: 'formatLabels',
                toggle: Menu.formatMenu([formatMessage({
                    id: 'lepi.close',
                    default: '关闭',
                }), formatMessage({
                    id: 'lepi.open',
                    default: '打开',
                })]),
            },

        };
    }

    openLearningMachineFace(args, util) {

        if (window.EditorPreload && EditorPreload.openLearningMachineFace) {
            EditorPreload.openLearningMachineFace()
            return
        }

        let url = `../learning-machine/face.html`

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
                let zip = await JSZip.loadAsync(file, { base64: base64 })
                let model_json = await zip.file('model.json').async('Blob')
                let face_descriptors = JSON.parse(await model_json.text())
                this.registeredFaces = []

                this.model = {}
                this.model.labels = face_descriptors.map(item => {
                    this.registeredFaces.push({
                        name: item.name,
                        samples: [new Float32Array(item.descriptor)]
                    })
                    return item.name
                })
                console.log(this.model)
                this.labels = this.model.labels
                if (base64 == false && this.runtime.ros && this.runtime.ros.isConnected()) {
                    var reader = new FileReader();
                    reader.onload = async (e) => {
                        await this.runtime.ros.saveFileData(file.name, e.target.result, '/home/pi/Lepi_Data/ros/learning_machine/face');
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
                    resolve('加载人脸模型成功')
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
    }

    setThreshold(args, util) {
        var value = parseInt(args.VALUE)
        if (value >= 0 && value < 100) {
            this.threshold = value
        }
    }

    async onResultsStatic(detections) {
        let result = [];
        if (detections.length > 0) {
            let registeredFaces = this.registeredFaces
            if (true) {
                // 为每个检测到的人脸寻找最佳匹配

                for (let i = 0; i < detections.length; i++) {
                    const currentDescriptor = detections[i].descriptor;
                    let bestMatch = { name: '未知', distance: 1.0 };

                    // 遍历所有注册人脸，计算欧氏距离
                    for (const registered of registeredFaces) {
                        const distance = faceapi.euclideanDistance(currentDescriptor, registered.samples[0]);
                        if (distance < bestMatch.distance) {
                            bestMatch = { name: registered.name, distance };
                        }
                    }

                    // 阈值设定：距离小于0.6认为匹配成功 (可根据实际调整)
                    const threshold = 1 - (this.threshold / 100.0);
                    if (bestMatch.distance < threshold) {
                        result.push({
                            className: bestMatch.name,
                            probability: 1 - bestMatch.distance,
                            box: detections[i].detection.box
                        });
                    } else {
                        result.push({
                            className: '未知',
                            probability: 0,
                            box: detections[i].detection.box
                        });
                    }


                }

                // recognitionResultEl.textContent = `🧑 ${resultTexts.join('  ·  ')}`;
            }
        }
        return result
    }
    async predict_single() {
        return new Promise(async (resolve) => {

            let canvas = document.querySelector('#lepi_camera')
            const detections = await faceapi
                .detectAllFaces(canvas, this.faceDetectionOptions)
                .withFaceLandmarks()
                .withFaceDescriptors();
            let result = await this.onResultsStatic(detections)
            resolve(result)

            if (this.drawResults) {
                let ctx = this.ctx
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // 准备用于显示的调整尺寸结果 (匹配canvas)
                const resizedDetections = faceapi.resizeResults(detections, {
                    width: canvas.width,
                    height: canvas.height
                });

                // 绘制人脸框和轮廓
                faceapi.draw.drawDetections(this.canvas, resizedDetections);
                // faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
                for (let i = 0; i < result.length; i++) {
                    // 在画布上额外绘制姓名 (基于检测框位置)
                    const box = result[i].box;
                    // console.log(box)
                    const textX = box.x + parseInt(box.width / 2);
                    const textY = box.y - 8 > 15 ? box.y - 8 : box.y + 20;
                    ctx.font = 'bold 16px "Segoe UI"';
                    ctx.fillStyle = '#4ade80';
                    ctx.shadowColor = '#000';
                    ctx.shadowBlur = 6;
                    // 获取对应名称

                    ctx.fillText(result[i].className, textX, textY);
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = 'transparent';
                }

                this.drawResult()
            }
        })

    }

    async predict(args, util) {
        let img_src = document.querySelector('#lepi_camera')
        if (!this.modelLoaded) {
            // 加载人脸识别模型
            const MODEL_URL = 'static/node_modules/@vladmandic/face-api/model';
            // 并行加载所需模型
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            this.modelLoaded = true;
        }
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

    detectedFace(args, util) {
        var class_ = args.CLASS
        var object = this.classes.filter(item => item.className == class_)[0]
        if (object && object.probability * 100 > this.threshold) {
            return true
        } else {
            return false
        }
    }

    detectResult(args, util) {
        return JSON.stringify(this.classes.map(item => item.className))
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

    setDrawResults(args, util) {
        let action = parseInt(args.ACTION)
        this.drawResults = action == 1
        if (action) {
            this.runtime.renderer.updateDrawableProperties(this._drawable, {
                visible: true
            });
        } else {
            this.runtime.renderer.updateDrawableProperties(this._drawable, {
                visible: false
            });
        }
    }

}

module.exports = LepiLearningMachineFace;