const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAUbSURBVFhH7ZZrbFRFFMd/dx99QlvassJ2oUhLK9JiBEk0YCDF8JC0GFAUogaj8QMgBmLQUDUxNbyKoIlWiZFASBqCH4qBAuGRoEVIgITyKl1rq6W0lHZpKO12t/u6nrvbmuruQu0K4cP+J3f3ztw5c373zMyZqzynlqs8wtL1/T+yigJGqihgpIoCRqooYKS6J6DywMv9FfKo0wy98mvbdxdFLxWDgqo19veUe50PfKqK6pKbAdIZdMQY9ej6vCty4+r14nJ5BppjkD5KnI6RC5LwibdwCgnovOCjfkoDLy/KFTAZTkACw/ZrgIn2vE/xMQYS9UYOVNTQZnfI9Cji2sczU8zMnpdNe7sdt9vnf7Fege60Oag808jk7gliHRoyCFAn5bzZSsPplZjHpUlLEH8YKVxpvc7rlZV0m1SGP5VA/FgjnioXN9e1Y+lI4MSFt0hISJS+/WMqfPX5L5R2VZO52SStwb6C1qC2MtwyHQE47a0GcymUbj7B9Om7KDg3hnV1U1laNo5hMx3U7m7FciYTR1kciYklWK+1+PsH7CA7Jw1vr7uvLVhBEdRLqc60snN9IfYeV2B276F4UwxbtlexYsWzvPP2NH9b841OMizJ/nunzcXUp7/GUJuG0eqjfcZNtu5YQLfNiVHW69VL7ZSn1mHZ/FjICIYE/D2jgbE/jqIDJ4ov9Jtp0qXrsBY2YN2/hpxJJj5af4TDh2pZXPQkNbVtXKu7zcUL7/v75o3ZzvAmM7aFLXhz3RhfTZGXV4k/pOK86yV9a9rgAetG1jO5PYcuXGECr02IQndzD0WfpFKy8yWKPz5KWmosa9fO5KhNZU66WKpeRls2cbO5GHurk9GffsnE90bTveU2I/ZYBEf2b7mTjnN2TNvTpBYMGD4PerTOwQYDZSu9w6wSbQfCgYM1frjH97by5rE2lG03qO6RTVA6j127z5M4Ko48awqGfCOuNg0lUPD4zcNqyCeJFkGn1YM+IxZbUzfzZ2dxqlMlSVLNLbs4TjKwuqqTJQsnUXXqut8md4RsCIePhFwtuQ5OQwbUYhufZuBXdyPpY4Zx5ZqNGckKl5p65aE8FZC5llhqrG1kjg1smNseBz1Hehi+WkvO956dfkUAqGJaMpxvf7jor9vtbuwd3TSuyuDFrARKXxhBcV4CC5fuo3j9LH+fk94mklUP3uxhUnsIgIlFSbg3OlnOQU7+/C75U8o49N1p9k5UKbjTStaErez4tgi9Xs+qxRXkrzHhXpQqi8Mn1+AUFlDVa0OEH0Z74hXIrKuZ/DTuIsuooOHPdeSPN7Nh21lOnb1Ffd0HFBTk8NnKY+zPb0CdkywOB0ZORrlPiEKnmVEN5FSb6TRImvnnt0Cw4mS7dHlpnN6MY7GR5cvzmJ+dy4QOF2cOuygpOY7jQx3mFSZ8bYHT42/Fi789Prrq3Yz84j/kwcvjf6P4lefp7JQFPxhJtHUpEg23JF2nB4cclT5pi4lFzt4YFLuESTbNv6XX62hpucvxJ25g3hj6LA4JeDrlMt47JX0twUb/nxSOVdTyxvFKsr7JGByg9on0x2vtLNJlsKlsLl6fmN3vQB6CdBJhe5ebwml76Pk+iZTC2JChCALUIqbDSOPqVlrLO+SrNPxGiUgy43pZFuM3WEhdFi9VbQkE+woBqEmD1GL5gOD6pDnWzuPA1Ib2FWaTa5lKlTSifYw/uEsrgeiED8SQE/XDUhQwUkUBI1UUMFJFASMT/AWSMDfdd+2CDwAAAABJRU5ErkJggg=='
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQUE1RTNFMzdENjMxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQUE1RTNFMjdENjMxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpkYWJmYjkwNy0zN2YxLTQ2OTktOGJkMi1mMjdjZmVjMjRlMWIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7ONSFAAAAHW0lEQVRYR+1Ya1BUZRh+dllg3YVFQhQQFfCSYmmI5rXRytCwi5Y62kxTaU2WU/3oNmWT1oTdnG6Wl7ImnS6OTsxk3m+oZGqZooUYmIoCCnJxue7C7tLzfpwdtnJ3D+FM/ehhYL/znT3feb73PO/7PgdD1K4lrfgPw6h9/mfxP8HOolMEW1tb0eJxo97VDHtLE+zNje2/LQ40uV3w8DudwT9KEiHW4G6B2+VEojUGd8X2x4ioBPQ0RyLMYESNy4GC+irsqj6LXZW/q2sspnCEGkPUuCPoMEGHxwUnIzSn9wi8PuAWdA+zaGf8Y+3FE3iiYBsqnfWwhXaBwWDQzgSHboIStVo+tgER3XBk9FxYQ0K1M22oZTRPNdbAyQ3EhUUg2dJVO9OOJWcP4tkTW2ANj4CJkdYDXQQVueYGRi0dnw6+Q5sFShy1eLZwN9aW5gGMDgzaI2z1cGxEv2uSsCBlLB7sOaRtnjjTdBkp+z6EJSRM1yPXRVBEP7/PCHw4aLI2A9yb9w2yT+9HbHRvvDHgZszsMQgRpjDtLJBbcw5vnjmITed+ogC74vCouUi3xalzDa4WROxYjAjKIyRIJIMSbGQyDOPCB0c+qI5djE6XnW/BxazNHf0wxkX3QmFDNT4rPYY9NcUqowdRBrPjUnFPj4HqmrQDnyKPOnw7bSaeSRqp5vJqy5GWuww2JlYgTYaYH8hYpI3/BikRTczIkglPaTO8YPtihBtNaJn0EqJCw9E/dzkWF+3B/qoz+CA1E7PjBystPndiM175bTsSLDH4ZHAmyliO3sjfiPiIWAyPikccdVjOtX+wl6r1/CFgfOso/KwBt2pHwOhDqwF3MxonPod91efQdWsWKhlJm5miZ3bKY5W6uDx1MlqnvIos6vXRw1/grqPr8TFJTmbmzzu6DmWOOrXe8tTbKVd3wFrpl6C6iBn5IkUu2FtdjINlv2DnyIdQT5LjD3yCyC5R3H0IDPyxUH9Lzx3GhB/XwLB5IeYxW+XaH295Gt8xe59nMm1JnwVQdxNI2ov5fW5UNdUf/BKUcnEbC7AXT53cgWgW41tjkpB+4DOE8xEZfbQjI0mSKBKwhUdi5fmf0WvvUlXAFw2ZirdIWPD2wAwUVZ3F75SB4PFe6fBww/7gl2AzQz+1+7XaEXDsUhFLxhhUsNwU2stgDqAbEX0UH3lJkx1PskAv7HuTitz8gq1MklG8awhWlBxR301lQsmxv8fsX4OtbpW9gtya83JXZHbrh68u5ANsW3oQGWrG0uJDanwnk2fthRNqbGD0c6qK1Vgw0BqrqsOVEIBgKxJZAgSnGqvVZwrrWRFLSrDa5YUqHx4PLrMDTeHmqpvaHmtKl2j8pq0pkB7u7nAECa/GXOpiAzPUo6q//5z7M9TVRqPSWzyjps1wPcnc9ogZ26aviAAEDbjEDiLobbapz1/rLyHN1oOLu9WxLnA3EiFxOPGiN6KYhJNYAbyQ+/gmnC/8E+TOj9dVqOHYronqc115AR5IYF9lfZT+rAvajTdUFGFe4jBUyqZJdrS2piC/vpLmoYMETczSrZWn1VjKRxwT5l3WM8G0hKGoC1AafCH2Kj7nHWSX5OHlvuPwQlGOmr8/4Tr1KdFroUb96dovQTO19vVFZqyG1/qNZ+1pxGIahOy06WpOaqUusD/vGDVHDVedPQSLOQrjo/u0HZM4/mLdfOGXoOxI2tA6NnnB3MQbEMM+uoAFV3qtJ+NFlSxi7a9Uw0QCDlr+WocdX6bPxsRuyeix5z1Vvr5Nm6F9C8g6/T2sPi7or/CvQcJqMuOR/M3aEVAw9lH+NaD/nvepm0twTHweT9CG1dEL2p0Niqz6ZaRr6RUHMynsNBX3sQaKqahoqMIs9uOJMclqvZXnj9B6OQOWraB2S274GI3qMs0LHqsrxw37PlKRmJcyTjV8wWH7BRyrL2fU3EhmhmbG9lPzGyoKcTfNArhORnwqtjGaApGHeVsWIsOsfjNYEJSgctPOOmQPvw/TtNYnmThw/wpUsWiLc85khGbQsErEpAUW87HuoP36uOQoHOK0eYdFgzLaWp6G7jnvMdGcAa2WQL/ld9ZiPXc/nUS8EJO6gF7wYr2UI4mCdyktIiEmzO6ZhhW0Xzaf9phEy1/KTVtp+4NBF0GBN5Lzk8fQ+k/SZttQTU+4mw7lNN83nEysWBqD4bZ4ZUx9cbKhEkN+WKXGlgCZ6wvdBAWKJEUdyayTl6cZce3RDIQa6u/h/E3ILjveoTc6QYcIeuFiT25gNxCbNKfnUPXiLhGLC7eqjJRNFNEM7KbJXV16HPmXS2BiVC3UW0feiQW6CYo/bOKN23VGMKLiusF6p141fSFE5DWUOpSN/AkkaqP+9JDVRVDI9aFhWHP93cqJBLpAzgW6rbwiSIa/UJijEicYSV0E5R9DG4fNwhSttl0NmLa/rhIlUA0U6CIob2oJtEyfMzHE+Qa9IADCtAguOrXv6kVQICQblQY7DwNJRl5NDf6b0F+Q/iX8T7BzAP4AlP8pe/xU5eQAAAAASUVORK5CYII='
const menuIconURI = blockIconURI;

let width = 480
let height = 360

const topic_maps = {
    "/ubiquityrobot/line_detector_node/image_color": formatMessage({
        id: 'lepi.color_detect',
        default: '颜色检测',
    }),
    "/ubiquityrobot/apriltag_detector_node/image_apriltag": formatMessage({
        id: 'lepi.apriltag_detect',
        default: '标签检测',
    }),
    // "/ubiquityrobot/ultra_face_inference_node/image_ultra_face": formatMessage({
    //     id: 'lepi.face_detect',
    //     default: '人脸检测',
    // }) ,
    "/ubiquityrobot/face_recognizer_node/image_face": formatMessage({
        id: 'lepi.face_recognize',
        default: '人脸识别',
    }),
    "/ubiquityrobot/object_detector_node/image_object": formatMessage({
        id: 'lepi.object_detect',
        default: '目标检测',
    }),
    "/ubiquityrobot/image_classifier_node/image_class": formatMessage({
        id: 'lepi.image_classify',
        default: '图像分类',
    }),
    // "/ubiquityrobot/transfer_learning_node/image_transfer": formatMessage({
    //     id: 'lepi.transfer_learning',
    //     default: '迁移学习',
    // }) ,
    "/ubiquityrobot/text_recognizer_node/image_text": formatMessage({
        id: 'lepi.text_recognize',
        default: '文本识别',
    }),
    "/ubiquityrobot/barcode_scanner_node/image_barcode": formatMessage({
        id: 'lepi.barcode_scan',
        default: '二维码扫描',
    }),
    "/ubiquityrobot/camera_node/image_raw/compressed": formatMessage({
        id: 'lepi.camera',
        default: '摄像头',
    }),
    "/ubiquityrobot/image_processor_node/image_processed": formatMessage({
        id: 'lepi.image_process',
        default: '图像处理',
    }),
    "/ubiquityrobot/hand_detector_node/image_hand": formatMessage({
        id: 'lepi.hand_detect',
        default: '手势识别',
    }),
    "/ubiquityrobot/pose_estimator_node/image_pose": formatMessage({
        id: 'lepi.pose_estimate',
        default: '姿态估计',
    }),
    "/ubiquityrobot/movenet_pose_node/image_pose": formatMessage({
        id: 'lepi.fast_pose_estimate',
        default: '姿态估计(快速)',
    }),
    "/ubiquityrobot/face_mesher_node/image_face_mesh": formatMessage({
        id: 'lepi.face_mesh',
        default: '人脸网格',
    }),
    // "/ubiquityrobot/camera_node/image_raw": '摄像头'
}

const topic_maps2 = {
    "颜色检测": "/ubiquityrobot/line_detector_node/image_color",
    "标签检测": "/ubiquityrobot/apriltag_detector_node/image_apriltag",
    "人脸识别": "/ubiquityrobot/face_recognizer_node/image_face",
    "目标检测": "/ubiquityrobot/object_detector_node/image_object",
    "图像分类": "/ubiquityrobot/image_classifier_node/image_class",
    "文本识别": "/ubiquityrobot/text_recognizer_node/image_text",
    "二维码扫描": "/ubiquityrobot/barcode_scanner_node/image_barcode",
    "摄像头": "/ubiquityrobot/camera_node/image_raw/compressed",
    "图像处理": "/ubiquityrobot/image_processor_node/image_processed",
    "手势识别": "/ubiquityrobot/hand_detector_node/image_hand",
    "姿态估计": "/ubiquityrobot/pose_estimator_node/image_pose",
    "姿态估计(快速)": "/ubiquityrobot/movenet_pose_node/image_pose",
    "人脸网格": "/ubiquityrobot/face_mesher_node/image_face_mesh",
    "color detect": "/ubiquityrobot/line_detector_node/image_color",
    "apriltag detect": "/ubiquityrobot/apriltag_detector_node/image_apriltag",
    "face recognize": "/ubiquityrobot/face_recognizer_node/image_face",
    "object detect": "/ubiquityrobot/object_detector_node/image_object",
    "image classify": "/ubiquityrobot/image_classifier_node/image_class",
    "text recognize": "/ubiquityrobot/text_recognizer_node/image_text",
    "barcode scan": "/ubiquityrobot/barcode_scanner_node/image_barcode",
    "camera": "/ubiquityrobot/camera_node/image_raw/compressed",
    "image process": "/ubiquityrobot/image_processor_node/image_processed",
    "gusture recognize": "/ubiquityrobot/hand_detector_node/image_hand",
    "pose estimate": "/ubiquityrobot/pose_estimator_node/image_pose",
    "movenet pose": "/ubiquityrobot/movenet_pose_node/image_pose",
    "face mesh": "/ubiquityrobot/face_mesher_node/image_face_mesh",
}


const xOffset = -240;
const yOffset = 180;

class LepiCamera extends EventEmitter {
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

        this.frequence = 15

        this.video = document.createElement('video')
        this.video.width = 480
        this.video.height = 360


        this.img = document.createElement('img');
        this.canvas = document.createElement('canvas')
        this.canvas.width = 480
        this.canvas.height = 360

        this.ctx = this.canvas.getContext('2d')

        this.img.setAttribute("crossOrigin", 'Anonymous');
        this.img.width = 480
        this.img.height = 360
        this.img.style.display = 'block'
        this.video.style.display = 'block'
        // this.video.style.marginTop = '1080px'
        this.canvas.style.display = 'block'
        this.canvas.style.display = 'none'
        this.video.style.display = 'none'
        this.img.style.display = 'none'

        this.canvas2 = this.canvas.cloneNode()
        this.canvas.id = 'lepi_camera'
        this.ctx2 = this.canvas2.getContext('2d')
        this.mirrored = true
        this.publishCounter = 0

        // mirror image
        // let width = 480;
        // let height = 360;
        // let angle = 0;
        // this.ctx2.scale(-1, 1)
        // this.ctx2.translate(-width / 2, height / 2)
        // this.ctx2.rotate(-angle * Math.PI / 180)

        document.querySelector('body').appendChild(this.video)
        document.querySelector('body').appendChild(this.canvas2)
        document.querySelector('body').appendChild(this.img)
        document.querySelector('body').appendChild(this.canvas)

        this.listener = null
        this.streamList = []
        this.cali_files = []
        this.clearRect()
        this.deviceArray = [{
            text: '默认',
            value: ' '
        }]

        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.getStreamList()
            this.listCaliFiles()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            console.log('LEPI_CONNECTED', 'getStreamList')
            this.getStreamList()
            this.listCaliFiles()
        })
        this.getCameraList()

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
            id: 'lepiCamera',
            name: formatMessage({
                id: 'lepi.lepiCamera',
                default: '摄像头',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [{
                opcode: 'openCamera',
                blockType: BlockType.COMMAND,
                isTerminal: false,
                blockAllThreads: false,
                text: formatMessage({
                    id: 'lepi.openCamera',
                    default: '打开主机摄像头 [ID] ',
                }),
                arguments: {
                    ID: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                    }
                }
            }, {
                opcode: 'closeCamera',
                text: formatMessage({
                    id: 'lepi.closeCamera',
                    default: '关闭主机摄像头',
                }),
                blockType: BlockType.COMMAND,
            },

            {
                opcode: '_setupPreview',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi._setupPreview',
                    default: '显示 [TOPIC] 图像',
                }),
                arguments: {
                    TOPIC: {
                        type: ArgumentType.STRING,
                        menu: 'streamList'
                    }
                }
            },
            {
                opcode: 'showSnapshot',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi.showSnapshot',
                    default: '显示 [TOPIC] 快照',
                }),
                arguments: {
                    TOPIC: {
                        type: ArgumentType.STRING,
                        menu: 'streamList'
                    }
                }
            },

            {
                opcode: '_disablePreview',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi._disablePreview',
                    default: '关闭图像',
                }),
            },
            {
                opcode: 'getStreamList',
                text: formatMessage({
                    id: 'lepi.getStreamList',
                    default: '更新图像列表',
                }),
                blockType: BlockType.COMMAND,
            },
            {
                opcode: 'openVideoPage',
                text: formatMessage({
                    id: 'lepi.openVideoPage',
                    default: '新窗口打开图像列表',
                }),
                blockType: BlockType.COMMAND,
            },

            {
                opcode: 'showPicFromSource',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi.showPicFromSource',
                    default: '显示图像 [ImageData]',
                }),
                arguments: {
                    ImageData: {
                        type: ArgumentType.STRING,
                        defaultValue: ' '
                    }
                }
            },

            {
                opcode: 'image2base64',
                blockType: BlockType.REPORTER,
                text: formatMessage({
                    id: 'lepi.image2base64',
                    default: '图像转base64',
                })
            },
            {
                opcode: 'freezeSnapshot',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi.freezeSnapshot',
                    default: '定格当前画面',
                }),
            },
            {
                opcode: 'savePic',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi.savePic',
                    default: '保存快照为[FILE_NAME].png',
                }),
                arguments: {
                    FILE_NAME: {
                        type: ArgumentType.STRING,
                        defaultValue: '-'
                    }
                }
            },
                '---',
            {
                opcode: 'drawRect',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi.drawRect',
                    default: '画矩形 (x1:[X1],y1[Y1]) (x2:[X2],y2:[Y2])',
                }),
                arguments: {
                    X1: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 128
                    },
                    Y1: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 68
                    },
                    X2: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 352
                    },
                    Y2: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 292
                    },
                }
            },
            {
                opcode: 'clearRect',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi.clearRect',
                    default: '清除矩形',
                }),
            },


            {
                opcode: 'setUpdateFrequence',
                text: formatMessage({
                    id: 'lepi.setUpdateFrequence',
                    default: '设置图像更新速率 [FREQUENCE]',
                }),
                arguments: {
                    FREQUENCE: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 15
                    }
                }
            },
            {
                opcode: 'setVideoTransparency',
                text: formatMessage({
                    id: 'lepi.setVideoTransparency',
                    default: '设置透明度 [TRANSPARENCY]',
                }),
                arguments: {
                    TRANSPARENCY: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 50
                    }
                }
            },


            {
                opcode: 'cameraSetFlip',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi.cameraSetFlip',
                    default: '摄像头翻转 [FLIPCODE]',
                }),
                arguments: {
                    FLIPCODE: {
                        type: ArgumentType.STRING,
                        menu: 'cameraFlip'
                    }
                }
            },

            {
                opcode: 'cameraSetRectify',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi.cameraSetRectify',
                    default: '摄像头矫正 [ACTION]',
                }),
                arguments: {
                    ACTION: {
                        type: ArgumentType.STRING,
                        menu: 'cameraRectify'
                    }
                }
            },

            {
                opcode: 'loadCaliFile',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi.loadCaliFile',
                    default: '加载矫正文件 [FILE]',
                }),
                arguments: {
                    FILE: {
                        type: ArgumentType.STRING,
                        menu: 'caliFiles'
                    }
                }
            },
            {
                opcode: 'listCaliFiles',
                text: formatMessage({
                    id: 'lepi.listCaliFiles',
                    default: '更新矫正文件列表',
                }),
                blockType: BlockType.COMMAND,
            },
                '---',

            {
                opcode: 'subRemoteCamera',
                blockType: BlockType.COMMAND,
                isTerminal: false,
                blockAllThreads: false,
                text: formatMessage({
                    id: 'lepi.subRemoteCamera',
                    default: '访问远程主机图像 [HOST] ',
                }),
                arguments: {
                    HOST: {
                        type: ArgumentType.STRING,
                        defaultValue: '192.168.50.112'
                    }
                }
            },
            {
                opcode: 'openWebCamera',
                blockType: BlockType.COMMAND,
                isTerminal: false,
                blockAllThreads: false,
                text: formatMessage({
                    id: 'lepi.openWebCamera',
                    default: '打开网络摄像头 [ID] ',
                }),
                arguments: {
                    ID: {
                        type: ArgumentType.STRING,
                        defaultValue: 'rtsp://'
                    }
                }
            },

            {
                opcode: 'toggleCamera',
                blockType: BlockType.COMMAND,
                text: formatMessage({
                    id: 'lepi.toggleCamera',
                    default: '[ACTION] 电脑摄像头 [CAMERA], 镜像翻转 [ONOFF]',
                }),
                arguments: {
                    ACTION: {
                        type: ArgumentType.STRING,
                        defaultValue: 1,
                        menu: 'cameraRectify'
                    },
                    CAMERA: {
                        type: ArgumentType.STRING,
                        menu: 'cameraList'
                    },
                    ONOFF: {
                        type: ArgumentType.STRING,
                        defaultValue: 1,
                        menu: 'cameraRectify'
                    },
                }
            },

            ],
            menus: {
                streamList: 'formatStreamList',
                caliFiles: 'formatCaliFiles',
                cameraRectify: Menu.formatMenu([formatMessage({
                    id: 'lepi.close',
                    default: '关闭',
                }), formatMessage({
                    id: 'lepi.open',
                    default: '打开',
                })]),
                cameraFlip: Menu.formatMenu([formatMessage({
                    id: 'lepi.flip_xy',
                    default: '上下左右',
                }), formatMessage({
                    id: 'lepi.flip_y',
                    default: '上下',
                }), formatMessage({
                    id: 'lepi.flip_x',
                    default: '左右',
                }), formatMessage({
                    id: 'lepi.no_rotate',
                    default: '不翻转',
                })], start = -1),
                cameraList: 'formatCameraList',
            },

        };
    }

    /**
     * Stamp an image onto the pen layer.
     * @param {HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} stampElement - the element to use as the stamp.
     * @param {number} x - the X coordinate of the stamp to draw.
     * @param {number} y - the Y coordinate of the stamp to draw.
     */
    drawStamp(stampElement, x, y) {

        if (this._skinId != -1) {
            this.runtime.renderer.updateBitmapSkin(this._skinId, stampElement, 1);
        }

        /*
        const ctx = this._skin._canvas.getContext('2d');

        ctx.drawImage(stampElement, this._skin._rotationCenter[0] + x, this._skin._rotationCenter[1] - y);

        this._skin._canvasDirty = true;
        this._skin._silhouetteDirty = true;
        */

    }

    drawImg() {
        try {
            // this.ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
            this.ctx.drawImage(this.img, 0, 0)
            if (this.runtime.rect && this.runtime.rect.length == 4) {
                this.ctx.strokeStyle = 'rgb(10,255,0)'
                let rect = this.runtime.rect
                this.ctx.beginPath()
                this.ctx.rect(rect[0], rect[1], rect[2], rect[3])
                this.ctx.stroke()
            }
            this.drawStamp(this.canvas, xOffset, yOffset);
            this.runtime.requestRedraw();
            // console.log('requestRedraw')
        } catch (error) {
            console.log(error)
            this._disablePreview()
        }
    }

    drawVideo() {
        try {
            // this.ctx.clearRect(0, 0, this.ctx.width, this.ctx.height);
            if (this.mirrored) {
                this.ctx2.drawImage(this.video, 0, 0, 480, 360, -width / 2, -height / 2, width, height)
            } else {
                this.ctx2.drawImage(this.video, 0, 0, 480, 360, 0, 0, width, height)
            }
            this.ctx.drawImage(this.canvas2, 0, 0)

            if (this.runtime.rect && this.runtime.rect.length == 4) {
                this.ctx2.strokeStyle = 'rgb(10,255,0)'
                let rect = this.runtime.rect
                this.ctx2.beginPath()
                if (this.mirrored) {
                    this.ctx2.rect(rect[0] - width / 2, rect[1] - height / 2, rect[2], rect[3])
                } else {
                    this.ctx2.rect(rect[0], rect[1], rect[2], rect[3])
                }
                this.ctx2.stroke()
            }

            if (this.runtime.ros && this.runtime.ros.isConnected()) {
                let data = this.canvas2.toDataURL('image/jpeg');
                this.runtime.ros.publishImage(data)
                this.publishCounter++
            } else {
                // let data = this.canvas2.toDataURL('image/jpeg');
                // var ImageData1 = "data:image/jpeg;base64," + data;
                // this.img.setAttribute('src', ImageData1);

                this.drawStamp(this.canvas2, xOffset, yOffset);
                this.runtime.requestRedraw();
            }

        } catch (error) {
            console.log(error)
            // this._disablePreview()
        }
    }

    drawRect(args, util) {
        let x1 = parseInt(args.X1)
        let y1 = parseInt(args.Y1)
        let x2 = parseInt(args.X2)
        let y2 = parseInt(args.Y2)
        this.runtime.rect = [x1, y1, x2 - x1, y2 - y1]
    }

    clearRect() {
        this.runtime.rect = []
    }

    _setupPreview(args, util) {
        // if (navigator.platform == 'Linux armv7l') {
        //     return '_setupPreview不支持在主机上执行'
        // }

        // var url = this.runtime.ros.url
        // this.img.src = url.replace('ws', 'http').replace('9090', '8080') + "/stream?topic=" + topic;
        // this.img.src = "http://192.168.50.171:8080/stream?topic=/ubiquityrobot/camera_node/image_raw"
        // snapshot
        // http://192.168.50.67:8080/snapshot?topic=/camera_node/image_raw
        const {
            renderer
        } = this.runtime;
        if (!renderer) return;

        if (this._skinId === -1 && this._skin === null && this._drawable === -1) {
            this._skinId = renderer.createBitmapSkin(this.canvas);
            this._skin = renderer._allSkins[this._skinId];

            this._drawable = renderer.createDrawable(StageLayering.VIDEO_LAYER);
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

            this._renderPreviewFrame = () => {
                clearTimeout(this._renderPreviewTimeout);
                if (!this._renderPreviewFrame) {
                    return;
                }

                this._renderPreviewTimeout = setTimeout(this._renderPreviewFrame, this.runtime.currentStepTime);

                this.drawImg()

                // ctx.drawImage(img,0,0); // Or at whatever offset you like
            };
            // this._renderPreviewFrame();

        }
        this.img.onload = () => {
            // console.log('img loaded')
            this.drawImg()
        }
        if (args && args.TOPIC) {
            var topic = args.TOPIC

            if (topic_maps2[topic]) {
                topic = topic_maps2[topic]
            }

            if (!(this.runtime.ros && this.runtime.ros.isConnected())) {
                return '未连接到主机'
            }

            if (topic == "/ubiquityrobot/camera_node/image_raw/compressed") {
                this.runtime.ros.setCameraUpdateFrequence(this.frequence)
            } else {
                this.runtime.ros.setCameraUpdateFrequence(0)
            }


            var callbackVideo = (message) => {
                // console.log('Received message on ' + listener.name);
                var ImageData1 = "data:image/jpeg;base64," + message.data;

                // ImageData1 = "data:image/jpeg;base64,"+ ImageData1;
                this.img.setAttribute('src', ImageData1);
                // this.drawImg()
                // listener.unsubscribe();
            }

            if (this.listener != null) {
                try {
                    this.listener.unsubscribe()
                    // this.listener = null
                } catch (error) {

                }
            }

            this.runtime.ros._disablePreview = () => {
                this._disablePreview()
            }

            this.listener = this.runtime.ros.subCompressedImage(topic, callbackVideo)
        } else {
            if (this.listener != null) {
                try {
                    this.listener.unsubscribe()
                    // this.listener = null
                } catch (error) {

                }
            }
        }
    }

    showSnapshot(args, util) {
        // if (navigator.platform == 'Linux armv7l') {
        //     return '_setupPreview不支持在主机上执行'
        // }

        if (!(this.runtime.ros && this.runtime.ros.isConnected())) {
            return '未连接到主机'
        }

        var topic = args.TOPIC
        // stream
        var url = this.runtime.ros.url
        // this.img.src = "http://192.168.50.171:8080/stream?topic=/ubiquityrobot/camera_node/image_raw"
        // snapshot
        // http://192.168.50.67:8080/snapshot?topic=/camera_node/image_raw
        const {
            renderer
        } = this.runtime;
        if (!renderer) return;

        if (this._skinId === -1 && this._skin === null && this._drawable === -1) {
            this._skinId = renderer.createBitmapSkin(this.canvas);
            this._skin = renderer._allSkins[this._skinId];

            this._drawable = renderer.createDrawable(StageLayering.VIDEO_LAYER);
            renderer.updateDrawableProperties(this._drawable, {
                skinId: this._skinId
            });
        }

        renderer.updateDrawableProperties(this._drawable, {
            ghost: this._forceTransparentPreview ? 100 : this._ghost,
            visible: true
        });

        this.img.onload = () => {
            console.log('img loaded', this._skin)
            try {
                this.drawStamp(this.img, xOffset, yOffset);
                this.ctx.drawImage(this.img, 0, 0)
                this.runtime.requestRedraw();
                console.log('requestRedraw')
            } catch (error) {
                console.log(error)
                this._disablePreview()
            }
            this.img.onload = null
        }

        // this.img.src = url.replace('ws', 'http').replace('9090', '8080') + "/snapshot?topic=" + topic;

        var topic = args.TOPIC
        // stream
        if (topic_maps2[topic]) {
            topic = topic_maps2[topic]
        }
        var callbackSnapshot = (message) => {
            this.freezeSnapshot();
            // console.log('Received message on ' + listener.name);
            var ImageData1 = "data:image/jpeg;base64," + message.data;

            // ImageData1 = "data:image/jpeg;base64,"+ ImageData1;
            this.img.setAttribute('src', ImageData1);
            // this.drawImg()
        }

        if (this.listener != null) {
            try {
                this.listener.unsubscribe()
                this.listener = null
            } catch (error) {
                this.listener = null
            }
        }


        if (topic == "/ubiquityrobot/camera_node/image_raw/compressed") {
            try {
                let p = this.runtime.ros.getCompressedImage()
                p.then(msg => {
                    var ImageData1 = "data:image/jpeg;base64," + msg.image.data;
                    this.img.setAttribute('src', ImageData1);
                })
            } catch (error) {
                console.log(error)
            }
        } else {
            this.listener = this.runtime.ros.subCompressedImage(topic, callbackSnapshot)
        }

    }
    showPicFromSource(args, util) {

        const {
            renderer
        } = this.runtime;
        if (!renderer) return;

        if (this._skinId === -1 && this._skin === null && this._drawable === -1) {
            this._skinId = renderer.createBitmapSkin(this.canvas);
            this._skin = renderer._allSkins[this._skinId];

            this._drawable = renderer.createDrawable(StageLayering.VIDEO_LAYER);
            renderer.updateDrawableProperties(this._drawable, {
                skinId: this._skinId
            });
        }

        renderer.updateDrawableProperties(this._drawable, {
            ghost: this._forceTransparentPreview ? 100 : this._ghost,
            visible: true
        });

        this.img.onload = () => {
            console.log('img loaded', this._skin)
            try {
                this.drawStamp(this.img, xOffset, yOffset);
                this.ctx.drawImage(this.img, 0, 0)
                this.runtime.requestRedraw();
                console.log('requestRedraw')
            } catch (error) {
                console.log(error)
                this._disablePreview()
            }
            this.img.onload = null
        }

        // this.img.src = url.replace('ws', 'http').replace('9090', '8080') + "/snapshot?topic=" + topic;
        this.img.crossOrigin = 'anonymous';
        console.log(this.img)
        this.img.setAttribute('src', args.ImageData);

    }

    image2base64() {
        // console.log(this.runtime.vm)
        if (!(this.runtime.ros && this.runtime.ros.isConnected())) {
            return this.canvas2.toDataURL()
        } else {
            return this.canvas.toDataURL()
        }
    }
    freezeSnapshot() {
        if (this.listener) {
            try {
                this.listener.unsubscribe()
                this.listener = null
            } catch (error) {

            }
        }
    }

    /**
     * Set the preview ghost effect
     * @param {number} ghost from 0 (visible) to 100 (invisible) - ghost effect
     */
    setPreviewGhost(ghost) {
        this._ghost = ghost;
        // Confirm that the default value has been changed to a valid id for the drawable
        if (this._drawable !== -1) {
            this.runtime.renderer.updateDrawableProperties(this._drawable, {
                ghost: this._forceTransparentPreview ? 100 : ghost
            });
        }
    }

    setVideoTransparency(args) {
        const transparency = Cast.toNumber(args.TRANSPARENCY);
        this.globalVideoTransparency = transparency;
        this.setPreviewGhost(transparency);
    }

    _disablePreview() {
        if (this._skinId !== -1) {
            this.runtime.renderer.updateBitmapSkin(this._skinId, new ImageData(480, 360), 1);
            this.runtime.renderer.updateDrawableVisible(this._drawable, false);
        }

        this._renderPreviewFrame = null;
        this.img.onload = null
        if (this.listener != null) {
            try {
                this.listener.unsubscribe()
                // this.listener = null
            } catch (error) {

            }
        }
        if (this.runtime.ros) {
            this.runtime.ros._disablePreview = null
        }

    }
    /*
    _formatStreamList(html) {
        var regexp = new RegExp('stream_viewer\\?topic=(.+?)">', "g");
        // var myArray = data.matchAll(regexp);
        // var myArray = regexp.exec(data);
        var list = []
        while ((matches = regexp.exec(html)) !== null) {
            list.push(matches[1])
        }
        return list
    }
    */
    getStreamList(args, util) {
        /*
        return new Promise((resolve) => {
            axios.get('http://' + this.LEPI_IP + ':8000/stream_list/').then(res => {
                // console.log(res)
                console.log(res.data)
                this.streamList = this._formatStreamList(res.data)
                resolve()
            })
        })
        */
        return new Promise((resolve) => {
            // this.runtime.ros.getImageTopics().then(res => {
            this.runtime.ros.getTopicsForType('sensor_msgs/CompressedImage').then(res => {
                // console.log(res)
                console.log(res.data)
                this.streamList = res.data.filter(topic => topic_maps[topic])
                resolve(this.streamList.map(topic => topic_maps[topic]).join(','))
            })
        })
    }

    formatStreamList() {
        let topics = this.streamList.map(topic => topic_maps[topic])
        return Menu.formatMenu2(topics)
    }

    formatCaliFiles() {
        return Menu.formatMenu2(this.cali_files)
    }

    openCamera(args, util) {
        this.closeLocalCamera()
        var id = parseInt(args.ID)
        this._setupPreview({
            TOPIC: '/ubiquityrobot/camera_node/image_raw/compressed'
        })
        this.runtime.ros.setCameraUpdateFrequence(this.frequence)
        return this.runtime.ros.cameraSetEnable(1, id)
    }
    closeCamera(args, util) {
        this._disablePreview()
        return this.runtime.ros.cameraSetEnable(0)
    }

    openWebCamera(args, util) {
        this.closeLocalCamera()
        this._setupPreview({
            TOPIC: '/ubiquityrobot/camera_node/image_raw/compressed'
        })
        this.runtime.ros.setCameraUpdateFrequence(this.frequence)
        return this.runtime.ros.openWebCamera(args.ID)
    }

    subRemoteCamera(args, util) {
        this.closeLocalCamera()
        this._setupPreview({
            TOPIC: '/ubiquityrobot/camera_node/image_raw/compressed'
        })
        // this.runtime.ros.setCameraUpdateFrequence(this.frequence)
        return this.runtime.ros.subRemoteCamera(args.HOST)
    }

    cameraSetRectify(args, util) {
        var value = parseInt(args.ACTION)
        return this.runtime.ros.cameraSetRectify(value)
    }
    cameraSetFlip(args, util) {
        var flipcode = parseInt(args.FLIPCODE)
        return this.runtime.ros.cameraSetFlip(flipcode)
    }
    listCaliFiles(args, util) {
        return new Promise(resolve => {
            this.runtime.ros.listCaliFiles().then(result => {
                this.cali_files = result.data
                resolve(result.data.join(','))
            })
        })
    }
    loadCaliFile(args, util) {
        var file_name = args.FILE
        return this.runtime.ros.loadCaliFile(file_name)
    }
    toggleCamera(args, util) {
        let action = parseInt(args.ACTION)
        let onoff = parseInt(args.ONOFF)
        let deviceId = args.CAMERA
        if (action) {
            if (this.video_stream) {
                this.closeLocalCamera()
                // return '请先关闭本地摄像头'
            }
            let constraints = {
                video: {
                    width: 480,
                    height: 360
                },
                audio: false
            }
            if (deviceId && deviceId.length > 5) {
                constraints.video.deviceId = { exact: deviceId }
            } else {
                delete constraints.video.deviceId
            }
            console.log(deviceId, constraints.video)
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {

                console.log(stream)
                this.video_stream = stream
                let video = this.video
                video.srcObject = stream
                video.onloadedmetadata = (e) => {
                    video.play();

                    if (this.runtime.ros && this.runtime.ros.isConnected()) {
                        this.closeCamera()
                        this._setupPreview({
                            TOPIC: '/ubiquityrobot/camera_node/image_raw/compressed'
                        })
                    } else {
                        this._setupPreview()
                    }

                    this.ctx2 = this.canvas2.getContext('2d')
                    this.ctx2.restore();
                    this.ctx2.save();
                    if (onoff == 1) {
                        this.mirrored = true
                        let angle = 0;
                        this.ctx2.scale(-1, 1)
                        this.ctx2.translate(-width / 2, height / 2)
                        this.ctx2.rotate(-angle * Math.PI / 180)
                    } else {
                        this.mirrored = false
                    }

                    this.publishImageTimer = setInterval(() => {
                        // ctx.drawImage(video);//绘制视频
                        console.log('publish image', this.publishCounter)
                        this.drawVideo()
                    }, 1000.0 / (this.frequence + 1));

                    console.log('setInterval should call only once', this.publishImageTimer)

                };
            })
        } else {
            this.closeLocalCamera()
        }
    }

    closeLocalCamera() {
        this.video.onloadedmetadata = () => { }
        if (this.publishImageTimer) {
            try {
                clearInterval(this.publishImageTimer)
                console.log('clearInterval', this.publishImageTimer)
            } catch (error) {
                console.log(error)
            } finally {
                this.publishImageTimer = null
            }
        }

        if (this.video) {
            this.video.pause();
            this.video.src = "";
        }
        if (this.video_stream) {
            try {
                this.video_stream.getTracks()[0].stop();
                this.video_stream = null
            } catch (error) {
                console.log(error)
            }
        }
        this._disablePreview()
    }

    savePic(args, utils) {
        let file_name = args.FILE_NAME
        if (file_name == '-') {
            file_name = (new Date()).Format("yyyy-MM-dd hh.mm.ss.S")
        }
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            return new Promise(resolve => {
                let URL = 'http://' + this.runtime.ros.ip + ':8000/upload/save'
                this.canvas.toBlob((blob) => {

                    var reader = new FileReader();
                    reader.onload = (e) => {
                        this.runtime.ros.saveFileData(file_name + ".png", e.target.result);
                        resolve('保存成功')
                    }
                    reader.readAsDataURL(blob);

                    /*
                    var data = new FormData()
                    data.append('name', '图片')
                    data.append('upload_file', blob, file_name + ".png")
                    var config = {
                        header: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                    axios.post(URL, data, config).then(response => {
                        console.log('response', response)
                        resolve('保存成功')
                    }).catch(error => {
                        console.log('error', error)
                        resolve('保存失败')
                    })
                    */
                })
            })
        } else {
            return '未连接到主机'
        }
    }

    openVideoPage() {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let url = 'http://' + this.runtime.ros.ip + ':8000/app/video.html'
            let a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.click()
        } else {
            return '请先连接到主机'
        }
    }

    setUpdateFrequence(args, util) {
        let freq = parseInt(args.FREQUENCE)
        if (freq >= 0 && freq <= 30) {
            return this.runtime.ros.setCameraUpdateFrequence(freq)
        } else {
            return '请输入0到30以内的数'
        }
    }

    getCameraList(args, util) {
        try {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                console.log(devices)
                const videoDevices = devices.filter(device => device.kind == 'videoinput')
                console.log(videoDevices)
                this.deviceArray = videoDevices.map((device, index) => {
                    return {
                        text: device.label || '摄像头 ' + index,
                        deviceId: device.deviceId,
                        value: device.deviceId,
                    }
                })
            })
        } catch (e) {
            console.log(e)
        }
    }

    formatCameraList(args, util) {
        if (this.deviceArray.length > 0) {
            return this.deviceArray
        } else {
            return [{
                text: '默认',
                value: ' '
            }]
        }
    }

}

(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        return
    }
    let prefix = "lepiCamera_"
    Blockly.Python[`${prefix}_setupPreview`] = function (block) {
        Blockly.Python.definitions_['import_cv2'] = 'import cv2';
        Blockly.Python.definitions_['import_thread'] = 'from threading import Thread';
        // var topic = block.getMenuItem('TOPIC', 'streamList')
        var topic = block.getFieldValue('TOPIC');
        // var topic = Blockly.Python.valueToCode(block, 'TOPIC');
        console.log(topic)
        topic = topic.split('/')[3]

        if (topic == 'image_raw') {
            topic = 'camera.getImage()'
        }
        Blockly.Python.definitions_['init_image'] = `${topic} = None`;

        let func = `
def display():
    while True:
    if ${topic} is not None:
        cv2.imshow("image", ${topic})
    cv2.waitKey(30)
`
        var code = `displayThread = Thread(display)\n`
        code += `displayThread.start()\n`
        return code;
    };
    console.log('lepiCamera loaded')

})()

module.exports = LepiCamera;