const EventEmitter = require('events');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const StageLayering = require('../../engine/stage-layering');

// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAACHDwAAjA8AAP1SAACBQAAAfXkAAOmLAAA85QAAGcxzPIV3AAAKOWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAEjHnZZ3VFTXFofPvXd6oc0w0hl6ky4wgPQuIB0EURhmBhjKAMMMTWyIqEBEEREBRZCggAGjoUisiGIhKKhgD0gQUGIwiqioZEbWSnx5ee/l5ffHvd/aZ+9z99l7n7UuACRPHy4vBZYCIJkn4Ad6ONNXhUfQsf0ABniAAaYAMFnpqb5B7sFAJC83F3q6yAn8i94MAUj8vmXo6U+ng/9P0qxUvgAAyF/E5mxOOkvE+SJOyhSkiu0zIqbGJIoZRomZL0pQxHJijlvkpZ99FtlRzOxkHlvE4pxT2clsMfeIeHuGkCNixEfEBRlcTqaIb4tYM0mYzBXxW3FsMoeZDgCKJLYLOKx4EZuImMQPDnQR8XIAcKS4LzjmCxZwsgTiQ7mkpGbzuXHxArouS49uam3NoHtyMpM4AoGhP5OVyOSz6S4pyalMXjYAi2f+LBlxbemiIluaWltaGpoZmX5RqP+6+Dcl7u0ivQr43DOI1veH7a/8UuoAYMyKarPrD1vMfgA6tgIgd/8Pm+YhACRFfWu/8cV5aOJ5iRcIUm2MjTMzM424HJaRuKC/6386/A198T0j8Xa/l4fuyollCpMEdHHdWClJKUI+PT2VyeLQDf88xP848K/zWBrIieXwOTxRRKhoyri8OFG7eWyugJvCo3N5/6mJ/zDsT1qca5Eo9Z8ANcoISN2gAuTnPoCiEAESeVDc9d/75oMPBeKbF6Y6sTj3nwX9+65wifiRzo37HOcSGExnCfkZi2viawnQgAAkARXIAxWgAXSBITADVsAWOAI3sAL4gWAQDtYCFogHyYAPMkEu2AwKQBHYBfaCSlAD6kEjaAEnQAc4DS6Ay+A6uAnugAdgBIyD52AGvAHzEARhITJEgeQhVUgLMoDMIAZkD7lBPlAgFA5FQ3EQDxJCudAWqAgqhSqhWqgR+hY6BV2ArkID0D1oFJqCfoXewwhMgqmwMqwNG8MM2An2hoPhNXAcnAbnwPnwTrgCroOPwe3wBfg6fAcegZ/DswhAiAgNUUMMEQbigvghEUgswkc2IIVIOVKHtCBdSC9yCxlBppF3KAyKgqKjDFG2KE9UCIqFSkNtQBWjKlFHUe2oHtQt1ChqBvUJTUYroQ3QNmgv9Cp0HDoTXYAuRzeg29CX0HfQ4+g3GAyGhtHBWGE8MeGYBMw6TDHmAKYVcx4zgBnDzGKxWHmsAdYO64dlYgXYAux+7DHsOewgdhz7FkfEqeLMcO64CBwPl4crxzXhzuIGcRO4ebwUXgtvg/fDs/HZ+BJ8Pb4LfwM/jp8nSBN0CHaEYEICYTOhgtBCuER4SHhFJBLVidbEACKXuIlYQTxOvEIcJb4jyZD0SS6kSJKQtJN0hHSedI/0ikwma5MdyRFkAXknuZF8kfyY/FaCImEk4SXBltgoUSXRLjEo8UISL6kl6SS5VjJHslzypOQNyWkpvJS2lIsUU2qDVJXUKalhqVlpirSptJ90snSxdJP0VelJGayMtoybDFsmX+awzEWZMQpC0aC4UFiULZR6yiXKOBVD1aF6UROoRdRvqP3UGVkZ2WWyobJZslWyZ2RHaAhNm+ZFS6KV0E7QhmjvlygvcVrCWbJjScuSwSVzcopyjnIcuUK5Vrk7cu/l6fJu8onyu+U75B8poBT0FQIUMhUOKlxSmFakKtoqshQLFU8o3leClfSVApXWKR1W6lOaVVZR9lBOVd6vfFF5WoWm4qiSoFKmclZlSpWiaq/KVS1TPaf6jC5Ld6In0SvoPfQZNSU1TzWhWq1av9q8uo56iHqeeqv6Iw2CBkMjVqNMo1tjRlNV01czV7NZ874WXouhFa+1T6tXa05bRztMe5t2h/akjpyOl06OTrPOQ12yroNumm6d7m09jB5DL1HvgN5NfVjfQj9ev0r/hgFsYGnANThgMLAUvdR6KW9p3dJhQ5Khk2GGYbPhqBHNyMcoz6jD6IWxpnGE8W7jXuNPJhYmSSb1Jg9MZUxXmOaZdpn+aqZvxjKrMrttTjZ3N99o3mn+cpnBMs6yg8vuWlAsfC22WXRbfLS0suRbtlhOWWlaRVtVWw0zqAx/RjHjijXa2tl6o/Vp63c2ljYCmxM2v9ga2ibaNtlOLtdZzllev3zMTt2OaVdrN2JPt4+2P2Q/4qDmwHSoc3jiqOHIdmxwnHDSc0pwOub0wtnEme/c5jznYuOy3uW8K+Lq4Vro2u8m4xbiVun22F3dPc692X3Gw8Jjncd5T7Snt+duz2EvZS+WV6PXzAqrFetX9HiTvIO8K72f+Oj78H26fGHfFb57fB+u1FrJW9nhB/y8/Pb4PfLX8U/z/z4AE+AfUBXwNNA0MDewN4gSFBXUFPQm2Dm4JPhBiG6IMKQ7VDI0MrQxdC7MNaw0bGSV8ar1q66HK4RzwzsjsBGhEQ0Rs6vdVu9dPR5pEVkQObRGZ03WmqtrFdYmrT0TJRnFjDoZjY4Oi26K/sD0Y9YxZ2O8YqpjZlgurH2s52xHdhl7imPHKeVMxNrFlsZOxtnF7YmbineIL4+f5rpwK7kvEzwTahLmEv0SjyQuJIUltSbjkqOTT/FkeIm8nhSVlKyUgVSD1ILUkTSbtL1pM3xvfkM6lL4mvVNAFf1M9Ql1hVuFoxn2GVUZbzNDM09mSWfxsvqy9bN3ZE/kuOd8vQ61jrWuO1ctd3Pu6Hqn9bUboA0xG7o3amzM3zi+yWPT0c2EzYmbf8gzySvNe70lbEtXvnL+pvyxrR5bmwskCvgFw9tst9VsR23nbu/fYb5j/45PhezCa0UmReVFH4pZxde+Mv2q4quFnbE7+0ssSw7uwuzi7Rra7bD7aKl0aU7p2B7fPe1l9LLCstd7o/ZeLV9WXrOPsE+4b6TCp6Jzv+b+Xfs/VMZX3qlyrmqtVqreUT13gH1g8KDjwZYa5ZqimveHuIfu1nrUttdp15UfxhzOOPy0PrS+92vG140NCg1FDR+P8I6MHA082tNo1djYpNRU0gw3C5unjkUeu/mN6zedLYYtta201qLj4Ljw+LNvo78dOuF9ovsk42TLd1rfVbdR2grbofbs9pmO+I6RzvDOgVMrTnV32Xa1fW/0/ZHTaqerzsieKTlLOJt/duFczrnZ86nnpy/EXRjrjup+cHHVxds9AT39l7wvXbnsfvlir1PvuSt2V05ftbl66hrjWsd1y+vtfRZ9bT9Y/NDWb9nffsPqRudN65tdA8sHzg46DF645Xrr8m2v29fvrLwzMBQydHc4cnjkLvvu5L2key/vZ9yff7DpIfph4SOpR+WPlR7X/aj3Y+uI5ciZUdfRvidBTx6Mscae/5T+04fx/Kfkp+UTqhONk2aTp6fcp24+W/1s/Hnq8/npgp+lf65+ofviu18cf+mbWTUz/pL/cuHX4lfyr468Xva6e9Z/9vGb5Dfzc4Vv5d8efcd41/s+7P3EfOYH7IeKj3ofuz55f3q4kLyw8Bv3hPP74uYdwgAAAAlwSFlzAAAOwgAADsIBFShKgAAABn5JREFUWEftV2lsVFUYPbN01rYzNNSWLhQq+1pAiKEIMQYSBBRFMNHgGgxRJMaIUUHBBBNDICHEH8QYEjAQlUUpBsFQFUSJCLFAiwVaCgFLKW2h+0xn83xv3jBd3puZtonBhDO5eW/ue+/ec8+33O8aXMUbQ7iHYVSv9yzuE+wv/r8Eg6EQWgO+Hq0jGFDf6D18waDmmP5QUH2jJzSjWMjZjWbMG/ggPEG/2gskGY242HYbZ5prYTGa1N7EIOTy7KmYljqoyyJlnN8b/0G1twVmQ0+9NAnKAMPtbpwpfE3tiWJ3zXksOfMtXEk2tScxtPg78PaQadgw4jG1J4qXzhVhJ8d1mpLUnih0CQ61paJsxnLk/rwZ1z1NdIbw6ixU1sZmMBiU/50RovIBhDSVkGcdoQA8NKnaAQS8CM1bj+e44N21FzQJxg0Sh9kKW5IVKWab0mKRE3dw832fhp/KNxaD6e44yWIBvhsPcQnKCwb+jJxAWmdyjb52NHa0KvdNfg/2T1qM67NWoi3QoRAWyLXR54GX5OXbu+Pwlwh0Ccogna/dIZPun7QElTPfJMk2OEwWvHH+EA7XVSrmEzJCrsnvxVcTF2Iqg0NIdkV4bC2XiEDziZBqpq8cqa9CC69aJIXAxdZ6Pu/gvxAj3ITLbQ24xCg3qBEuGpo4+bOZY9nGkGDU9DKi+POhusuoam/UJanZKy/X0XyzT+1EPU2n9XEq/WfV3z/g19vXOIpZ6RNiQigCWViApLZcPYkVpQfoe1GfkwWKP889vQunmmtg1Ulb2rQJIeVKsseU36AGDZhoVZejMqG7/if51GZOUvzNSHKimuTDiKmFpMyhR06gP3sCEPJlLbcwyjmQ6SW8GwipiP9JulqQPgxFty4p5hRy2dZkTHflaPijNvpFUHaBolsVeOKBEYp/GanRHQaFm8qKhpL3Hksbip8arjDFGNFGd9k1YSGKpz4Pjzcc/fHQbwUrW+swwpEGvxCkctc8zci1pSBABUVFM/tEVcpKeYN83oi8Y5/BQSUTQcIEZbKIb3UBSVq4y9hNNCG3sxI6fAYnD0gBQFJ+fiMmb+Wzt/KnYxMDptrbrER9IkiIoPBq8rWxebqQVO7pS0uzJuDqzBXYOHoOVg5+CNvHLYCXKafQlY3v6X8hqhtgupo1YDB+o7mdzJmJwmR7cc469V4XTVxxaO5aLMwYiS1VJxiZ4QmUYKCCxcyXt0n+/dIiTE7Lw7jkdGQ607CNRAtSMtDAZ6enL0PhyR0wU2m95K+FhBQ0kNCHl46imQFQQFXkGlFSTHu0oQr5DjejJhlrKo4i75fNeK/8R6y6WIynSvZgCCsjCSjxx8SphZHwqU5IBanEVm5bB2srUFR9Fk6bC2b6n0TwDHcOBlmd+LqmXCEtC5BiNEAX2DBqNt4tP8LCw5Kw70WQcJDILuCyu7D87H7F1KH565XgkFwn6hypq2DOG87/4XJKzK+UT7zmSMTy2ltygl6nGbvFiU1X/sCfjdXYNna+knCbOtpJQKrtBuSwjoyU8G0k+0H+DHxceVwpJvqCXhMUtS6338G0E19g8dl92D3xaXxTsAiTWK2soZ+uGzaT5ZZPMbGf1ympmbjA3UaOC32B7leRQ5OSZLtBSLqopNVgxqK/9mBx5mh8RKXAJG1jURqiguKXT2aMxq4bZbDqqBfx01iHJk2CQkoOTa9mT+TVpElSIAGSzGrbcHAtdt4oxSfj52M1o3h57hR4mTeXZo3D3hoS1PA9IecjsZeZQ7MY/XokNQnKy5kWB7aOmYv0JEfMFUp5lWpNwZ6b5TjO0uv13MkYya3PTV8saapl3mM1o5H3ZMntrCU/H/s4Ct3ZiuJa0DVxhJSyZcWBEJBT3uH6K9hRXYoXssbju4JnsJ5qOow9D0JRhC2jR04Q13PFDNIknUiLRTiFea6s+aZi7lncUZwWO4uwqHtIAREZR8aUOjIe4hLMofny2AazyVF0AEupmCRZgK6uOIZHTm5XiEQqbCHnZALPZ3KXsaTl8D4eYhzcB/DgvkztiWIffW1Ryd6YB3cJKlGoc3DIwf2doQ/j0+GPqj1RvHLuAL5kMCV8cJcJTPQrWWXnADFSDTml6Z1TYkFUT2a6SafCnS0gCtfyVNjKhC9zdofuXiwktaJXKpHekotAiImpu0NIapET6M4kRCQhd299JScQIlpj6pET9H22/wj3CfYX9zhB4F+yrvnbHKTqNQAAAABJRU5ErkJggg=='
const blockIconURI = 'data:image/png;base64,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'

class LocalHandDetection extends EventEmitter {
    constructor(runtime) {
        super();

        this.runtime = runtime;
        this._skinId = -1;
        this._skin = null;
        this._drawable = -1;
        this._ghost = 0;
        this._forceTransparentPreview = false;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'local_hand_detection';
        this.canvas.width = 480;
        this.canvas.height = 360;
        this.ctx = this.canvas.getContext('2d');
        
        this.drawResults = true;
        this.leftHandLandmarks = [];
        this.rightHandLandmarks = [];

        this._setupPreview();
        this.init();
    }

    async init() {
        this.hands = new Hands({
            locateFile: (file) => {
                return `static/node_modules/@mediapipe/hands/${file}`;
            }
        });
        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        this.hands.onResults(this.onResultsHands.bind(this));
    }

    onResultsHands(results) {
        this.leftHandLandmarks = [];
        this.rightHandLandmarks = [];
        
        for (let i = 0; i < results.multiHandedness.length; i++) {
            const landmarks = results.multiHandLandmarks[i];
            if (results.multiHandedness[i].label == 'Right') {
                this.leftHandLandmarks = landmarks;
            } else {
                this.rightHandLandmarks = landmarks;
            }
        }

        if (this.drawResults) {
            let canvasCtx = this.ctx;
            let canvas = this.canvas;
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (results.multiHandLandmarks) {
                let i = 0;
                for (const landmarks of results.multiHandLandmarks) {
                    if (results.multiHandedness[i].label == 'Right') {
                        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: 'white' });
                        drawLandmarks(canvasCtx, landmarks, {
                            color: 'white',
                            fillColor: 'rgb(255,138,0)',
                            lineWidth: 2,
                            radius: (data) => {
                                return lerp(data.from.z, -0.15, .1, 10, 1);
                            }
                        });
                    } else if (results.multiHandedness[i].label == 'Left') {
                        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: 'white' });
                        drawLandmarks(canvasCtx, landmarks, {
                            color: 'white',
                            fillColor: 'rgb(0,217,231)',
                            lineWidth: 2,
                            radius: (data) => {
                                return lerp(data.from.z, -0.15, .1, 10, 1);
                            }
                        });
                    }
                    i++;
                }
            }
            canvasCtx.restore();
            this.drawResult();
        }
    }

    drawResult() {
        if (this._skinId != -1) {
            this.runtime.renderer.updateBitmapSkin(this._skinId, this.canvas, 1);
            this.runtime.requestRedraw();
        }
    }

    _setupPreview() {
        const { renderer } = this.runtime;
        if (!renderer) return;

        if (this._skinId === -1 && this._skin === null && this._drawable === -1) {
            this._skinId = renderer.createBitmapSkin(this.canvas);
            this._skin = renderer._allSkins[this._skinId];
            this._drawable = renderer.createDrawable(StageLayering.DRAW_LAYER);
            renderer.updateDrawableProperties(this._drawable, { skinId: this._skinId });
        }

        if (!this._renderPreviewFrame) {
            renderer.updateDrawableProperties(this._drawable, {
                ghost: this._forceTransparentPreview ? 100 : this._ghost,
                visible: true
            });
        }
    }

    getInfo() {
        return {
            id: 'localHandDetection',
            name: '手势检测',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'setDrawResults',
                    text: '检测结果绘制 [ACTION]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ACTION: {
                            type: ArgumentType.NUMBER,
                            menu: 'toggle',
                            defaultValue: 1
                        },
                    }
                },
                '---',
                {
                    opcode: 'detectHands',
                    text: '检测手势',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'handLandmarks',
                    text: '[HAND]手 [N]号特征点 [POINT]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        HAND: {
                            type: ArgumentType.NUMBER,
                            menu: 'hand',
                        },
                        N: {
                            type: ArgumentType.NUMBER,
                            menu: 'handLandmarks',
                        },
                        POINT: {
                            type: ArgumentType.NUMBER,
                            menu: 'landmarks',
                        }
                    }
                },
            ],
            menus: {
                toggle: Menu.formatMenu(['关闭', '打开']),
                landmarks: Menu.formatMenu(['x坐标', 'y坐标', 'z坐标']),
                handLandmarks: Menu.formatMenu4(21),
                hand: Menu.formatMenu(['右或左', '左', '右']),
            },
        };
    }

    setDrawResults(args, util) {
        let action = parseInt(args.ACTION);
        this.drawResults = action == 1;
        if (this.drawResults) {
            this.runtime.renderer.updateDrawableProperties(this._drawable, { visible: true });
        } else {
            this.runtime.renderer.updateDrawableProperties(this._drawable, { visible: false });
        }
    }

    async detectHands(args, util) {
        let img_src = document.querySelector('#lepi_camera');
        if (img_src) {
            await this.hands.send({ image: img_src });
        }
    }

    handLandmarks(args, util) {
        let i = parseInt(args.HAND);
        let id = parseInt(args.N);
        let axis = parseInt(args.POINT);
        let wh = [480, 360, 480];
        let key = ['x', 'y', 'z'];
        let landmarks = [];
        
        if (i == 0) {
            if (this.rightHandLandmarks && this.rightHandLandmarks.length > 0) {
                landmarks = this.rightHandLandmarks;
            } else if (this.leftHandLandmarks && this.leftHandLandmarks.length > 0) {
                landmarks = this.leftHandLandmarks;
            }
        } else if (i == 1) {
            landmarks = this.leftHandLandmarks;
        } else {
            landmarks = this.rightHandLandmarks;
        }
        
        if (landmarks && landmarks.length > 0) {
            return parseInt(landmarks[id][key[axis]] * wh[axis]);
        }
        return 0;
    }
}

module.exports = LocalHandDetection;