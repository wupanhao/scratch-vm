const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Menu = require('../../util/menu');
const JSZip = require('jszip');
const tf = require('@tensorflow/tfjs');
const { setWasmPath, setWasmPaths } = require('@tensorflow/tfjs-backend-wasm');

const speechCommands = require('@tensorflow-models/speech-commands');
const JSZipUtils = require('jszip-utils');

// const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAMtSURBVFhH7ZZbSFRRFIb/M86M4/0yjpeJUimzQi0EzSCFYvKSXaR6qPDB6AKVgUj1kAZFPSQoFUFG9FCRhQhFVE+RDyGBDBYIRpqF1YM6Nd7G0Zx0VuvsiQIxm5lzBKH5Yc3ea7PXOt/es8/ZS6IxEBaxNL/aRasAoFIFAJUqAKhUAUCl+s8AJbYgT1ctqQcow7HZBvhH5xlSQ+oBhgMVB6ORtNwEGNiXgVWQOoB6oL8XuNM8ibTUMFysZUIGVkPqlFsRwOpkPXbvO4ATVZVITMoCjXNaeRdnPFP8lXJA3qlH93XYVf4DRJ5UpYXrOXEnnj7/DjjEkN9SBijvEAPqpSDcbarH3v1VnnEagqQx4l2HBukZbmDKM+yPlJ1Bhjt/Wg+zKVbAXW04g2QTU0uxOFd7GFtKteJ8KpK8g36ZEzQzLHafurtf8L9L9LrjIR09slH0ZfH66cGtYLk3dw4vzH9ADi3apKWdxRsEjCxzrE4A32w8K/xnT66zr+Uez3fMivfS/AOcAnW1awQMO2S3f6CC3HjaU7aO4qMjaJtljQCUtSplKZ08ZuDerBxemn+AHJYQp6OGuhqadNpp2P5ewORmLaNUcxS9bK0Xfm/3Kxoa6hELmbBx3MSsPF6Y74Ac0nRDT+G6aOr72Ma+UwC0t7UwXCSVWHJpqyWHvnyyUmiQPN9NFeU7KD8vRMTOmXMe8w1wnI1DuCKgDutjMgaDRkf6qO5CNeWtDSNLQRplrkykws1mylyRQJ/72ik7I4FjOIoXYW3l8yh/LufK/RfzDZCnVx/X825kiocODnTS9pJs0S/ISRVtWVE+fbVZ6crlGurv76JD5cVEM6PU0txIcTE6njFH3nnM+w81l1GOEQmRS5KQnqJFkGYSWl0IjHHpsA32ID4hGfZvdsTExmB0xAaDIQQu1zTCwqMw7hjlBGN489aFa5eGUXnKBTg9af8l324S/ujeux0Mt9vNAG5eovwauyFJEreeNKKIYf+35HH2Jb4TpklCkWUaRhOPeXlH+37VhbLJz/ct6o/ka8+HAkJ5sbDAUrfkXwAFAJUqAKhUAUClCgAq1SIHBH4CS5yFQixuY8IAAAAASUVORK5CYII='
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADhmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpERUFCRkU3RUNGQjcxMUVBOTUxN0FEN0Y3Mzg2QUYzMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpERUFCRkU3RENGQjcxMUVBOTUxN0FEN0Y3Mzg2QUYzMSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjg3MzNiMzAzLTFlN2UtNDZlNC1hMWU1LWVjMTUyOWU1OTU0OCIgc3RSZWY6ZG9jdW1l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'
const menuIconURI = blockIconURI;

// const detectResults = require('./detectResults')

const sampleRateHz = 44100
const columnTruncateLength = 232
const numFrames = 43
const fftSize = 1024

class LepiLearningMachine extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.model = null
        this.model_dir = "/home/pi/Lepi_Data/ros/learning_machine/audio"
        this.detectResults = []
        this.result = null
        this.threshold = 60
        this.runtime = runtime;
        this.data = []
        this.analyser = {}
        this.deviceArray = []

        this.constraints = {
            audio: {
                sampleRate: 44100, // not working, still 48000
                // deviceId: { exact: deviceArray[item.value].deviceId }
            },
        };

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
        this.getMicrophoneList()
        this.updateModelList()

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
            id: 'lepiLearningMachineAudio',
            name: formatMessage({
                id: 'lepi.lepiLearningMachineAudio',
                default: '机器学习-音频',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'openLearningMachineAudio',
                    text: formatMessage({
                        id: 'lepi.openLearningMachineAudio',
                        default: '打开音频训练工具',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'switchMicrophone',
                    text: formatMessage({
                        id: 'lepi.switchMicrophone',
                        default: '切换麦克风 [DEVICE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DEVICE: {
                            type: ArgumentType.STRING,
                            menu: 'microphoneList'
                        }
                    }
                },
                {
                    opcode: 'loadModelFromFile',
                    text: formatMessage({
                        id: 'lepi.loadAudioModelFromFile',
                        default: '从文件导入音频模型',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'updateModelList',
                    text: formatMessage({
                        id: 'lepi.updateAudioModelList',
                        default: '更新音频模型列表',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'loadModelFromList',
                    text: formatMessage({
                        id: 'lepi.loadAudioModelFromList',
                        default: '加载音频模型 [MODEL]',
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
                        id: 'lepi.setAudioDetectThreshold',
                        default: '将音频检测阈值设为 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: this.threshold
                        }
                    }
                },
                {
                    opcode: 'startPredict',
                    text: formatMessage({
                        id: 'lepi.startAudioPredict',
                        default: '开始音频检测,间隔[GAP]秒,持续[DURATION]秒',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        GAP: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.5
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                    }
                },
                {
                    opcode: 'stopPredict',
                    text: formatMessage({
                        id: 'lepi.stopAudioPredict',
                        default: '停止音频检测',
                    }),
                    blockType: BlockType.COMMAND,
                },
                /*
                {
                    opcode: 'startRecording',
                    text: '开始录音',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'predict',
                    text: '进行预测',
                    blockType: BlockType.COMMAND,
                }, 
                */
                {
                    opcode: 'detectedClass',
                    text: formatMessage({
                        id: 'lepi.detectedAudioClass',
                        default: '检测到音频 [CLASS] ?',
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
                        id: 'lepi.getAudioClassProbability',
                        default: '音频分类 [CLASS] 置信度',
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
                        id: 'lepi.audioDetectResult',
                        default: '音频预测结果',
                    }),
                    blockType: BlockType.REPORTER,
                }, {
                    opcode: 'resultData',
                    text: formatMessage({
                        id: 'lepi.audioDetectConfidence',
                        default: '音频预测置信度',
                    }),
                    blockType: BlockType.REPORTER,
                },

            ],
            menus: {
                models: 'formatModels',
                labels: 'formatLabels',
                microphoneList: 'formatMicrophoneList'
            },

        };
    }

    openLearningMachineAudio(args, util) {
        let url = `../learning-machine/audio.html`
        // if (window.location.protocol == 'https:') {
        //     url = `https://innovation.huaweiapaas.com/edu/machineAudio`
        // }
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            url = `${url}#lepi=${this.runtime.vm.LEPI_IP}`
        }
        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
    }

    loadModel(file) {
        return new Promise(async (resolve) => {
            try {
                let zip = await JSZip.loadAsync(file)
                let model_json = await zip.file('model.json').async('Blob')
                let weights = await zip.file('weights.bin').async('Blob')
                let metadata = await zip.file('metadata.json').async('string')
                metadata = JSON.parse(metadata)
                // console.log(model_json)

                const recognizer = speechCommands.create(
                    "BROWSER_FFT", // fourier transform type, not useful to change
                    undefined, // speech commands vocabulary feature, not useful for your models
                    await tf.io.browserFiles([new File([model_json], 'model.json'), new File([weights], 'weights.bin')]).load(),
                    metadata);

                // check that model and metadata are loaded via HTTPS requests.
                let startTime = new Date()
                await recognizer.ensureModelLoaded();
                this.model = recognizer
                this.model.warmUpModel()
                let endTime = new Date();
                var timeDiff = endTime - startTime; //in ms
                // strip the ms
                var seconds = Math.round(timeDiff);
                console.log('warmUpModel in ' + seconds + " ms");
                console.log(this.model)
                this.labels = metadata.wordLabels
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
                    resolve('加载成功')
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
                    resolve('加载成功')
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

    async startRecording(args, utils) {
        if (!this.frameIntervalTask) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();

            let stream = await navigator.mediaDevices.getUserMedia(this.constraints)

            console.log(stream)
            audio_stream = stream

            this.analyser = audioCtx.createAnalyser();

            // this.analyser.connect(distortion);

            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.0;
            let bufferLength = this.analyser.frequencyBinCount; // 1024 Half of fftSize
            console.log(bufferLength)
            let source = audioCtx.createMediaStreamSource(stream);
            source.connect(this.analyser);

            var dataBuffer = new Float32Array(bufferLength);
            var audioBuffer = new Uint8Array(bufferLength);
            var timeData = []

            var onAudioFrame = () => {

                this.analyser.getFloatFrequencyData(dataBuffer);
                this.analyser.getByteTimeDomainData(audioBuffer);
                // drawFft(dataBuffer.slice(112))
                let timeDataArray = Array.prototype.slice.call(timeData)
                // drawWav(timeDataArray)

                if (dataBuffer[0] == null) {
                    return
                }

                this.data.push(Array.prototype.slice.call(dataBuffer.slice(0, columnTruncateLength)))
                timeData.push(timeDataArray)
                if (this.data.length <= numFrames) {
                    // setImageData(imageData.data, data, canvas)
                } else {
                    this.data.splice(0, this.data.length - numFrames)
                    // let array = data.splice(0, numFrames)
                    // let audioRaw = (timeData.splice(0, numFrames))
                    // setImageData(imageData.data, array, canvas)
                    // let wavBuffer = addWavHeader(concatenateUint8Arrays(audioRaw), 44100, 8, 1)
                }
                console.log(this.data.length)

            }

            // recording = true
            this.frameIntervalTask = setInterval(
                onAudioFrame, fftSize / sampleRateHz * 1e3);

        } else {
            return '录音已经启动了'
        }
    }

    concatenateArrays(arrays) {
        let flat = []
        for (let i = 0; i < arrays.length; i++) {
            flat = flat.concat(arrays[i]);
        }
        // console.log(arrays, flat)
        return flat
    }

    async predict(args, util) {
        if (this.data.length >= numFrames) {
            let array = this.concatenateArrays(this.data.slice(0, numFrames))
            // console.log(array, this.data)
            let input = tf.tensor4d(array, [1, 43, 232, 1])
            let out = this.model.model.predict(input)
            out = out.dataSync()
            this.detectResults = [...out].map((item, i) => {
                return {
                    className: this.labels[i],
                    probability: item
                }
            })
            let max = Math.max(...out)
            let id = out.findIndex(item => item == max)
            console.log(out, this.detectResults)
            if (this.detectResults[id].probability * 100 >= this.threshold) {
                this.result = this.detectResults[id]
                return `${this.result.className}:${parseInt(this.result.probability * 100)}%`
            } else {
                this.result = null
            }
        } else {
            return '数据不够'
        }
    }

    async startPredict(args, util) {
        if (!this.model) {
            return '模型未加载'
        }
        if (this.model.isListening()) {
            return '检测已经启动'
        }

        let duration = parseFloat(args.DURATION)
        let gap = parseFloat(args.GAP)
        let overlapFactor = 0.5
        if (gap < 0.5 && gap > 0) {
            overlapFactor = 1.0 - gap
        }
        // listen() takes two arguments:
        // 1. A callback function that is invoked anytime a word is recognized.
        // 2. A configuration object with adjustable fields
        this.model.listen(result => {
            const scores = result.scores; // probability of prediction for each class
            // render the probability scores per class

            this.detectResults = [...scores].map((item, i) => {
                return {
                    className: this.labels[i],
                    probability: item
                }
            })

            console.log(this.detectResults)

            // for (let i = 0; i < result.scores.length; i++) {
            // let className = this.labels[i]

            // const id = className.split(' ').join('')
            // document.querySelector(`#result-${id} .bar-graph-bar`).style.width = `${parseInt(result.scores[i] * 100)}%`

            // const classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2);
            // labelContainer.childNodes[i].innerHTML = classPrediction;
            // }

        }, {
            includeSpectrogram: true, // in case listen should return result.spectrogram
            probabilityThreshold: 0.75,
            invokeCallbackOnNoiseAndUnknown: true,
            overlapFactor: overlapFactor,// probably want between 0.5 and 0.75. More info in README
            audioTrackConstraints: this.constraints
        });

        // Stop the recognition in 5 seconds.
        if (duration > 0) {
            setTimeout(() => this.model.stopListening(), duration * 1000);
        }
        return new Promise(resolve => {
            setTimeout(() => resolve('启动成功'), 500);
        })
    }

    stopPredict() {
        try {
            if (this.model && this.model.isListening()) {
                this.model.stopListening()
            }
        } catch (error) {
            console.log(error)
        }
        this.detectResults = []
    }

    detectedClass(args, util) {
        var class_ = args.CLASS
        var result = this.detectResults.filter(item => item.className == class_)[0]
        if (result && result.probability * 100 >= this.threshold) {
            return true
        } else {
            return false
        }
    }

    detectResult(args, util) {

        if (this.detectResults.length > 0) {
            let max = Math.max(...this.detectResults.map(item => item.probability))
            let id = this.detectResults.findIndex(item => item.probability == max)
            this.result = this.detectResults[id]
        } else {
            this.result = null
        }

        if (this.result && this.result.probability * 100 >= this.threshold) {
            return this.result.className
        } else {
            return ''
        }
    }
    getProbability(args, util) {
        var class_ = args.CLASS
        var result = this.detectResults.filter(item => item.className == class_)[0]
        if (result) {
            return parseInt(result.probability * 100)
        } else {
            return 0
        }
    }

    resultData(args, util) {
        if (this.result) {
            return parseInt(this.result.probability * 100)
        } else {
            return 0
        }
    }

    getMicrophoneList(args, util) {
        try {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                console.log(devices)
                const videoDevices = devices.filter(device => device.kind == 'audioinput')
                console.log(videoDevices)
                this.deviceArray = videoDevices.map((device, index) => {
                    return {
                        text: device.label || '麦克风 ' + index,
                        deviceId: device.deviceId,
                        value: index,
                    }
                })
            })
        } catch (e) {
            console.log(e)
        }
    }

    formatMicrophoneList(args, util) {
        if (this.deviceArray.length > 0) {
            return this.deviceArray
        } else {
            return [{
                text: '默认',
                value: ' '
            }]
        }
    }

    switchMicrophone(args, utils) {
        if (args.DEVICE.length > 1) {
            this.constraints.audio = {
                sampleRate: 44100,
                deviceId: args.DEVICE
            }
        } else {
            this.constraints.audio = {
                sampleRate: 44100
            }
        }
    }
}

module.exports = LepiLearningMachine;