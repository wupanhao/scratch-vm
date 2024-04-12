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
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAS+SURBVFhH7ZdbaBxVHMa/M5fd2U12ki1pA7HSFomhCoaKF+iLTxakD1YfRFKUBluoqC8igmBfREF90QcRsXhB+uJbBREvCIL1QfJSBH1otG3Sazb33ezszu5c/P6zu6Wum2SmWyTgfnAymTNnzvnN/3bOqtWnz4fYwtKa1y2rHmC36gF2qx5gt/qfA3ILMNmybBk2dQtbQiLAJAsYHGtz+oupEKdMF1+bNeR0DXagALbQTSOsWtFHbKTYgAIXcnQuaHZsIItjHR3YkSngnvAqJtUSnlQLUMZlvGlVYRtceP9P0Cc+I+jGkLEBc6HCwVwR72dd2D6tEHaeVWe3pylsN69h3qvzy0gTLUPiQMMJx8HkoZPIvXIY/ncHQVtyTPRqRyVy8bTy8HJ6GS8NOrBDA2lhbOPs42oT6VXA541qm16RxKrh80+exezvh2E9/yW83Rfli5oD/q1EgLQHgXR8oEoYys/jL8aXTatk6HYlFo1gFb4KnejaUdKdLeHjqzuQrlgwzo3SuOvHTSLA8cDkX6HQsBj6uDdbwL5ty/gm6yGnGY0EMDgmEPOtJxmzhpkfHwTePc7YWVv3W0TxACPrhHjdzchNo09mpfXOhjUcSi1BDVzD2NAqnlHTfCZxt86q4uZwFcMX7qYlKxvCiWIBWkyQk4MBpg0do7TUDcli0QqcholzLqjjlL9EALf5rE0Sk7Uim4cDIxnUgtbHrq9YgC7XOlbUcby/guk6I9EtsbcNoAWr08oBk6RdERzfK5YwOp7DvrrFmL5NgDQg6nTxz6tcPGOzDbGDiVBju7ncyP9mllcGvT/fiMWKB5Q5bmUOKJWw//4BPHGfje1XDPja5oCJfpPYXO/DfIAXUlwwYF0T1ctNyGZT7HcKhKelUxpefXwMM4UKlFfFnm1AVQswfqkPE1MDqLAKbKZkP5oIYrPgTmUVHu6r8FaA2lzt02JrRdyZd3Ds0T18rGhID8WFAgKGwLIV4J3v74jygzm2qRIBZujrL9JFHA3PYziwMBdtzgLIK8tO5FLXw5HHRjG+exArDqOM7xQXrkfvV7lBPzDfj8lfBrAmVb7t2zopVgy2VKENnqsO4m21C3Mh6xezttFotcianC5l4vTUdei6gsb70iLdTfnyiPdHfs2jHBNOlPx3sbiZ29yZdAWP4E8arcZZbqp7cnGq2Dmcx1MP9SPHOJMdaIWJ89a3IzDdEH4zfONoc8AoARrSuLrMLfuJIUcbZeKHvhIOlP9gshBUpHg60VKNWKwxm7McR9f+FuzFmG+iKqeJBNoYkHAhTyYWC3SaeC6tMMsDw1na5IxWx2nNxayAaYJM0wXVRq0Tt0fve8gaaVzS98L2FJwYZaVdmwKmGTevmSt4z5dYojXEOlJK5C2pd5Ic4mafcDcKL6/8sDeMnTgRDqNC4HrMmGtXLBfLyRiahk+xiI/YpurcrgSulWNSaiQUCDVuDuAo8ngRLOZ+gCITK25CdFLsJJGKko1ikFA8us/QvReCGi6HdYwwFnfRzXex9AhUQAuW5W8XYC3FBvyH+Ibkrd5MGrGlx06mRVfW6qSmjxKKEIx5HiJCOGxVNrm/3XCiWwP8D9UD7FY9wG7VA+xWWxwQ+BshcuGgi4Ql9AAAAABJRU5ErkJggg=='
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQwIDc5LjE2MDQ1MSwgMjAxNy8wNS8wNi0wMTowODoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkYWJmYjkwNy0zN2YxLTQ2OTktOGJkMi1mMjdjZmVjMjRlMWIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RERENzUyOUI3RDYyMTFFQTgyRjdEOTUyNTMyQTlDQkQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RERENzUyOUE3RDYyMTFFQTgyRjdEOTUyNTMyQTlDQkQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDplYmE1ODhiNi1lMDFkLTRhZWEtYWUzNC02N2RhYTNiOWIxZmQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ZGFiZmI5MDctMzdmMS00Njk5LThiZDItZjI3Y2ZlYzI0ZTFi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'
const menuIconURI = blockIconURI;

class LepiTransferLearning extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.subTraningLogs = false
        this.runtime = runtime;
        this.prediction = ''
        this.prob = 0
        this.cats = []
        this.names = []
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.listNS()
        }

        try {
            this.setSize({ W: 224, H: 224 })
        } catch (error) {
            console.log(error)
        }

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
            id: 'lepiTransferLearning',
            name: '迁移学习',
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'listNS',
                    blockType: BlockType.COMMAND,
                    text: '更新训练列表',
                },
                {
                    opcode: 'setSize',
                    blockType: BlockType.COMMAND,
                    text: '设置图像尺寸 宽:[W] 高:[H]',
                    arguments: {
                        W: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 224,
                        },
                        H: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 224,
                        },
                    }
                },
                {
                    opcode: 'setNS',
                    blockType: BlockType.COMMAND,
                    text: '加载训练 [NS] ',
                    arguments: {
                        NS: {
                            type: ArgumentType.STRING,
                            menu: 'ns',
                        }
                    }
                }, {
                    opcode: 'createNS',
                    blockType: BlockType.COMMAND,
                    text: '创建训练 [NS] ',
                    arguments: {
                        NS: {
                            type: ArgumentType.STRING,
                            defaultValue: '分类测试'
                        }
                    }
                },
                {
                    opcode: 'getTrainingData',
                    blockType: BlockType.COMMAND,
                    text: '查看训练样本',
                },
                {
                    opcode: 'createCat',
                    blockType: BlockType.COMMAND,
                    text: '创建分类 [CAT] ',
                    arguments: {
                        CAT: {
                            type: ArgumentType.STRING,
                            defaultValue: '分类1'
                        }
                    }
                }, {
                    opcode: 'saveFrame',
                    blockType: BlockType.COMMAND,
                    text: '向分类 [CAT] 添加训练数据',
                    arguments: {
                        CAT: {
                            type: ArgumentType.STRING,
                            menu: 'cat',
                        }
                    }
                }, {
                    opcode: 'trainClassifier',
                    blockType: BlockType.COMMAND,
                    text: '训练分类器,执行 [N] 轮',
                    arguments: {
                        N: {
                            type: ArgumentType.STRING,
                            defaultValue: '3'
                        }
                    }
                }, {
                    opcode: 'getPredictions',
                    blockType: BlockType.COMMAND,
                    text: '进行预测',
                }, {
                    opcode: 'getPredictionResult',
                    blockType: BlockType.REPORTER,
                    text: '预测结果',
                }, {
                    opcode: 'getPredictionProb',
                    blockType: BlockType.REPORTER,
                    text: '预测确信度',
                }, {
                    opcode: 'deleteNS',
                    blockType: BlockType.COMMAND,
                    text: '删除训练 [NS] ',
                    arguments: {
                        NS: {
                            type: ArgumentType.STRING,
                            menu: 'ns'
                        }
                    }
                }, {
                    opcode: 'deleteCat',
                    blockType: BlockType.COMMAND,
                    text: '删除分类 [CAT] ',
                    arguments: {
                        CAT: {
                            type: ArgumentType.STRING,
                            menu: 'cat',
                        }
                    }
                },],
            menus: {
                joyButtons: Menu.formatMenu(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
                joyAxes: Menu.formatMenu(['0', '1', '2', '3', '4', '5', '6', '7']),
                ns: 'formatNS',
                cat: 'formatCat'
            },
        };
    }
    setSize(args, util) {
        const w = parseInt(args.W)
        const h = parseInt(args.H)
        let x = parseInt(240 - w / 2)
        let y = parseInt(180 - h / 2)
        this.runtime.rect = [x, y, w, h]
        return this.runtime.ros.setTransferSize(w, h)
    }
    listNS(args, util) {
        return new Promise(resolve => {
            this.runtime.ros.listNS().then(result => {
                this.ns = result.data
                resolve(this.ns.join(','))
            })
        })
    }
    listCat(args, util) {
        return new Promise(resolve => {
            this.runtime.ros.listCat().then(result => {
                this.cat = result.data
                resolve(this.cat.join(','))
            })
        })
    }
    formatNS() {
        return Menu.formatMenu2(this.ns)
    }
    formatCat() {
        return Menu.formatMenu2(this.cat)
    }
    setNS(args, util) {
        var ns = args.NS
        var promise = this.runtime.ros.setNS(ns)
        promise.then(this.listCat())
        return promise
    }
    createNS(args, util) {
        return this.setNS(args, util)
    }
    createCat(args, util) {
        var cat = args.CAT
        return new Promise(resolve => {
            this.runtime.ros.createCat(cat).then(result => {
                this.getTrainingData({}, util)
                resolve(result.data)
                this.listCat()
            })
        })
    }
    getTrainingData(args, util) {
        return this.runtime.ros.getTrainingData().then((data) => {
            let cats = data.label_names
            let counts = data.prob
            var str = cats.map((item, index) => {
                return `${item}:${counts[index]}`
                // {item: parseInt(data[1][index])}
            })
            this.runtime.emit('SAY', util.target, 'say', str.join(','));
        })
    }
    deleteNS(args, util) {
        var ns = args.NS
        return this.runtime.ros.deleteNS(ns)
    }
    deleteCat(args, util) {
        var ns = args.CAT
        return this.runtime.ros.deleteCat(ns)
    }
    saveFrame(args, util) {
        var cat = args.CAT
        return new Promise(resolve => {
            this.runtime.ros.saveFrame(cat).then((result) => {
                this.runtime.ros.getTrainingData().then((data) => {
                    let cats = data.label_names
                    let counts = data.prob
                    var str = cats.map((item, index) => {
                        return `${item}:${counts[index]}`
                        // {item: parseInt(data[1][index])}
                    })
                    this.runtime.emit('SAY', util.target, 'say', str.join(','));
                    resolve(result.data)
                })
            })
        })
    }
    trainClassifier(args, util) {
        const n = args.N
        this.runtime.emit('SAY', util.target, 'say', '训练中，请耐心等候');
        if (!this.subTraningLogs) {
            this.subTraningLogs = true
            console.log('subTraningLogs')
            this.runtime.ros.subTraningLogs((message) => {
                this.runtime.emit('SAY', util.target, 'say', message.data);
            })
        } else {
            console.log('TraningLogs subscribed')
        }
        return new Promise(resolve => {
            this.runtime.ros.trainClassifier(n).then(result => {
                resolve(result.data)
            })
        })
    }
    getPredictions(args, util) {
        return new Promise(resolve => {
            this.runtime.ros.getPredictions().then(predictions => {
                let cats = predictions.label_names
                let prob = predictions.prob
                var max_id = 0
                var max_value = 0
                for (var i = cats.length - 1; i >= 0; i--) {
                    if (prob[i] > max_value) {
                        max_value = prob[i]
                        max_id = i
                    }
                }
                var prediction = cats[max_id]
                this.prediction = prediction
                this.prob = max_value * 100
                resolve(prediction)
                this.runtime.emit('SAY', util.target, 'say', '预测结果:' + parseInt(max_value * 100) + '%为:' + prediction);
            })
        })
    }

    getPredictionResult() {
        return this.prediction
    }

    getPredictionProb() {
        return this.prob

    }
}

module.exports = LepiTransferLearning;