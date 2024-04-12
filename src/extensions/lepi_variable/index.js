const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

const ROSLIB = require('roslib');


/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAMtSURBVFhH7ZZbSFRRFIb/M86M4/0yjpeJUimzQi0EzSCFYvKSXaR6qPDB6AKVgUj1kAZFPSQoFUFG9FCRhQhFVE+RDyGBDBYIRpqF1YM6Nd7G0Zx0VuvsiQIxm5lzBKH5Yc3ea7PXOt/es8/ZS6IxEBaxNL/aRasAoFIFAJUqAKhUAUCl+s8AJbYgT1ctqQcow7HZBvhH5xlSQ+oBhgMVB6ORtNwEGNiXgVWQOoB6oL8XuNM8ibTUMFysZUIGVkPqlFsRwOpkPXbvO4ATVZVITMoCjXNaeRdnPFP8lXJA3qlH93XYVf4DRJ5UpYXrOXEnnj7/DjjEkN9SBijvEAPqpSDcbarH3v1VnnEagqQx4l2HBukZbmDKM+yPlJ1Bhjt/Wg+zKVbAXW04g2QTU0uxOFd7GFtKteJ8KpK8g36ZEzQzLHafurtf8L9L9LrjIR09slH0ZfH66cGtYLk3dw4vzH9ADi3apKWdxRsEjCxzrE4A32w8K/xnT66zr+Uez3fMivfS/AOcAnW1awQMO2S3f6CC3HjaU7aO4qMjaJtljQCUtSplKZ08ZuDerBxemn+AHJYQp6OGuhqadNpp2P5ewORmLaNUcxS9bK0Xfm/3Kxoa6hELmbBx3MSsPF6Y74Ac0nRDT+G6aOr72Ma+UwC0t7UwXCSVWHJpqyWHvnyyUmiQPN9NFeU7KD8vRMTOmXMe8w1wnI1DuCKgDutjMgaDRkf6qO5CNeWtDSNLQRplrkykws1mylyRQJ/72ik7I4FjOIoXYW3l8yh/LufK/RfzDZCnVx/X825kiocODnTS9pJs0S/ISRVtWVE+fbVZ6crlGurv76JD5cVEM6PU0txIcTE6njFH3nnM+w81l1GOEQmRS5KQnqJFkGYSWl0IjHHpsA32ID4hGfZvdsTExmB0xAaDIQQu1zTCwqMw7hjlBGN489aFa5eGUXnKBTg9af8l324S/ujeux0Mt9vNAG5eovwauyFJEreeNKKIYf+35HH2Jb4TpklCkWUaRhOPeXlH+37VhbLJz/ct6o/ka8+HAkJ5sbDAUrfkXwAFAJUqAKhUAUClCgAq1SIHBH4CS5yFQixuY8IAAAAASUVORK5CYII='
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQUE1RTNFNzdENjMxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQUE1RTNFNjdENjMxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1l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'
// const menuIconURI = blockIconURI;

class LepiVariable extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.variables = {}
        this.runtime = runtime;
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.updateVariables()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'updateVariables')
            this.updateVariables()
        })


    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'lepiVariable',
            name: formatMessage({
                id: 'lepi.lepiVariable',
                default: '共享变量',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'getVariable',
                    text: formatMessage({
                        id: 'lepi.getVariable',
                        default: '共享变量 [NAME]的值',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'variableList',
                        }
                    }
                }, {
                    opcode: 'setVariable',
                    text: formatMessage({
                        id: 'lepi.setVariable',
                        default: '将共享变量 [NAME] 设为 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'myVar'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '0'
                        }
                    }
                }, {
                    opcode: 'deleteVariable',
                    text: formatMessage({
                        id: 'lepi.deleteVariable',
                        default: '删除共享变量 [NAME]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'variableList',
                        }
                    }
                },
                {
                    opcode: 'updateVariables',
                    text: formatMessage({
                        id: 'lepi.updateVariables',
                        default: '更新变量数据',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'hasVariable',
                    text: formatMessage({
                        id: 'lepi.hasVariable',
                        default: '存在共享变量 [NAME] ?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'variableList',
                        }
                    }
                },
                '---',
                {
                    opcode: 'getRemoteVariable',
                    text: formatMessage({
                        id: 'lepi.getRemoteVariable',
                        default: '主机[HOST] 变量 [NAME]的值',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        HOST: {
                            type: ArgumentType.STRING,
                            defaultValue: '127.0.0.1'
                        },
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'myVar'
                        }
                    }
                }, {
                    opcode: 'setRemoteVariable',
                    text: formatMessage({
                        id: 'lepi.setRemoteVariable',
                        default: '将主机[HOST] 变量 [NAME] 设为 [VALUE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        HOST: {
                            type: ArgumentType.STRING,
                            defaultValue: '127.0.0.1'
                        },
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'myVar'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '0'
                        }
                    }
                },

            ],
            menus: {
                variableList: 'formatVariableList',
            },
        };
    }

    async updateVariables() {
        this.variables = await this.getVariable({ NAME: '' })
        return Promise.resolve(Object.keys(this.variables).join(','))
        /*
        return new Promise(resolve => {
            this.runtime.ros.variableList().then(res => {
                this.variables = JSON.parse(res)
                resolve(Object.keys(this.variables).join(','))
            })
        })
        */
    }

    formatVariableList() {
        const names = Object.keys(this.variables)
        // const values = names.map(name => this.variables[name])
        return Menu.formatMenu3(names, names)
    }

    hasVariable(args, util) {
        var name = args.NAME
        return name in this.variables
    }
    async getVariable(args, util) {
        var name = args.NAME
        let variable = new ROSLIB.Param({
            ros: this.runtime.ros.ros,
            name: `/variable/${name}`
        });
        return new Promise(resolve => {
            variable.get(value => {
                resolve(value)
            })
        })
        /*
        return new Promise(resolve => {
            this.runtime.ros.variableList().then(res => {
                this.variables = JSON.parse(res)
                if (name in this.variables) {
                    resolve(this.variables[name])
                } else {
                    this.runtime.emit('SAY', util.target, 'say', formatMessage({
                        id: 'lepi.lepiVariable',
                        default: 'shared variable',
                    }) + ` ${name} ` + formatMessage({
                        id: 'lepi.not_exists',
                        default: 'not exists',
                    }));
                    resolve(0)
                }
            })
        })
        */
    }
    setVariable(args, util) {
        var name = args.NAME
        var value = args.VALUE
        // const URL = `http://${this.runtime.ros.ip}:8000/variable/set?name=${encodeURI(name)}&value=${encodeURI(value)}`

        let variable = new ROSLIB.Param({
            ros: this.runtime.ros.ros,
            name: `/variable/${name}`
        });

        variable.set(value)
        this.variables[name] = value
        return value
        /*
        return new Promise(resolve => {
            this.runtime.ros.proxyGet(URL).then(response => {
                console.log('response', response)
                // this.runtime.emit('SAY', util.target, 'say', '设置成功');
                this.variables[name] = value
                resolve(formatMessage({
                    id: 'lepi.ok',
                    default: 'OK',
                }))
                // this.updateVariables()
            }).catch(error => {
                console.log('error', error)
                // this.runtime.emit('SAY', util.target, 'say', '设置失败');
                resolve(formatMessage({
                    id: 'lepi.failed',
                    default: 'Failed',
                }))
            })
        })
        */

    }
    async deleteVariable(args, util) {
        var name = args.NAME
        // const URL = `http://${this.runtime.ros.ip}:8000/variable/delete?name=${encodeURI(name)}`
        let res = await this.runtime.ros.deleteVariable(name)
        if(name in this.variables){
            delete this.variables[name]
        }
        return Promise.resolve(res)
    }

    getRemoteVariable(args, util) {
        var host = args.HOST
        var name = args.NAME
        const URL = `http://${host}:8000/variable/get`
        return new Promise(resolve => {
            this.runtime.ros.proxyGet(URL).then(response => {
                console.log('response', response)
                let data = JSON.parse(response)
                // this.runtime.emit('SAY', util.target, 'say', '设置成功');
                if (data[name]) {
                    resolve(data[name])
                } else {
                    resolve(0)
                    this.runtime.emit('SAY', util.target, 'say', formatMessage({
                        id: 'lepi.lepiVariable',
                        default: 'shared variable',
                    }) + ` ${name} ` + formatMessage({
                        id: 'lepi.not_exists',
                        default: 'not exists',
                    }));
                }
                // this.updateVariables()
            }).catch(error => {
                console.log('error', error)
                // this.runtime.emit('SAY', util.target, 'say', '设置失败');
                resolve(formatMessage({
                    id: 'lepi.failed',
                    default: 'Failed',
                }))
            })
        })
    }

    setRemoteVariable(args, util) {
        var host = args.HOST
        var name = args.NAME
        var value = args.VALUE
        const URL = `http://${host}:8000/variable/set?name=${encodeURI(name)}&value=${encodeURI(value)}`

        return new Promise(resolve => {
            this.runtime.ros.proxyGet(URL).then(response => {
                console.log('response', response)
                // this.runtime.emit('SAY', util.target, 'say', '设置成功');
                resolve(formatMessage({
                    id: 'lepi.ok',
                    default: 'OK',
                }))
                // this.updateVariables()
            }).catch(error => {
                console.log('error', error)
                // this.runtime.emit('SAY', util.target, 'say', '设置失败');
                resolve(formatMessage({
                    id: 'lepi.failed',
                    default: 'Failed',
                }))
            })
        })

    }

}

module.exports = LepiVariable;