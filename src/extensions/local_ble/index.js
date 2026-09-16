const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Menu = require('../../util/menu');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';
const menuIconURI = blockIconURI;

class LocalBLE extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.devices = [];
        this.services = {
            characteristic_uuids: [],
            properties: []
        };
        this.notification = [];
        this.new_data = false;
        this.device = null; // 当前连接的 BluetoothDevice
        this.server = null; // 当前连接的 GATT Server
        this.characteristics = {}; // 缓存已获取的特征
        this.notificationCharacteristics = {}; // 通知订阅缓存
        // 在 constructor 中添加
        this.optionalServices = [];


        // 检查 Web Bluetooth 支持
        if (!navigator.bluetooth) {
            console.warn('Web Bluetooth API 不可用，请使用 Chrome/Edge 并确保在 HTTPS 或 localhost 环境下运行。');
        }
    }

    // 新增方法
    setOptionalServices(args) {
        let services = args.SERVICES
        this.optionalServices = services.split(',').map(s => s.trim()).filter(s => s);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'localBLE',
            name: '蓝牙通信',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'setOptionalServices',
                    text: '设置要访问的服务 UUID [SERVICES]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SERVICES: {
                            type: ArgumentType.STRING,
                            defaultValue: '2854f2cd-d4a8-4b6a-9604-c520836acb5f'
                        }
                    }
                },
                {
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
        return Menu.formatMenu3(this.devices.map(item => item.name), this.devices.map(item => item.id || item.address));
    }

    formatReadableUUIDs() {
        if (this.services.characteristic_uuids && this.services.characteristic_uuids.length > 0) {
            let uuids = [];
            for (let i = 0; i < this.services.characteristic_uuids.length; i++) {
                const uuid = this.services.characteristic_uuids[i];
                if (this.services.properties[i] && this.services.properties[i].indexOf('read') >= 0) {
                    uuids.push(uuid);
                }
            }
            return Menu.formatMenu3(uuids, uuids);
        } else {
            return Menu.formatMenu3([], []);
        }
    }
    formatWritableUUIDs() {
        if (this.services.characteristic_uuids && this.services.characteristic_uuids.length > 0) {
            let uuids = [];
            for (let i = 0; i < this.services.characteristic_uuids.length; i++) {
                const uuid = this.services.characteristic_uuids[i];
                if (this.services.properties[i] && this.services.properties[i].indexOf('write') >= 0) {
                    uuids.push(uuid);
                }
            }
            return Menu.formatMenu3(uuids, uuids);
        } else {
            return Menu.formatMenu3([], []);
        }
    }
    formatNotifyUUIDs() {
        if (this.services.characteristic_uuids && this.services.characteristic_uuids.length > 0) {
            let uuids = [];
            for (let i = 0; i < this.services.characteristic_uuids.length; i++) {
                const uuid = this.services.characteristic_uuids[i];
                if (this.services.properties[i] && this.services.properties[i].indexOf('notify') >= 0) {
                    uuids.push(uuid);
                }
            }
            return Menu.formatMenu3(uuids, uuids);
        } else {
            return Menu.formatMenu3([], []);
        }
    }

    /**
     * 扫描周围设备。
     * Web Bluetooth 的 requestDevice 需要用户手势触发，并会弹出浏览器选择框。
     * 这里将用户选择的设备加入 this.devices 列表。
     */
    async scanDevices() {
        if (!navigator.bluetooth) {
            console.error('Web Bluetooth API 不可用');
            return;
        }
        try {
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['generic_access',
                    'generic_attribute',
                    'device_information',
                    'battery_service'].concat(this.optionalServices) // 可以在这里预填一些常见服务
            });
            // 避免重复添加
            const exists = this.devices.some(d => (d.id || d.address) === (device.id || device.address));
            if (!exists) {
                this.devices.push(device);
            }
            console.log('已添加设备:', device);
        } catch (error) {
            console.error('扫描设备失败:', error);
        }
    }

    deviceMac(args, util) {
        return args.DEVICE;
    }

    /**
     * 连接到设备。
     * args.DEVICE 可以是设备 id/address，也可以是设备名称。
     */
    async connectToDevice(args) {
        if (!navigator.bluetooth) {
            console.error('Web Bluetooth API 不可用');
            return;
        }
        let device = this.devices.find(d => (d.id || d.address) === args.DEVICE || d.name === args.DEVICE);
        if (!device) {
            console.error('未找到设备:', args.DEVICE);
            return;
        }
        try {
            this.device = device;
            this.server = await device.gatt.connect();
            // 监听断开
            device.addEventListener('gattserverdisconnected', () => {
                console.log('设备已断开');
                this.server = null;
                this.characteristics = {};
                this.notificationCharacteristics = {};
            });
            console.log('已连接到设备:', device.name || device.id);
        } catch (error) {
            console.error('连接设备失败:', error);
        }
    }

    isDeviceConnected(args, util) {
        return !!(this.device && this.device.gatt && this.device.gatt.connected);
    }

    async disconnectDevice() {
        if (this.device && this.device.gatt && this.device.gatt.connected) {
            this.device.gatt.disconnect();
            this.server = null;
            this.characteristics = {};
            this.notificationCharacteristics = {};
        }
    }

    /**
     * 发现设备服务特征。
     * 注意：Web Bluetooth 需要事先在 requestDevice 的 optionalServices 中声明服务 UUID，
     * 或者通过 getPrimaryServices 传入具体服务 UUID。
     * 这里为了尽量通用，尝试获取所有已授权的主服务。
     */
    async discoverServices() {
        if (!this.server) {
            console.error('未连接设备');
            return;
        }
        try {
            const services = await this.server.getPrimaryServices();
            this.services = {
                characteristic_uuids: [],
                properties: []
            };
            this.characteristics = {};
            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const characteristic of characteristics) {
                    const uuid = characteristic.uuid;
                    const props = [];
                    if (characteristic.properties.read) props.push('read');
                    if (characteristic.properties.write) props.push('write');
                    if (characteristic.properties.writeWithoutResponse) props.push('writeWithoutResponse');
                    if (characteristic.properties.notify) props.push('notify');
                    if (characteristic.properties.indicate) props.push('indicate');
                    this.services.characteristic_uuids.push(uuid);
                    this.services.properties.push(props);
                    this.characteristics[uuid] = characteristic;
                }
            }
            console.log('发现服务特征:', this.services);
        } catch (error) {
            console.error('发现服务失败:', error);
        }
    }

    /**
     * 根据 UUID 获取缓存的 characteristic。
     */
    async _getCharacteristic(uuid) {
        if (this.characteristics[uuid]) {
            return this.characteristics[uuid];
        }
        // 如果未缓存，尝试从 server 中查找
        if (this.server) {
            const services = await this.server.getPrimaryServices();
            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const characteristic of characteristics) {
                    if (characteristic.uuid === uuid) {
                        this.characteristics[uuid] = characteristic;
                        return characteristic;
                    }
                }
            }
        }
        throw new Error(`未找到特征: ${uuid}`);
    }

    async readCharacteristicString(args) {
        try {
            const characteristic = await this._getCharacteristic(args.UUID);
            const value = await characteristic.readValue();
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(value);
        } catch (error) {
            console.error('读取特征失败:', error);
            return '';
        }
    }

    async readCharacteristicBytes(args) {
        try {
            const characteristic = await this._getCharacteristic(args.UUID);
            const value = await characteristic.readValue();
            return JSON.stringify(Array.from(new Uint8Array(value.buffer)));
        } catch (error) {
            console.error('读取特征失败:', error);
            return '[]';
        }
    }

    async writeCharacteristicString(args) {
        try {
            const characteristic = await this._getCharacteristic(args.UUID);
            const encoder = new TextEncoder();
            const value = encoder.encode(args.VALUE);
            if (characteristic.properties.writeWithoutResponse) {
                await characteristic.writeValueWithoutResponse(value);
            } else {
                await characteristic.writeValue(value);
            }
        } catch (error) {
            console.error('写入特征失败:', error);
        }
    }

    async writeCharacteristicBytes(args) {
        try {
            const characteristic = await this._getCharacteristic(args.UUID);
            const value = new Uint8Array(JSON.parse(args.VALUE));
            if (characteristic.properties.writeWithoutResponse) {
                await characteristic.writeValueWithoutResponse(value);
            } else {
                await characteristic.writeValue(value);
            }
        } catch (error) {
            console.error('写入特征失败:', error);
        }
    }

    async bleSubscribeNotification(args) {
        try {
            const characteristic = await this._getCharacteristic(args.UUID);
            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', (event) => {
                const value = event.target.value;
                this.notification = Array.from(new Uint8Array(value.buffer));
                this.new_data = true;
                console.log('收到通知:', this.notification);
            });
            this.notificationCharacteristics[args.UUID] = characteristic;
        } catch (error) {
            console.error('启用通知失败:', error);
        }
    }

    hasNewNotification() {
        if (this.new_data) {
            this.new_data = false;
            return true;
        } else {
            return false;
        }
    }

    notificationData(args) {
        if (args.TYPE === 'bytes') {
            return JSON.stringify(this.notification);
        } else {
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(new Uint8Array(this.notification).buffer);
        }
    }

    async bleUnsubscribeNotification(args) {
        try {
            const characteristic = this.notificationCharacteristics[args.UUID];
            if (characteristic) {
                await characteristic.stopNotifications();
                delete this.notificationCharacteristics[args.UUID];
            }
        } catch (error) {
            console.error('取消通知失败:', error);
        }
    }
}

module.exports = LocalBLE;