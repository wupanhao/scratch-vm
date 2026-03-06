/* eslint-env browser */
/* global MQTT */
const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const mqtt = require('mqtt');

/**
 * Scratch 3.0 Matrix Display Extension
 * Controls a matrix display via MQTT protocol
 */
class LepiLedSimulator extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // MQTT client
        this.client = null;

        // MQTT configuration
        this.config = {
            broker: 'wss://broker.hivemq.com:8884/mqtt',
            clientId: 'scratch-matrix-' + Math.random().toString(36).substr(2, 9),
            commandTopic: 'matrix/command',
            dataTopic: 'matrix/data'
        };

        // Matrix dimensions
        this.rows = 32;
        this.cols = 64;
        this.size = 25;

        // Connection status
        this.connected = false;
        this.background = '#1a1a1a'
        // Color mapping for Scratch colors
        this.colorMap = {
            'red': '#ff0000',
            'orange': '#ff8c00',
            'yellow': '#ffff00',
            'green': '#00ff00',
            'blue': '#0000ff',
            'purple': '#800080',
            'white': '#ffffff',
            'black': '#000000',
            'gray': '#808080'
        };

        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.connectMQTT({})
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            this.connectMQTT({})
        })

    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'lepiLedSimulator',
            name: '模拟点阵屏',
            color1: '#4a90e2',
            color2: '#357abd',
            color3: '#2c66a8',
            menuIconURI: this.getMenuIconURI(),
            blockIconURI: this.getBlockIconURI(),
            blocks: [
                {
                    opcode: 'connectMQTT',
                    blockType: BlockType.COMMAND,
                    text: '连接到点阵屏 [BROKER]',
                    arguments: {
                        BROKER: {
                            type: ArgumentType.STRING,
                            defaultValue: `${this.runtime.vm.LEPI_IP}`
                        },
                        CLIENTID: {
                            type: ArgumentType.STRING,
                            defaultValue: 'scratch-matrix-123'
                        },
                        COMMANDTOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: 'matrix/command'
                        },
                        DATATOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: 'matrix/data'
                        }
                    }
                },
                {
                    opcode: 'disconnectMQTT',
                    blockType: BlockType.COMMAND,
                    text: '断开点阵屏连接'
                },
                {
                    opcode: 'configureMatrix',
                    blockType: BlockType.COMMAND,
                    text: '配置点阵屏 行数 [ROWS] 列数 [COLS] 大小[SIZE]',
                    arguments: {
                        ROWS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 32
                        },
                        COLS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 64
                        },
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 25
                        }
                    }
                },
                {
                    opcode: 'colorByName',
                    blockType: BlockType.REPORTER,
                    text: '颜色代码 [COLORNAME]',
                    arguments: {
                        COLORNAME: {
                            type: ArgumentType.STRING,
                            menu: 'colorNames'
                        }
                    }
                },
                {
                    opcode: 'setBackground',
                    blockType: BlockType.COMMAND,
                    text: '设置背景颜色 [COLOR]',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#1a1a1a'
                        }
                    }
                },
                {
                    opcode: 'setPixel',
                    blockType: BlockType.COMMAND,
                    text: '设置点 [ROW] 行 [COL] 列 颜色 [COLOR]',
                    arguments: {
                        ROW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        COL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#ff0000'
                        }
                    }
                },
                {
                    opcode: 'clearMatrix',
                    blockType: BlockType.COMMAND,
                    text: '清除点阵屏'
                },
                {
                    opcode: 'drawRectangle',
                    blockType: BlockType.COMMAND,
                    text: '绘制矩形 起始行 [STARTROW] 起始列 [STARTCOL] 行数 [HEIGHT] 列数 [WIDTH] 颜色 [COLOR]',
                    arguments: {
                        STARTROW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        STARTCOL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        HEIGHT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 4
                        },
                        WIDTH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 4
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#00ff00'
                        }
                    }
                },
                {
                    opcode: 'drawMatrix',
                    blockType: BlockType.COMMAND,
                    text: '绘制点阵[MATRIX] 起始行 [STARTROW] 起始列 [STARTCOL] 行数 [HEIGHT] 列数 [WIDTH] 颜色 [COLOR]',
                    arguments: {
                        MATRIX: {
                            type: ArgumentType.MATRIX,
                            defaultValue: '0101010101100010101000100'
                        },
                        STARTROW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        STARTCOL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        HEIGHT: {
                            type: ArgumentType.NUMBER,
                            menu: 'rows_cols',
                            defaultValue: 5
                        },
                        WIDTH: {
                            type: ArgumentType.NUMBER,
                            menu: 'rows_cols',
                            defaultValue: 5
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#00ff00'
                        }
                    }
                },
                {
                    opcode: 'drawLine',
                    blockType: BlockType.COMMAND,
                    text: '绘制直线 起点([STARTROW],[STARTCOL]) 终点([ENDROW],[ENDCOL]) 颜色 [COLOR]',
                    arguments: {
                        STARTROW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        STARTCOL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        ENDROW: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 15
                        },
                        ENDCOL: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 15
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#0000ff'
                        }
                    }
                },
                {
                    opcode: 'sendCustomCommand',
                    blockType: BlockType.COMMAND,
                    text: '发送自定义命令 [COMMAND]',
                    arguments: {
                        COMMAND: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"type": "clear"}'
                        }
                    }
                },
                {
                    opcode: 'isConnected',
                    blockType: BlockType.BOOLEAN,
                    text: '点阵屏已连接？'
                },
                {
                    opcode: 'getMatrixInfo',
                    blockType: BlockType.REPORTER,
                    text: '点阵屏 [INFO]',
                    arguments: {
                        INFO: {
                            type: ArgumentType.STRING,
                            menu: 'matrixInfo'
                        }
                    }
                }
            ],
            menus: {
                colorNames: Menu.formatMenu3([
                    '红色',
                    '橙色',
                    '黄色',
                    '绿色',
                    '蓝色',
                    '紫色',
                    '白色',
                    '黑色',
                    '灰色'
                ], [
                    'red',
                    'orange',
                    'yellow',
                    'green',
                    'blue',
                    'purple',
                    'white',
                    'black',
                    'gray'
                ]),
                rows_cols: ['1', '2', '3', '4', '5'],
                matrixInfo: [
                    { text: '行数', value: 'rows' },
                    { text: '列数', value: 'cols' },
                    { text: '连接状态', value: 'connected' }
                ]
            }
        };
    }

    getMenuIconURI() {
        return 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                <rect width="48" height="48" fill="#4a90e2"/>
                <g fill="#ffffff">
                    <circle cx="8" cy="8" r="3"/>
                    <circle cx="16" cy="8" r="3"/>
                    <circle cx="24" cy="8" r="3"/>
                    <circle cx="32" cy="8" r="3"/>
                    <circle cx="40" cy="8" r="3"/>
                    <circle cx="8" cy="16" r="3"/>
                    <circle cx="16" cy="16" r="3"/>
                    <circle cx="24" cy="16" r="3"/>
                    <circle cx="32" cy="16" r="3"/>
                    <circle cx="40" cy="16" r="3"/>
                    <circle cx="8" cy="24" r="3"/>
                    <circle cx="16" cy="24" r="3"/>
                    <circle cx="24" cy="24" r="3"/>
                    <circle cx="32" cy="24" r="3"/>
                    <circle cx="40" cy="24" r="3"/>
                    <circle cx="8" cy="32" r="3"/>
                    <circle cx="16" cy="32" r="3"/>
                    <circle cx="24" cy="32" r="3"/>
                    <circle cx="32" cy="32" r="3"/>
                    <circle cx="40" cy="32" r="3"/>
                    <circle cx="8" cy="40" r="3"/>
                    <circle cx="16" cy="40" r="3"/>
                    <circle cx="24" cy="40" r="3"/>
                    <circle cx="32" cy="40" r="3"/>
                    <circle cx="40" cy="40" r="3"/>
                </g>
            </svg>
        `);
    }

    getBlockIconURI() {
        return this.getMenuIconURI();
    }

    // MQTT 连接方法
    connectMQTT(args) {
        let broker = `ws://${this.runtime.vm.LEPI_IP}:8083/mqtt`
        if (args.BROKER) {
            broker = `ws://${args.BROKER}:8083/mqtt`
        }
        const clientId = this.config.clientId;
        const commandTopic = args.COMMANDTOPIC || this.config.commandTopic;
        const dataTopic = args.DATATOPIC || this.config.dataTopic;

        // 更新配置
        this.config.broker = broker;
        this.config.clientId = clientId;
        this.config.commandTopic = commandTopic;
        this.config.dataTopic = dataTopic;

        // 如果已经连接，先断开
        if (this.client) {
            this.client.end();
        }

        try {
            // 创建 MQTT 客户端
            this.client = mqtt.connect(broker, {
                clientId: clientId,
                clean: true,
                connectTimeout: 4000,
                reconnectPeriod: 1000
            });

            this.client.on('connect', () => {
                this.connected = true;
                console.log('MQTT connected successfully');
            });

            this.client.on('error', (error) => {
                console.error('MQTT connection error:', error);
                this.connected = false;
            });

            this.client.on('close', () => {
                this.connected = false;
                console.log('MQTT connection closed');
            });

        } catch (error) {
            console.error('MQTT connection failed:', error);
            this.connected = false;
        }
    }

    // 断开 MQTT 连接
    disconnectMQTT() {
        if (this.client) {
            this.client.end();
            this.client = null;
            this.connected = false;
        }
    }

    // 配置点阵屏
    configureMatrix(args) {
        const rows = Math.max(1, Math.min(100, parseInt(args.ROWS) || 32));
        const cols = Math.max(1, Math.min(100, parseInt(args.COLS) || 64));
        const size = Math.max(1, Math.min(100, parseInt(args.SIZE) || 25));

        this.rows = rows;
        this.cols = cols;
        this.size = size;

        if (this.connected && this.client) {
            const command = {
                type: 'config',
                rows: rows,
                cols: cols,
                cell_size: size
            };
            this.client.publish(this.config.commandTopic, JSON.stringify(command));
        }
    }

    // 设置单个像素
    setPixel(args) {
        const row = parseInt(args.ROW) || 0;
        const col = parseInt(args.COL) || 0;
        const color = args.COLOR || '#ff0000';

        if (this.connected && this.client) {
            const command = {
                type: 'set',
                row: row,
                col: col,
                color: color
            };
            this.client.publish(this.config.commandTopic, JSON.stringify(command));
        }
    }

    // 通过颜色名称设置像素
    colorByName(args) {
        const colorName = args.COLORNAME || 'red'
        const color = this.colorMap[colorName] || '#ff0000';
        return color
    }

    setBackground(args) {
        const color = args.COLOR || '#1a1a1a';
        this.background = color
    }

    // 清除点阵屏
    clearMatrix() {
        if (this.connected && this.client) {
            // const command = { type: 'clear' };
            // this.client.publish(this.config.commandTopic, JSON.stringify(command));
            this.drawRectangle({ WIDTH: this.cols, HEIGHT: this.rows, COLOR: this.background })
        }
    }

    // 绘制矩形
    drawRectangle(args) {
        const startRow = parseInt(args.STARTROW) || 0;
        const startCol = parseInt(args.STARTCOL) || 0;
        const height = Math.max(1, parseInt(args.HEIGHT) || 4);
        const width = Math.max(1, parseInt(args.WIDTH) || 4);
        const color = args.COLOR || '#00ff00';

        if (this.connected && this.client) {
            // 创建矩形数据
            const rectangleData = [];
            for (let i = 0; i < height; i++) {
                rectangleData[i] = [];
                for (let j = 0; j < width; j++) {
                    rectangleData[i][j] = color;
                }
            }

            const command = {
                type: 'image',
                startRow: startRow,
                startCol: startCol,
                data: rectangleData
            };
            this.client.publish(this.config.commandTopic, JSON.stringify(command));
        }
    }

    drawMatrix(args) {
        const startRow = parseInt(args.STARTROW) || 0;
        const startCol = parseInt(args.STARTCOL) || 0;
        const height = Math.max(1, parseInt(args.HEIGHT) || 5);
        const width = Math.max(1, parseInt(args.WIDTH) || 5);
        const color = args.COLOR || '#00ff00';

        console.log(args.MATRIX)

        if (this.connected && this.client) {
            // 创建矩形数据
            const rectangleData = [];
            for (let i = 0; i < height; i++) {
                rectangleData[i] = [];
                for (let j = 0; j < width; j++) {
                    if (args.MATRIX[i * 5 + j] == '1') {
                        rectangleData[i][j] = color;
                    } else {
                        rectangleData[i][j] = this.background;
                    }
                }
            }

            const command = {
                type: 'image',
                startRow: startRow,
                startCol: startCol,
                data: rectangleData
            };
            this.client.publish(this.config.commandTopic, JSON.stringify(command));
        }
    }

    // 绘制直线（简单实现，使用Bresenham算法）
    drawLine(args) {
        const startRow = parseInt(args.STARTROW) || 0;
        const startCol = parseInt(args.STARTCOL) || 0;
        const endRow = parseInt(args.ENDROW) || 15;
        const endCol = parseInt(args.ENDCOL) || 15;
        const color = args.COLOR || '#0000ff';

        if (this.connected && this.client) {
            // Bresenham直线算法
            const lineData = this.bresenhamLine(startRow, startCol, endRow, endCol, color);
            console.log(lineData)
            if (lineData.length > 0) {
                const command = {
                    type: 'image',
                    startRow: Math.min(startRow, endRow),
                    startCol: Math.min(startCol, endCol),
                    data: lineData
                };
                this.client.publish(this.config.commandTopic, JSON.stringify(command));
            }
        }
    }

    // Bresenham直线算法实现
    bresenhamLine(x0, y0, x1, y1, color) {
        const points = [];
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;
        console.log(x0, y0, x1, y1)
        let x = x0
        let y = y0
        while (true) {
            points.push({ x: x, y: y });
            console.log(x, y, x1, y1)
            if (x === x1 && y === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }

        // 转换为二维数组格式
        const minX = Math.min(x0, x1);
        const minY = Math.min(y0, y1);
        const maxX = Math.max(x0, x1);
        const maxY = Math.max(y0, y1);
        const width = maxY - minY + 1;
        const height = maxX - minX + 1;

        const data = Array(height).fill().map(() => Array(width).fill(this.background));
        points.forEach(point => {
            const row = point.x - minX;
            const col = point.y - minY;
            if (row >= 0 && row < height && col >= 0 && col < width) {
                data[row][col] = color;
            }
        });

        return data;
    }

    // 发送自定义命令
    sendCustomCommand(args) {
        const commandStr = args.COMMAND || '{"type": "clear"}';

        if (this.connected && this.client) {
            try {
                const command = JSON.parse(commandStr);
                this.client.publish(this.config.commandTopic, JSON.stringify(command));
            } catch (e) {
                console.error('Invalid JSON command:', e);
            }
        }
    }

    // 检查连接状态
    isConnected() {
        return this.connected;
    }

    // 获取点阵屏信息
    getMatrixInfo(args) {
        const info = args.INFO;
        switch (info) {
            case 'rows':
                return this.rows;
            case 'cols':
                return this.cols;
            case 'connected':
                return this.connected ? '已连接' : '未连接';
            default:
                return '';
        }
    }
}

module.exports = LepiLedSimulator;
