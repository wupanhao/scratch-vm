const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')

// const aubio = require('./aubio')
// const aubios = require('./aubio.wasm')

/*

Aubio().then(aubio => {
    console.log(aubio)
})
*/
/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAVcSURBVFhH7VZtSJtXFH7yZWKy1A/Y2CR1zq2Jioxqp62jtTBk4qibsNFBYVAm7OdSHa3Iyib90z/F0cE6Zd2XHYLVtZtsdCDWjlHsplhR1uJErZ0fc/MjiSYxJm+yc27ySleavAkZrIw8cEje+5733Oc+55x7ryp0FCE8xFBHfh9apAgmixTBZJEimCxSBJPF/5AgH4z3Ho7y84OMIc8gPyeIxAkGgVtbO/DFigW31ug5cJ/5I0Z+d13A6XEtfnEaxDMksgSJxn9ZoODn5nbgdrkdJeUV2JW3E99+dwW5lhzMzy9QJBVCoRD/QAoEEQj4odUbUFG2B3+uOvH77AxKpy/iNc8NQEfxyC8exEeQlFnc8SR+e3sQB21P0OQBSJIEvV5Pv0FoNPElYsolwXdqP4oWiKQ+MqgAZYL81g0snVtBZmYGQpJfKGUwGODz+YQFg0GkpaVBrVaTgir4/X4xZjKZoNVqceT1V6AzLuHLz2/gry0g+y0VNBw3jnUpu1A9OZ57CTBnY/D6TygpKYHNZsPVq1eh0+kEAf5l0qwqE2OSTM7jcaP78mU0vHMSBdYXMXPnLoKU+rWDxwBfJL4CYhPkVW6SgC80QOvbwKVLl2C1WpGTk4Oenh5KrUYQYbLr6+si5axoX1+fIP7Zp+dx2P4Bch7LRnPzKRx+Kg9dLe8jeKg53EjKxaWQYmoMSavBH+cC0G8sY2pqCo2Njdja2sKFCxdQUFAQdiPlGLJ6nGo2xujQzxi/PQGVQcKeon3UzBIetRXD/G4B0hcmwg0TA7EVpFU699XDSF6sSH5+Pnp7e3Ht2jVBbnh4GK2trUJJJscmN9DAwADGx8exu2wvRieG0XDSjsLiQlipPHTk49j7ZlhFBURXkEfXgfn3riPDVkZFHRDqsDEhl8uFhoYGdHV1YXR0VNSlTK6trQ2dnZ1YWlrC2bNnUVdXJ0Jubm6K9xLFXl5dQ37jTuARehFjy4muIAUJmShtu56HOugXxMQwNQOrmZubi46ODlRXV6Ompgb9/f2iWVjFsbExoXZ6ejpGRkYEMe5sOf0qiqHLzoHPQgTD1REV0QnS3ucqPgSDKiQmZcgKMgYHB1FbW4uhoSG0t7ejsrJSKOjxeNDU1ASv14vS0lLU19cLcjLCMUBxJYr/cvj0iQFNy260RP7/E7QNrB2ohya/jBQMbNeYXGcWiwVZWVlCUbvdLrpXpI+MVWJVq6qqxP5oNBrFN/L+yAiQn9cvIePGxZgnS/QapPqbPf4DzIX7t1PMJo4zLW3KpnRoyE1L5rxHBSpP8iEjHirKj44s5KXN3OcV38rd7acTyLG2hmdOPE17LA0kRJBHiOD0mRlkZmdDFQwXCk8Q1BnhW5yE6fwRqBzz4biRScV3xIyWgRCzI3/JmAXvG59AW3CA9lIKGgEruRIywnaMCj1hBXlkA5g8MwszFTqdb+H0qXVwL06j8HQFkEY+LKESOKMcy/41dIUHoQ14tzPh0mWh6AS3MSGyxvsRZZjAK1qdg4dqy+12w7XhxuzSKqwfEjm6PW0TVDJWJwPY9fGrmJuZhMuzKeJ5vLTlrC+LkyqaeowHE+QPqLjMw51Y9qngdK1jyhHAs1/VQcMNyYWXCHgWur2Ud9Tgzkp4sc6ABuab3THJMaIrSAEfH/gIqqFu3JxzoOh7OzLmlY+mqKBFpTkdKPvmKEbmXHD/+iPyeo+Hr10xSMY+i/kNbTc+vRp6uoQK5RRWHBMcj/rNTbuAyUf3Ll5sdIkEYr9mMrRCPVd6suQY/D3VpSlE5LiGFcgxlF04qGz/BhKMF8ca/lukCCaLFMFkkSKYHIC/AZpfWt/JEqxtAAAAAElFTkSuQmCC'
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;

class LepiAudio extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.musics = []
        this.music_dir = '/home/pi/Lepi_Data/Music'
        this.audio = document.createElement('audio')
        this.audio.display = 'none'
        document.querySelector('body').appendChild(this.audio)

        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.updateMusicList()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'update Music List')
            this.updateMusicList()
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
            id: 'lepiAudio',
            name: formatMessage({
                id: 'lepi.lepiAudio',
                default: '音频',
            }) ,
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'isRecording',
                    text: formatMessage({
                        id: 'lepi.isRecording',
                        default: '录音中?',
                    }) ,
                    blockType: BlockType.BOOLEAN,
                }, {
                    opcode: 'startRecording',
                    text: formatMessage({
                        id: 'lepi.startRecording',
                        default: '开始录音',
                    }) ,
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'stopRecordingAndSave',
                    text: formatMessage({
                        id: 'lepi.stopRecordingAndSave',
                        default: '结束录音,[SAVE] [FILE_NAME].wav',
                    }) ,
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SAVE: {
                            type: ArgumentType.STRING,
                            defaultValue: 0,
                            menu: 'save'
                        },
                        FILE_NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: '-'
                        }
                    }
                }, {
                    opcode: 'previewRecording',
                    text: formatMessage({
                        id: 'lepi.previewRecording',
                        default: '回放录音',
                    }) ,
                    blockType: BlockType.COMMAND,
                },

                '---',
                {
                    opcode: 'updateMusicList',
                    text: formatMessage({
                        id: 'lepi.updateMusicList',
                        default: '更新音频列表',
                    }) ,
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'musicPlaying',
                    text: formatMessage({
                        id: 'lepi.musicPlaying',
                        default: '正在播放音频?',
                    }) ,
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'playMusic',
                    text: formatMessage({
                        id: 'lepi.playMusic',
                        default: '播放 [MUSIC] [WAITING]',
                    }) ,
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MUSIC: {
                            type: ArgumentType.STRING,
                            defaultValue: '-',
                        },
                        WAITING: {
                            type: ArgumentType.STRING,
                            defaultValue: 0,
                            menu: 'waiting'
                        },
                    }
                },
                {
                    opcode: 'music',
                    text: formatMessage({
                        id: 'lepi.music',
                        default: '音频 [MUSIC]',
                    }) ,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        MUSIC: {
                            type: ArgumentType.STRING,
                            menu: 'musics'
                        },
                    }
                }, {
                    opcode: 'musicNumber',
                    text: formatMessage({
                        id: 'lepi.musicNumber',
                        default: '第 [NUM] 段音频',
                    }) ,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NUM: {
                            type: ArgumentType.STRING,
                            defaultValue: 0,
                        },
                    }
                }, {
                    opcode: 'playControl',
                    text: formatMessage({
                        id: 'lepi.playControl',
                        default: '播放控制 [ACTION]',
                    }) ,
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ACTION: {
                            type: ArgumentType.STRING,
                            defaultValue: 0,
                            menu: 'controls'
                        },
                    }
                },

            ],
            menus: {
                waiting: Menu.formatMenu([formatMessage({
                    id: 'lepi.no_wait',
                    default: '不等待',
                }) , formatMessage({
                    id: 'lepi.wait',
                    default: '等待',
                }) ]),
                save: Menu.formatMenu([formatMessage({
                    id: 'lepi.no_save',
                    default: '不保存',
                }) , formatMessage({
                    id: 'lepi.save_as',
                    default: '保存为',
                }) ]),
                controls: Menu.formatMenu([formatMessage({
                    id: 'lepi.play_resume',
                    default: '暂停/继续',
                }) , formatMessage({
                    id: 'lepi.fast_forward',
                    default: '快进10秒',
                }) , formatMessage({
                    id: 'lepi.fast_backward',
                    default: '快退10秒',
                }) , formatMessage({
                    id: 'lepi.stop_playing',
                    default: '停止播放',
                }) , formatMessage({
                    id: 'lepi.muse',
                    default: '静音',
                }) , formatMessage({
                    id: 'lepi.volume_up',
                    default: '音量+',
                }) , formatMessage({
                    id: 'lepi.volume_down',
                    default: '音量-',
                }) ]),
                musics: 'formatMusicList',
            },

        };
    }

    startRecording(args, util) {
        // if (!(this.runtime.ros && this.runtime.ros.isConnected())) {
        //     return '没有连接主机'
        // }
        if (this.mediaRecorder) {
            return '正在录音'
        } else {
            return new Promise(resolve => {
                var constraints = { audio: true };
                this.chunks = [];

                navigator.mediaDevices.getUserMedia(constraints)
                    .then((stream) => {

                        var mediaRecorder = new MediaRecorder(stream);
                        this.mediaRecorder = mediaRecorder
                        mediaRecorder.ondataavailable = (e) => {
                            this.chunks.push(e.data);
                        }
                        // visualize(stream);

                        mediaRecorder.start();
                        console.log(mediaRecorder.state);
                        console.log("recorder started");
                        resolve('开始录音')

                    })
            })
        }
    }

    saveRecording(blob, file_name) {

        var reader = new FileReader();
        reader.onload = (e) => {
            this.runtime.ros.saveFileData(file_name + ".wav", e.target.result);
            resolve('保存成功')
        }
        reader.readAsDataURL(blob);
        /*
        return new Promise(resolve => {
            let URL = 'http://' + this.runtime.ros.ip + ':8000/upload/save'
            var data = new FormData()
            data.append('name', '音频')
            data.append('upload_file', blob, file_name + ".wav")
            var config = {
                header: {
                    'Content-Type': 'multipart/form-data'
                }
            }
            axios.post(URL, data, config).then(response => {
                console.log('response', response)
                resolve('保存成功')
            }).catch(error => {
                console.log('error', error)
                resolve('保存失败')
            })
        })
        */

    }
    stopRecordingAndSave(args, util) {

        let file_name = args.FILE_NAME
        let save = parseInt(args.SAVE)
        if (file_name == '-') {
            file_name = (new Date()).Format("yyyy-MM-dd hh.mm.ss.S")
        }
        if (this.mediaRecorder) {
            return new Promise(resolve => {

                this.mediaRecorder.onstop = (e) => {
                    console.log("data available after MediaRecorder.stop() called.");

                    var blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' });
                    this.chunks = [];
                    this.recordingURL = URL.createObjectURL(blob);
                    // this.audio.src = this.recordingURL;
                    // this.audio.play()

                    if (save) {
                        if (!(this.runtime.ros && this.runtime.ros.isConnected())) {
                            resolve('未连接到主机')
                        } else {
                            this.saveRecording(blob, file_name).then((msg) => {
                                resolve(msg)
                            })
                        }
                    } else {
                        resolve('录音完成')
                    }
                    if (this.mediaRecorder.stream != null && this.mediaRecorder.stream.getTracks().length > 0) {
                        this.mediaRecorder.stream.getTracks()[0].stop();
                    }
                    this.mediaRecorder = null
                    console.log("recorder stopped");
                }

                this.mediaRecorder.stop();
                console.log(this.mediaRecorder);

                console.log("stop recorder");
            })
        } else {
            return '没有开始录音'
        }

    }
    previewRecording() {
        if (this.recordingURL) {
            try {
                this.audio.src = this.recordingURL
                console.log(this.audio)
                this.audio.play()
            } catch (error) {
                console.log(error)
            }
        } else {
            return '你还没有录音'
        }

    }

    isRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state == 'recording') {
            return true
        } else {
            return false
        }
    }

    async updateMusicList() {
        // let url = `http://${this.runtime.vm.LEPI_IP}:8000/explore?dir=${this.music_dir}`
        let data = await this.runtime.ros.getFileList(this.music_dir)
        this.musics = data.files.filter(item => item.endsWith('.mp3') || item.endsWith('.wav'))
        // this.music_dir = data.current
        return this.musics.join(',')
    }

    formatMusicList() {
        return Menu.formatMenu2(this.musics)
    }

    music(args, util) {
        let music = args.MUSIC
        return `http://${this.runtime.vm.LEPI_IP}:8000${this.music_dir.replace('/home/pi/Lepi_Data', '/explore')}/${music}`
    }

    playMusic(args, util) {
        let src = args.MUSIC
        console.log(src)
        let waiting = parseInt(args.WAITING)
        if (waiting) {
            return new Promise(resolve => {
                if (src) {
                    this.audio.src = encodeURI(src)
                    this.audio.onended = () => {
                        resolve()
                    }
                    this.audio.play()
                }
            })
        } else if (src) {
            this.audio.src = encodeURI(src)
            this.audio.play()
        }
    }

    musicPlaying() {
        console.log(this.audio)
        return !this.audio.paused
    }

    musicNumber(args, util) {
        let i = parseInt(args.NUM)
        if (this.musics[i]) {
            return `http://${this.runtime.vm.LEPI_IP}:8000${this.music_dir.replace('/home/pi/Lepi_Data', '/explore')}/${this.musics[i]}`
        } else {
            return ''
        }
    }

    playControl(args, util) {
        let action = parseInt(args.ACTION)
        if (action == 0) {
            if (this.audio.paused) {
                this.audio.play()
            } else {
                this.audio.pause()
            }
        } else if (action == 1) {
            this.audio.currentTime += 10
        } else if (action == 2) {
            this.audio.currentTime -= 10
        } else if (action == 3) {
            this.audio.pause()
            this.audio.currentTime = 0

        } else if (action == 4) {
            this.audio.volume = 0
        } else if (action == 5) {
            this.audio.volume = Math.min(this.audio.volume + 0.1, 1)
        } else if (action == 6) {
            this.audio.volume = Math.max(this.audio.volume - 0.1, 0)
        } else {
            return `未定义的指令:${action}`
        }
    }

}

(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        return
    }

    console.log('lepi_audio loaded')

})()

module.exports = LepiAudio;