const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

// const aubio = require("aubiojs")
const fft = require('fft-js').fft
const fftUtil = require('fft-js').util
/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;

const nameMap = {
    'FORCE': '力传感器',
    'TEMPE': '热电偶温度传感器',
    'VOLTA': '电压传感器',
    'ECURR': '电流传感器',
    'SOUND': '声音传感器',
    'SPECT': '光谱传感器',
    'INFRA': '红外温度传感器',
    'MVOLT': '微电压传感器',
    'MCURR': '微电流传感器',
    'CUSTOM': '自定义传感器',
}

class LineBreakTransformer2 {
    constructor() {
        this.container = '';
    }

    transform(chunk, controller) {
        this.container += chunk;
        const lines = this.container.split('\r\n');
        this.container = lines.pop();
        lines.forEach(line => controller.enqueue(line));
    }

    flush(controller) {
        controller.enqueue(this.container);
    }
}

class LepiScienceSensor extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.sensorState = {}
        this.sensorNameMap = {}
        this.keepReading = false;

        this.runtime = runtime;

        this.runtime.on('LEPI_CONNECTED', () => {
        })
        this.runtime.vm.on('PROJECT_RUN_STOP', () => {
            // console.log('PROJECT_RUN_STOP')
            this.keepReading = false
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
            id: 'lepiScienceSensor',
            name: '科学传感器',
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                // {
                //     opcode: 'openSerialMonitor',
                //     text: formatMessage({
                //         id: 'lepi.openSerialMonitor',
                //         default: '打开串口绘图器',
                //     }),
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //     }
                // },
                {
                    opcode: 'connectSensors',
                    text: '连接科学传感器',
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'sensorValueUpdated',
                    text: '[SENSOR] 数据有更新?',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        SENSOR: {
                            type: ArgumentType.STRING,
                            menu: 'sensors'
                        },
                    }
                }, {
                    opcode: 'getSensorValue',
                    text: '[SENSOR] 获取 [ATTR]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        SENSOR: {
                            type: ArgumentType.STRING,
                            menu: 'sensors'
                        },
                        ATTR: {
                            type: ArgumentType.STRING,
                            menu: 'attr'
                        },
                    }
                },
                {
                    opcode: 'scienceSensorValueUpdated',
                    text: '[SENSOR] 数据有更新?',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        SENSOR: {
                            type: ArgumentType.STRING,
                            menu: 'all_sensors'
                        },
                    }
                },
                {
                    opcode: 'getScienceSensorValue',
                    text: '[SENSOR] 获取 [ATTR]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        SENSOR: {
                            type: ArgumentType.STRING,
                            menu: 'all_sensors'
                        },
                        ATTR: {
                            type: ArgumentType.STRING,
                            menu: 'attr'
                        },
                    }
                },
                {
                    opcode: 'getSpectrumSensorValue',
                    text: '光谱传感器 [CHANNEL]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            menu: 'channels'
                        },
                    }
                }, {
                    opcode: 'getIRTempSensorValue',
                    text: '红外温度传感器 [IR]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        IR: {
                            type: ArgumentType.STRING,
                            menu: 'ir'
                        },
                    }
                }, {
                    opcode: 'getAudioSensorValue',
                    text: '声音传感器 [ATTR]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ATTR: {
                            type: ArgumentType.STRING,
                            menu: 'audio'
                        },
                    }
                },
            ],

            menus: {
                attr: Menu.formatMenu3(['数值', '原始数据'], ['value', 'raw_data']),
                sensors: 'formatSensorList',
                simple_sensors: Menu.formatMenu2(['力传感器', '热电偶温度传感器', '电压传感器', '电流传感器', '微电压传感器', '微电流传感器'],
                    ['FORCE', 'TEMPE', 'VOLTA', 'ECURR', 'MVOLT', 'MCURR']),
                all_sensors: Menu.formatMenu2(['力传感器', '热电偶温度传感器', '电压传感器', '电流传感器', '声音传感器', '光谱传感器', '红外温度传感器', '微电压传感器', '微电流传感器'],
                    ['FORCE', 'TEMPE', 'VOLTA', 'ECURR', 'SOUND', 'SPECT', 'INFRA', 'MVOLT', 'MCURR']),
                channels: Menu.formatMenu2(['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'CLE', 'NIR']),
                ir: Menu.formatMenu3(['环境温度', '测量温度'], ['env', 'measure']),
                audio: Menu.formatMenu3(['音量', '频率'], ['volume', 'frequency']),
            },

        };
    }

    openSerialMonitor(){
        let url = `../lepi-plottor`
        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
    }

    async readDataLoop(port, index) {
        const controller = new AbortController();
        const signal = controller.signal;
        await port.open({ baudRate: 115200 }); // set baud rate
        console.log(port)
        const textDecoder = new TextDecoderStream();
        const lineBreaker = new TransformStream(new LineBreakTransformer2())
        let textDecoderClosed = port.readable.pipeTo(textDecoder.writable, { signal })
        let lineBreakerClosed = textDecoder.readable.pipeTo(lineBreaker.writable, { signal })
        let reader = lineBreaker.readable.getReader();
        while (port.readable && this.keepReading) {
            try {
                while (this.keepReading) {
                    const { value, done } = await reader.read();
                    if (done) {
                        // Allow the serial port to be closed later.
                        reader.releaseLock();
                        // Allow the serial port to be closed later.
                        // writer.releaseLock();
                        break;
                    }
                    if (value) {
                        /*** TODO: deal with the data value ***/
                        let line = value.split(': ')
                        // console.log(value, line)
                        if (line.length == 2) {
                            let prefix = line[0].trim()
                            let data = line[1].split(',').map(Number)
                            // console.log(prefix, data, ['FORCE', 'TEMPE', 'VOLTA', 'ECURR', 'MVOLT', 'MCURR', 'SOUND'].indexOf(prefix))
                            data.shift()
                            let value = null
                            if (prefix.startsWith('SPECT')) {
                                let keys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'CLE', 'NIR']
                                value = {}
                                for (let i = 0; i < keys.length; i++) {
                                    value[keys[i]] = data[i]
                                }
                            } else if (prefix.startsWith('INFRA')) {
                                value = { 'env': data[0], 'measure': data[1] }
                            } else if (['FORCE', 'TEMPE', 'VOLTA', 'ECURR', 'MVOLT', 'MCURR', 'SOUND'].indexOf(prefix) >= 0) {
                                value = {}
                                value[prefix] = data
                            }
                            if (value) {
                                this.sensorState[index].value = value
                                this.sensorState[index].raw_data = data
                                this.sensorState[index].updated = true
                                if (this.sensorState[index].type.length == 0) {
                                    this.sensorState[index].sensor_id = prefix.trim() + index
                                    let type = prefix.trim()
                                    this.sensorState[index].type = type
                                    let count = Object.keys(this.sensorNameMap).filter(key => key.startsWith(nameMap[type])).length
                                    if (count >= 1) {
                                        this.sensorState[index].sensor_name = `${nameMap[type]}-${count + 1}`
                                        this.sensorNameMap[`${nameMap[type]}-${count + 1}`] = index
                                    } else {
                                        this.sensorState[index].sensor_name = `${nameMap[type]}`
                                        this.sensorNameMap[`${nameMap[type]}`] = index
                                    }
                                }

                                if (prefix.startsWith('SOUND')) {
                                    this.sensorState[index].buffer.push(data)
                                    if (this.sensorState[index].buffer.length > 32) {
                                        this.sensorState[index].buffer = this.sensorState[index].buffer.slice(this.sensorState[index].buffer.length - 16)
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                // Handle non-fatal read error.
                console.error(error);
            } finally {
                console.log(port.readable, this.keepReading);
            }
        }

        try {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            controller.abort('manually disconnected')

        } catch (error) {
            console.log(error)
        }
        try {
            await textDecoderClosed;
            await lineBreakerClosed;
        } catch (error) {
            console.log(error)
        }

        await port.close();

        // clearInterval(writeInt);
        console.log("port closed", reader, textDecoder, lineBreaker);
        delete this.sensorNameMap[this.sensorState[index].sensor_name]
    }

    async connectSensors(args, util) {
        this.keepReading = true
        let ports = await navigator.serial.getPorts()
        for (let index = 0; index < ports.length; index++) {
            const port = ports[index];
            if (port.getInfo().usbVendorId == 12346) {
                this.sensorState[index + 1] = {
                    type: '',
                    sensor_name: '',
                    value: '',
                    raw_data: [],
                    buffer: [],
                    updated: false
                }
                this.readDataLoop(port, index + 1)
            }
        }
    }

    formatSensorList() {
        // for 
        let keys = Object.keys(this.sensorNameMap)
        return Menu.formatMenu3(keys, keys)
    }

    sensorValueUpdated(args, util) {
        let sensor = args.SENSOR
        let sensor_id = this.sensorNameMap[sensor]
        if (this.sensorState[sensor_id] && this.sensorState[sensor_id].updated) {
            this.sensorState[sensor_id].updated = false
            return true
        } else {
            return false
        }
    }
    scienceSensorValueUpdated(args, util) {
        let sensor = args.SENSOR
        let sensor_id = this.sensorNameMap[sensor]
        if (this.sensorState[sensor_id] && this.sensorState[sensor_id].updated) {
            this.sensorState[sensor_id].updated = false
            return true
        } else {
            return false
        }
    }
    getSensorValue(args, util) {
        let sensor = args.SENSOR
        let sensor_id = this.sensorNameMap[sensor]
        let attr = args.ATTR
        if (this.sensorState[sensor_id]) {

        } else {
            return '未连接'
        }
        if (attr == 'value') {
            let type = this.sensorState[sensor_id].type
            let data = this.sensorState[sensor_id].raw_data
            if (['FORCE', 'TEMPE', 'VOLTA', 'ECURR', 'MVOLT', 'MCURR'].indexOf(type) >= 0) {
                return data[data.length - 1]
            } else {
                return JSON.stringify(this.sensorState[sensor_id].value)
            }
        } else {
            return JSON.stringify(this.sensorState[sensor_id].raw_data)
        }
    }

    getSpectrumSensorValue(args) {
        let sensor = '光谱传感器'
        let channel = args.CHANNEL
        let sensor_id = this.sensorNameMap[sensor]
        console.log(this.sensorNameMap, this.sensorState, sensor_id, channel)
        if (sensor_id) {
            return this.sensorState[sensor_id].value[channel]
        }
    }

    getIRTempSensorValue(args) {
        let sensor = '红外温度传感器'
        let channel = args.IR
        let sensor_id = this.sensorNameMap[sensor]
        if (sensor_id) {
            return this.sensorState[sensor_id].value[channel]
        }
    }
    computeFrequency(buffer) {
        var phasors = fft(buffer);

        var frequencies = fftUtil.fftFreq(phasors, 16000), // Sample rate and coef is just used for length, and frequency step
            magnitudes = fftUtil.fftMag(phasors);
        let max_value = 0
        let max_frequency = 0
        var both = frequencies.map((f, ix) => {
            if (magnitudes[ix] > max_value) {
                max_frequency = f
                max_value = magnitudes[ix]
            }
            // return { frequency: f, magnitude: magnitudes[ix] };
        });

        // console.log(max_value, max_frequency, both);
        return max_frequency
    }
    getAudioSensorValue(args) {
        let sensor = '声音传感器'
        let channel = args.ATTR
        let sensor_id = this.sensorNameMap[sensor]
        if (sensor_id && this.sensorState[sensor_id].buffer.length >= 16) {
            if (channel == 'frequency') {
                let data = this.sensorState[sensor_id].buffer.slice(this.sensorState[sensor_id].buffer.length - 16).flat()
                return this.computeFrequency(data)
            } else {
                let data = this.sensorState[sensor_id].raw_data
                return data.reduce((previous, current) => Math.abs(current) + previous) / data.length
            }
        } else {
            return 0
        }
    }
    getScienceSensorValue(args) {
        let sensor = args.SENSOR
        let sensor_id = this.sensorNameMap[sensor]
        let attr = args.ATTR
        if (this.sensorState[sensor_id]) {

        } else {
            return '未连接'
        }
        if (attr == 'value') {
            let type = this.sensorState[sensor_id].type
            let data = this.sensorState[sensor_id].raw_data
            if (['FORCE', 'TEMPE', 'VOLTA', 'ECURR', 'MVOLT', 'MCURR'].indexOf(type) >= 0) {
                return data[data.length - 1]
            } else {
                return JSON.stringify(this.sensorState[sensor_id].value)
            }
        } else {
            return JSON.stringify(this.sensorState[sensor_id].raw_data)
        }
    }
}


module.exports = LepiScienceSensor;