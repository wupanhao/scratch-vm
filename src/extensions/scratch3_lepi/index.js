const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
// const Log = require('../../util/log');
// const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
const formatMessage = require('format-message');
const BLE = require('../../io/ws');
// const Base64Util = require('../../util/base64-util');

// const StageLayering = require('../../engine/stage-layering')
// const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
// const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+cGVuLWljb248L3RpdGxlPjxnIHN0cm9rZT0iIzU3NUU3NSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik04Ljc1MyAzNC42MDJsLTQuMjUgMS43OCAxLjc4My00LjIzN2MxLjIxOC0yLjg5MiAyLjkwNy01LjQyMyA1LjAzLTcuNTM4TDMxLjA2NiA0LjkzYy44NDYtLjg0MiAyLjY1LS40MSA0LjAzMi45NjcgMS4zOCAxLjM3NSAxLjgxNiAzLjE3My45NyA0LjAxNUwxNi4zMTggMjkuNTljLTIuMTIzIDIuMTE2LTQuNjY0IDMuOC03LjU2NSA1LjAxMiIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0yOS40MSA2LjExcy00LjQ1LTIuMzc4LTguMjAyIDUuNzcyYy0xLjczNCAzLjc2Ni00LjM1IDEuNTQ2LTQuMzUgMS41NDYiLz48cGF0aCBkPSJNMzYuNDIgOC44MjVjMCAuNDYzLS4xNC44NzMtLjQzMiAxLjE2NGwtOS4zMzUgOS4zYy4yODItLjI5LjQxLS42NjguNDEtMS4xMiAwLS44NzQtLjUwNy0xLjk2My0xLjQwNi0yLjg2OC0xLjM2Mi0xLjM1OC0zLjE0Ny0xLjgtNC4wMDItLjk5TDMwLjk5IDUuMDFjLjg0NC0uODQgMi42NS0uNDEgNC4wMzUuOTYuODk4LjkwNCAxLjM5NiAxLjk4MiAxLjM5NiAyLjg1NU0xMC41MTUgMzMuNzc0Yy0uNTczLjMwMi0xLjE1Ny41Ny0xLjc2NC44M0w0LjUgMzYuMzgybDEuNzg2LTQuMjM1Yy4yNTgtLjYwNC41My0xLjE4Ni44MzMtMS43NTcuNjkuMTgzIDEuNDQ4LjYyNSAyLjEwOCAxLjI4Mi42Ni42NTggMS4xMDIgMS40MTIgMS4yODcgMi4xMDIiIGZpbGw9IiM0Qzk3RkYiLz48cGF0aCBkPSJNMzYuNDk4IDguNzQ4YzAgLjQ2NC0uMTQuODc0LS40MzMgMS4xNjVsLTE5Ljc0MiAxOS42OGMtMi4xMyAyLjExLTQuNjczIDMuNzkzLTcuNTcyIDUuMDFMNC41IDM2LjM4bC45NzQtMi4zMTYgMS45MjUtLjgwOGMyLjg5OC0xLjIxOCA1LjQ0LTIuOSA3LjU3LTUuMDFsMTkuNzQzLTE5LjY4Yy4yOTItLjI5Mi40MzItLjcwMi40MzItMS4xNjUgMC0uNjQ2LS4yNy0xLjQtLjc4LTIuMTIyLjI1LjE3Mi41LjM3Ny43MzcuNjE0Ljg5OC45MDUgMS4zOTYgMS45ODMgMS4zOTYgMi44NTYiIGZpbGw9IiM1NzVFNzUiIG9wYWNpdHk9Ii4xNSIvPjxwYXRoIGQ9Ik0xOC40NSAxMi44M2MwIC41LS40MDQuOTA1LS45MDQuOTA1cy0uOTA1LS40MDUtLjkwNS0uOTA0YzAtLjUuNDA3LS45MDMuOTA2LS45MDMuNSAwIC45MDQuNDA0LjkwNC45MDR6IiBmaWxsPSIjNTc1RTc1Ii8+PC9nPjwvc3ZnPg==';

// const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAZ4SURBVFhHzVhtTJVVHP/de7nA5bVNXoVIwAUJjZjVYipT1tgStbZcX7APLc0PbZWNPjDtgyu/2Idc8YUPuOWGbuUctPUyctbc2GrDcCqGJIVMEBRRQOByXzu//33O9UG5cDBa/rZzz/P8z/95zu/83855riN8BmE8xnBa/WOLZVnw7zV/IS0tDaFQCIFAQPpwOPI4e4fDIS0YDEqvZdQjfD6fjLndbumfHioR+WJYNsHU1FRs3bpVJiNJQpMk9HVfX5/0dpDs2NiYND5bMlxqjcTGIxM8deoUurq6sG7dOly8eBElJRFraIItLS2oqKhAVVUVGhsbsX//frk+ceIEKisr4ff7UXrjGdFdDMuKQbuliLVr14olNTkNum/Xrl0oLy/HzMwMDhw4EH3W6XQ+9J7F8K8IxoJdj2R1DOq4JCg3wbIJ2lss6DESWgg6yUxgRPC3pF/xi+NnBNWLL/9x1ZLGhqu1HTNffmHdzYdaGvz37gn5P/N7LWlsGBFMSUmR5JgL+JRZki1pBJs3bxaLtLW1SWK4VfD76ncg8f0P4e29hPr6etTV1VnaCsq6Hr8XycnJcLncljA2jAju3r1bSIYCKp7iMixpBPHx8WhubkZTUxNu374N5ObB6Q/BrXTTXqjCli1bcOvWLUtbQVnOoSKACTYyMmIJY8OozHza+QnOnTuHgwc/xri3EB+9WytlZmJiwtKIIBqXyR74VTEOjUaIafnGjRtx/HgrKnIy0fDZ55LhHY2nqSHjC8HIgqWlpcjOzkZIJV4wRuDbMTd+N0puITCnt23bJlZcjBxhRDAjIwN79uyRwI5Fr7+/Hzdv3sTg4CB6enrEfYmJidaoHQ7EqZaS4lEeOWjJYsOYoJBzhJQVVaIsgKKiImRlZaGgoABlZWXIycmB1+uVMXu5CYfVO1S/fv2LuKeyeSkYEdQTBJS6MzB1P9YeCSzW80kvBiOCGg64EA6NWXcP4+TJk7LndnR0oLq62pLOh8PpwKwzsLIEozsDgsqCD7tFj+/cuROHDh1CbW0tzp49KzI7SIqqfiQZe2FZFkTYgbLyZ60byLluKUu4XMrqNjLUdiUtlDwLY3kEFeyEmLXcERbD6OjovHrJXcfUvYRRoe7JuiQZSYsxO3keZBnhmU4jHFKnZ9V7g35M3rkbET6AhIQEtLa2ori4WHYmWrdwoMgaXRjGMRiJn/snmVWrVkn50e373DXoXF2Er7Pz8XZiGhzuVCFkbwQtyDOhKYw1NUliYGBAeg2OvanKzw7fBN6ZncSxwAxc4Vk58z3YeAKnvimMXcyT8/j4uMQTY29qagpzc3PRmLLHFq8JupDWopzX3FkyMzPFvSzmHFvKxUYEL2f3SLwxDtPT09Hd3S0T2S2hydgtzWfsOiSen58vi+OuY0LQ2MUkwEY3MeY4GRvvPR6PxBhPybwnMV5fuHBBCFKPPdvs7GzUqiYwIsiX8kynJ9Ev1/309LTsqyQn50aL+NDQkIzbwTGCccxv7KVgRPDw4cM4evRodOWsfSTCni5vb28XPZYhnvF0Aa+pqZHF8TRO/aSkpOg79u7di4aGBnluMRjFIL+HWXDj4uLEnayBtJC2JvvOzk5s2rQpKqMeE0vHIRvB2KUVGSZMmtVX8kQeC0YWZLbSAgQn4gQkQbfqifPy8kR+48pluNQY3a7HuDBaldDPsnEBS8E4Buk6TkgXsfGa1tDQsZWW/xT8yrqEJqiThiAxPj85OSltKRi5WKMv74pMdv78eZmck2mi/Pvj+vXrokcCvb292Ldvn+gwJNhzESzUrAbDw8PY6rF97cXAsgj2F1yVWjjz2uvqG9kHh0/tDi4nfnzrDWx4qcbSuo+W5ia819WNuKBaTMABf2AOcT/9gGR3grh3/eTzlmZsGNdBQlzLQ4H6bnSp7PWmPqFWGMLLzccsDeDIkSPWFZBVWKTGlftzn4SvME+eCymL04LMaBMsy4LXigYkFie370C/WlpIxVVhUBVhuPHN9lcQ70lQLo/EHluufxob2r7Dt3cmcNUZxAfuJHjOnEZyQqIsdsX/HxwsviYZPaL24t+/aoHfOweXyo2QIisvUTEWVkd6kqRrWMZFrn541E+vexXVlc9RIvhPCNIyurwwMxn4tIbOYoJjTAqdsQT/geB2SBnjj/2KE6SLWdNIkBNoaHLsGV8c026mPknayer9eMUJ/h+ILOmxBfAPjKaa4m3d6xYAAAAASUVORK5CYII='
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADeGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEREQ3NTI5RjdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEREQ3NTI5RTdENjIxMUVBODJGN0Q5NTI1MzJBOUNCRCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmViYTU4OGI2LWUwMWQtNGFlYS1hZTM0LTY3ZGFhM2I5YjFmZCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpkYWJmYjkwNy0zN2YxLTQ2OTktOGJkMi1mMjdjZmVjMjRlMWIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6R7biKAAADvklEQVRYR+2YSWgUQRSG/54ty5hpDGbRYA4eFCQSN1SISBT0EEHNxeXikosLHkTEkyDmFDDqQcXcBE+C4I5JQAVRoiaixpUEDDGIO+pkcfZp36su46gxVTPTxAU/eKSqq+bl7+qqV6/KMK80WviDccm/SizLGrYkWcJKIp5MIpZMIPoL4zbuw335N8M+pE8dtEaQnfbHQlwiM+B2eeB3e5FHlk9lr8sNt2GIvgz3YlEsMpSM43MihsF4FKC6aKXfBLy55EmNlsBgdAj3qzajsqBEPsmOo313sP1pK0wSqUJPYCgIa3m9rNmcePkQPsPNA6qER7CurFLWQF8jAvNyA8yccfLJr8lYoHFxD+DJ4ZL9YDQiA7BWNlDB7vsmMoTSq41aArUXyU9481BAZvrUxn21XmQEMhc4RugJjH2WBWeI0wpHVM+nUmCQHN1dskvWnKE0x497i3cK3yrUI0hxbFagVFacwW24MDNAIYt8q/hH5uBv5L/AbPn7BXpoQ1/deRqfYmH5JHvuBF9h3YOzwrcKpcBcSo3OvO1GWCMk6PKasqNz5JN9q9D6xOzIyHAvHQnOHXXEMZnPQUqhOI0a0jDumynKdIszY478XVVbUEJb1FdW3TslMmodPlI23jJnLZXsr9D8/hnWPzwvpg37Hg09gTTQXQu/F5gNtsALJDCmFKj1iflN0zvqjA4foHQXnVJgjE5lMwqK4VG8aToUuH2oGFckfKtQ/tcI5YIdCzZhgi9fPsmeRYXluDl/g/CtwpFh4QS07tFFbH3SjG1PWrCBFgCfO5zAEYHtwZc43nMDTXScPNbXgRO9t3HuXbdszQ5HBDb0tKF6YgVqiqcKWzapAkdIrBMow0ww3A+rZp+s2aygGNhCoSKPdoP+6CB2TKnCoWlLZavN/t5b2P34Esw8E+FEHLMpK2+jeZeKcWkvzNyArI1MRiPYOfBGbH1JcY3hRaE4Vn4Pr1R4fCKOGrS1dQ68lS3poRZI4SVEI5CK1+VCNDKIQV4ItPHz3c2PiLsaOhRxnzD1daXc3TAiDmqELr2bBVoEVu0BWbPh9IuFhhMJ1Nw9iY1llcPpBIs7+LwdzbPXoNjnF7dcqfcwL0IDmNxaD1PjMJbx1Ucq1z4+R/X1JoBvEZhYBIcra7G9fK5d/4GxufpIYbq/CONpZyjPLxRm+gsxz5wkW7PDkRFMlzEfwXTJcbllSY2eQIp3fTSKTnH1Qy/51BOp9Ym/XQE7BK3ygCdXxEcVWgKZkWJdNuiIY7TnIDt00vQAvgBt5buBT4mnugAAAABJRU5ErkJggg=='
// const menuIconURI = blockIconURI;

const axios = require('axios').default;

/*
const colorsMap = {
    0: '熄灭',
    1: '红',
    4: '绿',
    5: '黄',
    16: '蓝',
    17: '紫',
    20: '靛',
    21: '白'
}
*/

const node_name_maps = {
    "/ubiquityrobot/line_detector_node": () => formatMessage({
        id: 'lepi.color_detect',
        default: '颜色检测',
    }),
    "/ubiquityrobot/apriltag_detector_node": () => formatMessage({
        id: 'lepi.apriltag_detect',
        default: '标签检测',
    }),
    "/ubiquityrobot/ultra_face_inference_node": () => formatMessage({
        id: 'lepi.face_detect',
        default: '人脸检测',
    }),
    "/ubiquityrobot/face_recognizer_node": () => formatMessage({
        id: 'lepi.face_recognize',
        default: '人脸识别',
    }),
    "/ubiquityrobot/object_detector_node": () => formatMessage({
        id: 'lepi.object_detect',
        default: '目标检测',
    }),
    "/ubiquityrobot/image_classifier_node": () => formatMessage({
        id: 'lepi.image_classify',
        default: '图像分类',
    }),
    "/ubiquityrobot/transfer_learning_node": () => formatMessage({
        id: 'lepi.transfer_learning',
        default: '迁移学习',
    }),
    "/ubiquityrobot/text_recognizer_node": () => formatMessage({
        id: 'lepi.text_recognize',
        default: '文本识别',
    }),
    "/ubiquityrobot/barcode_scanner_node": () => formatMessage({
        id: 'lepi.barcode_scan',
        default: '二维码扫描',
    }),
    "/ubiquityrobot/camera_node": () => formatMessage({
        id: 'lepi.camera',
        default: '摄像头',
    }),
    "/ubiquityrobot/image_processor_node": () => formatMessage({
        id: 'lepi.image_process',
        default: '图像处理',
    }),
    "/ubiquityrobot/hand_detector_node": () => formatMessage({
        id: 'lepi.hand_detect',
        default: '手势识别',
    }),
    "/ubiquityrobot/pose_estimator_node": () => formatMessage({
        id: 'lepi.pose_estimate',
        default: '姿态估计',
    }),
    "/ubiquityrobot/movenet_pose_node": () => formatMessage({
        id: 'lepi.fast_pose_estimate',
        default: '姿态估计(快速)',
    }),
    "/ubiquityrobot/smart_audio_node": () => formatMessage({
        id: 'lepi.smart_audio',
        default: '智能语音',
    }), "/ubiquityrobot/rfid_node": () => formatMessage({
        id: 'lepi.rfid',
        default: 'RFID读卡器',
    }),
    "/ubiquityrobot/joystick_node": () => formatMessage({
        id: 'lepi.joystick',
        default: '游戏手柄',
    }), "/ubiquityrobot/brushless_driver_node": () => formatMessage({
        id: 'lepi.brushless_driver',
        default: '平衡车',
    }), "/ubiquityrobot/pupper_driver_node": () => formatMessage({
        id: 'lepi.pupper_robot',
        default: '四足机器人',
    }), "/ubiquityrobot/hexapod_driver_node": () => formatMessage({
        id: 'lepi.hexapod_robot',
        default: '六足机器人',
    }),


}

function getUrlPrefix(href) {
    var reg = new RegExp(/(\w+):\/\/([^/:]+)(:\d*)?/)
    let matchObj = href.match(reg)
    if (matchObj) {
        return matchObj[0]
    } else {
        return ''
    }
}

/**
 * Scratch 3.0 blocks to interact with a Lepi peripheral.
 */
class Scratch3LepiBlocks {

    /**
     * @return {string} - the name of this extension.
     */
    // static get EXTENSION_NAME() {
    //     return '主机';
    // }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID() {
        return 'lepi';
    }

    /**
     * Construct a set of Lepi blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.LEPI_NAME = 'lepi.local'
        this.LEPI_IP = 'localhost'
        const extensionId = 'lepi'
        // this.runtime.registerPeripheralExtension(extensionId, this);
        this._extensionId = extensionId;

        // this.sharedVariables = {}
        // this.lane_pose = null

        this.totalNodes = []
        this.files = []
        this.file_dir = "/home/pi/Lepi_Data/Scratch"
        // this.subLineDetection = false
        /**
         * The "answer" block value.
         * @type {string}
         */
        this._answer = '';

        this.div = document.createElement('div')
        this.div.style.display = 'none'
        this.div.style.width = '2px'
        this.div.style.height = '2px'
        this.div.style.marginTop = '1080px'
        document.querySelector('body').appendChild(this.div)

        // Create a new MicroBit peripheral instance
        // this._peripheral = new MicroBit(this.runtime, Scratch3LepiBlocks.EXTENSION_ID);
        this.runtime.registerPeripheralExtension(this._extensionId, this);
        // this.runtime.on('ANSWER', this._onAnswer.bind(this));
        // this.runtime.vm.on('PROJECT_RUN_STOP', () => {
        //     // console.log('PROJECT_RUN_STOP')

        // })

        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.getLaunchedNodes()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            this.getLaunchedNodes()
            this.updateLepiProjects()
        })

    }

    /**
     * Called by the runtime when user wants to scan for a peripheral.
     */
    scan() {
        if (this._ble) {
            this._ble.disconnect();
        }
        this._ble = new BLE(this.runtime, this._extensionId, {
            filters: [{
                name: this.LEPI_NAME
            }]
        }, this._onConnect, this.reset);
    }

    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect(ip, onSuccess, onFailure) {
        console.log(ip)
        this.LEPI_IP = ip

        this.runtime.vm.connect(ip, () => {
            if (onSuccess) {
                onSuccess()
            }

            this.runtime.emit(this.runtime.constructor.PERIPHERAL_CONNECTED);


            this.runtime.ros.ros.on('close', () => {
                console.log('Connection to websocket server closed.');
                this.subTraningLogs = false

                // Sets connection status icon to orange
                this.runtime.emit(this.runtime.constructor.PERIPHERAL_DISCONNECTED);

                // Show lost connection message
                this.runtime.emit(this.runtime.constructor.PERIPHERAL_CONNECTION_LOST_ERROR, {
                    message: `Scratch lost connection to`,
                    extensionId: this._extensionId
                });
            });
            try {
                window.LEPI_IP = ip
            } catch (error) {
                console.log(ip)
            }
        }, onFailure)

    }
    /**
     * Starts reading data from peripheral after BLE has connected to it.
     * @private
     */
    _onConnect() {
        console.log('lepi connected')
    }
    /**
     * Disconnect from the micro:bit.
     */
    disconnect() {
        console.log('disconnect called')

        setTimeout(() => {
            if (this.isConnected()) {
                this.runtime.ros = null
                this.runtime.emit(this.runtime.constructor.PERIPHERAL_DISCONNECTED);
            }
        }, 2000)
        if (this.runtime.ros && this.runtime.ros.isConnected) {
            this.runtime.ros.close()
        }

        if (this._ble) {
            this._ble.disconnect();
        }

        this.reset();
    }

    /**
     * Reset all the state and timeout/interval ids.
     */
    reset() {

    }

    /**
     * Return true if connected to the micro:bit.
     * @return {boolean} - whether the micro:bit is connected.
     */
    isConnected() {
        var connected = false;
        if (this._ble) {
            connected = this._ble.isConnected();
        }
        connected = this.runtime.ros && this.runtime.ros.isConnected()
        return connected;
    }


    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'lepi',
            name: formatMessage({
                id: 'lepi.host',
                default: '主机',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: 'loadLepiProject',
                    text: formatMessage({
                        id: 'lepi.loadLepiProject',
                        default: '加载乐派作品 [FILE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        FILE: {
                            type: ArgumentType.STRING,
                            menu: 'lepiProjects'
                        },
                    }
                },
                {
                    opcode: 'setLed',
                    text: formatMessage({
                        id: 'lepi.setLed',
                        default: '设置指示灯颜色 LED1[COLOR1] LED2[COLOR2]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLOR1: {
                            type: ArgumentType.STRING,
                            menu: 'colorList'
                        },
                        COLOR2: {
                            type: ArgumentType.STRING,
                            menu: 'colorList'
                        },
                    }
                },{
                    opcode: 'closeFan',
                    text: formatMessage({
                        id: 'lepi.setFan',
                        default: '关闭风扇',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'setFanTemp',
                    text: formatMessage({
                        id: 'lepi.setFanTemp',
                        default: '设置风扇开关温度,[TEMP1]打开 [TEMP2]关闭',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEMP1: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 70
                        },
                        TEMP2: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 65
                        },
                    }
                },
                /*
                {
                    opcode: 'setRuntimeMode',
                    text: '设置运行模式 [MODE] ',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        MODE: {
                            type: ArgumentType.NUMBER,
                            menu: 'mode'
                        }
                    }
                },
                */
                '---',
                {
                    opcode: 'openLepiGUI',
                    text: formatMessage({
                        id: 'lepi.openLepiGUI',
                        default: '打开主机屏幕',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                {
                    opcode: 'openVNC',
                    text: formatMessage({
                        id: 'lepi.openVNC',
                        default: '打开乐派桌面, 端口[PORT]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: '6080'
                        }
                    }
                },
                {
                    opcode: 'openVSCode',
                    text: formatMessage({
                        id: 'lepi.openVSCode',
                        default: '打开VSCode编辑器, 端口[PORT]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: '8080'
                        }
                    }
                },
                {
                    opcode: 'openFileBrowser',
                    text: formatMessage({
                        id: 'lepi.openFileBrowser',
                        default: '打开文件浏览器, 端口[PORT]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            defaultValue: '8888'
                        }
                    }
                },
                {
                    opcode: 'openCollaborationSheet',
                    text: formatMessage({
                        id: 'lepi.openCollaborationSheet',
                        default: '打开协作表单',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                {
                    opcode: 'openAudioAnalyzer',
                    text: formatMessage({
                        id: 'lepi.openAudioAnalyzer',
                        default: '打开音频分析工具',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                {
                    opcode: 'openWebSniffer',
                    text: formatMessage({
                        id: 'lepi.openWebSniffer',
                        default: '打开网络嗅探工具',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    }
                },
                {
                    opcode: 'openURL',
                    text: formatMessage({
                        id: 'lepi.openURL',
                        default: '[PROXY] 打开网页[URL]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'http://www.baidu.com'
                        },
                        PROXY: {
                            type: ArgumentType.STRING,
                            defaultValue: 0,
                            menu: 'proxy'
                        },
                    }
                },
                '---',
                {
                    opcode: 'getLaunchedNodes',
                    text: formatMessage({
                        id: 'lepi.getLaunchedNodes',
                        default: '更新扩展模块信息',
                    }),
                    blockType: BlockType.COMMAND,
                }, {
                    opcode: 'launchNode',
                    text: formatMessage({
                        id: 'lepi.launchNode',
                        default: '启动 [NAME] 扩展',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'shutdownNodes'
                        }
                    }
                }, {
                    opcode: 'shutdownNode',
                    text: formatMessage({
                        id: 'lepi.shutdownNode',
                        default: '关闭 [NAME] 扩展',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'launchedNodes'
                        }
                    }
                },
                '---',
                {
                    opcode: 'toggleTerminal',
                    text: formatMessage({
                        id: 'lepi.toggleTerminal',
                        default: '[TOGGLE] 命令行窗口',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TOGGLE: {
                            type: ArgumentType.STRING,
                            menu: 'toggle'
                        }
                    }
                },
                {
                    opcode: 'inputString',
                    text: formatMessage({
                        id: 'lepi.inputString',
                        default: '输入 [INPUT] [Enter]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        INPUT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        Enter: {
                            type: ArgumentType.STRING,
                            menu: 'toggleEnter',
                            defaultValue: 1
                        }
                    }
                },
                /*
                '---',
                {
                    opcode: 'connectToWiFi',
                    text: '连接WiFi 名称:[SSID] 密码:[PASSWD]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SSID: {
                            type: ArgumentType.STRING,
                            defaultValue: 'SSID'
                        },
                        PASSWD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'PASSWD'
                        },
                    }
                },
                {
                    opcode: 'testHTTPGET',
                    text: '测试HTTP GET, URL:[URL]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: '/test'
                        },
                    }
                },
                {
                    opcode: 'testROS2',
                    text: '测试ROS2',
                    blockType: BlockType.COMMAND,
                    arguments: {}
                },
                */

                /*
                    '---', {
                    opcode: 'connectToBT',
                    text: '连接蓝牙设备 地址:[ADDR] ',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ADDR: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ADDR'
                        }
                    }
                },
                     {
                        opcode: 'setPidEnable',
                        text: '[ENABLED] 巡线,速度 [SPEED],偏移 [OFFSET],转向 [FACTOR]',
                        blockType: BlockType.COMMAND,
                        arguments: {
                            ENABLED: {
                                type: ArgumentType.NUMBER,
                                menu: 'pidToggle'
                            },
                            SPEED: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 50
                            },
                            OFFSET: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 70
                            },
                            FACTOR: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 1.2
                            }
                        }
                    },
    
                    '---', {
                        opcode: 'detectLanePose',
                        text: '检测车道',
                        blockType: BlockType.COMMAND,
                    }, {
                        opcode: 'lanePoseCurvature',
                        text: '车道弧度',
                        blockType: BlockType.REPORTER,
                    }, {
                        opcode: 'lanePoseOffset',
                        text: '车道偏移',
                        blockType: BlockType.REPORTER,
                    },
    
                    '---',
    
                    */
            ],
            menus: {
                launchedNodes: 'formatLaunchedNodes',
                shutdownNodes: 'formatShutdownNodes',
                lepiProjects: 'formatLepiProjects',

                toggle: Menu.formatMenu([formatMessage({
                    id: 'lepi.close',
                    default: '关闭',
                }), formatMessage({
                    id: 'lepi.open',
                    default: '打开',
                })]),
                toggleEnter: Menu.formatMenu([formatMessage({
                    id: 'lepi.no_enter',
                    default: '不加回车',
                }), formatMessage({
                    id: 'lepi.with_enter',
                    default: '添加回车',
                })]),

                colorList: Menu.formatMenu([formatMessage({
                    id: 'lepi.off',
                    default: '熄灭',
                }), formatMessage({
                    id: 'lepi.red',
                    default: '红色',
                }), formatMessage({
                    id: 'lepi.green',
                    default: '绿色',
                }), formatMessage({
                    id: 'lepi.yellow',
                    default: '黄色',
                }), formatMessage({
                    id: 'lepi.blue',
                    default: '蓝色',
                }), formatMessage({
                    id: 'lepi.purple',
                    default: '紫色',
                }), formatMessage({
                    id: 'lepi.indigo',
                    default: '靛青',
                }), formatMessage({
                    id: 'lepi.white',
                    default: '白色',
                })]),
                proxy: Menu.formatMenu(['不使用代理', '使用代理']),
                // windows: Menu.formatMenu(['全屏', '上半屏', '下半屏']),
                // sharedVariablesMenu: 'sharedVariablesMenu2',
            },
            // Optional: translations,目前没什么用
            translation_map: {
                zh: {
                    'extensionName': '',
                    'say': '说 [TEXT]',
                    'Scratch.lepi.say.TEXT_default': '你好',
                    'menuA_item1': 'Artikel eins',

                    // Dynamic menus can be translated too
                    'menuB_example': 'Beispiel',

                    // This message contains ICU placeholders (see `myReporter()` below)
                    'myReporter.result': 'Buchstabe {varTER_NUM} von {TEXT} ist {varTER}.'
                },
            },
        };
    }

    connected(args, util) {
        var connected = this.runtime.ros && this.runtime.ros.isConnected()
        return connected
    }

    formatLaunchedNodes() {
        this.launchedNodes = this.totalNodes.filter(item => item.status == '已启动').map(item => {
            // console.log(item, item.value, node_name_maps[item.value])
            return {
                text: node_name_maps[item.value] ? node_name_maps[item.value]() : item.value,
                value: item.value,
            }
        })
        // console.log(this.launchedNodes, node_name_maps)
        if (this.launchedNodes.length == 0)
            return [{
                text: ' ',
                value: ' '
            }]
        else
            return this.launchedNodes
    }
    formatShutdownNodes() {
        this.shutdownNodes = this.totalNodes.filter(item => item.status == '已停止').map(item => {
            return {
                text: node_name_maps[item.value] ? node_name_maps[item.value]() : item.value,
                value: item.value,
            }
        })

        // let topics = this.totalNodes.map(topic => node_name_maps[topic.value])
        // return Menu.formatMenu2(topics)

        // let menu = Menu.formatMenu3(Object.values(node_name_maps), Object.keys(node_name_maps))
        // console.log(menu)
        // return menu
        if (this.shutdownNodes.length == 0)
            return [{
                text: ' ',
                value: ' '
            }]
        else
            return this.shutdownNodes
    }

    async updateLepiProjects() {
        let data = await this.runtime.ros.getFileList(this.file_dir)
        this.files = data.files.filter(item => item.endsWith('.sb3'))
        // this.model_dir = data.current
        return this.files.join(',')
    }

    formatLepiProjects() {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.updateLepiProjects()
        }
        return Menu.formatMenu3(this.files, this.files)
    }

    async loadLepiProject(args) {
        let data = await this.runtime.ros.getFileData(`${this.file_dir}/${args.FILE}`)
        this.runtime.vm.loadProject(Buffer.from(data, 'base64'))
        // http://192.168.50.125:8000/explore/Scratch/1111.sb3
        // window.location.href = `${window.location.href}?lepiFile=http://${this.runtime.ros.ip}:8000/explore/Scratch/${args.FILE}`
    }
    /*
    viewAFrame(args, util) {
        if (!this.track) {
            this.runtime.emit('SAY', util.target, 'say', "摄像头还没启动，先打开摄像头吧");
            return
        }
        const {
            renderer
        } = this.runtime;
        if (!renderer) return;

        if (this._skinId === -1 && this._skin === null && this._drawable === -1) {
            this._skinId = renderer.createPenSkin();
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
        if (!this.video) {
            this._skin.clear();
            return;
        }

        const xOffset = -240;
        const yOffset = 180;

        var base64Data = args.PICTURE
        // console.log(base64Data)
        var image = new Image();
        image.src = base64Data
        image.onload = () => {
            this._skin.drawStamp(image, xOffset, yOffset);
            this.runtime.requestRedraw();
        };
        // console.log(image)
    }
    snapshot(args, util) {
        return new Promise((resolve, reject) => {

            var context = this.canvas.getContext('2d');
            context.drawImage(this.video, 0, 0);
            // context.drawImage(this.video, 0, 0, 480, 360);
            var base64Data = this.canvas.toDataURL("image/jpeg");
            // console.log(base64Data)
            resolve(base64Data)
        })
    }
    */
    // Could not process inbound connection: [/rosbridge_websocket] is not a publisher
    // 解决办法
    // /opt/ros/kinetic/lib/python2.7/dist-packages/rosbridge_library/internal/publishers.py
    // 注释掉unregister topic 的部分
    // def _unregister_impl(self, topic):
    //     #if not self._publishers[topic].has_clients():
    //     #    self._publishers[topic].unregister()
    //     #    del self._publishers[topic]
    //     del self.unregister_timers[topic]



    whenEventHappen() {
        console.log('called whenEventHappen')
        return false
    }

    /*
    setPidEnable(args, util) {
        enabled = parseInt(args.ENABLED)
        speed = parseInt(args.SPEED)
        offset = parseInt(args.OFFSET)
        factor = parseInt(args.FACTOR)
        return new Promise(resolve => {
            this.runtime.ros.setPidEnable(enabled, speed, offset, factor).then(result => {
                resolve()
            })
        })
    }
    detectLanePose(args, util) {
        return new Promise((resolve) => {
            this.runtime.ros.detectLanePose().then(result => {
                if (result && result.pose && result.pose.in_lane) {
                    this.lane_pose = result.pose
                }
                resolve()
            })
        })
    }
    lanePoseCurvature(args, util) {
        if (this.lane_pose) {
            return this.lane_pose.d * 100
        }
    }
    lanePoseOffset(args, util) {
        if (this.lane_pose) {
            return Math.atan(this.lane_pose.phi) / Math.PI * 180
        }
    }
    
    */
    async getLaunchedNodes() {
        let data = await this.runtime.ros.getNodeList()
        this.totalNodes = Object.values(data)
        const aliveNodes = this.formatLaunchedNodes().map(item => item.text)
        return Promise.resolve(aliveNodes.join(','))
    }
    async launchNode(args, util) {
        var node_name = args.NAME
        let res = await this.runtime.ros.startNode(node_name)
        return Promise.resolve(res)

    }

    async shutdownNode(args, util) {
        var node_name = args.NAME
        let res = await this.runtime.ros.stopNode(node_name)
        this.getLaunchedNodes()
        return Promise.resolve(res)
    }

    toggleTerminal(args, util) {
        var value = parseInt(args.TOGGLE)
        console.log(value)
        const SERVER_URL = 'http://' + this.LEPI_IP + ':8000'
        return new Promise((resolve) => {
            if (value == 1) {
                this.runtime.ros.proxyGet(`${SERVER_URL}/system/openTerminal`).then(data => {
                    console.log(data)
                    resolve(formatMessage({
                        id: 'lepi.done',
                        default: 'Done',
                    }))
                })
            } else {
                this.runtime.ros.proxyGet(`${SERVER_URL}/system/closeTerminal`).then(data => {
                    console.log(data)
                    resolve(formatMessage({
                        id: 'lepi.done',
                        default: 'Done',
                    }))
                })
            }
        })
    }
    inputString(args, util) {
        var input = args.INPUT
        var enter = parseInt(args.Enter)
        const SERVER_URL = 'http://' + this.LEPI_IP + ':8000'
        return new Promise((resolve) => {
            var url = `${SERVER_URL}/system/inputString?input=${encodeURI(input)}`
            if (enter) {
                url = url + '&enter=1'
            }
            this.runtime.ros.proxyGet(url).then(data => {
                console.log(data)
                resolve(formatMessage({
                    id: 'lepi.done',
                    default: 'Done',
                }))
            })
        })
    }
    connectToWiFi(args, util) {

        return new Promise(resolve => {
            var URL = 'http://' + this.LEPI_IP + ':8000/wifi/connect'

            var data = {
                ssid: args.SSID,
                psk: args.PASSWD
            }
            this.runtime.ros.proxyPost(URL, 'POST', data).then(response => {
                console.log('response', response)
                let data = JSON.parse(response)
                if (data && data.ip_address) {
                    this.runtime.emit('SAY', util.target, 'say', `ssid:${args.SSID},ip:${data.ip_address}`);
                    resolve(formatMessage({
                        id: 'lepi.ok',
                        default: 'OK',
                    }))
                } else {
                    resolve(formatMessage({
                        id: 'lepi.failed',
                        default: 'Failed',
                    }))
                }
            }).catch(error => {
                console.log('error', error)
                resolve(formatMessage({
                    id: 'lepi.error',
                    default: 'Error',
                }))
            })
        })
    }

    setLed(args, util) {
        let color1 = parseInt(args.COLOR1)
        let color2 = parseInt(args.COLOR2)
        let data1 = (color1 & 0x01) | ((color1 & 0x02) << 1) | ((color1 & 0x04) << 2)
        let data2 = ((color2 & 0x01) << 1) | ((color2 & 0x02) << 2) | ((color2 & 0x04) << 3)
        return this.runtime.ros.setSystemLed(data1 | data2)
    }

    closeFan(){
        return this.runtime.ros.setSystemFanTemp({ temp1:100, temp2:100 })
    }

    setFanTemp(args) {
        let temp1 = parseInt(args.TEMP1)
        let temp2 = parseInt(args.TEMP2)
        return this.runtime.ros.setSystemFanTemp({ temp1, temp2 })
    }

    connectToBT(args, util) {
        return
    }

    testHTTPGET(args, util) {
        let url = 'http://' + this.LEPI_IP + ':8000/system/test'
        if (args.URL && args.URL.length > 0) {
            url = args.URL
        }
        return axios.get(url)
    }

    testROS2() {
        return this.runtime.ros.ros2_call_service()
    }

    async openVSCode(args, util) {
        const port = parseInt(args.PORT)
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let url
            if (window.location.protocol == 'https:') {
                url = `http://${this.runtime.vm.ros.ip}:${port}`
            } else {
                let res = await axios.get(`http://localhost:20110/create_proxy`, {
                    params: {
                        host: this.runtime.vm.ros.ip, port: port
                    }
                })
                console.log(res.data)
                url = `http://localhost:${res.data.proxy_port}`
            }

            let a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.click()
        } else {
            return '未连接到主机'
        }
    }

    openLepiGUI(args, util) {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let url = `http://${this.runtime.vm.ros.ip}:8000/app`
            let a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.click()
        } else {
            return '未连接到主机'
        }
    }

    async openVNC(args, util) {
        const port = parseInt(args.PORT)
        let url
        if (window.location.protocol == 'https:') {
            url = `https://${this.runtime.vm.ros.ip}:${port}`
            return '仅App版支持打开桌面'
        } else if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let res = await axios.get(`http://localhost:20110/create_proxy`, {
                params: {
                    host: this.runtime.vm.ros.ip, port: port
                }
            })
            console.log(res.data)
            url = `http://localhost:${res.data.proxy_port}/vnc.html`
        } else {
            return '未连接到主机'
        }
        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
    }

    async openFileBrowser(args, util) {
        const port = parseInt(args.PORT)

        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let url = `http://${this.runtime.vm.ros.ip}:${port}`
            // if (window.location.protocol == 'https:'){
            //     url = `http://${this.runtime.vm.ros.ip}:${port}`
            // }else{
            //     let res = await axios.get(`http://localhost:20110/create_proxy`, {
            //         params: {
            //             host: this.runtime.vm.ros.ip, port: port
            //         }
            //     })
            //     console.log(res.data)
            //     url = `http://localhost:${res.data.proxy_port}`
            // }

            let a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.click()
        } else {
            return '未连接到主机'
        }
    }

    async openCollaborationSheet(args, util) {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let url = `http://${this.runtime.vm.ros.ip}:8000/collaborationSheet/iframe.html?id=collabration--example&viewMode=story`
            let a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.click()
        } else {
            return '未连接到主机'
        }
    }

    openAudioAnalyzer(){
        let url = `../audio_analyzer`
        url = `${url}?lepi=${this.runtime.vm.LEPI_IP}`
        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
    }

    async openWebSniffer(args, util) {
        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            let url = `http://${this.runtime.vm.ros.ip}:4000/SnifferUI/`
            let a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.click()
        } else {
            return '未连接到主机'
        }
    }

    async openURL(args, util) {
        let url
        let proxy = parseInt(args.PROXY)
        if (proxy) {
            let origin = getUrlPrefix(args.URL)
            let pathname = args.URL.replace(origin, '')
            let res = await axios.get(`http://localhost:20110/create_proxy`, {
                params: {
                    url: origin
                }
            })
            console.log(res.data)
            url = `http://localhost:${res.data.proxy_port}${pathname}`
        } else {
            url = args.URL
        }

        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
    }

}

(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        console.log('Blockly.Python not defined')
        return
    }
    const prefix = 'lepi_'
    Blockly.Python[`${prefix}block_function`] = function (block) {
        // plain input
        // const key = Blockly.Python.valueToCode(block, 'DATA')

        // faceLabels: 'formatFaceLabels',
        // const key = block.getFieldValue('TAG')

        // faceParams: Menu.formatMenu(['x坐标', 'y坐标', '宽度', '高度']),
        // var param = block.getInputTargetBlock('DATA')
        // var id = param.getFieldValue('data')
        Blockly.Python.definitions_['import_or_init_FaceRecognizer'] = 'from face_recognizer import FaceRecognizer'
        // console.log(key, key2)
        return `do something\n` //Command
        //or return [`barcodeScanner.barcode[${id}]`, Blockly.Python.ORDER_FUNCTION_CALL] // Boolean Reporter
    };
    console.log('scratch3_lepi loaded')

})()
module.exports = Scratch3LepiBlocks;