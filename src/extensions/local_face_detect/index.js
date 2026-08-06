const EventEmitter = require('events');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const StageLayering = require('../../engine/stage-layering');

// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGNDU4OUZEQTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGNDU4OUZEOTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1l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'
const blockIconURI = 'data:image/png;base64,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'

class LocalFaceDetection extends EventEmitter {
    constructor(runtime) {
        super();

        this.runtime = runtime;
        this._skinId = -1;
        this._skin = null;
        this._drawable = -1;
        this._ghost = 0;
        this._forceTransparentPreview = false;

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'local_face_detection';
        this.canvas.width = 480;
        this.canvas.height = 360;
        this.ctx = this.canvas.getContext('2d');
        
        this.drawResults = true;
        this.faceDetections = [];
        this.faceMeshDetections = [];

        this._setupPreview();
        this.init();
    }

    async init() {
        this.faceDetection = new FaceDetection({
            locateFile: (file) => {
                return `static/node_modules/@mediapipe/face_detection/${file}`;
            }
        });
        this.faceDetection.setOptions({
            model: 'short',
            minDetectionConfidence: 0.5
        });
        this.faceDetection.onResults(this.onResultsFace.bind(this));

        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `static/node_modules/@mediapipe/face_mesh/${file}`;
            }
        });
        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        this.faceMesh.onResults(this.onResultsFaceMesh.bind(this));
    }

    onResultsFace(results) {
        this.faceDetections = results.detections;
        if (this.drawResults) {
            let canvasCtx = this.ctx;
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (results.detections.length > 0) {
                for (const detection of results.detections) {
                    drawRectangle(
                        canvasCtx, detection.boundingBox,
                        { color: 'white', lineWidth: 4, fillColor: '#00000000' });
                    drawLandmarks(canvasCtx, detection.landmarks, {
                        color: 'red',
                        radius: 4,
                    });
                }
            }
            canvasCtx.restore();
            this.drawResult();
        }
    }

    onResultsFaceMesh(results) {
        this.faceMeshDetections = results.multiFaceLandmarks[0];
        
        if (this.drawResults) {
            let canvasCtx = this.ctx;
            let canvas = this.canvas;
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (results.multiFaceLandmarks) {
                for (const landmarks of results.multiFaceLandmarks) {
                    results.faceLandmarks = landmarks;
                    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
                    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYE, { color: 'rgb(0,217,231)' });
                    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYEBROW, { color: 'rgb(0,217,231)' });
                    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYE, { color: 'rgb(255,138,0)' });
                    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYEBROW, { color: 'rgb(255,138,0)' });
                    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0', lineWidth: 5 });
                    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_LIPS, { color: '#E0E0E0', lineWidth: 5 });
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
            id: 'localFaceDetection',
            name: '人脸检测',
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
                    opcode: 'detectFaces',
                    text: '检测人脸',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'faceCount',
                    text: '人脸个数',
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'faceData',
                    text: '第 [I] 个人脸的 [DATA]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DATA: {
                            type: ArgumentType.NUMBER,
                            menu: 'faceParams'
                        },
                        I: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        },
                    }
                },
                {
                    opcode: 'faceLandmarks',
                    text: '第 [I] 个人脸 [N] 特征点的 [DATA]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DATA: {
                            type: ArgumentType.NUMBER,
                            menu: 'landmarks'
                        },
                        I: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1'
                        },
                        N: {
                            type: ArgumentType.NUMBER,
                            menu: 'faceLandmarks',
                            defaultValue: '0'
                        },
                    }
                },
                '---',
                {
                    opcode: 'detectFaceMesh',
                    text: '检测人脸网格',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'faceMeshResult',
                    text: '人脸网格结果',
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'faceMeshSolve',
                    text: '人脸网格姿态解算',
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'faceMeshLandmarks',
                    text: '人脸网格[N]号特征点 [POINT]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        N: {
                            type: ArgumentType.NUMBER,
                        },
                        POINT: {
                            type: ArgumentType.NUMBER,
                            menu: 'landmarks',
                        }
                    }
                },
            ],
            menus: {
                faceParams: Menu.formatMenu(['x坐标', 'y坐标', '宽度', '高度']),
                toggle: Menu.formatMenu(['关闭', '打开']),
                faceLandmarks: Menu.formatMenu(['右眼', '左眼', '鼻子', '嘴巴', '右耳', '左耳']),
                landmarks: Menu.formatMenu(['x坐标', 'y坐标', 'z坐标']),
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

    async detectFaces(args, util) {
        let img_src = document.querySelector('#lepi_camera');
        if (img_src) {
            await this.faceDetection.send({ image: img_src });
        }
    }

    faceCount(args, util) {
        return this.faceDetections.length;
    }

    faceData(args, util) {
        var face_id = parseInt(args.I) - 1;
        var face_data = parseInt(args.DATA);
        if (this.faceDetections.length > face_id) {
            var detectedFace = this.faceDetections[face_id];
            var params = detectedFace.boundingBox;
            var img_x = parseInt(params.xCenter * this.canvas.width);
            var img_y = parseInt(params.yCenter * this.canvas.height);
            var width = parseInt(params.width * this.canvas.width);
            var height = parseInt(params.height * this.canvas.height);
            return [img_x, img_y, width, height][face_data];
        }
        return 0;
    }

    faceLandmarks(args, util) {
        var face_id = parseInt(args.I) - 1;
        var landmarks_id = parseInt(args.N);
        var landmarks_data = parseInt(args.DATA);
        if (this.faceDetections.length > face_id) {
            var detectedFace = this.faceDetections[face_id];
            var params = detectedFace.landmarks[landmarks_id];
            var x = parseInt(params.x * this.canvas.width);
            var y = parseInt(params.y * this.canvas.height);
            var z = parseInt(params.z * this.canvas.width);
            return [x, y, z][landmarks_data];
        }
        return 0;
    }

    async detectFaceMesh(args, util) {
        let img_src = document.querySelector('#lepi_camera');
        if (img_src) {
            await this.faceMesh.send({ image: img_src });
        }
    }

    faceMeshResult() {
        if (this.faceMeshDetections && this.faceMeshDetections.length >= 1) {
            return JSON.stringify(this.faceMeshDetections);
        }
        return JSON.stringify([]);
    }

    faceMeshSolve() {
        if (this.faceMeshDetections && this.faceMeshDetections.length >= 1) {
            return JSON.stringify(Kalidokit.Face.solve(this.faceMeshDetections));
        }
        return JSON.stringify({
            "eye": { "l": 1, "r": 1 },
            "mouth": { "x": 0, "y": 0, "shape": { "A": 0, "E": 0, "I": 0, "O": 0, "U": 0 } },
            "head": { "x": 0, "y": 0, "z": 0, "width": 0.3, "height": 0.6, "position": { "x": 0.5, "y": 0.5, "z": 0 }, "normalized": { "y": 0, "x": 0, "z": 0 }, "degrees": { "y": 0, "x": 0, "z": 0 } },
            "brow": 0,
            "pupil": { "x": 0, "y": 0 }
        });
    }

    faceMeshLandmarks(args, util) {
        let wh = [480, 360, 480];
        let key = ['x', 'y', 'z'];
        let id = parseInt(args.N);
        let axis = parseInt(args.POINT);
        if (this.faceMeshDetections && this.faceMeshDetections.length >= 1 && id <= 477) {
            return parseInt(this.faceMeshDetections[id][key[axis]] * wh[axis]);
        }
        return 0;
    }
}

module.exports = LocalFaceDetection;