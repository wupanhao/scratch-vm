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
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAVcSURBVFhH7VZtSJtXFH7yZWKy1A/Y2CR1zq2Jioxqp62jtTBk4qibsNFBYVAm7OdSHa3Iyib90z/F0cE6Zd2XHYLVtZtsdCDWjlHsplhR1uJErZ0fc/MjiSYxJm+yc27ySleavAkZrIw8cEje+5733Oc+55x7ryp0FCE8xFBHfh9apAgmixTBZJEimCxSBJPF/5AgH4z3Ho7y84OMIc8gPyeIxAkGgVtbO/DFigW31ug5cJ/5I0Z+d13A6XEtfnEaxDMksgSJxn9ZoODn5nbgdrkdJeUV2JW3E99+dwW5lhzMzy9QJBVCoRD/QAoEEQj4odUbUFG2B3+uOvH77AxKpy/iNc8NQEfxyC8exEeQlFnc8SR+e3sQB21P0OQBSJIEvV5Pv0FoNPElYsolwXdqP4oWiKQ+MqgAZYL81g0snVtBZmYGQpJfKGUwGODz+YQFg0GkpaVBrVaTgir4/X4xZjKZoNVqceT1V6AzLuHLz2/gry0g+y0VNBw3jnUpu1A9OZ57CTBnY/D6TygpKYHNZsPVq1eh0+kEAf5l0qwqE2OSTM7jcaP78mU0vHMSBdYXMXPnLoKU+rWDxwBfJL4CYhPkVW6SgC80QOvbwKVLl2C1WpGTk4Oenh5KrUYQYbLr6+si5axoX1+fIP7Zp+dx2P4Bch7LRnPzKRx+Kg9dLe8jeKg53EjKxaWQYmoMSavBH+cC0G8sY2pqCo2Njdja2sKFCxdQUFAQdiPlGLJ6nGo2xujQzxi/PQGVQcKeon3UzBIetRXD/G4B0hcmwg0TA7EVpFU699XDSF6sSH5+Pnp7e3Ht2jVBbnh4GK2trUJJJscmN9DAwADGx8exu2wvRieG0XDSjsLiQlipPHTk49j7ZlhFBURXkEfXgfn3riPDVkZFHRDqsDEhl8uFhoYGdHV1YXR0VNSlTK6trQ2dnZ1YWlrC2bNnUVdXJ0Jubm6K9xLFXl5dQ37jTuARehFjy4muIAUJmShtu56HOugXxMQwNQOrmZubi46ODlRXV6Ompgb9/f2iWVjFsbExoXZ6ejpGRkYEMe5sOf0qiqHLzoHPQgTD1REV0QnS3ucqPgSDKiQmZcgKMgYHB1FbW4uhoSG0t7ejsrJSKOjxeNDU1ASv14vS0lLU19cLcjLCMUBxJYr/cvj0iQFNy260RP7/E7QNrB2ohya/jBQMbNeYXGcWiwVZWVlCUbvdLrpXpI+MVWJVq6qqxP5oNBrFN/L+yAiQn9cvIePGxZgnS/QapPqbPf4DzIX7t1PMJo4zLW3KpnRoyE1L5rxHBSpP8iEjHirKj44s5KXN3OcV38rd7acTyLG2hmdOPE17LA0kRJBHiOD0mRlkZmdDFQwXCk8Q1BnhW5yE6fwRqBzz4biRScV3xIyWgRCzI3/JmAXvG59AW3CA9lIKGgEruRIywnaMCj1hBXlkA5g8MwszFTqdb+H0qXVwL06j8HQFkEY+LKESOKMcy/41dIUHoQ14tzPh0mWh6AS3MSGyxvsRZZjAK1qdg4dqy+12w7XhxuzSKqwfEjm6PW0TVDJWJwPY9fGrmJuZhMuzKeJ5vLTlrC+LkyqaeowHE+QPqLjMw51Y9qngdK1jyhHAs1/VQcMNyYWXCHgWur2Ud9Tgzkp4sc6ABuab3THJMaIrSAEfH/gIqqFu3JxzoOh7OzLmlY+mqKBFpTkdKPvmKEbmXHD/+iPyeo+Hr10xSMY+i/kNbTc+vRp6uoQK5RRWHBMcj/rNTbuAyUf3Ll5sdIkEYr9mMrRCPVd6suQY/D3VpSlE5LiGFcgxlF04qGz/BhKMF8ca/lukCCaLFMFkkSKYHIC/AZpfWt/JEqxtAAAAAElFTkSuQmCC'
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGNDU4OUZFMjdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGNDU4OUZFMTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1l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'
const menuIconURI = blockIconURI;

class LepiJoystick extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.joyState = {}
        this.runtime = runtime;
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.subJoyState()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'subJoyState')
            this.subJoyState()
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
            id: 'lepiJoystick',
            name: formatMessage({
                id: 'lepi.lepiJoystick',
                default: '游戏手柄',
            }) ,
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [{
                opcode: 'getJoyState',
                text: formatMessage({
                    id: 'lepi.getJoyState',
                    default: '手柄状态',
                }) ,
                blockType: BlockType.REPORTER,
            }, {
                opcode: 'getJoyButtonState',
                text: formatMessage({
                    id: 'lepi.getJoyButtonState',
                    default: '手柄 [ID] 键按下?',
                }) ,
                blockType: BlockType.BOOLEAN,
                arguments: {
                    ID: {
                        type: ArgumentType.NUMBER,
                        menu: 'joyButtons'
                    }
                }
            }, {
                opcode: 'getJoyAxisValue',
                text: formatMessage({
                    id: 'lepi.getJoyAxisValue',
                    default: '手柄坐标轴 [ID] 的值',
                }) ,
                blockType: BlockType.REPORTER,
                arguments: {
                    ID: {
                        type: ArgumentType.NUMBER,
                        menu: 'joyAxes'
                    }
                }
            },],
            menus: {
                joyButtons: Menu.formatMenu(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']),
                joyAxes: Menu.formatMenu(['0', '1', '2', '3', '4', '5', '6', '7']),
            },
        };
    }

    getJoyState(args, util) {
        // console.log(this.joyState)
        return JSON.stringify(this.joyState)
    }
    getJoyButtonState(args, util) {
        if (this.joyState && this.joyState.Buttons && this.joyState.Buttons[args.ID]) {
            return this.joyState.Buttons[args.ID]
        } else {
            return 0
        }
    }
    getJoyAxisValue(args, util) {
        if (this.joyState && this.joyState.Axes && this.joyState.Axes[args.ID]) {
            return this.joyState.Axes[args.ID]
        } else {
            return 0
        }
    }
    subJoyState() {
        this.runtime.ros.subJoyState((message) => {
            this.joyState = JSON.parse(message.data)
        })
    }
}

(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        return
    }

    console.log('lepi_joystick loaded')

})()

module.exports = LepiJoystick;