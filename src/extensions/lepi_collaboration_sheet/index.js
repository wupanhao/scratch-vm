const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHZJREFUWEft1bEJgDAQQNHoAjqTK7mGjqQzuYEWXpU0wkc84b8maYSfSLhu2JazJNbHmlb6wOYXH9Mcu2+M+xq7239vsD7JE2986yOhDKQMpAykHHWUo44ykDKQMpByklBOEspAykDKQMpJQjU3mI2PhEoeWMoFOmU8V30xDb0AAAAASUVORK5CYII='
const menuIconURI = blockIconURI;

/*
{
    "req": "op",
    "data": [
        {
            "op": "replace",
            "value": {
                "v": "233",
                "ct": {
                    "fa": "General",
                    "t": "n" // "n" for number "g" for string
                },
                "m": "233"
            },
            "path": [
                "data",
                0,
                0
            ],
            "id": "4b04d270-8f6a-4e44-b0fd-b906c6bb4cba" //sheetId
        }
    ]
}

*/

class LepiCollaborationSheet extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.sheetData = []
        this.runtime = runtime;
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.updateSheetData()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'updateSheetData')
            this.updateSheetData()
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
            id: 'lepiCollaborationSheet',
            name: '协作表格',
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'openCollaborationSheet',
                    text: '打开协作表格',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'updateSheetData',
                    text: '更新表格数据',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'uploadFromFile',
                    text: '从文件导入数据',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'exportAndDownload',
                    text: '数据导出并下载',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'rowsCount',
                    text: '表格[SHEET]行数',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        SHEET: {
                            type: ArgumentType.STRING,
                            menu: 'sheetList'
                        }
                    }
                }, {
                    opcode: 'colsCount',
                    text: '表格[SHEET]列数',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        SHEET: {
                            type: ArgumentType.STRING,
                            menu: 'sheetList'
                        }
                    }
                }, {
                    opcode: 'getCellValue',
                    text: '表格[SHEET]第[R]行 第[C]列值',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        SHEET: {
                            type: ArgumentType.STRING,
                            menu: 'sheetList'
                        },
                        R: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        C: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                }, {
                    opcode: 'setCellValue',
                    text: '把表格[SHEET]第[R]行 第[C]列设为[VALUE]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SHEET: {
                            type: ArgumentType.STRING,
                            menu: 'sheetList'
                        },
                        R: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        C: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    }
                },
                {
                    opcode: 'clearSheetData',
                    text: '清空表格数据',
                    blockType: BlockType.COMMAND,
                },
            ],
            menus: {
                sheetList: 'formatSheetList',
            },

        };
    }
    async openCollaborationSheet(args, util) {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let url = `http://${this.runtime.vm.ros.ip}:8000/collaborationSheet/iframe.html?id=collabration--example&viewMode=story`
            let a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.click()
        } else {
            return '未连接到主机'
        }
    }
    formatSheetList() {
        let name = this.sheetData.map(item => item.name)
        return Menu.formatMenu3(name, name)
    }

    uploadFromFile() {
        return new Promise(resolve => {
            let upload = document.createElement('input')
            upload.type = 'file'
            upload.accept = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            upload.onchange = async () => {
                try {
                    let file = upload.files[0]
                    var fd = new FormData();
                    fd.append('file', file);
                    let url = `http://${this.runtime.ros.ip}:8000/collaborationSheet/upload`

                    var reader = new FileReader();
                    reader.onload = async (e) => {
                        // this.runtime.ros.saveFileData(file_name + ".png", e.target.result);
                        let data = await this.runtime.ros.proxyPost(encodeURI(url), 'POST', JSON.stringify({ file: e.target.result }))
                        resolve('导入成功')
                    }
                    reader.readAsDataURL(file);

                } catch (error) {
                    console.log(error)
                    resolve('导入失败')
                }
            }
            upload.click()
        })
    }
    exportAndDownload() {
        let a = document.createElement('a')
        a.style.display = 'none'
        a.href = `http://${this.runtime.ros.ip}:8000/collaborationSheet/export?r=${Math.random()}`
        a.target = '_blank'
        console.log(a)
        a.click()
    }
    rowsCount(args, util) {
        let max_row = 0
        let has_value = false
        let sheet = this.sheetData.filter(item => item.name == args.SHEET)[0]
        if (sheet && sheet.celldata && sheet.celldata.length >= 1) {
            sheet.celldata.filter(item => item.v && item.v.v).map(cell => {
                if (cell.r > max_row) {
                    max_row = cell.r
                }
                has_value = true
            })
            if (has_value) {
                max_row++
            }
        }
        return max_row
    }
    colsCount(args, util) {
        let max_col = 0
        let has_value = false
        let sheet = this.sheetData.filter(item => item.name == args.SHEET)[0]
        if (sheet && sheet.celldata && sheet.celldata.length >= 1) {
            sheet.celldata.filter(item => item.v && item.v.v).map(cell => {
                if (cell.c > max_col) {
                    max_col = cell.c
                }
                has_value = true
            })
            if (has_value) {
                max_col++
            }
        }
        return max_col
    }
    async getCellValue(args, util) {
        let url = `http://${this.runtime.ros.ip}:8000/collaborationSheet/getCell`
        let data = await this.runtime.ros.proxyPost(encodeURI(url), 'GET', JSON.stringify({ r: parseInt(args.R), c: parseInt(args.C), sheet: args.SHEET }))
        return JSON.parse(data).value
    }
    async setCellValue(args, util) {
        let url = `http://${this.runtime.ros.ip}:8000/collaborationSheet/setCell`
        let data = await this.runtime.ros.proxyPost(encodeURI(url), 'GET', JSON.stringify({ r: parseInt(args.R), c: parseInt(args.C), sheet: args.SHEET, value: args.VALUE }))
        return JSON.parse(data).value
    }
    async updateSheetData() {
        let url = `http://${this.runtime.ros.ip}:8000/collaborationSheet/data`
        let data = await this.runtime.ros.proxyPost(encodeURI(url), 'GET')
        this.sheetData = JSON.parse(data)
    }
    async clearSheetData(){
        let url = `http://${this.runtime.ros.ip}:8000/collaborationSheet/init`
        await this.runtime.ros.proxyPost(encodeURI(url), 'GET')
        await this.updateSheetData()
        return '清除成功'
    }
}


module.exports = LepiCollaborationSheet;