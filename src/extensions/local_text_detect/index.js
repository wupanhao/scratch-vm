const EventEmitter = require('events');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const StageLayering = require('../../engine/stage-layering');

const blockIconURI = 'data:image/png;base64,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'

const languages = {
    "en": "English",
    "zh": "简体中文",
};

class LocalTextDetection extends EventEmitter {
    constructor(runtime) {
        super();

        this.runtime = runtime;
        this._skinId = -1;
        this._skin = null;
        this._drawable = -1;
        this._ghost = 0;
        this._forceTransparentPreview = false;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'local_text_detection';
        this.canvas.width = 480;
        this.canvas.height = 360;
        this.ctx = this.canvas.getContext('2d');

        this.drawResults = true;
        this.texts = [];
        this.text = '';
        this.textThreshold = 0.60;
        this.ocr = null;
        this.ocrLoading = false;

        this._setupPreview();
    }

    drawLine(begin, end, color) {
        let canvas = this.ctx;
        canvas.beginPath();
        if (begin.length >= 2 && end.length >= 2) {
            canvas.moveTo(begin[0], begin[1]);
            canvas.lineTo(end[0], end[1]);
        } else {
            canvas.moveTo(begin.x, begin.y);
            canvas.lineTo(end.x, end.y);
        }
        canvas.lineWidth = 2;
        canvas.strokeStyle = color;
        canvas.stroke();
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
            id: 'localTextDetection',
            name: '文本识别',
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
                    opcode: 'detectText',
                    text: '识别 [LANG] 文本',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LANG: {
                            type: ArgumentType.STRING,
                            menu: 'lang',
                            defaultValue: 'zh',
                        }
                    }
                },
                {
                    opcode: 'textDetectResult',
                    text: '文本识别结果',
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'textDetectResultDetail',
                    text: '文本识别结果详情',
                    blockType: BlockType.REPORTER,
                },
            ],
            menus: {
                toggle: Menu.formatMenu(['关闭', '打开']),
                lang: Menu.formatMenu3(Object.values(languages), Object.keys(languages)),
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

    async detectText(args, util) {
        if (this.ocrLoading) return;
        
        if (this.ocr) {
            let img_src = document.querySelector('#lepi_camera');
            const [result] = await this.ocr.predict(img_src);
            
            if (result.items && result.items.length > 0) {
                this.texts = result.items.filter(item => item.score > this.textThreshold);
                this.text = this.texts.map(item => item.text).join(' ');
                
                if (this.drawResults) {
                    this.ctx.save();
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    for (let i = 0; i < this.texts.length; i++) {
                        const element = this.texts[i];
                        this.drawLine(element.poly[0], element.poly[1], "#FF3B58");
                        this.drawLine(element.poly[1], element.poly[2], "#FF3B58");
                        this.drawLine(element.poly[2], element.poly[3], "#FF3B58");
                        this.drawLine(element.poly[3], element.poly[0], "#FF3B58");
                    }
                    this.ctx.restore();
                    this.drawResult();
                }
            } else {
                this.texts = [];
                this.text = '';
            }
        } else {
            this.ocrLoading = true;
            let url = new URL('./static/models/paddleocr/paddleocr-paddleocr-js.js', location.href).href
            const { PaddleOCR } = await eval(`import("${url}")`);
            this.ocr = await PaddleOCR.create({
                ocrVersion: "PP-OCRv6",
                textDetectionModelName: "PP-OCRv6_tiny_det",
                textDetectionModelAsset: {
                    url: "static/models/paddleocr/PP-OCRv6_tiny_det_onnx_infer.tar"
                },
                textRecognitionModelName: "PP-OCRv6_tiny_rec",
                textRecognitionModelAsset: {
                    url: "static/models/paddleocr/PP-OCRv6_tiny_rec_onnx_infer.tar"
                }
            });
            this.ocrLoading = false;
            await this.detectText();
        }
    }

    textDetectResult(args, util) {
        return this.text;
    }

    textDetectResultDetail(args, util) {
        return JSON.stringify(this.texts);
    }
}

module.exports = LocalTextDetection;