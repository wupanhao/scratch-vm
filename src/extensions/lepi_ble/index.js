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
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;

class LepiBLE extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.bleState = {}
        this.devices = []
        this.services = {}
        this.notification = []
        this.new_data = false
        this.runtime = runtime;
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.bleSubscribeNotificationTopic()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            this.bleSubscribeNotificationTopic()
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
            id: 'lepiBLE',
            name: '蓝牙通信',
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [{
                opcode: 'scanDevices',
                text: '扫描周围设备',
                blockType: BlockType.COMMAND,
            }, {
                opcode: 'deviceMac',
                text: '设备 [DEVICE]',
                blockType: BlockType.REPORTER,
                arguments: {
                    DEVICE: {
                        type: ArgumentType.NUMBER,
                        menu: 'deviceNames'
                    }
                }
            },
            {
                opcode: 'connectToDevice',
                text: '连接到设备 [DEVICE]',
                blockType: BlockType.COMMAND,
                arguments: {
                    DEVICE: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                    }
                }
            },
            {
                opcode: 'isDeviceConnected',
                text: '设备已连接?',
                blockType: BlockType.BOOLEAN,
                arguments: {
                    DEVICE: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                    }
                }
            },
            {
                opcode: 'disconnectDevice',
                text: '断开设备连接',
                blockType: BlockType.COMMAND,
                arguments: {
                    DEVICE: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                    }
                }
            },
            {
                opcode: 'discoverServices',
                text: '发现设备服务特征',
                blockType: BlockType.COMMAND,
                arguments: {
                    DEVICE: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                    }
                }
            },
            {
                opcode: 'readCharacteristicString',
                text: '读取特征 [UUID] 为字符串',
                blockType: BlockType.REPORTER,
                arguments: {
                    UUID: {
                        type: ArgumentType.STRING,
                        menu: 'uuids_read'
                    }
                }
            },
            {
                opcode: 'readCharacteristicBytes',
                text: '读取特征 [UUID] 为字节数组',
                blockType: BlockType.REPORTER,
                arguments: {
                    UUID: {
                        type: ArgumentType.STRING,
                        menu: 'uuids_read'
                    }
                }
            },
            {
                opcode: 'writeCharacteristicString',
                text: '写入特征 [UUID] 字符串 [VALUE]',
                blockType: BlockType.COMMAND,
                arguments: {
                    UUID: {
                        type: ArgumentType.STRING,
                        menu: 'uuids_write'
                    },
                    VALUE: {
                        type: ArgumentType.STRING,
                        defaultValue: ''
                    },
                }
            },
            {
                opcode: 'writeCharacteristicBytes',
                text: '写入特征 [UUID] 字节数组 [VALUE]',
                blockType: BlockType.COMMAND,
                arguments: {
                    UUID: {
                        type: ArgumentType.STRING,
                        menu: 'uuids_write'
                    },
                    VALUE: {
                        type: ArgumentType.STRING,
                        defaultValue: '[]'
                    },
                }
            },
            {
                opcode: 'bleSubscribeNotification',
                text: '启用通知 [UUID]',
                blockType: BlockType.COMMAND,
                arguments: {
                    UUID: {
                        type: ArgumentType.STRING,
                        menu: 'uuids_notify'
                    },
                }
            },
            {
                opcode: 'hasNewNotification',
                text: '收到新通知数据?',
                blockType: BlockType.BOOLEAN,
                arguments: {
                    UUID: {
                        type: ArgumentType.STRING,
                        menu: 'uuids_notify'
                    },
                }
            },
            {
                opcode: 'notificationData',
                text: '作为 [TYPE]的最新通知数据',
                blockType: BlockType.REPORTER,
                arguments: {
                    TYPE: {
                        type: ArgumentType.STRING,
                        menu: 'data_type'
                    },
                }
            },
            {
                opcode: 'bleUnsubscribeNotification',
                text: '取消通知 [UUID]',
                blockType: BlockType.COMMAND,
                arguments: {
                    UUID: {
                        type: ArgumentType.STRING,
                        menu: 'uuids_notify'
                    },
                }
            },

            ],
            menus: {
                deviceNames: 'formatDeviceNames',
                uuids_read: 'formatReadableUUIDs',
                uuids_write: 'formatWritableUUIDs',
                uuids_notify: 'formatNotifyUUIDs',
                data_type: Menu.formatMenu3(['字符串', '字节数组'], ['string', 'bytes'])
            },

        };
    }

    formatDeviceNames(args, util) {
        // console.log(this.joyState)
        return Menu.formatMenu3(this.devices.map(item => item.name), this.devices.map(item => item.address))
    }

    formatReadableUUIDs() {
        if (this.services.characteristic_uuids && this.services.characteristic_uuids.length > 0) {
            let uuids = []
            for (let i = 0; i < this.services.characteristic_uuids.length; i++) {
                const uuid = this.services.characteristic_uuids[i];
                if (this.services.properties[i].indexOf('read') >= 0) {
                    uuids.push(uuid)
                }
            }
            return Menu.formatMenu3(uuids, uuids)
        } else {
            return Menu.formatMenu3([], [])
        }
    }
    formatWritableUUIDs() {
        if (this.services.characteristic_uuids && this.services.characteristic_uuids.length > 0) {
            let uuids = []
            for (let i = 0; i < this.services.characteristic_uuids.length; i++) {
                const uuid = this.services.characteristic_uuids[i];
                if (this.services.properties[i].indexOf('write') >= 0) {
                    uuids.push(uuid)
                }
            }
            return Menu.formatMenu3(uuids, uuids)
        } else {
            return Menu.formatMenu3([], [])
        }
    }
    formatNotifyUUIDs() {
        if (this.services.characteristic_uuids && this.services.characteristic_uuids.length > 0) {
            let uuids = []
            for (let i = 0; i < this.services.characteristic_uuids.length; i++) {
                const uuid = this.services.characteristic_uuids[i];
                if (this.services.properties[i].indexOf('notify') >= 0) {
                    uuids.push(uuid)
                }
            }
            return Menu.formatMenu3(uuids, uuids)
        } else {
            return Menu.formatMenu3([], [])
        }
    }
    async scanDevices(args, util) {
        this.devices = JSON.parse(await this.runtime.ros.scanDevices())
    }
    deviceMac(args, util) {
        return args.DEVICE
    }
    async connectToDevice(args, util) {
        let data = await this.runtime.ros.connectToDevice(args.DEVICE)
    }

    isDeviceConnected(args, util) {
        return this.runtime.ros.isDeviceConnected()
    }

    async disconnectDevice(args, util) {
        let data = await this.runtime.ros.disconnectDevice()
    }

    async discoverServices() {
        this.services = JSON.parse(await this.runtime.ros.discoverServices())
    }

    async readCharacteristicString(args, util) {
        let data = JSON.parse(await this.runtime.ros.readCharacteristic(args.UUID))
        let decoder = new TextDecoder('utf-8')
        // console.log(data)
        return decoder.decode(new Uint8Array(data.value).buffer)
    }

    async readCharacteristicBytes(args, util) {
        let data = JSON.parse(await this.runtime.ros.readCharacteristic(args.UUID))
        console.log(data)
        return JSON.stringify(data.value)
    }

    async writeCharacteristicString(args, util) {
        const encoder = new TextEncoder()
        let data = {
            "uuid": args.UUID,
            "value": Array.from(encoder.encode(args.VALUE))
        }
        console.log(data)
        await this.runtime.ros.writeCharacteristic(JSON.stringify(data))
    }
    async writeCharacteristicBytes(args, util) {
        let data = {
            "uuid": args.UUID,
            "value": JSON.parse(args.VALUE)
        }
        console.log(data)
        await this.runtime.ros.writeCharacteristic(JSON.stringify(data))
    }

    async bleSubscribeNotification(args) {
        let data = {
            "uuid": args.UUID,
        }
        console.log(data)
        this.runtime.ros.bleSubscribeNotification(JSON.stringify(data))
    }

    bleSubscribeNotificationTopic() {
        this.runtime.ros.bleSubscribeNotificationTopic((msg) => {
            this.notification = JSON.parse(msg.data)
            console.log(this.notification)
            this.new_data = true
        })
    }

    hasNewNotification() {
        if (this.new_data) {
            this.new_data = false
            return true
        } else {
            return false
        }
    }

    notificationData(args) {
        if (args.TYPE == 'bytes') {
            return JSON.stringify(this.notification)
        } else {
            let decoder = new TextDecoder('utf-8')
            return decoder.decode(new Uint8Array(this.notification).buffer)
        }
    }

    async bleUnsubscribeNotification(args) {
        let data = {
            "uuid": args.UUID,
        }
        console.log(data)
        await this.runtime.ros.bleUnsubscribeNotification(JSON.stringify(data))
    }
}

module.exports = LepiBLE;