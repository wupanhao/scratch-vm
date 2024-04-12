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
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAASlSURBVFhH7ZZ9bFNVGIefftytY2UTNtYNBgKDDKq48KGITGNI3ILKwEyM0QgGhRgFDWrCP5BgRKMiSoQRE8QIGqYGEBcBjTMhBmJQI4SPBRmFrYwCFZCt2H3c21vf064KCKxdK+GP/ppz7z0f7zlP3/e8515LGHeYm1jW7vtNqzRgskoDJqs0YLJKAyarGwjYuxfWDQJUcBYaM0LRagJKMWDMSzGQaN2U39LBNt4ckkVdbpi/5AsgXqUQUC0aohYf7w+0s5PTkdYjdp33RvanMruYWdYB1Dg7GHJfJh7NjPT3pBR+zbQx253PikN7yZfanvNeGvPGcqzIhSu7HyHTJBA2GGrLYk3Ix4MdGotO9eyflHiwSbz23LMVrI/ASXh1HxP75zFw/1dknGrmgN5Kp8VgkF3DawapsvSjxa4se/ZNEoBqcpMtHGfrF6v4cO06qbYJnF/abWBcZMqYyRStXMqngSZyw1b8ZhcOiwWn1Uowy44309I9z7WVRIi7WGI5T4X3V+4tHiZAZ8GeEe0y2uWiFhfZC5gz+3Hq63bwRoEbf6gTZ6aDoU1nqQxq0THXURyAqrt7sX+e23h6dB6rGvbRVzUbZwTExVuvL+buCYXcP/UpaeuU4TJexcjmYlmxG0/gT0pchTzpCTLMVDG+2tKxtaLqIcQxIHWPPp8VuIULpvNJBE72m3FK4JzMm/UIM6e7BW5uN5xkqUWmFzhoZW7LHqbIDljc2NkNp6TmvrJcDt0DYMwgaryLAA9UDGZa9UzVGd1v9ix21H3D/OdnUHJHtcC1iomAWx3SN0DqEvqQDReZdO14mQuo8Mf+8NWKWutfxZEkUQMvnSx/pYJnplWx5NUXOXOyAbQsmTPE8BG3UuoeLyCBSB2tv3juFpo8BwVSQMMdUgJMnZAj52Nsf16rXK44AJXCbM8OMbl0FA0HD1M2fizL310daVeldPRIMrMLI8mLViQXO9UPTZKMPS7PVkLKq+3b+KxuHw9Hdq2yi09xZ/EZydo58+5kuNZHtpeJrus0Nx7n2527JIwqSTI4sN/Lltp1tDT/xtqNH4vVCPS2X9Ach3nno92Uv7Cde8iR9v966lpK4JgJs0n24JdzynE5BFIyNBC4SH5OLitq1kq/enVJiJFwRlzZF+Pc99hyzrNg9gZeqz1CHk5pjx9OKe4Q/yEZu+GJ8TgNE6vNGgF0OrPx+U+z+fON0WHqGyEkZ1vIinluEz7zJC/d/jara5t7BacUJyAMEK8M+dnDuPKJHG34HS0jg6LCAkbdNoqampV4PYfEcRqmfgEufs13x5rYXLiMD44oanUgJw6nFCegmtxgTGkpP/y4m+KSYZzwHKNLN9A7dcrGjeWxmbPk2DmK1b6L5bU/kXlXDQtNlRBqid7BKSWwB3XWVJXRIQlSrwXlHiIvN5eBuf1k+TAtPjnC208wafgg5q/eKx7vXUivVILvYj1yrXeE8TtsFAQNFs0oJb9LslzvoGyvl/U+5TGVJMnDKSUIeKmiZtv6GGwt0qj0GzwaiL1fUwOnlATgpYpBpRZOKe4svr5iUKmFU0oR4P+nNGCySgMmqzRgcoK/ARvypZAAhn+4AAAAAElFTkSuQmCC'
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDNzJCNkI3RTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDNzJCNkI3RDdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpkYWJmYjkwNy0zN2YxLTQ2OTktOGJkMi1mMjdjZmVjMjRlMWIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6YUcj+AAAFt0lEQVRYR+1XW2wUVRj+Zre729u2GNKgtBqUiEWpCaBUilGjMQha9cVEHyoxKMR7JBqvQQhBpamGGDFKjBp9MdGoL94QWqQgF41QYgoRqKBUClrrsr3OXsb/+2emnV52O7QmENNv8885c86Zc77z385Zo3hLnYVzGAGnPGcxQXC8mCA4Xvx/CMYSvSpepKw0kukhwrYsYlmWfsfSD3wRJLH3ZlXjnVm39pPkIgEYKA5FEM0Jo1AlhIJACPkieYEclVyRSCCIsBHUejxl6ncJnyR9JeqY2YUD1z4EDrx8+5soCuXjtLRZi160B5wB1rbswPOXLMDF2zbgT7MbQcPQdsMph8I3wX1Vy9GXTqFy2+uAEISVwpT881AWKUJaxgRlfkN/hIGA+y4Ls41CDW7+64h8K0vK9xCtugjnRJAXzHHeBuCb4K5rlqJyUim6UgndNddIyCL0K4KTuCZzJ7T6azb4RnOzEvBojFu4q+lTbP37GHKHkPRNcPf8+zGzYDI+amsW3wqpSuLJPu3nBPZyrgZtuHW3lZwGxgI5RkA2G8C9Uyuw/tgPeOLgJvHpXKfXRtYgoUk1KBI2kcPdHVi292PU7P8cNU2fifYs1Si12JNKolvqrvSkE+hypDNtyjgTnUnT6efYJH7rPY0lez7QuRPppJZDkVGDJFdRWIIHymbjRF8cy8vm4ITZidk73tYgkRjEgkkX2qlDxns158JrYmqR727gUpsJSUuN4pPW4lWo/XUnnv6lfpgGMxKMSYTtnr8U84qnOi3AT7E2zN25EcXhAvU3k44+LhjoFQtZi1ZinRB8ZgSCWU3MIGiKn4TxyaPY3vG77cD9GjDE4Znjxi5h8T+S1Pn0ORzDCKZEM/QTiLDOiSAaY+mNvLT0xRI9tphO6Uc41pHTTpBlwyATkxB3tahkOk71dWN9+c2qsFn1ddhz/WNyYkQwUxJsNCw+KGM3XXWPBgc1a4rP0sf6I1afA3BbuUm3r10I37nnQ1i3rfHng4yyFdMqUTvjRqcF2Btvw5yG9UqwSAiWC8EiEhQypZGolpxgKCEv3H7Zk9YJGiMtAdbS1Q7rlpV4RQg+O5oPFgRDeO3obkS31MH4eg12dBxHxLATp72IoweZnefp8d44Wns78YcIy0xywi37OtHmCNtOipWUaRYMIsiFSVLpyO7s48qGN2UQHJsTCCDkQ9xxLL3insPZMCxIuDCzO0SosT4mUDlJmFi90zHN0MljFEkVtnjrowtvNv2g/UcgnDUP/ijH29ziC5wW4OfOU6hofEt9kCHxRvlC3QAjnCnJdgNiIBCGwhsk/wjJFc1fSqJejZdbvsdzh7eiWPzci4wEExKVpblRPH7RPNXSfaUVojGzP0h4zF0ZLZHotcPEJabu4cA7sdvjttF0zBpNsVa9tp0xQYIkNScmutFQtUyjdkb9q5IXed1K49B1j0i/iTA1KGNdKFnHXPbTBhciMeqQrnRSguWGxg2w7qgdG0EXNHdD5RLMLpyC1S2NiAbDmgfbkz3qi9QEF/Tqj+2s86ltzjv1zW8J3mYoG69YbB91hxrGTnDz1TW4afI0p+W/x/Lmr/Bu6z7JImGnxYZvgt/NW4LzI4W4bPM6uXUWOD2iMzFTT/VavN+6Hw/KpROqAa9hBd5XmcuqfgmrjzRi1cFvnfG8kQc0xdESXgxLM5nA6MvnZUH8j9ctW/Lk+p+nkzMpgX5I84l/DhIJpEEiCPNmLeR4fFJGIkf406CcmV/MuRvT5T9IeaP8aRKS7lQx0aC58AX1r4NybOnfAbtLfU1/0mDfGoFeSUtVk8pQd3QXnuLR5mgwE3wRpMN3y82YtsqXiPXuNC6p50k5v28vuVRzo53eZaSMcUdp1PInDWxjYDx84Bs95/W2lAW+CBIkSYxkBpJMZ7iyZ0Ku/I8ejRzhm+DZgu8gOVuYIDheTBAcL85xgsC/4axQ4AIMIGsAAAAASUVORK5CYII='
const menuIconURI = blockIconURI;

const busServo = {
    'position': formatMessage({
        id: 'lepi.position',
        default: '位置',
    }),
    'angle': formatMessage({
        id: 'lepi.angle',
        default: '角度',
    }),
    'lock': formatMessage({
        id: 'lepi.lock',
        default: '锁定',
    }),
    'min_position': formatMessage({
        id: 'lepi.min_position',
        default: '最小位置',
    }),
    'max_position': formatMessage({
        id: 'lepi.max_position',
        default: '最大位置',
    }),
    'min_angle': formatMessage({
        id: 'lepi.min_angle',
        default: '最小角度',
    }),
    'max_angle': formatMessage({
        id: 'lepi.max_angle',
        default: '最大角度',
    }),
    'id': formatMessage({
        id: 'lepi.id',
        default: 'ID',
    })
}

const EEPROM = {
    ID: 0x05,
    MIN_POSITION_H: 0x09,
    MIN_POSITION_L: 0x0a,
    MAX_POSITION_H: 0x0b,
    MAX_POSITION_L: 0x0c,
    TARGET_POSITION_H: 0x2a,
    TARGET_POSITION_L: 0x2b,
    SPEED_H: 0x2e,
    SPEED_L: 0x2f,
    LOCK: 0x30,
    CURRENT_POSITION_H: 0x38,
    CURRENT_POSITION_L: 0x39,
    RESET: 0x99
}

class LepiActuator extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /*
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'sub xxx')
        })
        */

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
            id: 'lepiActuator',
            name: formatMessage({
                id: 'lepi.lepiActuator',
                default: '执行器',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [ 
            // {
            //     opcode: 'motorSetEnable',
            //     text: '[TOGGLE] 电机 [PORT]',
            //     blockType: BlockType.COMMAND,
            //     arguments: {
            //         PORT: {
            //             type: ArgumentType.NUMBER,
            //             menu: 'motorPorts',
            //         },
            //         TOGGLE: {
            //             type: ArgumentType.NUMBER,
            //             menu: 'toggle',
            //         }
            //     }
            // },
            {
                opcode: 'motorSetSpeed',
                text: formatMessage({
                    id: 'lepi.motorSetSpeed',
                    default: '电机 [PORT] 速度设为 [SPEED]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    PORT: {
                        type: ArgumentType.NUMBER,
                        menu: 'motorPorts',
                    },
                    SPEED: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 50
                    }
                }
            },
            {
                opcode: 'motorSetRotate',
                text: formatMessage({
                    id: 'lepi.motorSetRotate',
                    default: '电机 [PORT] 转动 [VALUE] 度',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    PORT: {
                        type: ArgumentType.NUMBER,
                        menu: 'motorPorts',
                    },
                    VALUE: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 90
                    }
                }
            },
            {
                opcode: 'motorSetHold',
                text: formatMessage({
                    id: 'lepi.motorSetHold',
                    default: '电机 [PORT] 刹车',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    PORT: {
                        type: ArgumentType.NUMBER,
                        menu: 'motorPorts',
                    },
                }
            },
            {
                opcode: 'motorSetCurrentPosition',
                text: formatMessage({
                    id: 'lepi.motorSetCurrentPosition',
                    default: '电机 [PORT] 编码器的值设置为 [VALUE]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    PORT: {
                        type: ArgumentType.NUMBER,
                        menu: 'motorPorts2',
                    },
                    VALUE: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                    }
                }
            },

            {
                opcode: 'motorSetPosition',
                text: formatMessage({
                    id: 'lepi.motorSetPosition',
                    default: '电机 [PORT] 编码器转到 [POSITION]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    PORT: {
                        type: ArgumentType.NUMBER,
                        menu: 'motorPorts',
                    },
                    POSITION: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                    }
                }
            },
            '---',
            {
                opcode: 'motorSetType',
                text: formatMessage({
                    id: 'lepi.motorSetType',
                    default: '端口 [PORT] 设置为 [TYPE] 模式',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    PORT: {
                        type: ArgumentType.NUMBER,
                        menu: 'motorPorts',
                    },
                    TYPE: {
                        type: ArgumentType.NUMBER,
                        menu: 'motorType',
                    }

                }
            }, {
                opcode: 'motorSetAngle',
                text: formatMessage({
                    id: 'lepi.motorSetAngle',
                    default: '舵机 [PORT] 转到 [ANGLE]度',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    PORT: {
                        type: ArgumentType.NUMBER,
                        menu: 'motorPorts',
                    },
                    ANGLE: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0,
                    },
                }
            },
            '---',
            {
                opcode: 'servoSetPosition',
                text: formatMessage({
                    id: 'lepi.servoSetPosition',
                    default: '总线舵机 [ID] 以 [SPEEDTIME] [VALUE] 转到 [POSANGLE] [POSITION]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    ID: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    SPEEDTIME: {
                        type: ArgumentType.NUMBER,
                        menu: 'speedtime',
                        defaultValue: 0
                    },
                    VALUE: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                    },
                    POSITION: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                    },
                    POSANGLE: {
                        type: ArgumentType.NUMBER,
                        menu: 'posangle',
                        defaultValue: 1
                    },
                }
            }, {
                opcode: 'servoSetParam',
                text: formatMessage({
                    id: 'lepi.servoSetParam',
                    default: '总线舵机 [ID] 修改参数[PARAM] 为 [VALUE]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    ID: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    PARAM: {
                        type: ArgumentType.NUMBER,
                        menu: 'servoParam'
                    },
                    VALUE: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                    }
                }
            }, {
                opcode: 'servoGetParam',
                text: formatMessage({
                    id: 'lepi.servoGetParam',
                    default: '总线舵机 [ID] 读取参数[PARAM]',
                }),
                blockType: BlockType.REPORTER,
                arguments: {
                    ID: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                    },
                    PARAM: {
                        type: ArgumentType.STRING,
                        menu: 'servoParam'
                    }
                }
            }, {
                opcode: 'servoReset',
                text: formatMessage({
                    id: 'lepi.servoReset',
                    default: '重置总线舵机 [ID]',
                }),
                blockType: BlockType.COMMAND,
                arguments: {
                    ID: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 1
                    }
                }
            },

            ],
            menus: {
                motorPorts: Menu.formatMenu(['M1', 'M2', 'M3', 'M4', 'M5'], start = 1),
                motorPorts2: Menu.formatMenu([formatMessage({
                    id: 'lepi.all',
                    default: '全部',
                }), 'M1', 'M2', 'M3', 'M4', 'M5'], start = 0),
                motorType: Menu.formatMenu([formatMessage({
                    id: 'lepi.motor',
                    default: '电机',
                }), formatMessage({
                    id: 'lepi.servo',
                    default: '舵机',
                })]),
                toggle: Menu.formatMenu([formatMessage({
                    id: 'lepi.close',
                    default: '关闭',
                }), formatMessage({
                    id: 'lepi.open',
                    default: '打开',
                })]),
                wait: Menu.formatMenu([formatMessage({
                    id: 'lepi.no_wait',
                    default: '不等待',
                }), formatMessage({
                    id: 'lepi.wait',
                    default: '等待',
                })]),
                posangle: Menu.formatMenu([formatMessage({
                    id: 'lepi.position',
                    default: '位置',
                }), formatMessage({
                    id: 'lepi.angle',
                    default: '角度',
                })]),
                speedtime: Menu.formatMenu([formatMessage({
                    id: 'lepi.speed',
                    default: '速度',
                }), formatMessage({
                    id: 'lepi.time',
                    default: '时间(ms)',
                })]),
                servoParam: Menu.formatMenu3([formatMessage({
                    id: 'lepi.position',
                    default: '位置',
                }), formatMessage({
                    id: 'lepi.angle',
                    default: '角度',
                }), formatMessage({
                    id: 'lepi.lock',
                    default: '锁定',
                }), formatMessage({
                    id: 'lepi.min_position',
                    default: '最小位置',
                }), formatMessage({
                    id: 'lepi.max_position',
                    default: '最大位置',
                }), formatMessage({
                    id: 'lepi.min_angle',
                    default: '最小角度',
                }), formatMessage({
                    id: 'lepi.max_angle',
                    default: '最大角度',
                }), formatMessage({
                    id: 'lepi.id',
                    default: 'ID',
                }),
                ], ['position', 'angle', 'lock', 'min_position', 'max_position', 'min_angle', 'max_angle', 'ID'])
            }
        };
    }
    motorSetType(args, util) {
        var port = parseInt(args.PORT)
        var value = parseInt(args.TYPE)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        return this.runtime.ros.motorSetType(port, value)
    }
    motorSetAngle(args, util) {
        var port = parseInt(args.PORT)
        var value = parseInt(args.ANGLE)
        var wait = true
        if (!(port >= 1 && port <= 5)) {
            return
        }
        if (wait) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    this.runtime.ros.motorSetAngle(port, value)
                    resolve()
                }, 0)
            })
        } else {
            this.runtime.ros.motorSetAngle(port, value)
            return
        }
    }
    motorSetHold(args, util) {
        var port = parseInt(args.PORT)
        var value = 1
        if (!(port >= 1 && port <= 5)) {
            return
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                this.runtime.ros.motorSetPulse(port, value)
                resolve()
            }, 0)
        })
    }
    motorSetEnable(args, util) {
        var port = parseInt(args.PORT)
        var value = parseInt(args.TOGGLE)
        if (!(port >= 1 && port <= 5)) {
            return
        }
        return this.runtime.ros.motorSetEnable(port, value)
    }
    motorSetSpeed(args, util) {
        var port = parseInt(args.PORT)
        var speed = parseInt(args.SPEED)
        var wait = true
        if (Number.isNaN(speed) || (!(port >= 1 && port <= 5))) {
            return
        }

        if (wait) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    this.runtime.ros.motorSetSpeed(port, speed)
                    resolve()
                }, 0)
            })
        } else {
            this.runtime.ros.motorSetSpeed(port, speed)
            return
        }

    }

    motorSetPosition(args, util) {
        var port = parseInt(args.PORT)
        var position = parseInt(args.POSITION)
        if (Number.isNaN(position) || (!(port >= 1 && port <= 5))) {
            return
        }
        return this.runtime.ros.motorSetPosition(port, position)
    }
    motorSetCurrentPosition(args, util) {
        var port = parseInt(args.PORT)
        var position = parseInt(args.VALUE)
        if (Number.isNaN(position) || (!(port >= 0 && port <= 5))) {
            return
        }
        return this.runtime.ros.motorSetCurrentPosition(port, position)
    }
    motorSetRotate(args, util) {
        var port = parseInt(args.PORT)
        var position = parseInt(args.VALUE)
        if (Number.isNaN(position) || (!(port >= 1 && port <= 5))) {
            return
        }
        return this.runtime.ros.motorSetRotate(port, position)
    }
    servoSetPosition(args, util) {
        var id = parseInt(args.ID)
        var position = parseInt(args.POSITION)
        var speedtime = parseInt(args.SPEEDTIME)
        var value = parseInt(args.VALUE)
        var posangle = parseInt(args.POSANGLE)
        var wait = true

        if (posangle == 1) {
            position = parseInt(position * 0x03ff / 200)
        }

        if (position < 0) {
            position = 0
        } else if (position > 0x03ff) {
            position = 0x03ff
        }

        if (wait) {
            if (speedtime == 1) {
                return this.runtime.ros.setServoPosition(id, position, value, 0)
            } else {
                return this.runtime.ros.setServoPosition(id, position, 0, value)
            }
        } else {
            if (speedtime == 1) {
                this.runtime.ros.setServoPosition(id, position, value, 0)
            } else {
                this.runtime.ros.setServoPosition(id, position, 0, value)
            }
            return
        }
    }
    servoSetParam(args, util) {
        var id = parseInt(args.ID)
        var param = args.PARAM
        var value = parseInt(args.VALUE)
        switch (param) {
            case 'position':
                return this.runtime.ros.setServoParamU16(id, EEPROM.TARGET_POSITION_H, value)
            case 'angle':
                return this.runtime.ros.setServoParamU16(id, EEPROM.TARGET_POSITION_H, parseInt(value * 0x03ff / 200))
            case 'lock':
                return this.runtime.ros.setServoParamU8(id, EEPROM.LOCK, value)
            case 'min_position':
                return this.runtime.ros.setServoParamU16(id, EEPROM.MIN_POSITION_H, value)
            case 'max_position':
                return this.runtime.ros.setServoParamU16(id, EEPROM.MAX_POSITION_H, value)
            case 'min_angle':
                return this.runtime.ros.setServoParamU16(id, EEPROM.MIN_POSITION_H, parseInt(value * 0x03ff / 200))
            case 'max_angle':
                return this.runtime.ros.setServoParamU16(id, EEPROM.MAX_POSITION_H, parseInt(value * 0x03ff / 200))
            case 'id':
                return this.runtime.ros.setServoParamU8(id, EEPROM.ID, value)
            default:
                return 0
        }
    }
    servoGetParam(args, util) {
        if (!(this.runtime.ros && this.runtime.ros.isConnected())) {
            this.runtime.emit('SAY', util.target, 'say', '主机未连接');
            return 0
        }
        var id = parseInt(args.ID)
        var param = args.PARAM
        console.log(id, param)
        switch (param) {
            case 'position':
                return this.runtime.ros.getServoParamU16(id, EEPROM.CURRENT_POSITION_H)
            case 'angle':
                return new Promise(resolve => {
                    this.runtime.ros.getServoParamU16(id, EEPROM.CURRENT_POSITION_H).then(result => resolve(parseInt(result * 200 / 0x03ff)))
                })
            case 'lock':
                return this.runtime.ros.getServoParamU8(id, EEPROM.LOCK)
            case 'min_position':
                return this.runtime.ros.getServoParamU16(id, EEPROM.MIN_POSITION_H)
            case 'max_position':
                return this.runtime.ros.getServoParamU16(id, EEPROM.MAX_POSITION_H)
            case 'min_angle':
                return new Promise(resolve => {
                    this.runtime.ros.getServoParamU16(id, EEPROM.MIN_POSITION_H).then(result => resolve(parseInt(result * 200 / 0x03ff)))
                })
            case 'max_angle':
                return new Promise(resolve => {
                    this.runtime.ros.getServoParamU16(id, EEPROM.MAX_POSITION_H).then(result => resolve(parseInt(result * 200 / 0x03ff)))
                })
            case 'id':
                return this.runtime.ros.getServoParamU8(id, EEPROM.ID)
            default:
                return 0
        }
    }

    servoReset(args, util) {
        var id = parseInt(args.ID)
        return this.runtime.ros.setServoParamU8(id, 0x99, 0)
    }
}

(() => {

    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        return
    }

    console.log('lepiActuator loaded')

})()
module.exports = LepiActuator;