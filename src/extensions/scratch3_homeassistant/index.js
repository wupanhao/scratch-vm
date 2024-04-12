const ArgumentType = require('../../extension-support/argument-type')
const BlockType = require('../../extension-support/block-type')
const Cast = require('../../util/cast')
const formatMessage = require('format-message')

const blockIconURI = 'data:image/png;base64,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'

// Home Assistant
_ws = null // WebSocket handle
_wsid = 0 // WebSocket session id
_wsapi = 'ws://192.168.50.73:8123/api/websocket' // TODO: Replace with yours
_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIwZmY1NTU2MTY3NDg0MDQ4YmRiM2IzOTY1NDk2YjFiYyIsImlhdCI6MTY2NjMyNDI3MywiZXhwIjoxOTgxNjg0MjczfQ.XienpkxJTEmbtD7U8cBblytCpWUuFwVl-YVJEOwMf_Q'

_connected = false
_entities = null // All Entity from Home Assistant
_entity_menu = [] // Updated entity menu
_states_changed = {} // State changed entities

function connect(wsapi, token) {
    _connected = false
    _ws = new WebSocket(wsapi)
    _token = token
    _ws.onopen = handleOpen
    _ws.onclose = handleClose
    _ws.onmessage = handleMessage
}

function handleOpen() {
    if (_token) {
        _ws.send('{"type": "auth", "' + (_token.length < 20 ? 'api_password' : 'access_token') + '": "' + _token + '"}')
    }
    _ws.send('{"id": 1, "type": "get_states"}')
    _ws.send('{"id": 2, "type": "subscribe_events", "event_type": "state_changed"}')
    _wsid = 2
}

function handleClose() {
    _ws = null
    _wsid = 0
    _entities = null
    _entity_menu = []
}

function handleMessage(message) {
    var json = JSON.parse(message.data)
    console.log('handleMessage: ' + json.type)
    switch (json.type) {
        case 'result':
            if (json.success) {
                if (json.id == 1) {
                    // Responed to get_states
                    _entities = json.result
                    buildEntityMenu()
                    _connected = true
                    break
                } else if (json.id == 2) {
                    // Responed to subscribe_events
                    break
                } else if (json.id == _wsid) {
                    // Correct response for call_service
                    break
                }
            }
            console.log('Unknown result: ' + (json.error ? json.error.message : message.data))
            break
        case 'event':
            handleEvent(json)
            break
        case 'auth_invalid':
            console.log('Invalid auth!')
            break
        default:
            console.log(json)
            break
    }
}

function handleEvent(json) {
    var entity = json.event.data.new_state
    if (!entity) {
        console.log('Event without entity: ' + (json.error.message || JSON.stringify(json)))
        return
    }

    for (var i in _entities) {
        var old_entity = _entities[i]
        if (old_entity.entity_id == entity.entity_id) {
            if (entity.state != old_entity.state) {
                console.log(entity.attributes.friendly_name + ' state changed from ' + old_entity.state + ' to ' + entity.state)
                _states_changed[entity.entity_id] = entity.state
            } else {
                console.log(entity.attributes.friendly_name + ' state received: ' + entity.state)
            }
            _entities.splice(i, 1, entity)
            return
        }
    }

    // New entity found
    _entities.push(entity)
    _states_changed[entity.entity_id] = entity.state
    console.log('New entity found：' + entity.attributes.friendly_name + ', state: ' + entity.state)
    buildEntityMenu()
}

const _valid_domains = ['sensor', 'binary_sensor', 'device_tracker', 'light', 'switch', 'media_player', 'cover', 'vacuum', 'fan', 'climate', 'script']
function buildEntityMenu() {
    _entity_menu = []
    for (var i in _entities) {
        var entity = _entities[i]
        if (_valid_domains.indexOf(entity.entity_id.split('.')[0]) != -1 && !entity.attributes.hidden) {
            _entity_menu.push({ text: entity.attributes.friendly_name, value: entity.entity_id })
        }
    }
    _entity_menu.sort(function (a, b) {
        var index1 = _valid_domains.indexOf(a.value.split('.')[0])
        var index2 = _valid_domains.indexOf(b.value.split('.')[0])
        return index1 == index2 ? a.text.localeCompare(b.text) : index1 - index2
    })
}

function filterEntityMenu(filter) {
    if (filter) {
        var menu = []
        for (var i in _entity_menu) {
            var item = _entity_menu[i]
            if (filter(item.value)) {
                menu.push(item)
            }
        }
    } else {
        var menu = _entity_menu
    }

    return menu.length ? menu : [{ text: '暂无', value: 'NA' }]
}

function findEntity(entity_id) {
    for (var i in _entities) {
        var entity = _entities[i]
        if (entity.entity_id == entity_id) {
            return entity
        }
    }
    console.log('Entity id not found: ' + entity_id)
    return null
}

function _callService(service, data) {
    var parts = service.split('.')
    if (parts.length == 2) {
        var domain = parts[0]
        service = parts[1]
    } else {
        var domain = data.entity_id.split('.')[0]
        if (domain == 'cover' /* || data.entity_id == 'group.all_covers'*/) {
            // Replace cover service
            if (service == 'turn_on') {
                service = 'open_cover'
            } else if (service == 'turn_off') {
                service = 'close_cover'
            }
        }
    }
    var command = JSON.stringify({
        id: ++_wsid,
        type: 'call_service',
        domain: domain,
        service: service,
        service_data: data
    })
    _ws.send(command)
    console.log('Call service: ' + command)
}

function callService(service, data) {
    if (_wsid >= 2) {
        _callService(service, data)
    } else {
        setTimeout(function () {
            _callService(service, data)
        }, 2000)
    }
}


class Scratch3HomeAssistantBlocks {
    constructor(runtime) {
        this.runtime = runtime

        if (_ws == null) {

            if (this.runtime.ros && this.runtime.ros.isConnected()) {
                try {
                    connect(`ws://${this.runtime.vm.ros.ip}:8123/api/websocket`, _token)
                } catch (error) {
                    console.log(error)
                }
            }
            this.runtime.on('LEPI_CONNECTED', () => {
                console.log('LEPI_CONNECTED', 'connect to HA')
                try {
                    connect(`ws://${this.runtime.vm.ros.ip}:8123/api/websocket`, _token)
                } catch (error) {
                    console.log(error)
                }
            })

        }
    }

    static get STATE_KEY() {
        return 'Scratch.HomeAssistant'
    }

    getInfo() {
        return {
            id: 'homeassistant',
            name: formatMessage({
                id: 'homeassistant.categoryName',
                default: '智能家居'
            }),
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'openHAPanel',
                    text: formatMessage({
                        id: 'lepi.openHAPanel',
                        default: '打开控制面板, 端口[PORT]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: '8123'
                        }
                    }
                },
                {
                    opcode: 'openZigbeeGW',
                    text: formatMessage({
                        id: 'lepi.openHAPanel',
                        default: '打开zigbee网关, 端口[PORT]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: '8088'
                        }
                    }
                },
                {
                    opcode: 'connectToHA',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.connectToHA',
                        default: '连接到HA实例 [WSAPI] 密钥 [TOKEN]'
                    }),
                    arguments: {
                        WSAPI: {
                            type: ArgumentType.STRING,
                            defaultValue: '-'
                        },
                        TOKEN: {
                            type: ArgumentType.STRING,
                            defaultValue: 'NA'
                        }
                    }
                },
                {
                    opcode: 'isConnected',
                    text: formatMessage({
                        id: 'homeassistant.isConnected',
                        default: '已连接上HA实例?'
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'turnOnOff',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.turnOnOff',
                        default: '设置 [ENTITY] 的状态为 [ONOFF]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'TURNONOFF_ENTITY'
                        },
                        ONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'ONOFF',
                            defaultValue: 'on'
                        }
                    }
                },
                {
                    opcode: 'setLightColor',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.setLightColor',
                        default: '设置灯光 [ENTITY] 的颜色为 [COLOR]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'LIGHT_ENTITY'
                        },
                        COLOR: {
                            type: ArgumentType.COLOR
                        }
                    }
                },
                {
                    opcode: 'setLightTemperature',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.setLightTemperature',
                        default: '设置灯光 [ENTITY] 的色温为 [TEMPERATURE]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'LIGHT_ENTITY'
                        },
                        TEMPERATURE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultTemperatureForSetLightTemperature',
                                default: '4000'
                            })
                        }
                    }
                },
                {
                    opcode: 'setLightBrightness',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.setLightBrightness',
                        default: '设置灯光 [ENTITY] 的亮度为 [BRIGHTNESS]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'LIGHT_ENTITY'
                        },
                        BRIGHTNESS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultBrightnessForSetLightBrightness',
                                default: '255'
                            })
                        }
                    }
                },
                {
                    opcode: 'speechInMiAi',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.miaiSpeech',
                        default: '让音箱[ENTITY] 说[TEXT]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'SPEAKER_ENTITY'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultTextForSpeechInMiAi',
                                default: '你好，我是小爱同学'
                            })
                        }
                    }
                },
                /*
                {
                    opcode: 'speech',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.speech',
                        default: '让 [ENTITY] 说 [TEXT]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'PLAY_MEDIA_ENTITY'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'homeassistant.defaultTextForSpeech',
                                default: '你好，我是 Scratch'
                            })
                        }
                    }
                },
                */
                {
                    opcode: 'run_script',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'homeassistant.run_script',
                        default: '执行指令 [ENTITY]'
                    }),
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'SCRIPT_ENTITY'
                        },
                    }
                },
                '---',
                {
                    opcode: 'whenStateChanged',
                    text: formatMessage({
                        id: 'homeassistant.whenStateChanged',
                        default: '当 [ENTITY] 的状态变化'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'ENTITY'
                        }
                    }
                },
                {
                    opcode: 'whenStateChangedToOnOff',
                    text: formatMessage({
                        id: 'homeassistant.whenStateChangedToOnOff',
                        default: '当 [ENTITY] 的状态变为 [ONOFF]'
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'ISSTATEON_ENTITY'
                        },
                        ONOFF: {
                            type: ArgumentType.STRING,
                            menu: 'ONOFF',
                            defaultValue: 'on'
                        }
                    }
                },
                '---',
                {
                    opcode: 'getState',
                    text: formatMessage({
                        id: 'homeassistant.getState',
                        default: '[ENTITY] 的状态'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'ENTITY'
                        }
                    }
                },
                {
                    opcode: 'isStateOn',
                    text: formatMessage({
                        id: 'homeassistant.isStateOn',
                        default: '[ENTITY] 已打开?'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        ENTITY: {
                            type: ArgumentType.STRING,
                            menu: 'ISSTATEON_ENTITY'
                        }
                    }
                }
            ],
            menus: {
                ONOFF: [
                    {
                        text: formatMessage({
                            id: 'homeassistant.on',
                            default: '打开'
                        }),
                        value: 'on'
                    },
                    {
                        text: formatMessage({
                            id: 'homeassistant.off',
                            default: '关闭'
                        }),
                        value: 'off'
                    }
                ],
                ENTITY: 'getEntityMenu',
                LIGHT_ENTITY: 'getLightEntityMenu',
                SCRIPT_ENTITY: 'getScriptEntityMenu',
                TURNONOFF_ENTITY: 'getTurnOnOffEntityMenu',
                ISSTATEON_ENTITY: 'getIsStateOnEntityMenu',
                SPEAKER_ENTITY: 'getSpeakerEntityMenu',
                PLAY_MEDIA_ENTITY: 'getPlayMediaEntityMenu'
            }
            // TODO: ??? translation_map: {
            //     de: {
            //         'homeassistant.categoryName': '家居助手'
            //     }
            // }
        }
    }
    openHAPanel(args) {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let url = 'http://' + this.runtime.ros.ip + ':' + args.PORT
            let a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.click()
        } else {
            return '请先连接到主机'
        }
    }
    openZigbeeGW(args) {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let url = 'http://' + this.runtime.ros.ip + ':' + args.PORT
            let a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.click()
        } else {
            return '请先连接到主机'
        }
    }
    connectToHA(args, util) {
        if (args.TOKEN == 'NA') {
            return formatMessage({
                id: 'homeassistant.parameter_wrong',
                default: '请填写正确的参数'
            })
        } else {
            connect(args.WSAPI, args.TOKEN)
        }
    }
    isConnected(args, util) {
        return _connected
    }
    turnOnOff(args, util) {
        callService('turn_' + args.ONOFF, { entity_id: args.ENTITY })
    }

    setLightColor(args, util) {
        const rgb = Cast.toRgbColorObject(args.COLOR)
        callService('turn_on', { entity_id: args.ENTITY, rgb_color: [rgb.r, rgb.g, rgb.b] })
    }

    setLightTemperature(args, util) {
        callService('turn_on', { entity_id: args.ENTITY, kelvin: args.TEMPERATURE })
    }

    setLightBrightness(args, util) {
        callService('turn_on', { entity_id: args.ENTITY, brightness: args.BRIGHTNESS })
    }

    speechInMiAi(args, util) {
        callService('xiaomi_miot_raw.speak_text', { entity_id: args.ENTITY, text: args.TEXT })
    }

    speech(args, util) {
        callService('tts.baidu_say', { entity_id: args.ENTITY, message: args.TEXT })
    }

    run_script(args, util) {
        callService('script.turn_on', { entity_id: args.ENTITY })
    }

    whenStateChanged(args, util) {
        var entity_id = args.ENTITY
        if (entity_id && _states_changed[entity_id] != null && (args.ONOFF == null || _states_changed[entity_id] == args.ONOFF)) {
            delete _states_changed[entity_id]
            console.log(args.ENTITY + ' 状态变化 ' + _states_changed[entity_id])
            return true
        }
        return false
    }

    whenStateChangedToOnOff(args, util) {
        return this.whenStateChanged(args)
    }

    getState(args) {
        var entity = findEntity(args.ENTITY)
        if (entity) {
            return entity.state
        }
        return '未知'
    }

    isStateOn(args) {
        var state = this.getState(args)
        return state == 'on'
    }

    getEntityMenu() {
        return filterEntityMenu()
    }

    getLightEntityMenu() {
        return filterEntityMenu(function (entity_id) {
            return entity_id.startsWith('light')
        })
    }

    getScriptEntityMenu() {
        return filterEntityMenu(function (entity_id) {
            return entity_id.startsWith('script')
        })
    }

    getTurnOnOffEntityMenu() {
        return filterEntityMenu(function (entity_id) {
            return !entity_id.startsWith('sensor') && !entity_id.startsWith('binary_sensor') && !entity_id.startsWith('device_tracker')
        })
    }

    getIsStateOnEntityMenu() {
        return filterEntityMenu(function (entity_id) {
            return !entity_id.startsWith('sensor')
        })
    }

    getSpeakerEntityMenu() {
        return filterEntityMenu(function (entity_id) {
            return entity_id.startsWith('media_player')
        })
    }

    getPlayMediaEntityMenu() {
        return filterEntityMenu(function (entity_id) {
            if (!entity_id.startsWith('media_player')) return
            var entity = findEntity(entity_id)
            return entity && entity.attributes.supported_features & 512
        })
    }
}

module.exports = Scratch3HomeAssistantBlocks