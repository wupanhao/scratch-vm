const EventEmitter = require('events');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const StageLayering = require('../../engine/stage-layering');

const blockIconURI = 'data:image/png;base64,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'

const {
    ObjectDetector,
    FilesetResolver
} = require('../lepi_google_ai/vision_bundle');

const classes = require('../lepi_google_ai/classes');
const names = Object.keys(classes);

function getCategoryColor(categoryIndex) {
    const hue = (categoryIndex * 37 + 180) % 360;
    return `hsl(${hue}, 70%, 55%)`;
}

function drawDetections(ctx, detections, canvasWidth, canvasHeight) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!detections || detections.length === 0) return;

    for (const detection of detections) {
        const bbox = detection.boundingBox;
        if (!bbox) continue;

        const x = bbox.originX;
        const y = bbox.originY;
        const w = bbox.width;
        const h = bbox.height;

        const category = detection.categories[0];
        const categoryName = classes[category.categoryName] || category.categoryName;
        const categoryIndex = names.indexOf(category.categoryName);
        const score = category.score;
        const color = getCategoryColor(categoryIndex >= 0 ? categoryIndex : 0);

        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2.5, Math.min(canvasWidth, canvasHeight) * 0.004);
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.strokeRect(x, y, w, h);
        ctx.shadowBlur = 0;

        ctx.fillStyle = color.replace('55%)', '55%, 0.12)').replace('hsl', 'hsla');
        ctx.fillRect(x, y, w, h);

        const labelText = `${categoryName} ${(score * 100).toFixed(0)}%`;
        const fontSize = Math.max(13, Math.min(canvasWidth, canvasHeight) * 0.032);
        ctx.font = `bold ${fontSize}px "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif`;
        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const textHeight = fontSize * 1.4;
        const labelY = y + h - textHeight - 4;

        const bgX = x;
        const bgY = labelY > 0 ? labelY : y + 2;
        const bgW = textWidth + 12;
        const bgH = textHeight + 4;

        ctx.fillStyle = color.replace('55%)', '55%, 0.85)').replace('hsl', 'hsla');
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';

        const rx = 6;
        const bx = bgY > 0 ? x : x;
        const by = bgY > 0 ? labelY : y + 2;
        ctx.beginPath();
        ctx.moveTo(bx + rx, by);
        ctx.lineTo(bx + bgW - rx, by);
        ctx.quadraticCurveTo(bx + bgW, by, bx + bgW, by + rx);
        ctx.lineTo(bx + bgW, by + bgH - rx);
        ctx.quadraticCurveTo(bx + bgW, by + bgH, bx + bgW - rx, by + bgH);
        ctx.lineTo(bx + rx, by + bgH);
        ctx.quadraticCurveTo(bx, by + bgH, bx, by + bgH - rx);
        ctx.lineTo(bx, by + rx);
        ctx.quadraticCurveTo(bx, by, bx + rx, by);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, bx + 6, by + bgH / 2);
    }
}

class LocalObjectDetection extends EventEmitter {
    constructor(runtime) {
        super();

        this.runtime = runtime;
        this._skinId = -1;
        this._skin = null;
        this._drawable = -1;
        this._ghost = 0;
        this._forceTransparentPreview = false;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'local_object_detection';
        this.canvas.width = 480;
        this.canvas.height = 360;
        this.ctx = this.canvas.getContext('2d');
        
        this.drawResults = true;
        this.objectDetections = [];
        this.object = null;
        this.objectThreshold = 0.40;
        this.objectDetector = null;
        this.objectModelLoading = false;

        this._setupPreview();
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

    async loadObjectModel() {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                'static/node_modules/@mediapipe/tasks-vision/wasm'
            );
            this.objectDetector = await ObjectDetector.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'static/models/efficientdet_lite0.tflite',
                    delegate: 'GPU',
                },
                scoreThreshold: this.objectThreshold,
                maxResults: 25,
                runningMode: 'IMAGE',
            });
        } catch (e) {
            console.log(e);
        }
    }

    getInfo() {
        return {
            id: 'localObjectDetection',
            name: '目标检测',
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
                    opcode: 'detectObject',
                    text: '检测目标',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'detectedObject',
                    text: '检测到 [CLASS] ?',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        CLASS: {
                            type: ArgumentType.NUMBER,
                            menu: 'objects'
                        }
                    }
                },
                {
                    opcode: 'objectData',
                    text: '目标 [DATA]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DATA: {
                            type: ArgumentType.NUMBER,
                            menu: 'objectData',
                        }
                    }
                },
            ],
            menus: {
                toggle: Menu.formatMenu(['关闭', '打开']),
                objects: Menu.formatMenu3(Object.values(classes), Object.keys(classes)),
                objectData: Menu.formatMenu(['中心点x坐标', '中心点y坐标', '宽度', '高度', '置信度']),
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

    async detectObject() {
        if (this.objectModelLoading) return;
        
        if (this.objectDetector) {
            let img_src = document.querySelector('#lepi_camera');
            const result = this.objectDetector.detect(img_src);
            
            if (this.drawResults) {
                drawDetections(this.ctx, result.detections, this.canvas.width, this.canvas.height);
                this.drawResult();
            }
            
            this.objectDetections = (result.detections || []).filter(d => {
                return d.categories && d.categories.length > 0 &&
                    d.categories[0].score >= this.objectThreshold;
            }).map(object => {
                let left_x = object.boundingBox.originX;
                let left_y = object.boundingBox.originY;
                return {
                    class_: object.categories[0].categoryName,
                    score: parseInt(object.categories[0].score * 100),
                    box: [left_y, left_x, left_y + object.boundingBox.height, left_x + object.boundingBox.width]
                };
            });
        } else {
            this.objectModelLoading = true;
            await this.loadObjectModel();
            this.objectModelLoading = false;
            await this.detectObject();
        }
    }

    detectedObject(args, util) {
        var class_ = args.CLASS;
        var id = this.objectDetections.findIndex(e => e.class_ == class_);
        
        if (id >= 0) {
            this.object = this.objectDetections[id];
            var img_x = parseInt((this.object.box[1] + this.object.box[3]) / 2);
            var img_y = parseInt((this.object.box[0] + this.object.box[2]) / 2);
            var height = this.object.box[2] - this.object.box[0];
            var width = this.object.box[3] - this.object.box[1];
            this.object.data = [img_x, img_y, width, height, this.object.score];
            return true;
        }
        
        this.object = null;
        return false;
    }

    objectData(args, util) {
        var data_id = parseInt(args.DATA);
        if (this.object) {
            return this.object.data[data_id];
        }
        return 0;
    }
}

module.exports = LocalObjectDetection;