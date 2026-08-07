const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');
const StageLayering = require('../../engine/stage-layering')

const languages = {
    "en": "English",
    "zh": "简体中文",
}

const {
    ObjectDetector,
    FilesetResolver
} = require('./vision_bundle.js');

const classes = require('./classes')
const names = Object.keys(classes);

console.log(ObjectDetector, FilesetResolver)

const jsQR = require("jsqr");
const QRCode = require('qrcode')

// const taskVision = require('@mediapipe/tasks-vision/vision_bundle.cjs')

// import {FilesetResolver,HandLandmarker} from "@mediapipe/tasks-vision"

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAMtSURBVFhH7ZZbSFRRFIb/M86M4/0yjpeJUimzQi0EzSCFYvKSXaR6qPDB6AKVgUj1kAZFPSQoFUFG9FCRhQhFVE+RDyGBDBYIRpqF1YM6Nd7G0Zx0VuvsiQIxm5lzBKH5Yc3ea7PXOt/es8/ZS6IxEBaxNL/aRasAoFIFAJUqAKhUAUCl+s8AJbYgT1ctqQcow7HZBvhH5xlSQ+oBhgMVB6ORtNwEGNiXgVWQOoB6oL8XuNM8ibTUMFysZUIGVkPqlFsRwOpkPXbvO4ATVZVITMoCjXNaeRdnPFP8lXJA3qlH93XYVf4DRJ5UpYXrOXEnnj7/DjjEkN9SBijvEAPqpSDcbarH3v1VnnEagqQx4l2HBukZbmDKM+yPlJ1Bhjt/Wg+zKVbAXW04g2QTU0uxOFd7GFtKteJ8KpK8g36ZEzQzLHafurtf8L9L9LrjIR09slH0ZfH66cGtYLk3dw4vzH9ADi3apKWdxRsEjCxzrE4A32w8K/xnT66zr+Uez3fMivfS/AOcAnW1awQMO2S3f6CC3HjaU7aO4qMjaJtljQCUtSplKZ08ZuDerBxemn+AHJYQp6OGuhqadNpp2P5ewORmLaNUcxS9bK0Xfm/3Kxoa6hELmbBx3MSsPF6Y74Ac0nRDT+G6aOr72Ma+UwC0t7UwXCSVWHJpqyWHvnyyUmiQPN9NFeU7KD8vRMTOmXMe8w1wnI1DuCKgDutjMgaDRkf6qO5CNeWtDSNLQRplrkykws1mylyRQJ/72ik7I4FjOIoXYW3l8yh/LufK/RfzDZCnVx/X825kiocODnTS9pJs0S/ISRVtWVE+fbVZ6crlGurv76JD5cVEM6PU0txIcTE6njFH3nnM+w81l1GOEQmRS5KQnqJFkGYSWl0IjHHpsA32ID4hGfZvdsTExmB0xAaDIQQu1zTCwqMw7hjlBGN489aFa5eGUXnKBTg9af8l324S/ujeux0Mt9vNAG5eovwauyFJEreeNKKIYf+35HH2Jb4TpklCkWUaRhOPeXlH+37VhbLJz/ct6o/ka8+HAkJ5sbDAUrfkXwAFAJUqAKhUAUClCgAq1SIHBH4CS5yFQixuY8IAAAAASUVORK5CYII='
const blockIconURI = 'data:image/png;base64,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'
const menuIconURI = blockIconURI;

// const classes = require('./classes')

function zColor(data) {
    const z = clamp(data.from.z + 0.5, 0, 1);
    return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
}

function connect(
    ctx,
    connectors) {
    const canvas = ctx.canvas;
    for (const connector of connectors) {
        const from = connector[0];
        const to = connector[1];
        if (from && to) {
            if (from.visibility && to.visibility &&
                (from.visibility < 0.1 || to.visibility < 0.1)) {
                continue;
            }
            ctx.beginPath();
            ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
            ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
            ctx.stroke();
        }
    }
}

function removeElements(
    landmarks, elements) {
    for (const element of elements) {
        delete landmarks[element];
    }
}

function removeLandmarks(results) {
    if (results.poseLandmarks) {
        removeElements(
            results.poseLandmarks,
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22]);
    }
}

// ==================== 工具函数 ====================
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

        // 绘制边界框
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2.5, Math.min(canvasWidth, canvasHeight) * 0.004);
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 8;
        ctx.strokeRect(x, y, w, h);
        ctx.shadowBlur = 0;

        // 半透明填充
        ctx.fillStyle = color.replace('55%)', '55%, 0.12)').replace('hsl', 'hsla');
        ctx.fillRect(x, y, w, h);

        // 标签
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

function rotationMatrixToEulerAngles(matrix) {
    // 矩阵为3x3数组，按行存储
    const m = matrix;

    // 提取旋转矩阵元素
    const m00 = m[0][0], m01 = m[0][1], m02 = m[0][2];
    const m10 = m[1][0], m11 = m[1][1], m12 = m[1][2];
    const m20 = m[2][0], m21 = m[2][1], m22 = m[2][2];

    // 计算欧拉角（XYZ旋转顺序）
    let x, y, z;

    // 检查是否为奇异情况（万向锁）
    const epsilon = 1e-6;
    if (Math.abs(m20 - 1) < epsilon) {
        // 绕Y轴旋转90度
        x = 0;
        y = Math.PI / 2;
        z = Math.atan2(m01, m11);
    } else if (Math.abs(m20 + 1) < epsilon) {
        // 绕Y轴旋转-90度
        x = 0;
        y = -Math.PI / 2;
        z = Math.atan2(-m01, -m11);
    } else {
        // 一般情况
        x = Math.atan2(m21, m22);
        y = Math.atan2(-m20, Math.sqrt(m21 * m21 + m22 * m22));
        z = Math.atan2(m10, m00);
    }

    // 转换为角度（弧度制，可选择转换为度）
    // return {
    //     x: x,
    //     y: y,
    //     z: z,
    //     // 可选：转换为度
    //     xDeg: x * 180 / Math.PI,
    //     yDeg: y * 180 / Math.PI,
    //     zDeg: z * 180 / Math.PI
    // };
    return [-x * 180 / Math.PI, -y * 180 / Math.PI, -z * 180 / Math.PI]
}

class LepiGoogleAI extends EventEmitter {
    constructor(runtime) {
        super();

        /**
         * Id representing a Scratch Renderer skin the video is rendered to for
         * previewing.
         * @type {number}
         */
        this._skinId = -1;

        /**
         * The Scratch Renderer Skin object.
         * @type {Skin}
         */
        this._skin = null;

        /**
         * Id for a drawable using the video's skin that will render as a video
         * preview.
         * @type {Drawable}
         */
        this._drawable = -1;

        /**
         * Store the last state of the video transparency ghost effect
         * @type {number}
         */
        this._ghost = 0;

        /**
         * Store a flag that allows the preview to be forced transparent.
         * @type {number}
         */
        this._forceTransparentPreview = false;
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.canvas = document.createElement('canvas')
        this.canvas.id = 'google_ai'
        this.canvas.width = 480
        this.canvas.height = 360
        this.canvas.style = "padding-top: 1000px"
        // document.body.append(this.canvas)

        this.ctx = this.canvas.getContext('2d')
        this.drawResults = true
        this.results = {}
        this.faceDetections = []
        this.faceMeshDetections = []
        this.defaultQRCodeValue = ['', 0, 0, 0, 0]

        this.apriltagDetections = []

        this._setupPreview()
        this.init()
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
        this.pose = new Pose({
            locateFile: (file) => {
                return `static/node_modules/@mediapipe/pose/${file}`;
            }
        });
        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: true,
            smoothSegmentation: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        this.pose.onResults(this.onResultsPose.bind(this));

        this.holistic = new Holistic({
            locateFile: (file) => {
                return `static/node_modules/@mediapipe/holistic/${file}`;
            }
        });
        this.holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: true,
            smoothSegmentation: true,
            refineFaceLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        this.holistic.onResults(this.onResultsHolistic.bind(this));

        this.objectDetections = []
        this.objectThreshold = 0.40

        this.texts = []
        this.text = ''
        this.textThreshold = 0.60
    }

    onResultsFace(results) {
        console.log(results)
        this.faceDetections = results.detections
        if (this.drawResults) {
            let canvasCtx = this.ctx
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // canvasCtx.drawImage(
            //     results.image, 0, 0, this.canvas.width, this.canvas.height);
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
            this.drawResult()
        }

    }

    onResultsFaceMesh(results) {
        this.faceMeshDetections = results.multiFaceLandmarks[0]
        // Object.assign(this.faceMeshDetections,results.faceLandmarks)
        // console.log(results, this.faceMeshDetections)

        if (this.drawResults) {
            let canvasCtx = this.ctx
            let canvas = this.canvas

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            // canvasCtx.drawImage(
            //     results.image, 0, 0, canvas.width, canvas.height);
            if (results.multiFaceLandmarks) {
                for (const landmarks of results.multiFaceLandmarks) {
                    results.faceLandmarks = landmarks
                    drawConnectors(
                        canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
                        { color: '#C0C0C070', lineWidth: 1 });
                    drawConnectors(
                        canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYE,
                        { color: 'rgb(0,217,231)' });
                    drawConnectors(
                        canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYEBROW,
                        { color: 'rgb(0,217,231)' });
                    drawConnectors(
                        canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYE,
                        { color: 'rgb(255,138,0)' });
                    drawConnectors(
                        canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYEBROW,
                        { color: 'rgb(255,138,0)' });
                    drawConnectors(
                        canvasCtx, results.faceLandmarks, FACEMESH_FACE_OVAL,
                        { color: '#E0E0E0', lineWidth: 5 });
                    drawConnectors(
                        canvasCtx, results.faceLandmarks, FACEMESH_LIPS,
                        { color: '#E0E0E0', lineWidth: 5 });
                }
            }
            canvasCtx.restore();
            this.drawResult()
        }


    }
    onResultsHands(results) {
        console.log(results)
        this.leftHandLandmarks = []
        this.rightHandLandmarks = []
        for (let i = 0; i < results.multiHandedness.length; i++) {
            const landmarks = results.multiHandLandmarks[i];
            if (results.multiHandedness[i].label == 'Right') { //左手
                this.leftHandLandmarks = landmarks
            } else {
                this.rightHandLandmarks = landmarks
            }
        }

        if (this.drawResults) {
            let canvasCtx = this.ctx
            let canvas = this.canvas

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            // canvasCtx.drawImage(
            //     results.image, 0, 0, canvas.width, canvas.height);
            if (results.multiHandLandmarks) {
                let i = 0
                for (const landmarks of results.multiHandLandmarks) {
                    if (results.multiHandedness[i].label == 'Right') {
                        drawConnectors(
                            canvasCtx, landmarks, HAND_CONNECTIONS,
                            { color: 'white' });
                        drawLandmarks(canvasCtx, landmarks, {
                            color: 'white',
                            fillColor: 'rgb(255,138,0)',
                            lineWidth: 2,
                            radius: (data) => {
                                return lerp(data.from.z, -0.15, .1, 10, 1);
                            }
                        });
                    } else if (results.multiHandedness[i].label == 'Left') {
                        drawConnectors(
                            canvasCtx, landmarks, HAND_CONNECTIONS,
                            { color: 'white' });
                        drawLandmarks(canvasCtx, landmarks, {
                            color: 'white',
                            fillColor: 'rgb(0,217,231)',
                            lineWidth: 2,
                            radius: (data) => {
                                return lerp(data.from.z, -0.15, .1, 10, 1);
                            }
                        });
                    }
                    // drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                    //     { color: '#00FF00', lineWidth: 5 });
                    // drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
                    i++
                }
            }
            canvasCtx.restore();
            this.drawResult()
        }


    }

    onResultsPose(results) {
        console.log(results)
        this.poseDetections = results.poseLandmarks
        if (this.drawResults) {
            let canvasCtx = this.ctx
            let canvas = this.canvas

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.poseLandmarks) {
                drawConnectors(
                    canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                    { color: 'white' });
                drawLandmarks(
                    canvasCtx,
                    Object.values(POSE_LANDMARKS_LEFT)
                        .map(index => results.poseLandmarks[index]),
                    { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)' });
                drawLandmarks(
                    canvasCtx,
                    Object.values(POSE_LANDMARKS_RIGHT)
                        .map(index => results.poseLandmarks[index]),
                    { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)' });
            }

            canvasCtx.restore();
            this.drawResult()
        }


    }

    onResultsHolistic(results) {
        console.log(results)
        this.poseDetections = []
        Object.assign(this.poseDetections, results.poseLandmarks)

        this.faceMeshDetections = results.faceLandmarks
        this.leftHandLandmarks = results.leftHandLandmarks
        this.rightHandLandmarks = results.rightHandLandmarks
        if (this.drawResults) {
            let canvasCtx = this.ctx
            let canvas = this.canvas

            removeLandmarks(results);
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            // Connect elbows to hands. Do this first so that the other graphics will draw
            // on top of these marks.
            canvasCtx.lineWidth = 5;
            if (results.poseLandmarks) {
                if (results.rightHandLandmarks) {
                    canvasCtx.strokeStyle = 'white';
                    connect(canvasCtx, [[
                        results.poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW],
                        results.rightHandLandmarks[0]
                    ]]);
                }
                if (results.leftHandLandmarks) {
                    canvasCtx.strokeStyle = 'white';
                    connect(canvasCtx, [[
                        results.poseLandmarks[POSE_LANDMARKS.LEFT_ELBOW],
                        results.leftHandLandmarks[0]
                    ]]);
                }
            }

            // Pose...
            if (results.poseLandmarks) {
                drawConnectors(
                    canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                    { color: 'white' });
                drawLandmarks(
                    canvasCtx,
                    Object.values(POSE_LANDMARKS_LEFT)
                        .map(index => results.poseLandmarks[index]),
                    { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)' });
                drawLandmarks(
                    canvasCtx,
                    Object.values(POSE_LANDMARKS_RIGHT)
                        .map(index => results.poseLandmarks[index]),
                    { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)' });
            }

            // Hands...
            drawConnectors(
                canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
                { color: 'white' });
            drawLandmarks(canvasCtx, results.rightHandLandmarks, {
                color: 'white',
                fillColor: 'rgb(0,217,231)',
                lineWidth: 2,
                radius: (data) => {
                    return lerp(data.from.z, -0.15, .1, 10, 1);
                }
            });
            drawConnectors(
                canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
                { color: 'white' });
            drawLandmarks(canvasCtx, results.leftHandLandmarks, {
                color: 'white',
                fillColor: 'rgb(255,138,0)',
                lineWidth: 2,
                radius: (data) => {
                    return lerp(data.from.z, -0.15, .1, 10, 1);
                }
            });

            // Face...
            drawConnectors(
                canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
                { color: '#C0C0C070', lineWidth: 1 });
            drawConnectors(
                canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYE,
                { color: 'rgb(0,217,231)' });
            drawConnectors(
                canvasCtx, results.faceLandmarks, FACEMESH_RIGHT_EYEBROW,
                { color: 'rgb(0,217,231)' });
            drawConnectors(
                canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYE,
                { color: 'rgb(255,138,0)' });
            drawConnectors(
                canvasCtx, results.faceLandmarks, FACEMESH_LEFT_EYEBROW,
                { color: 'rgb(255,138,0)' });
            drawConnectors(
                canvasCtx, results.faceLandmarks, FACEMESH_FACE_OVAL,
                { color: '#E0E0E0', lineWidth: 5 });
            drawConnectors(
                canvasCtx, results.faceLandmarks, FACEMESH_LIPS,
                { color: '#E0E0E0', lineWidth: 5 });

            canvasCtx.restore();
            this.drawResult()
        }


    }

    drawResult() {
        if (this._skinId != -1) {
            this.runtime.renderer.updateBitmapSkin(this._skinId, this.canvas, 1);
            this.runtime.requestRedraw();
            // console.log('called drawResult')
        }
    }

    _setupPreview(args, util) {

        const {
            renderer
        } = this.runtime;
        if (!renderer) return;

        if (this._skinId === -1 && this._skin === null && this._drawable === -1) {
            this._skinId = renderer.createBitmapSkin(this.canvas);
            this._skin = renderer._allSkins[this._skinId];

            this._drawable = renderer.createDrawable(StageLayering.DRAW_LAYER);
            renderer.updateDrawableProperties(this._drawable, {
                skinId: this._skinId
            });
        }

        // if we haven't already created and started a preview frame render loop, do so
        if (!this._renderPreviewFrame) {
            renderer.updateDrawableProperties(this._drawable, {
                ghost: this._forceTransparentPreview ? 100 : this._ghost,
                visible: true
            });

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
            id: 'lepiGoogleAI',
            name: '通用AI',
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'setDrawResults',
                    text: '检测结果绘制 [ACTION] ',
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
                    text: '第 [I] 个人脸的 [DATA] ',
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
                    text: '第 [I] 个人脸 [N] 特征点的 [DATA] ',
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
                    text: formatMessage({
                        id: 'lepi.faceMeshLandmarks',
                        default: '人脸网格[N]号特征点 [POINT]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        N: {
                            type: ArgumentType.NUMBER,
                            // defaultValue: 0,
                        },
                        POINT: {
                            type: ArgumentType.NUMBER,
                            menu: 'landmarks',
                            // defaultValue: 0
                        }
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
                    text: formatMessage({
                        id: 'lepi.handLandmarks',
                        default: '[HAND]手 [N]号特征点 [POINT]',
                    }),
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
                '---',
                {
                    opcode: 'detectPose',
                    text: '检测身体姿态',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'poseLandmarks',
                    text: formatMessage({
                        id: 'lepi.poseLandmarks',
                        default: '身体[N]号特征点 [POINT]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        N: {
                            type: ArgumentType.NUMBER,
                            // defaultValue: '0',
                            menu: 'poseLandmarks'
                        },
                        POINT: {
                            type: ArgumentType.NUMBER,
                            menu: 'landmarks2',
                            // defaultValue: '0'
                        }
                    }
                },
                '---',
                {
                    opcode: 'detectHolistic',
                    text: '检测全身',
                    blockType: BlockType.COMMAND,
                },
                '---',
                {
                    opcode: 'detectObject',
                    text: '检测目标',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'detectedObject',
                    text: formatMessage({
                        id: 'lepi.detectedObject',
                        default: '检测到 [CLASS] ?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        CLASS: {
                            type: ArgumentType.NUMBER,
                            menu: 'objects'
                        }
                    }
                }, {
                    opcode: 'objectData',
                    text: formatMessage({
                        id: 'lepi.objectData',
                        default: '目标 [DATA]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DATA: {
                            type: ArgumentType.NUMBER,
                            menu: 'objectData',
                            // defaultValue: 0
                        }
                    }
                },
                '---',
                {
                    opcode: 'detectQRCode',
                    text: '检测二维码',
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'detectedBarcode',
                    text: formatMessage({
                        id: 'lepi.detectedBarcode',
                        default: '检测到内容包含 [TAG] 的二维码?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        TAG: {
                            type: ArgumentType.STRING,
                            defaultValue: 'tag'
                        }
                    }
                }, {
                    opcode: 'barcodeData',
                    text: formatMessage({
                        id: 'lepi.barcodeData',
                        default: '二维码 [DATA]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        DATA: {
                            type: ArgumentType.NUMBER,
                            menu: 'barCodeData',
                            // defaultValue: 0
                        }
                    }
                }, {
                    opcode: 'generateBarcode',
                    text: formatMessage({
                        id: 'lepi.generateBarcode',
                        default: '二维码[TAG] 转base64, 大小[SIZE]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TAG: {
                            type: ArgumentType.STRING,
                            defaultValue: 'tag'
                        },
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 360
                        },
                    }
                },
                '---',
                {
                    opcode: 'detectText',
                    text: formatMessage({
                        id: 'lepi.detectText',
                        default: '识别 [LANG] 文本',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        LANG: {
                            type: ArgumentType.STRING,
                            menu: 'lang',
                            defaultValue: 'zh',
                        }
                    }
                }, {
                    opcode: 'textDetectResult',
                    text: formatMessage({
                        id: 'lepi.textDetectResult',
                        default: '文本识别结果',
                    }),
                    blockType: BlockType.REPORTER,
                }, {
                    opcode: 'textDetectResultDetail',
                    text: formatMessage({
                        id: 'lepi.textDetectResultDetail',
                        default: '文本识别结果详情',
                    }),
                    blockType: BlockType.REPORTER,
                }, '---', {
                    opcode: 'detectAprilTag',
                    text: formatMessage({
                        id: 'lepi.detectAprilTag',
                        default: '检测标志物',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'detectAprilTagIDs',
                    text: formatMessage({
                        id: 'lepi.detectAprilTagIDs',
                        default: '检测到的标志物ID',
                    }),
                    blockType: BlockType.REPORTER,
                }, {
                    opcode: 'detectedAprilTag',
                    text: formatMessage({
                        id: 'lepi.detectedAprilTag',
                        default: '检测到id为 [TAG] 的标志物?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        TAG: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                            // menu: 'apriltags'
                        }
                    }
                }, {
                    opcode: 'aprilTagTranslation',
                    text: formatMessage({
                        id: 'lepi.aprilTagTranslation',
                        default: '标志物 [AXIS] 偏移距离',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.NUMBER,
                            menu: 'axes',
                            // defaultValue: 0
                        }
                    }
                }, {
                    opcode: 'aprilTagRotation',
                    text: formatMessage({
                        id: 'lepi.aprilTagRotation',
                        default: '标志物 [AXIS] 偏移角度',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.NUMBER,
                            menu: 'axes',
                            // defaultValue: 0
                        }
                    }
                }

            ],
            menus: {
                // objects: Menu.formatMenu3(Object.values(classes), Object.keys(classes)),
                faceParams: Menu.formatMenu(['x坐标', 'y坐标', '宽度', '高度']),
                toggle: Menu.formatMenu([formatMessage({
                    id: 'lepi.close',
                    default: '关闭',
                }), formatMessage({
                    id: 'lepi.open',
                    default: '打开',
                })]),
                faceLandmarks: Menu.formatMenu(['右眼', '左眼', '鼻子', '嘴巴', '右耳', '左耳']),
                landmarks: Menu.formatMenu(['x坐标', 'y坐标', 'z坐标']),
                landmarks2: Menu.formatMenu(['x坐标', 'y坐标', 'z坐标', '可见度']),
                handLandmarks: Menu.formatMenu4(21),
                poseLandmarks: Menu.formatMenu4(33),
                hand: Menu.formatMenu(['右或左', '左', '右']),
                objects: Menu.formatMenu3(Object.values(classes), Object.keys(classes)),
                // apriltags: _formatMenu1(['停止', '机动车道', '前方学校', '单行道', '等待行人']),
                objectData: Menu.formatMenu([formatMessage({
                    id: 'lepi.center_x',
                    default: '中心点x坐标',
                }), formatMessage({
                    id: 'lepi.center_y',
                    default: '中心点y坐标',
                }), formatMessage({
                    id: 'lepi.width',
                    default: '宽度',
                }), formatMessage({
                    id: 'lepi.height',
                    default: '高度',
                }), formatMessage({
                    id: 'lepi.confidence',
                    default: '置信度',
                })]),
                barCodeData: Menu.formatMenu([formatMessage({
                    id: 'lepi.text_content',
                    default: '文本内容',
                }), formatMessage({
                    id: 'lepi.center_x',
                    default: '中心点x坐标',
                }), formatMessage({
                    id: 'lepi.center_y',
                    default: '中心点y坐标',
                }), formatMessage({
                    id: 'lepi.width',
                    default: '宽度',
                }), formatMessage({
                    id: 'lepi.height',
                    default: '高度',
                })]),
                lang: Menu.formatMenu3(Object.values(languages), Object.keys(languages)),
                axes: Menu.formatMenu([formatMessage({
                    id: 'lepi.x_axis',
                    default: 'x轴',
                }), formatMessage({
                    id: 'lepi.y_axis',
                    default: 'y轴',
                }), formatMessage({
                    id: 'lepi.z_axis',
                    default: 'z轴',
                })]),
            },

        };
    }

    setDrawResults(args, util) {
        let action = parseInt(args.ACTION)
        this.drawResults = action == 1
        if (action) {
            this.runtime.renderer.updateDrawableProperties(this._drawable, {
                visible: true
            });
        } else {
            this.runtime.renderer.updateDrawableProperties(this._drawable, {
                visible: false
            });
        }
    }

    async detectFaces(args, util) {
        let img_src = document.querySelector('#lepi_camera')
        if (img_src) {
            await this.faceDetection.send({ image: img_src });
        }
    }
    faceCount(args, util) {
        return this.faceDetections.length
    }

    faceData(args, util) {
        var face_id = parseInt(args.I) - 1
        var face_data = parseInt(args.DATA)
        if (this.faceDetections.length > face_id) {
            this.detectedFace = this.faceDetections[face_id]
            var params = this.detectedFace.boundingBox
            var img_x = parseInt(params.xCenter * this.canvas.width)
            var img_y = parseInt(params.yCenter * this.canvas.height)
            // var scratch_x = img_x - 240
            // var scratch_y = -img_y + 180
            var width = parseInt(params.width * this.canvas.width)
            var height = parseInt(params.height * this.canvas.height)
            this.detectedFace.params = [img_x, img_y, width, height]
            return this.detectedFace.params[face_data]
        } else {
            return 0
        }
    }
    faceLandmarks(args, util) {
        var face_id = parseInt(args.I) - 1
        var landmarks_id = parseInt(args.N)
        var landmarks_data = parseInt(args.DATA)
        if (this.faceDetections.length > face_id) {
            this.detectedFace = this.faceDetections[face_id]
            var params = this.detectedFace.landmarks[landmarks_id]
            var x = parseInt(params.x * this.canvas.width)
            var y = parseInt(params.y * this.canvas.height)
            var z = parseInt(params.z * this.canvas.width)
            this.detectedFace.params = [x, y, z]
            return this.detectedFace.params[landmarks_data]
        } else {
            return 0
        }
    }
    async detectFaceMesh(args, util) {
        let img_src = document.querySelector('#lepi_camera')
        if (img_src) {
            await this.faceMesh.send({ image: img_src });
        }
    }
    faceMeshResult() {
        if (this.faceMeshDetections && this.faceMeshDetections.length >= 1) {
            return JSON.stringify(this.faceMeshDetections)
        } else {
            return JSON.stringify([])
        }
    }
    faceMeshSolve() {
        if (this.faceMeshDetections && this.faceMeshDetections.length >= 1) {
            return JSON.stringify(Kalidokit.Face.solve(this.faceMeshDetections))
        } else {
            return JSON.stringify({
                "eye": {
                    "l": 1,
                    "r": 1
                },
                "mouth": {
                    "x": 0,
                    "y": 0,
                    "shape": {
                        "A": 0,
                        "E": 0,
                        "I": 0,
                        "O": 0,
                        "U": 0
                    }
                },
                "head": {
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "width": 0.3,
                    "height": 0.6,
                    "position": {
                        "x": 0.5,
                        "y": 0.5,
                        "z": 0
                    },
                    "normalized": {
                        "y": 0,
                        "x": 0,
                        "z": 0
                    },
                    "degrees": {
                        "y": 0,
                        "x": 0,
                        "z": 0
                    }
                },
                "brow": 0,
                "pupil": {
                    "x": 0,
                    "y": 0
                }
            })
        }
    }
    faceMeshLandmarks(args, util) {
        let wh = [480, 360, 480]
        let key = ['x', 'y', 'z']
        let id = parseInt(args.N)
        let axis = parseInt(args.POINT)
        let k = key[axis]
        if (this.faceMeshDetections && this.faceMeshDetections.length >= 1 && id <= 477) {
            return parseInt(this.faceMeshDetections[id][k] * wh[axis])
        }
        return 0
    }
    async detectHands(args, util) {
        let img_src = document.querySelector('#lepi_camera')
        if (img_src) {
            await this.hands.send({ image: img_src });
        }
    }
    handLandmarks(args, util) {
        let i = parseInt(args.HAND)
        let id = parseInt(args.N)
        let axis = parseInt(args.POINT)
        let wh = [480, 360, 480]
        let key = ['x', 'y', 'z']
        let landmarks = []
        if (i == 0) {
            if (this.rightHandLandmarks && this.rightHandLandmarks.length > 0) {
                landmarks = this.rightHandLandmarks
            } else if (this.leftHandLandmarks && this.leftHandLandmarks.length > 0) {
                landmarks = this.leftHandLandmarks
            }
        } else if (i == 1) {
            landmarks = this.leftHandLandmarks
        } else {
            landmarks = this.rightHandLandmarks
        }
        if (landmarks && landmarks.length > 0) {
            return parseInt(landmarks[id][key[axis]] * wh[axis])
        }
        return 0
    }

    async detectPose(args, util) {
        let img_src = document.querySelector('#lepi_camera')
        if (img_src) {
            await this.pose.send({ image: img_src });
        }
    }
    poseLandmarks(args, util) {
        let id = parseInt(args.N)
        let axis = parseInt(args.POINT)
        let wh = [480, 360, 480, 100]
        let key = ['x', 'y', 'z', 'visibility']
        if (this.poseDetections && this.poseDetections.length >= 1) {
            return parseInt(this.poseDetections[id][key[axis]] * wh[axis])
        }
        return 0
    }
    async detectHolistic(args, util) {
        let img_src = document.querySelector('#lepi_camera')
        if (img_src) {
            await this.holistic.send({ image: img_src });
        }
    }



    setResize(args, util) {
        const w = parseInt(args.W)
        const h = parseInt(args.H)
        return this.runtime.ros.setUltraFaceResize(w, h)
    }

    async loadObjectModel() {
        // const vision = require('@mediapipe/tasks-vision');
        // console.log(vision)
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
                runningMode: 'IMAGE', // 使用 IMAGE 模式以同时支持图片和视频
            });
        } catch (e) {
            console.log(e)
        }
    }

    async detectObject() {
        if (this.objectModelLoading) {
            return
        }
        if (this.objectDetector) {
            let img_src = document.querySelector('#lepi_camera')
            // 使用 MediaPipe 的 detect 方法检测图片
            const result = this.objectDetector.detect(img_src);
            console.log(result)
            if (this.drawResults) {
                drawDetections(this.ctx, result.detections, this.canvas.width, this.canvas.height);
                this.drawResult()
            }
            this.objectDetections = (result.detections || []).filter(d => {
                return d.categories && d.categories.length > 0 &&
                    d.categories[0].score >= this.objectThreshold;
            }).map(object => {
                let left_x = object.boundingBox.originX
                let left_y = object.boundingBox.originY
                return {
                    class_: object.categories[0].categoryName,
                    score: parseInt(object.categories[0].score * 100),
                    box: [left_y, left_x, left_y + object.boundingBox.height, left_x + object.boundingBox.width]
                }
            });
            console.log(this.objectDetections)
        } else {
            this.objectModelLoading = true
            await this.loadObjectModel()
            this.objectModelLoading = false
            await this.detectObject()
        }
    }

    detectedObject(args, util) {
        var class_ = args.CLASS
        var id = this.objectDetections.findIndex(e => e.class_ == class_)
        if (id >= 0) {
            this.object = this.objectDetections[id]
            var img_x = parseInt((this.object.box[1] + this.object.box[3]) / 2)
            var img_y = parseInt((this.object.box[0] + this.object.box[2]) / 2)
            var height = this.object.box[2] - this.object.box[0]
            var width = this.object.box[3] - this.object.box[1]
            // this.object.data = [img_x - 240, -img_y + 180, width, height, this.object.score]
            this.object.data = [img_x, img_y, width, height, this.object.score]
            return true
        } else {
            this.object = null
            return false
        }
    }

    objectData(args, util) {
        var data_id = parseInt(args.DATA)
        if (this.object) {
            return this.object.data[data_id]
        } else {
            return 0
        }
    }

    drawLine(begin, end, color) {
        let canvas = this.ctx
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

    detectQRCode(args, util) {
        let img_src = document.querySelector('#lepi_camera')
        let canvas = img_src.getContext("2d");
        let imageData = canvas.getImageData(0, 0, img_src.width, img_src.height);
        let code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
            let topLeftCorner = code.location.topLeftCorner
            let bottomRightCorner = code.location.bottomRightCorner
            let width = parseInt(Math.abs(bottomRightCorner.x - topLeftCorner.x))
            let height = parseInt(Math.abs(bottomRightCorner.y - topLeftCorner.y))
            let x = parseInt((bottomRightCorner.x + topLeftCorner.x) / 2)
            let y = parseInt((bottomRightCorner.y + topLeftCorner.y) / 2)
            this.barcodeDetections = [{ class_: code.data, box: [x - parseInt(width / 2), y - parseInt(height / 2), width, height] }]
            this.barcode = this.getBarcodeById(0)
        } else {
            this.barcodeDetections = []
        }
        console.log(code, this.barcodeDetections)

        if (this.drawResults) {
            if (code) {
                this.ctx.save();
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
                this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
                this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
                this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
                this.ctx.restore();
                this.drawResult()
            }
        }
    }
    getBarcodeById(id) {
        const target = this.barcodeDetections[id]
        if (target) {
            var data = {}
            data.x = parseInt(target.box[0] + target.box[2] / 2)
            data.y = parseInt(target.box[1] + target.box[3] / 2)
            data.w = target.box[2]
            data.h = target.box[3]
            return [target.class_, data.x, data.y, data.w, data.h]
        } else {
            return null
        }

    }
    detectedBarcode(args, util) {
        var tag = args.TAG
        var id = this.barcodeDetections.findIndex(e => e.class_.indexOf(tag) >= 0)
        if (id >= 0) {
            this.barcode = this.getBarcodeById(id)
            return true
        } else {
            this.barcode = null
            return false
        }
    }

    barcodeData(args, util) {
        var data_id = parseInt(args.DATA)
        if (this.barcode) {
            return this.barcode[data_id]
        } else {
            return this.defaultQRCodeValue[data_id]
        }
    }

    async generateBarcode(args, util) {
        let tag = args.TAG
        let width = parseInt(args.SIZE)
        console.log(tag)
        let base64 = await QRCode.toDataURL(tag.toString(), { width: width })
        return base64
    }

    async detectText(args, util) {
        if (this.ocrLoading) {
            return
        }
        if (this.ocr) {
            let img_src = document.querySelector('#lepi_camera')
            const [result] = await this.ocr.predict(img_src)
            console.log(result)
            if (result.items && result.items.length > 0) {
                this.texts = result.items.filter(item => item.score > this.textThreshold)
                this.text = this.texts.map(item => item.text).join(' ')
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
                    this.drawResult()
                }
            } else {
                this.texts = []
                this.text = ''
            }
        } else {
            this.ocrLoading = true
            let url = new URL('./static/models/paddleocr/paddleocr-paddleocr-js.js', location.href).href
            const { PaddleOCR } = await eval(`import("${url}")`);
            // console.log(PaddleOCR)
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
            this.ocrLoading = false
            await this.detectText()
        }

    }

    textDetectResult(args, util) {
        return this.text
    }
    textDetectResultDetail(args, util) {
        return JSON.stringify(this.texts)
    }

    async detectAprilTag() {
        if (this.apriltagLoading) {
            return
        }
        if (this.process_frame) {
            let img_src = document.querySelector('#lepi_camera')
            let ctx_src = img_src.getContext('2d')
            // this.ctx.drawImage(img_src, 0, 0, this.canvas.width, this.canvas.height);
            let imageData = ctx_src.getImageData(0, 0, img_src.width, img_src.height)
            // console.log(imageData)
            let detections = await this.process_frame(imageData)
            console.log(detections)

            if (this.drawResults) {
                this.ctx.save();
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                // draw previous detection
                let ctx = this.ctx
                detections.forEach(det => {
                    // draw tag borders
                    ctx.beginPath();
                    ctx.lineWidth = "2";
                    ctx.strokeStyle = "blue";
                    ctx.moveTo(det.corners[0].x, det.corners[0].y);
                    ctx.lineTo(det.corners[1].x, det.corners[1].y);
                    ctx.lineTo(det.corners[2].x, det.corners[2].y);
                    ctx.lineTo(det.corners[3].x, det.corners[3].y);
                    ctx.lineTo(det.corners[0].x, det.corners[0].y);
                    ctx.font = "bold 20px Arial";
                    var txt = "" + det.id;
                    ctx.fillStyle = "blue";
                    ctx.textAlign = "center";
                    ctx.fillText(txt, det.center.x, det.center.y + 5);
                    ctx.stroke();
                });
                this.ctx.restore();
                this.drawResult()
            }
            this.apriltagDetections = detections.map(tag => {
                let det = {
                    id: tag.id,
                    pose_t: tag.pose.t.map(v => v * 100 / 2.5),
                    pose_r: rotationMatrixToEulerAngles(tag.pose.R)
                }
                // det.pose_t[1] = -det.pose_t[1]
                return det
            })
            if (this.apriltagDetections.length > 0) {
                this.apriltag = this.apriltagDetections[0]
            } else {
                this.apriltag = null;
            }
        } else {
            this.apriltagLoading = true
            let apriltag_process_url = new URL('./static/models/apriltag/apriltag_process.js', location.href).href
            const { init, process_frame } = await eval(`import("${apriltag_process_url}")`);
            await init()
            this.process_frame = process_frame
            this.apriltagLoading = false
            await this.detectAprilTag()
        }
    }
    detectAprilTagIDs() {
        return JSON.stringify(this.apriltagDetections.map(item => item.id))
    }

    detectedAprilTag(args, util) {
        var tag_id = parseInt(args.TAG)
        var id = this.apriltagDetections.findIndex(e => e.id == tag_id)
        if (id >= 0) {
            this.apriltag = this.apriltagDetections[id]
            return true
        } else {
            this.apriltag = null
            return false
        }
    }
    aprilTagTranslation(args, util) {
        var axis_id = parseInt(args.AXIS)
        if (this.apriltag) {
            return this.apriltag.pose_t[axis_id]
        } else {
            return 0
        }
    }
    aprilTagRotation(args, util) {
        var axis_id = parseInt(args.AXIS)
        if (this.apriltag) {
            return this.apriltag.pose_r[axis_id]
        } else {
            return 0
        }
    }
}

module.exports = LepiGoogleAI;