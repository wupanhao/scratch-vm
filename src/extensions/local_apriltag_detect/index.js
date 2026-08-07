const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const StageLayering = require('../../engine/stage-layering');

const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAisSURBVFhH7Vd9jBR3GX7ma2d3du/2Pjnu4I5SsFeBylcwUguibYXaiBKRqoRaNcY0Tb/ExkpD0xgJrTWIWiNElCixRE3/aEwL2JTEa8p3a3shSOmVHj04enDX22VvP2Z2Z8bn/e3RRLi99uBM+kffZDI7szu/feZ93ud535/W29sb4iMc+vD5IxsfA7zaGCeALGPNQmDUIjSqea2Vb49DjAvAUItA89Nw+rfATj+rrscL5DgAlCUMVJ25DzWnHkTtydWIpv6GQJdMXn1cGUCdj1nMksYsaTr04AIi2f0ITF6S7UjuILNowtQI3IqrI2bYLISxO9rYARpEEQTAuXcBk5/hs/bqkG28n6ASKMauQb5uDSLwkPMLeOrE01jf+RQ6UyfgGNHyGmOIsRm1YQDFIoxNP4N2eB+Cb34HwTfuAtwCwUVheN0I9SqEZj0cLcCGY7/HzlO7YDGbLbEJ2PLpR9EcbYAXFFWFfpg/HlsGLYtvdBpax4tAOgVt7x4C9pQetMBFyW4nzY3QwwLyvoejqS5UmwnU2zV4t9CPk0OnESUDCTuEbYXqbBLBaEArApSHDH4ri8QjoSo3eB7C1ikIb18BNE9GuHxluRbJuCjXyndCL55BoMXgmDaWNC1A1s/jXOE9zEhOww0101AIPOw8HMW6ZxPY+lIMuSKXGCVNFSkWcEOuhr8ciqImFmDlPBc6QQYUhaI6OwRUJUmvS1odxPs2ItG3CYFVj1TbdviJGymeHF7sO4TzhQHcMnEhpiXr8Yf9GrZ0OIjxpXOehhVzXPzw5hwKRW3ETFbEHiMFnWdM/HFfFNtejuFMSkfE5BIikJIPxBOq9kCl6v4gnIEtfMqDWTiLWOpplCCqBe5oW4r7rr8Tk5wJyBRdvNpjwSE4YabGCfDvHhOpPJ2gApKKAN2ShvamEm6f5WL5p1w0VQfweE9xHaUadWZRzqGoOAkvsQR6iZdc0Ysv5sJFisPAXmbwr6eeR8rLIGFaaKv1kWXminzHTEFHa22AKoINRuRxFIrlptSGoZfrT8AFogbSqz+zE9qBlxCsWoPwM4v4pU+RZBG5sIcUN6IYX4K4oVHBz2PT8R0oUrWfbZyLJ+fej4IXwW87bBw7ayhwdy/O8+yrhIwUH2gzShz8hfqRHYX2dheMe+5UNRjOnA3/19tVFtmEVffQSK4RsD7DEN879CiVewZxM4pBZnDzvIdxc/M8ZjmHLOtbqHaZdak/9T8jREWKJeQZqUWxBBV+CWF9A8L2GSqT4aw5ZbMmmFCz2UWyCmwAC7ZBOp0WZEo5pItDSFpVaI41cJESjvYa2H0sgiPviNFrSnyVYtQMyoMiFHnT6yb4ShuIWEBqEFoPTbl9ZhkoYrAzu6jkX8CPNCPT/DjMyCT0F85ha9ffaTMDWNW2DMsmzcfeLh8bdzvKISyW8T2fy+Mrs12l6JGiIkABdbDbwkPPJFBLtf3mjiG01Pjw6FvK+yI8CnnxHd4oov7EQiq4h7XI4m+5Fxean0Q0vICobjOjvMnX8LU8HqH/He42kYzRZkhtM8X3q1UZOgQJkp9dEhUpJmtwSG2SHljjhIgYpPHiq4hJSk9W3iA3TSqZ9Tf8B6FOf+R9nZ5ZYIcZKuZ4XabS4jqiWHlKziav5f77a18So1Isbehsuux/9fGwTLHN2Y9C0f5zFMHCxUCyhmVnMXuvI37+d4ribOODsM1qvJXpxi/f2IF+d5AUL8XqqbfgSA8p3uPgXEZXXvjAF/L4fDsHi7FSfDEEXBiWfUt6MQb6YT50N9B1HOFtX4W/bgMZZjdhe5OBQXIjKo5Qlg+8+nN0nH+FlkP183rrgscwv2EqTqWKONlvYFIyQGudr1RcKUZVsYTPGnu/NkiZJt0jPSgXwHsD5c4iEfIsbZAhTatENYt6bT1CRdtw6YWZkqhcR0MiwCcouokEKFGJXglj7dq1jw1//p+QZ0Rl4lMSJj+HwnFtHcKWVmjJWgSrvwuI7XBSNYo9iJ/bDNM9jmL0BsTofQ6PIwNH1Vz4pZZF+NbUW3E6HeKnzzn404EoOt60cG1DQPEFKCmxXR4VKbZJbfeAgQ274qiLB/jJshxb0vBCjsNXI90es+nKuGWi5u3lHPX3q8Sm255AtuFexJHHqWyvyuT11VM5FQEbdtt47qit1ryQ1zB7so/HV9D0iWKkdleRYsleb9pQPviaNPScpsSrghMMPDkIjvsRBHkY7lvSTFTqDbeLJ52DaYlj1nQsapzPOTCCAo3+/JCuzF+UK1Y2kNWQp0DG3ElEVXNbi1i3LIsfL81hMvumGhakcxCgKFkNDPSW0KjB0MT1KEXa4FYvQK7++xz5Xdadp0b+h1/fjGPpk9ybRHHT9CJbt4Y0s5fmsCDXMtWM5IESo6pY3kqsQHQgE4iaAykSY+N6aK8c5Mh/F4Jv/4CGzZFfj3PrSfHoVDKHV4dDxhPHtmNH9z/U5mlKvAVbFqxHi1OLF45rqs21N/lYNtNT2awEcFQVS11kCloZnISM/H1noR05AORz0Pb9S+1R5B800hyYTbQahyO/i3zJxWuDx1FtJdBg1+J0rg9vZt7hH0Zw6wwPj7CmvzaXTHDZUgVwEqMCvCxkem69BsHK1cB07j++vqbsjTIEMt125gUadie7X1nBNzXOU11ERv7rqqbgk9XXsg49NclkeEg/FmEMv/6I8YFGfVlc3BOLH8rAWpCRP4aq3h/RZrYxizGkpvwZperbKJ4M/nn2ZQIcxBebb8Rkp0kBHA3QpTF2gBJSnHJIcdJiZFitf2MOJ+o0x3/Wa+MapFq3wQoGOQvGSBOV6pdFw2IYXuTDxdgovhjKtIYLR438dSgkV6phwadSC8kvqzoM2F0yxazywfJeeGzgJK4sg5dF2QCtHJVt1qEUnUWw5QnmamOcAMoSHFxpNTIxi6LHK66M4stCMsUtFUUxnuAkxgng/y8+Bnh1AfwXGXbJhp0mdeAAAAAASUVORK5CYII=';

function rotationMatrixToEulerAngles(matrix) {
    const m = matrix;
    const m00 = m[0][0], m01 = m[0][1], m02 = m[0][2];
    const m10 = m[1][0], m11 = m[1][1], m12 = m[1][2];
    const m20 = m[2][0], m21 = m[2][1], m22 = m[2][2];

    let x, y, z;
    const epsilon = 1e-6;

    if (Math.abs(m20 - 1) < epsilon) {
        x = 0;
        y = Math.PI / 2;
        z = Math.atan2(m01, m11);
    } else if (Math.abs(m20 + 1) < epsilon) {
        x = 0;
        y = -Math.PI / 2;
        z = Math.atan2(-m01, -m11);
    } else {
        x = Math.atan2(m21, m22);
        y = Math.atan2(-m20, Math.sqrt(m21 * m21 + m22 * m22));
        z = Math.atan2(m10, m00);
    }

    return [-x * 180 / Math.PI, -y * 180 / Math.PI, -z * 180 / Math.PI];
}

class LocalApriltagDetection extends EventEmitter {
    constructor(runtime) {
        super();

        this.runtime = runtime;

        /**
         * Id representing a Scratch Renderer skin the video is rendered to for previewing.
         * @type {number}
         */
        this._skinId = -1;

        /**
         * The Scratch Renderer Skin object.
         * @type {Skin}
         */
        this._skin = null;

        /**
         * Id for a drawable using the video's skin that will render as a video preview.
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

        // 创建独立的Canvas用于AprilTag检测结果绘制
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'local_apriltag_detection';
        this.canvas.width = 480;
        this.canvas.height = 360;
        this.ctx = this.canvas.getContext('2d');

        this.drawResults = true;

        // AprilTag检测相关变量
        this.apriltagDetections = [];
        this.apriltag = null;
        this.process_frame = null;
        this.apriltagLoading = false;

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

    getInfo() {
        return {
            id: 'localApriltagDetection',
            name: '标签检测',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'setDrawResults',
                    text: formatMessage({
                        id: 'lepiAprilTag.setDrawResults',
                        default: '检测结果绘制 [ACTION]',
                    }),
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
                    opcode: 'detectAprilTag',
                    text: formatMessage({
                        id: 'lepiAprilTag.detectAprilTag',
                        default: '检测标志物',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'detectAprilTagIDs',
                    text: formatMessage({
                        id: 'lepiAprilTag.detectAprilTagIDs',
                        default: '检测到的标志物ID',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'detectedAprilTag',
                    text: formatMessage({
                        id: 'lepiAprilTag.detectedAprilTag',
                        default: '检测到id为 [TAG] 的标志物?',
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        TAG: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'aprilTagTranslation',
                    text: formatMessage({
                        id: 'lepiAprilTag.aprilTagTranslation',
                        default: '标志物 [AXIS] 偏移距离',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.NUMBER,
                            menu: 'axes',
                        }
                    }
                },
                {
                    opcode: 'aprilTagRotation',
                    text: formatMessage({
                        id: 'lepiAprilTag.aprilTagRotation',
                        default: '标志物 [AXIS] 偏移角度',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.NUMBER,
                            menu: 'axes',
                        }
                    }
                }
            ],
            menus: {
                toggle: Menu.formatMenu([
                    formatMessage({
                        id: 'lepiAprilTag.close',
                        default: '关闭',
                    }),
                    formatMessage({
                        id: 'lepiAprilTag.open',
                        default: '打开',
                    })
                ]),
                axes: Menu.formatMenu([
                    formatMessage({
                        id: 'lepiAprilTag.x_axis',
                        default: 'x轴',
                    }),
                    formatMessage({
                        id: 'lepiAprilTag.y_axis',
                        default: 'y轴',
                    }),
                    formatMessage({
                        id: 'lepiAprilTag.z_axis',
                        default: 'z轴',
                    })
                ]),
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

    async detectAprilTag() {
        if (this.apriltagLoading) {
            return;
        }

        if (this.process_frame) {
            let img_src = document.querySelector('#lepi_camera');
            if (!img_src) {
                console.warn('Camera element not found');
                return;
            }

            let ctx_src = img_src.getContext('2d');
            let imageData = ctx_src.getImageData(0, 0, img_src.width, img_src.height);
            let detections = await this.process_frame(imageData);
            console.log(detections)

            // 更新检测结果
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
                this.apriltag = this.apriltagDetections[0];
            } else {
                this.apriltag = null;
            }

            // 绘制检测结果
            if (this.drawResults) {
                this.ctx.save();
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                detections.forEach(det => {
                    // 绘制标志物边框
                    this.ctx.beginPath();
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeStyle = "blue";
                    this.ctx.moveTo(det.corners[0].x, det.corners[0].y);
                    this.ctx.lineTo(det.corners[1].x, det.corners[1].y);
                    this.ctx.lineTo(det.corners[2].x, det.corners[2].y);
                    this.ctx.lineTo(det.corners[3].x, det.corners[3].y);
                    this.ctx.closePath();
                    this.ctx.stroke();

                    // 绘制标志物ID
                    this.ctx.font = "bold 20px Arial";
                    const txt = "" + det.id;
                    this.ctx.fillStyle = "blue";
                    this.ctx.textAlign = "center";
                    this.ctx.fillText(txt, det.center.x, det.center.y + 5);

                    // 绘制中心点
                    // this.ctx.beginPath();
                    // this.ctx.arc(det.center.x, det.center.y, 3, 0, 2 * Math.PI);
                    // this.ctx.fillStyle = "red";
                    // this.ctx.fill();
                });

                this.ctx.restore();
                this.drawResult();
            }
        } else {
            // 加载AprilTag检测模型
            this.apriltagLoading = true;
            try {
                let apriltag_process_url = new URL('./static/models/apriltag/apriltag_process.js', location.href).href;
                const { init, process_frame } = await eval(`import("${apriltag_process_url}")`);
                await init();
                this.process_frame = process_frame;
                this.apriltagLoading = false;
                await this.detectAprilTag();
            } catch (error) {
                console.error('Failed to load AprilTag detection model:', error);
                this.apriltagLoading = false;
            }
        }
    }

    detectAprilTagIDs() {
        return JSON.stringify(this.apriltagDetections.map(item => item.id));
    }

    detectedAprilTag(args, util) {
        var tag_id = parseInt(args.TAG);
        var id = this.apriltagDetections.findIndex(e => e.id == tag_id);
        if (id >= 0) {
            this.apriltag = this.apriltagDetections[id];
            return true;
        } else {
            this.apriltag = null;
            return false;
        }
    }

    aprilTagTranslation(args, util) {
        var axis_id = parseInt(args.AXIS);
        if (this.apriltag) {
            return this.apriltag.pose_t[axis_id];
        } else {
            return 0;
        }
    }

    aprilTagRotation(args, util) {
        var axis_id = parseInt(args.AXIS);
        if (this.apriltag) {
            return this.apriltag.pose_r[axis_id];
        } else {
            return 0;
        }
    }
}

module.exports = LocalApriltagDetection;