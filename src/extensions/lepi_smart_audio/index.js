const EventEmitter = require('events');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Menu = require('../../util/menu');
// const StageLayering = require('../../engine/stage-layering')
const getMonitorIdForBlockWithArgs = require('../../util/get-monitor-id');
// const MathUtil = require('../../util/math-util');
const { pinyin } = require('pinyin-pro');

const voices = require('./voices')
/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADhmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmRhYmZiOTA3LTM3ZjEtNDY5OS04YmQyLWYyN2NmZWMyNGUxYiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpERUFCRkU3RUNGQjcxMUVBOTUxN0FEN0Y3Mzg2QUYzMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpERUFCRkU3RENGQjcxMUVBOTUxN0FEN0Y3Mzg2QUYzMSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjg3MzNiMzAzLTFlN2UtNDZlNC1hMWU1LWVjMTUyOWU1OTU0OCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjJhN2YzMTY3LTgzODItZGI0ZS04MTY0LWRlNDQ5ZTRmYzgwNSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pg+avtwAAAZ9SURBVFhH7Vd5bJNlGP/13Lqu7dgYO4ERBLYx6MYGBBK5BJnohKBEYYZDEW8FjwSDEo1CSEAzUfHAYDgjIcqlBrmEiQiMezCQQ8DB5tgBa7ut6+nzvKxjbdftKxtkf/Br3rbf1/d739/7HL/nqcywa4kbHRjyhs8Oi/sE24oOT7DZJOEbNpcDVpfz1oVM3G5fuN1QyRXQyJWQyQJv4EfQTQ+a7HUY3bknZiQYYXc3kGxnqIncgeprWHrlEPTK0IAkvQgKcrZarDFOxKmaciy6kA847eK07c7S7cLQmBQkh0dhxZUCaNRaQdoXXgRriczU+P5kNQdWXTqI4bEp+Do1G11D9XARyfY2pI1DiHCmpgK5hVtQWm+BVqES9zzwIlhtt2JTxiRMOLQK4xON2JQ+CX/euIp9N4uhkt2dfLKTJWeQUbqEaJGwdyluEgeOTQ/8CK7sl4NpR36AO2ch1pWeRu7htRQw2oYZrYBDgWOWDxPMgchy5dnvo9B8HaMKVsOgDmv4wVdmKFBFuMlunWBd6SmoyL0GVWiLQ68METEVF6rDlIR0DDAkiNgNV6qbne87EBKONbSXUR8j1mmKFo/ZXND6QiQWWeC3rFwcGzITmfpY5CWPRs3YeainGHP6bBgICqLiFNbxRtCBZXe5vBYyOW1YlpaD87VViN2+AG+d2YZh+5djOLmqcuQcWEgV+BAeNP3uhQBSKJkgL8zk+umiEUluYZJiM3LlS90y8erJjcjs/ABe7zEEE+KNOFx5CUWWSqQZ4uFosCLP5+8BSTYDSQQFOVrYCRfCFWokaQyNrpPTNcsDqCKo5HKEyVUIVSjF9WFTKfpoIxstXkfV6ZWuWeJTKiQR5JI3I6E/xYmM4spB75RM9DI5rLc9Q4SNuhjM7j4I46N7A/SMgjKZydWTleto8DMc16ypHqu2BkkEFZTdf9dUknu7iA1d9HK63MgfNBVOIikknCy2qqQQafu/xfNFvwCUwXxfWK37QDwVm4owEuGztE6kSoNeYZGSSEqPQRpsEbfMLTLO7qjDkIhEKgd1iKBaCkc9nolLw/7B07AsJVtcG0h+quj3DJKPbiRXfbXR2FJ+Dul0UG4SpMSiJIJKInbaUi6qCbu5zFYDFVmhuM5EGh6Jf60mpEUlYTkV/t57v8DUEz8JoZ4S1xcFJPbPkTYuKz6CHpoI2MnVo2juX9Qo8LqtQRJBObnY5LChmqyilimpdlZiLmXruGPrUTZiNlJ2f4rCobPwQtJgRJNYj6Rsdo/7EP1JbhZnPIm8y4dww2pGH3KrjGJwbclpUXNbarM8kOxiztDzNVU4SCfnTP7u6nGcpdK0+PIBXHt4LmTbPkIUWXWD8QlMjkuFescivJg4ADmUMHMoJsOofG2tuECuVeGS9aYk6zEkE+TMVchlYmFOGgu5Sq/WYOHFP5B7cjMsY+aKRCgwlZAMRcBG1yU2M5L3fgZ9iE40AEWWCnFQqeQYfjNbClsm6XELv5vqa1kksef6OYT/PA/GPXnUmRgx7uh6yDa9gwVnd4pY5B6TWysmFyy8n6DNROFvRUg5+0wUj+7s+bCQe81j34P50Y9RQZ9RZNWyEW/A/NgCmOl385h34X5kPrL0cY39XzDwa1hnJWbgHNXV7ZmTMeHYBvxacVHoly8ESbKMHzztlrDxbWioPAZqPrjNy0sei9z4VETvXAwDdTceeFmQiXxz9Sh2kMsYHDeBaie72kBNpt/g9ow28L0fiJxYmyyrpfLooFrvezC/oNBShvKkE5Shq9MepwVcMJFEVHtGvbmxDntgdTrovuX2nCCGyVqN+LAIzExMx2rqCbkiNYWXiz3gkwjte+jthjveiNj9iSDJSWMm0R7YqZuoIMFkpy9Ywnrnfw4dde+8twfNEmTYyey1VGefpv8L3L0waa1ShQ96DkOvfV/hn9oblEv1+J50bzo1Er9XXcFmCo2QAK5sDkyDD1lAXc8uKoE6dbgXOUZAggzuOqyU0WwtF41OJLZVI9+EbtcSxND3Cw++LOZNPP4jNl47ARm370GC6ajoLwYfrLnK0iLBpmCLRpKEFA97DSuIzLP0p/64uQxZB1aIg+hInvyXbzuCChruZhhMbnrhVmTkf4lQCmrWzrtBjiGZIJMro0xd/1+RSJKVJSehJ0lpS2JIgWQXM9iVZkoMliLlHZStO0FQu3CG8f/Ye0WOce92ukPcJ9hWdHCCwP+X3/Kj/+HK7wAAAABJRU5ErkJggg=='
const menuIconURI = blockIconURI;

let voicesMap = {}

// 兼容不同浏览器的前缀
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

let startRecognition = async (callback) => {
    if (SpeechRecognition) {
        return new Promise(resolve => {
            const recognition = new SpeechRecognition();

            // 设置识别参数
            recognition.continuous = false;  // 持续监听
            recognition.interimResults = true;  // 显示临时结果
            recognition.lang = 'zh-CN';  // 设置语言为中文

            // 处理识别结果
            recognition.onresult = (event) => {
                const results = event.results;
                let result = results[results.length - 1]
                // let transcript = Array.from(results)
                //     .map(result => result[0])
                //     .map(result => result.transcript)
                //     .join('');

                // 显示临时结果（灰色）和最终结果（黑色）
                if (result.isFinal) {
                    console.log(result[0].transcript)
                    resolve(result[0].transcript)
                    if (callback) {
                        callback(result[0].transcript)
                    }
                } else {
                    console.log(result[0].transcript)
                    // if (callback) {
                    //     callback(result[0].transcript)
                    // }
                }
            };

            // 错误处理
            recognition.onerror = (event) => {
                console.error('识别错误:', event.error);
                resolve('')
            };

            // 识别结束
            recognition.onend = () => {
                console.log('识别结束')
                // recognition.start();
            };
            recognition.start();
        })

    } else {
        return ''
    }
}

async function delay_ms(ms = 1000) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
}

const axios = require('axios').default;
let onDetectResult = null

const asr_url = 'https://agent.jszcai.com/v1/audio-to-text';
const tts_url = 'https://agent.jszcai.com/v1/text-to-audio';
const apiKey = require('./api_key');
async function recognize_audio(blob) {
    // 或直接使用文件对象
    let formData = new FormData();
    formData.append('file', blob, 'audio.wav');
    console.log(formData)

    // const response = await fetch(asr_url, {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${apiKey}`,
    //         // 注意: 不要手动设置 Content-Type，浏览器会自动设置 multipart/form-data 边界
    //     },
    //     body: formData,
    // });
    // const responseText = await response.text();
    // console.log(responseText)
    try {
        let response = await axios.post(asr_url, formData, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        console.log(response.data)
        if (onDetectResult) {
            onDetectResult(response.data.text)
        }
    } catch (error) {
        console.log(error)
        if (onDetectResult) {
            onDetectResult('')
        }
    }
}

// ---------- 全局状态 ----------
let mediaStream = null;             // 当前麦克风流
let mediaRecorder = null;           // MediaRecorder 实例
let audioChunks = [];               // 录音数据块 Blob 数组
let isRecording = false;             // 是否正在录制中
let silenceTimeout = null;           // 静音检测超时定时器
let lastRecordingBlob = null;        // 最新录音的Blob (用于播放/保存)
let lastRecordingURL = null;          // 对应的blob URL
// 音频上下文 & 分析器 (用于音量检测)
let audioContext = null;              // AudioContext 实例 (需用户手势后创建/恢复)
let sourceNode = null;                // MediaStreamSourceNode
let analyserNode = null;              // AnalyserNode 用于获取音量
let isAnalyserSetup = false;           // 是否已连接分析器
let scriptProcessor = null;
// 可配置的静音阈值参数
const SILENCE_THRESHOLD = 0.012;       // 音量阈值 (RMS归一化值，经验值 0.012 较灵敏，0.008以下完全静音)
const SILENCE_DELAY_MS = 1200;         // 静音持续 1.8 秒后自动停止录音

// 为了防止刚开始录音因为环境底噪立刻停止，增加最小录音时长 (至少录制1.2秒)
const MIN_RECORDING_DURATION_MS = 1800;
let recordingStartTime = 0;             // 录音开始时间戳 (毫秒)

// 辅助标志: 防止在停止清理过程中重复触发
let isStoppingManually = false;          // 是否正在主动停止（避免递归）

// 停止录音的核心逻辑: 保存blob并清理录音状态 (不关闭麦克风track)
async function stopRecordingAndSave(triggerSource = "auto") {
    // 防止重复停止
    if (!isRecording || !mediaRecorder || mediaRecorder.state === 'inactive') {
        console.log(`⚠️ 停止请求但未在录音中 (state: ${mediaRecorder?.state})`);
        return;
    }

    // 避免并发停止 (例如超时和手动同时)
    if (isStoppingManually) return;
    isStoppingManually = true;

    console.log(`🔴 ${triggerSource === 'auto' ? '自动检测静音' : '手动停止'} 录音中...`);

    // 停止MediaRecorder (会触发dataavailable和stop事件)
    // 注意: 在stop事件中我们会完成最终的blob组装与清理
    mediaRecorder.stop();

    // 注意: 不能立即重置 mediaRecorder 变量, 等待stop事件回调处理完成后重置。
    // 实际清理在 mediaRecorder onstop 回调中进行。
    // 但是为了防止超时重复stop, 将 isRecording 标记先置false避免额外停止
    isRecording = false;

    // 清除静音定时器
    if (silenceTimeout) {
        clearTimeout(silenceTimeout);
        silenceTimeout = null;
    }

    // 断开音频分析节点 (但保留媒体流track不关闭)
    if (audioContext && sourceNode) {
        try {
            sourceNode.disconnect();
            analyserNode?.disconnect();
        } catch (e) { }
        // 注意: 不要 close audioContext，因为之后重新录音时需要复用 (需要resume)
        // 但是如果不关闭音频上下文，下次重新录音需要重新创建连接。为了简单，在停止录音后挂起上下文，下次再重建连接。
        if (audioContext.state !== 'closed') {
            // audioContext.suspend().catch(e => console.log(`挂起AudioContext失败:${e}`));
            await closeMicrophone()
        }
    }
    isAnalyserSetup = false;
    console.log("⏹️ 已停止录音，正在处理音频...", false);

    // 同时设置一个延迟, 确保如果MediaRecorder的stop事件因为某些原因没及时清理, 我们还是重置按钮状态
    setTimeout(() => {
        if (isStoppingManually) {
            // 保险重置标志
            isStoppingManually = false;
        }
    }, 500);
}

// 完全关闭麦克风(释放硬件资源)
async function closeMicrophone() {
    // 如果正在录音，先停止录音并等待清理
    if (isRecording && mediaRecorder && mediaRecorder.state !== 'inactive') {
        console.log("关闭麦克风前先停止录音");
        await new Promise((resolve) => {
            if (!isRecording) return resolve();
            const onStopHandler = () => {
                mediaRecorder.removeEventListener('stop', onStopHandler);
                resolve();
            };
            mediaRecorder.addEventListener('stop', onStopHandler);
            if (mediaRecorder.state === 'recording') mediaRecorder.stop();
            else resolve();
        });
    }

    // 关闭音频上下文
    if (audioContext) {
        await audioContext.close().catch(e => console.log(`关闭音频上下文错误: ${e}`));
        audioContext = null;
    }

    // 关闭所有麦克风轨道
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
            if (track.readyState === 'live') {
                track.stop();
                console.log(`关闭音频轨道: ${track.kind}`);
            }
        });
        mediaStream = null;
    }

    sourceNode = null;
    analyserNode = null;
    isAnalyserSetup = false;

}

// 开始录音 (要求已经获取mediaStream)
async function startRecording() {
    if (!mediaStream) {
        console.log("错误: 麦克风流不存在，请先请求麦克风", true);
        return false;
    }
    if (isRecording) {
        console.log("已有正在进行的录音，请先停止");
        return false;
    }

    // 重置录音数据块
    audioChunks = [];
    recordingStartTime = Date.now();

    // 配置MediaRecorder (支持常用音频编码)
    let mimeType = '';
    const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg'];
    for (let type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
        }
    }
    try {
        mediaRecorder = new MediaRecorder(mediaStream, { mimeType: mimeType });
    } catch (e) {
        console.log(`创建MediaRecorder失败: ${e}`, true);
        return false;
    }

    mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            audioChunks.push(event.data);
            console.log(`📦 收到音频数据块: ${(event.data.size / 1024).toFixed(1)}KB`);
        }
    };

    mediaRecorder.onstop = () => {
        // 当MediaRecorder停止，组装最终Blob
        if (audioChunks.length === 0) {
            console.log("警告: 录音数据为空，未生成文件", true);
            console.log("⚠️ 录音数据为空，请重试", false);
            isStoppingManually = false;
            return;
        }

        // const blobType = mimeType || 'audio/webm';
        const blobType = 'audio/wav'
        const audioBlob = new Blob(audioChunks, { type: blobType });
        console.log(`✅ 录音完成，文件大小: ${(audioBlob.size / 1024).toFixed(1)}KB, 格式: ${blobType}`);

        // 检查最小录音时长，如果太短则丢弃并提示
        const duration = Date.now() - recordingStartTime;
        if (duration < MIN_RECORDING_DURATION_MS && audioBlob.size < 8000) {
            console.log(`⏱️ 录音时长过短 (${duration}ms), 可能未检测到有效语音, 忽略此次录音`, true);
            console.log("⏱️ 说话时间太短，请稍后重新录音", false);
            lastRecordingBlob = null;
            // 重置停止标志
            isStoppingManually = false;
            // 刷新状态准备就绪
            if (onDetectResult) {
                onDetectResult('')
            }
            return;
        }

        // 保存最新录音
        console.log(`✨ 录音时长 ${(duration / 1000).toFixed(1)} 秒`);

        // 重置停止标志
        isStoppingManually = false;

        // 清除任何残留静音超时
        if (silenceTimeout) clearTimeout(silenceTimeout);
        silenceTimeout = null;
        recognize_audio(audioBlob)
    };

    mediaRecorder.start(200); // 每200ms触发dataavailable，保证实时切片用于分析和稳定性
    isRecording = true;
    console.log("🎙️ 录音中 · 正在聆听 ... (说完后自动停止)", true);
    console.log("开始录音，启用智能静音检测 (1.8秒停顿自动结束)");

    // 重新连接音频分析器 (音量检测)
    if (audioContext && mediaStream) {
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        // 断开旧的source再建新连接
        if (sourceNode) {
            try { sourceNode.disconnect(); } catch (e) { }
        }
        sourceNode = audioContext.createMediaStreamSource(mediaStream);
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        sourceNode.connect(analyserNode);
        // 可选: 为了不输出音频到扬声器，不连接destination。如果希望静音，不连即可。
        // 但为了性能没有连接扬声器
        isAnalyserSetup = true;

        // 启动音量检测循环
        let lastNotSilentTime = Date.now();
        let hasDetectedSpeech = false;   // 检测到过语音（开始说话标志）

        const detectVolume = () => {
            if (!isRecording || !analyserNode || !isAnalyserSetup) return;
            if (!analyserNode) return;

            try {
                const dataArrayLocal = new Uint8Array(analyserNode.frequencyBinCount);
                analyserNode.getByteTimeDomainData(dataArrayLocal);
                let sumSquares = 0;
                for (let i = 0; i < dataArrayLocal.length; i++) {
                    let v = (dataArrayLocal[i] - 128) / 128;
                    sumSquares += v * v;
                }
                let rms = Math.sqrt(sumSquares / dataArrayLocal.length);
                // 当前音量级别
                const currentVolume = rms;

                // 动态阈值: 如果音量超过阈值则认为在说话
                if (currentVolume > SILENCE_THRESHOLD) {
                    // 有人在说话，记录最近非静音时间
                    lastNotSilentTime = Date.now();
                    if (!hasDetectedSpeech) {
                        hasDetectedSpeech = true;
                        console.log(`🗣️ 检测到语音输入 (音量:${currentVolume.toFixed(4)})`);
                    }
                    // 重置静音定时器（有声音就推迟停止）
                    if (silenceTimeout) {
                        clearTimeout(silenceTimeout);
                        silenceTimeout = null;
                    }
                } else {
                    // 处于静音或环境噪声状态，并且已经检测过至少一次语音（避免一启动就自动关闭）
                    if (hasDetectedSpeech && isRecording) {
                        if (!silenceTimeout) {
                            // 开始静音计时器，等待指定时长后自动停止
                            silenceTimeout = setTimeout(() => {
                                if (isRecording && hasDetectedSpeech) {
                                    console.log(`🤫 检测到持续静音 ${SILENCE_DELAY_MS / 1000} 秒，自动停止录音`);
                                    stopRecordingAndSave("auto");
                                }
                                silenceTimeout = null;
                            }, SILENCE_DELAY_MS);
                        }
                    }
                }

                // 动态展示UI可选: 显示小波纹效果（非必须，为了反馈可以在标题上体现）
                // if (isRecording) {
                //     const volumePercent = Math.min(100, Math.floor(currentVolume * 200));
                // } else {
                // }

            } catch (e) {
                // 忽略可能的断开错误
            }
            if (isRecording) {
                setTimeout(detectVolume, 200)
            }
        };
        setTimeout(detectVolume, 200);

    } else {
        console.log("警告: 音频上下文未初始化，无法进行音量检测，录音将依靠手动停止或最低时长后无法自动", true);
        // 如果无法分析, 依然提供一个后备: 5秒后自动停止，避免永久录制，但用户手动也可以停止。
        silenceTimeout = setTimeout(() => {
            if (isRecording) {
                console.log("⏰ 无音量检测超时后备机制，停止录音");
                stopRecordingAndSave("auto-fallback");
            }
        }, 5000);
    }

    return true;
}

// 请求麦克风权限 + 初始化音频上下文（用于音量检测）
async function requestMicrophoneAndInit() {
    if (mediaStream && mediaStream.active) {
        console.log("麦克风已存在，无需重复请求");
        return true;
    }
    try {
        // 请求麦克风权限，音频track
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        mediaStream = stream;
        console.log("🎤 麦克风权限已获取，音频流就绪");

        // 创建AudioContext (chrome要求必须在用户手势下创建或恢复)
        if (audioContext && audioContext.state !== 'closed') {
            await audioContext.close();
        }
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // 由于用户点击按钮时调用此函数，所以可以启动音频上下文
        await audioContext.resume();
        console.log(`音频上下文状态: ${audioContext.state}`);

        return true;
    } catch (err) {
        console.log(`麦克风错误: ${err.name} - ${err.message}`, true);
        console.log("❌ 无法获取麦克风，请检查权限", false);
        return false;
    }
}

// 主按钮行为: 打开麦克风 -> 开始录音（若已存在麦克风并且没有录音则开始录音）
async function requestMicrophone(callback) {
    // 如果当前正在录音 -> 手动停止录音
    if (isRecording) {
        // console.log("手动停止录音 (用户点击停止)");
        // await stopRecordingAndSave("manual");
        return;
    }

    // 如果不存在麦克风流，先请求权限
    if (!mediaStream || !mediaStream.active) {
        const granted = await requestMicrophoneAndInit();
        if (!granted) return;
    } else {
        // 已经有麦克风，但是可能audioContext挂起，恢复一下
        if (audioContext && audioContext.state === 'suspended') {
            await audioContext.resume();
        }
    }

    // 确保没有任何旧录音分析残留，清理之前的音量检测定时器
    if (silenceTimeout) {
        clearTimeout(silenceTimeout);
        silenceTimeout = null;
    }
    onDetectResult = callback
    // 开始新的录音
    const started = await startRecording();
    if (!started) {
        console.log("录音启动失败");
    }
}

// 辅助函数：将 Int16Array 转换为 Base64
function int16ArrayToBase64(int16Array) {
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
}


/**
* file或blob转base64
* @param {*} blob file或者blob
* @param {*} callback function (data)通过参数获得base64
*/
function blobToBase64(blob) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            // "data:audio/webm;codecs=opus;base64,jIEAtID7A...."
            console.log(reader.result)
            console.log(reader.result.slice(35))
            resolve(reader.result.slice(35));
        });
        reader.readAsDataURL(blob);
    })
}

function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// streaming-tts-player.js
class StreamingTTSPlayer {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.audioQueue = [];
        this.currentSource = null;
        this.nextStartTime = 0;
        this.sampleRate = 24000;
        this.channels = 1;
        this.totalChunks = 0;
        this.processedChunks = 0;
        this.onProgressCallback = null;
        this.onEndCallback = null;
        this.onErrorCallback = null;
    }

    // 初始化音频上下文
    async init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // 确保音频上下文处于运行状态
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        return this.audioContext;
    }

    // 设置回调函数
    onProgress(callback) {
        this.onProgressCallback = callback;
    }

    onEnd(callback) {
        this.onEndCallback = callback;
    }

    onError(callback) {
        this.onErrorCallback = callback;
    }

    // 将PCM数据转换为AudioBuffer
    pcmToAudioBuffer(pcmData, sampleRate, channels) {
        // 将Uint8Array转换为Float32Array
        const int16Array = new Int16Array(pcmData);
        const audioBuffer = this.audioContext.createBuffer(channels, int16Array.length, sampleRate);

        for (let channel = 0; channel < channels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < int16Array.length; i++) {
                // 将Int16 (-32768 to 32767) 转换为Float32 (-1.0 to 1.0)
                channelData[i] = int16Array[i] / 32768.0;
            }
        }

        return audioBuffer;
    }

    // 播放单个音频块
    async playAudioBuffer(audioBuffer) {
        return new Promise((resolve) => {
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);

            // 计算播放时间
            const currentTime = this.audioContext.currentTime;
            const startTime = Math.max(currentTime, this.nextStartTime);

            source.start(startTime);
            this.nextStartTime = startTime + audioBuffer.duration;

            source.onended = () => {
                resolve();
            };

            this.currentSource = source;
        });
    }

    // 处理队列中的音频块
    async processQueue() {
        while (this.audioQueue.length > 0 && !this.isPaused) {
            const chunk = this.audioQueue.shift();

            try {
                const audioBuffer = this.pcmToAudioBuffer(
                    chunk.data,
                    chunk.sampleRate || this.sampleRate,
                    chunk.channels || this.channels
                );

                await this.playAudioBuffer(audioBuffer);
                this.processedChunks++;

                // 触发进度回调
                if (this.onProgressCallback) {
                    const progress = this.totalChunks > 0
                        ? (this.processedChunks / this.totalChunks) * 100
                        : 0;
                    this.onProgressCallback(progress, this.processedChunks, this.totalChunks);
                }
            } catch (error) {
                console.error('播放音频块失败:', error);
                if (this.onErrorCallback) {
                    this.onErrorCallback(error);
                }
            }
        }

        // 队列处理完成
        if (this.audioQueue.length === 0 && this.onEndCallback) {
            this.onEndCallback();
        }
    }

    // 添加音频数据到队列（立即播放）
    addChunk(audioData, sampleRate = 24000, channels = 1) {
        if (!this.isPlaying && !this.isPaused) {
            this.start();
        }

        this.audioQueue.push({
            data: audioData,
            sampleRate: sampleRate,
            channels: channels
        });

        // 如果当前没有在处理队列，开始处理
        if (!this.processingPromise) {
            this.processingPromise = this.processQueue().finally(() => {
                this.processingPromise = null;
            });
        }
    }

    // 开始播放
    async start() {
        if (this.isPlaying) return;

        await this.init();
        this.isPlaying = true;
        this.isPaused = false;
        this.nextStartTime = this.audioContext.currentTime;
        this.processedChunks = 0;

        // 开始处理队列
        if (this.audioQueue.length > 0 && !this.processingPromise) {
            this.processingPromise = this.processQueue().finally(() => {
                this.processingPromise = null;
            });
        }
    }

    // 暂停播放
    pause() {
        if (!this.isPlaying || this.isPaused) return;

        this.isPaused = true;
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
        }

        // 暂停音频上下文
        if (this.audioContext) {
            this.audioContext.suspend();
        }
    }

    // 恢复播放
    async resume() {
        if (!this.isPlaying || !this.isPaused) return;

        this.isPaused = false;

        // 恢复音频上下文
        if (this.audioContext) {
            await this.audioContext.resume();
        }

        // 重新计算播放时间
        this.nextStartTime = this.audioContext.currentTime;

        // 继续处理队列
        if (this.audioQueue.length > 0 && !this.processingPromise) {
            this.processingPromise = this.processQueue().finally(() => {
                this.processingPromise = null;
            });
        }
    }

    // 停止播放
    stop() {
        this.isPlaying = false;
        this.isPaused = false;

        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
        }

        this.audioQueue = [];
        this.totalChunks = 0;
        this.processedChunks = 0;
        this.nextStartTime = 0;

        if (this.processingPromise) {
            // 清空处理中的Promise
            this.processingPromise = null;
        }

        // 重置音频上下文
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.onEndCallback()
    }

    // 设置音频参数
    setAudioParams(sampleRate, channels = 1) {
        this.sampleRate = sampleRate;
        this.channels = channels;
    }

    // 设置总块数（用于进度计算）
    setTotalChunks(total) {
        this.totalChunks = total;
    }
}

class LepiSmartAudio extends EventEmitter {
    constructor(runtime) {
        super();
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.commandResult = ''
        this.recognitionEnd = false;
        this.recognitionResult = '';
        this.audio = document.createElement('audio')
        this.audio.display = 'none'
        this.audio.autoplay = false
        this.tts_busy = false
        this.hotwordList = []
        this.model_dir = `/home/pi/Lepi_Data/ros/smart_audio_node/resources/models`
        // 创建新的播放器实例
        this.player = null;

        if (this.runtime.ros && this.runtime.ros.isConnected()) {
            this.subHotwordDetect()
            this.updateHotwordList()
        }
        this.runtime.on('LEPI_CONNECTED', () => {
            this.subHotwordDetect()
            this.updateHotwordList()
        })

        this.runtime.on('PROJECT_RUN_STOP', () => {
            if (this.runtime.ros && this.runtime.ros.isConnected()) {
                this.runtime.ros.stopSpeak()
                this.toggleHotwordDetect({ ACTION: 'close' })
            }
            this.StopSpeak()
        });

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
            id: 'lepiSmartAudio',
            name: formatMessage({
                id: 'lepi.lepiSmartAudio',
                default: '智能语音',
            }),
            // menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            // showStatusButton: true,
            blocks: [
                {
                    opcode: 'SpeechRecognitionEnd',
                    text: formatMessage({
                        id: 'lepi.SpeechRecognitionEnd',
                        default: '识别到语音?',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'SpeechRecognitionResult',
                    text: formatMessage({
                        id: 'lepi.SpeechRecognitionResult',
                        default: '语音识别结果',
                    }),
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: 'SpeechRecognitionOnline',
                    text: formatMessage({
                        id: 'lepi.SpeechRecognitionOnline',
                        default: '在线语音识别',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'SpeechRecognitionOnlineStream',
                    text: formatMessage({
                        id: 'lepi.SpeechRecognitionOnlineStream',
                        default: '在线语音识别(流式)',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'TTSOnline',
                    text: formatMessage({
                        id: 'lepi.TTSOnline',
                        default: '在线语音朗读[TEXT], 音色[VOICE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.hello',
                                default: '你好',
                            })
                        }, VOICE: {
                            type: ArgumentType.STRING,
                            menu: 'coze_voices',
                            defaultValue: '7426725529589596187'
                        }
                    }
                },
                {
                    opcode: 'TTSOnlineStream',
                    text: formatMessage({
                        id: 'lepi.TTSOnlineStream',
                        default: '在线语音朗读(流式)[TEXT], 音色[VOICE]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.hello',
                                default: '你好',
                            })
                        }, VOICE: {
                            type: ArgumentType.STRING,
                            menu: 'coze_voices',
                            defaultValue: '7426725529589596187'
                        }
                    }
                },
                {
                    opcode: 'SpeakEnd',
                    text: formatMessage({
                        id: 'lepi.SpeakEnd',
                        default: '朗读结束?',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'StopTTSOnline',
                    text: formatMessage({
                        id: 'lepi.StopTTSOnline',
                        default: '停止在线语音朗读',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'TTSOnlineSave',
                    text: formatMessage({
                        id: 'lepi.TTSOnlineSave',
                        default: '在线语音合成[TEXT], 音色[VOICE], 保存为[FILE_NAME].mp3',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.hello',
                                default: '你好',
                            })
                        }, VOICE: {
                            type: ArgumentType.STRING,
                            menu: 'coze_voices',
                            defaultValue: '7426725529589596187'
                        },
                        FILE_NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: '-'
                        }
                    }
                },
                '---',
                {
                    opcode: 'LocalSpeechRecognition',
                    text: formatMessage({
                        id: 'lepi.LocalSpeechRecognition',
                        default: '电脑离线语音识别',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'SpeakOffline',
                    text: formatMessage({
                        id: 'lepi.SpeakOffline',
                        default: '电脑离线语音朗读[TEXT], 发音人[SPEAKER], 音量[VOLUME] 速度[RATE] 音调[PITCH]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.hello',
                                default: '你好',
                            })
                        }, SPEAKER: {
                            type: ArgumentType.STRING,
                            menu: 'speakers',
                        }, VOLUME: {
                            type: ArgumentType.STRING,
                            defaultValue: 100
                        }, RATE: {
                            type: ArgumentType.STRING,
                            defaultValue: 10
                        }, PITCH: {
                            type: ArgumentType.STRING,
                            defaultValue: 50
                        },
                    }
                },

                {
                    opcode: 'StopSpeak',
                    text: formatMessage({
                        id: 'lepi.StopSpeak',
                        default: '停止离线语音朗读',
                    }),
                    blockType: BlockType.COMMAND,
                },
                '---',
                {
                    opcode: 'SpeechRecognitionOffline',
                    text: formatMessage({
                        id: 'lepi.SpeechRecognitionOffline',
                        default: '离线语音识别',
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'Text2Pinyin',
                    text: formatMessage({
                        id: 'lepi.Text2Pinyin',
                        default: '汉字[TEXT]转拼音[TONE]',
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: '中文'
                        },
                        TONE: {
                            type: ArgumentType.STRING,
                            menu: 'tone',
                            defaultValue: 'none'
                        },
                    }
                },
                // {
                //     opcode: 'SpeechRecognitionConfidence',
                //     text: '语音识别置信度',
                //     blockType: BlockType.REPORTER,
                // },
                {
                    opcode: 'TTSOffline',
                    text: formatMessage({
                        id: 'lepi.TTSOffline',
                        default: '离线语音朗读[TEXT], [WAIT]读完',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: formatMessage({
                                id: 'lepi.hello',
                                default: '你好',
                            })
                        }, WAIT: {
                            type: ArgumentType.STRING,
                            menu: 'wait',
                            defaultValue: 1
                        },
                    }
                },
                '---',
                {
                    opcode: 'toggleHotwordDetect',
                    text: formatMessage({
                        id: 'lepi.toggleHotwordDetect',
                        default: '[ACTION] 关键词检测',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ACTION: {
                            type: ArgumentType.STRING,
                            menu: 'action',
                            defaultValue: 'open'
                        }
                    }
                },
                {
                    opcode: 'isHotwordDetect',
                    text: formatMessage({
                        id: 'lepi.isHotwordDetect',
                        default: '检测到关键词?',
                    }),
                    blockType: BlockType.BOOLEAN,
                },
                {
                    opcode: 'switchHotwordModel',
                    text: formatMessage({
                        id: 'lepi.switchHotwordModel',
                        default: '切换关键词模型[HOTWORD]',
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        HOTWORD: {
                            type: ArgumentType.STRING,
                            menu: 'hotword'
                        }
                    }
                },
            ],
            menus: {
                name: Menu.formatMenu([formatMessage({
                    id: 'lepi.female',
                    default: '女声',
                }), formatMessage({
                    id: 'lepi.male',
                    default: '男声',
                })]),
                wait: Menu.formatMenu([formatMessage({
                    id: 'lepi.no_wait',
                    default: '不等待',
                }), formatMessage({
                    id: 'lepi.wait',
                    default: '等待',
                })]),
                action: Menu.formatMenu3([formatMessage({
                    id: 'lepi.close',
                    default: '关闭',
                }), formatMessage({
                    id: 'lepi.open',
                    default: '打开',
                })], ['close', 'open']),
                tone: Menu.formatMenu3([formatMessage({
                    id: 'lepi.withTone',
                    default: '带声调',
                }), formatMessage({
                    id: 'lepi.noTone',
                    default: '不带声调',
                })], ['num', 'none']),
                speakers: 'formatSpeakerList',
                grammer: 'formatGrammerList',
                hotword: 'formatHotwordList',
                coze_voices: voices
            },

        };
    }

    async updateHotwordList() {
        let ip = this.runtime.vm.LEPI_IP
        if (ip) {
            let data = await this.runtime.ros.getFileList(this.model_dir)
            let files = data.files.filter(file => file.endsWith('.umdl') || file.endsWith('.pmdl'))
            this.hotwordList = files
            return Promise.resolve(files.join(','))
        } else {
            return formatMessage({
                id: 'lepi.msg.lepi not connected',
                default: 'lepi not connected',
            })
        }
    }

    formatHotwordList() {
        return Menu.formatMenu3(this.hotwordList.map(filename => {
            if (filename.endsWith('.umdl')) {
                return filename.replace('.umdl', '')
            } else {
                return filename.replace('.pmdl', '')
            }
        }), this.hotwordList)
    }

    subHotwordDetect() {
        console.log('LEPI_CONNECTED', 'subHotwordDetect')
        let callback = (hotword) => {
            console.log(hotword)
            this.hotwordDetected = true
        }
        this.runtime.ros.subHotwordDetect(callback)
    }

    isHotwordDetect() {
        if (this.hotwordDetected) {
            this.hotwordDetected = false
            return true
        } else {
            return false
        }
    }

    toggleHotwordDetect(args, util) {
        let action = args.ACTION
        return this.runtime.ros.toggleHotwordDetect(action)
    }

    switchHotwordModel(args) {
        var file_name = args.HOTWORD
        return this.runtime.ros.switchHotwordModel(file_name)
    }


    detectCommand(args, util) {
        let length = args.LEN
        return new Promise(resolve => {
            this.runtime.ros.detectCommand('' + length).then(result => {
                console.log(result)
                this.commandResult = result.data
                resolve(result.data)
            })
        })
    }

    detectedCommand() {
        return this.commandResult
    }

    TTSOffline(args, util) {
        // console.log(this.joyState)
        let text = args.TEXT
        text = text.toString()
        let wait = parseInt(args.WAIT)
        text = text.trim()
        if (text.length == 0) {
            return
        }

        if (wait == 0) {
            this.runtime.ros.TTSOffline(text)
            return
        } else {
            return this.runtime.ros.TTSOffline(text)
        }
    }


    SpeechRecognitionOffline() {
        this.recognitionEnd = false
        this.recognitionResult = ''
        return new Promise(resolve => {
            this.runtime.ros.detectCommand().then(result => {
                this.recognitionResult = result.data
                if (result.data.length > 0) {
                    this.recognitionEnd = true
                }
                resolve(result.data)
            })
        })
    }
    SpeechRecognitionEnd() {
        if (this.recognitionResult && this.recognitionResult.length > 0) {
            return true
        } else {
            return false
        }
    }
    SpeechRecognitionResult() {
        return this.recognitionResult
    }
    Text2Pinyin(args) {
        return pinyin(args.TEXT, { toneType: args.TONE })
    }
    SpeechRecognitionConfidence() {
        return parseInt(this.recognitionConfidence * 100)
    }
    formatSpeakerList() {
        try {
            window.speechSynthesis.getVoices().map(item => {
                if (item.localService) {
                    voicesMap[item.name] = item
                }
                // console.log(item, item.localService, voicesMap)
            })
        } catch (error) {
            console.log(error)
        }

        // console.log(window.speechSynthesis.getVoices(), voicesMap)
        return Menu.formatMenu2(Object.keys(voicesMap))
    }

    onRecognitionResult(text) {
        if (text && text.length > 0) {
            this.recognitionResult = text
            this.recognitionEnd = true
        }
    }

    async LocalSpeechRecognition(args, util) {

        if (this.runtime.ros && this.runtime.ros.isConnected() && (this.runtime.vm.ros.ip == 'localhost' || this.runtime.vm.ros.ip == '127.0.0.1')) {
            // On Lepi
            return this.SpeechRecognitionOffline()
        }

        // if (navigator.userAgent.indexOf("Electron") >= 0) {
        if (location.host == "appassets.androidplatform.net") {
            await startAudioRecognize(this.onRecognitionResult.bind(this))
            return Promise.resolve(this.recognitionResult)
        } else {
            this.recognitionEnd = false
            this.recognitionResult = ''
            this.recognitionResult = await startRecognition()
            this.recognitionEnd = true
            return this.recognitionResult
        }
    }

    async SpeakOffline(args) {

        if (!this.SpeakEnd()) {
            return
        }

        if (this.runtime.ros && this.runtime.ros.isConnected() && (this.runtime.vm.ros.ip == 'localhost' || this.runtime.vm.ros.ip == '127.0.0.1')) {
            // On Lepi
            let text = args.TEXT.trim()
            if (text.length == 0) {
                return
            }
            return this.runtime.ros.TTSOffline(text)
        }

        try {
            let msg = new SpeechSynthesisUtterance();

            // Set the text.
            msg.text = args.TEXT;

            // Set the attributes.
            msg.volume = parseFloat(args.VOLUME) / 100;
            msg.rate = parseFloat(args.RATE) / 10;
            msg.pitch = parseFloat(args.PITCH) / 100 * 2;
            if (voicesMap[args.SPEAKER]) {
                msg.voice = voicesMap[args.SPEAKER];
            }
            window.speechSynthesis.speak(msg);
            while (window.speechSynthesis.speaking == true) {
                await delay_ms(100)
            }
        } catch (error) {
            console.log(error)
        }

    }

    async SpeakOfflineWait(args) {

        this.SpeakOffline(args)
        while (window.speechSynthesis.speaking == true) {
            await delay_ms(100)
        }

    }

    SpeakEnd() {
        if (this.tts_busy) {
            return false
        } else {
            return window.speechSynthesis.speaking == false
        }
    }

    StopSpeak() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel()
        }
    }

    SpeechRecognitionOnline() {
        return new Promise(resolve => {
            this.recognitionEnd = false
            this.recognitionResult = ''
            requestMicrophone((text) => {
                this.recognitionResult = text
                if (text.length > 0) {
                    this.recognitionEnd = true
                }
                resolve()
            })
        })
    }
    SpeechRecognitionOnlineStream() {
        return new Promise(async (resolve) => {
            this.recognitionEnd = false
            this.recognitionResult = ''
            await this.requestMicrophoneWS()
            resolve()
        })
    }

    async requestMicrophoneWS() {
        // 如果当前正在录音 -> 手动停止录音
        if (isRecording) {
            // console.log("手动停止录音 (用户点击停止)");
            // await stopRecordingAndSave("manual");
            return;
        }

        // 如果不存在麦克风流，先请求权限
        if (!mediaStream || !mediaStream.active) {
            const granted = await requestMicrophoneAndInit();
            if (!granted) return;
        } else {
            // 已经有麦克风，但是可能audioContext挂起，恢复一下
            if (audioContext && audioContext.state === 'suspended') {
                await audioContext.resume();
            }
        }

        // 确保没有任何旧录音分析残留，清理之前的音量检测定时器
        if (silenceTimeout) {
            clearTimeout(silenceTimeout);
            silenceTimeout = null;
        }
        // 开始新的录音
        await this.startRecordingWS();
    }

    async startRecordingWS() {
        if (!mediaStream) {
            console.log("错误: 麦克风流不存在，请先请求麦克风", true);
            return false;
        }
        if (isRecording) {
            console.log("已有正在进行的录音，请先停止");
            return false;
        }

        const url = `wss://agent.jszcai.com/stream-audio/v1/audio/transcriptions`;
        const ws = new WebSocket(url);

        ws.addEventListener('open', () => {
            console.log('Connected to server.');

        });

        ws.addEventListener('message', (message) => {
            let msg = JSON.parse(message.data.toString())
            console.log(msg);
            if (msg.event_type == 'transcriptions.created') {
                let format = {
                    "id": crypto.randomUUID(),
                    "event_type": "transcriptions.update",
                    "data": {
                        "input_audio": {
                            "format": "pcm",
                            "codec": "pcm",
                            "sample_rate": 48000,
                            "channel": 1,
                            "bit_depth": 16
                        }
                    }
                }
                ws.send(JSON.stringify(format))
            }
            if (msg.event_type == 'transcriptions.message.update') {
                this.recognitionResult = msg.data.content
            }
            if (msg.event_type === 'transcriptions.message.completed') {
                ws.close()
            }
            // event_type: 'transcriptions.created'
        });
        let resolver; // 1. 在外部定义一个变量来保存 resolve 函数

        const myPromise = new Promise((resolve) => {
            resolver = resolve; // 2. 将 Promise 内部的 resolve 赋值给外部变量
        });
        // 重置录音数据块
        audioChunks = [];
        recordingStartTime = Date.now();

        // 重新连接音频分析器 (音量检测)
        if (audioContext && mediaStream) {
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            // 断开旧的 source 再建新连接
            if (sourceNode) {
                try { sourceNode.disconnect(); } catch (e) { }
            }

            sourceNode = audioContext.createMediaStreamSource(mediaStream);

            // 创建 ScriptProcessorNode 用于捕获 PCM 数据
            const bufferSize = 4096; // 缓冲区大小
            scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);

            // 创建分析器节点用于音量检测
            analyserNode = audioContext.createAnalyser();
            analyserNode.fftSize = 256;

            // 连接节点: source -> analyser -> scriptProcessor -> destination (不连接destination避免回声)
            sourceNode.connect(analyserNode);
            analyserNode.connect(scriptProcessor);
            // 不连接到 destination，避免播放音频

            // 重要：scriptProcessor 必须连接到 destination 才能触发 onaudioprocess
            // 如果不想听到声音，可以创建一个静音的 GainNode
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0; // 静音
            scriptProcessor.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // 存储 PCM 数据的数组
            let pcmData = [];
            let isFirstChunk = true;

            // 处理音频数据
            scriptProcessor.onaudioprocess = (event) => {
                if (!isRecording) return;

                const inputData = event.inputBuffer.getChannelData(0);
                const sampleRate = event.inputBuffer.sampleRate;

                // 将 Float32Array 转换为 Int16Array (PCM 16-bit)
                const int16Data = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    // 将 -1.0 到 1.0 的浮点数转换为 -32768 到 32767 的整数
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // 存储 PCM 数据
                pcmData.push(int16Data);

                // 每200ms发送一次数据块到 WebSocket
                if (isFirstChunk || pcmData.length * bufferSize >= sampleRate * 0.2) {
                    isFirstChunk = false;
                    const totalLength = pcmData.reduce((acc, arr) => acc + arr.length, 0);
                    const combinedData = new Int16Array(totalLength);
                    let offset = 0;
                    for (const arr of pcmData) {
                        combinedData.set(arr, offset);
                        offset += arr.length;
                    }
                    // 转换为 Base64 并发送 combinedData.toString('base64') //
                    const base64Data = int16ArrayToBase64(combinedData);
                    const data = {
                        "id": crypto.randomUUID(),
                        "event_type": "input_audio_buffer.append",
                        "data": {
                            "delta": base64Data,
                        }
                    };
                    // console.log(data, sampleRate)
                    console.log(`📦 发送音频数据块: ${(combinedData.byteLength / 1024).toFixed(1)}KB`);
                    ws.send(JSON.stringify(data));

                    // 清空缓冲区
                    pcmData = [];
                }
            };

            let stopRecordingWS = async (stopType = "manual") => {
                console.log(`停止录音，类型: ${stopType}`);

                if (scriptProcessor) {
                    try {
                        // 断开所有连接
                        scriptProcessor.disconnect();
                        if (gainNode) gainNode.disconnect();
                        scriptProcessor.onaudioprocess = null;
                    } catch (e) {
                        console.error('断开scriptProcessor失败:', e);
                    }
                }

                isRecording = false;
                isStoppingManually = false;

                // 清除静音超时
                if (silenceTimeout) clearTimeout(silenceTimeout);
                silenceTimeout = null;

                // 清理音频节点
                try {
                    if (analyserNode) analyserNode.disconnect();
                    if (sourceNode) sourceNode.disconnect();
                } catch (e) {
                    console.error('清理音频节点失败:', e);
                }
            };

            isAnalyserSetup = true;

            // 启动音量检测循环
            let lastNotSilentTime = Date.now();
            let hasDetectedSpeech = false;

            const detectVolume = () => {
                if (!isRecording || !analyserNode || !isAnalyserSetup) return;

                try {
                    const dataArrayLocal = new Uint8Array(analyserNode.frequencyBinCount);
                    analyserNode.getByteTimeDomainData(dataArrayLocal);
                    let sumSquares = 0;
                    for (let i = 0; i < dataArrayLocal.length; i++) {
                        let v = (dataArrayLocal[i] - 128) / 128;
                        sumSquares += v * v;
                    }
                    let rms = Math.sqrt(sumSquares / dataArrayLocal.length);
                    const currentVolume = rms;

                    if (currentVolume > SILENCE_THRESHOLD) {
                        lastNotSilentTime = Date.now();
                        if (!hasDetectedSpeech) {
                            hasDetectedSpeech = true;
                            console.log(`🗣️ 检测到语音输入 (音量:${currentVolume.toFixed(4)})`);
                        }
                        if (silenceTimeout) {
                            clearTimeout(silenceTimeout);
                            silenceTimeout = null;
                        }
                    } else {
                        if (hasDetectedSpeech && isRecording) {
                            if (!silenceTimeout) {
                                silenceTimeout = setTimeout(() => {
                                    if (isRecording && hasDetectedSpeech) {
                                        console.log(`🤫 检测到持续静音 ${SILENCE_DELAY_MS / 1000} 秒，自动停止录音`);
                                        // 发送结束标志
                                        let end_message = {
                                            "id": crypto.randomUUID(),
                                            "event_type": "input_audio_buffer.complete"
                                        }
                                        ws.send(JSON.stringify(end_message))
                                        stopRecordingWS("auto");
                                        this.recognitionEnd = true
                                        resolver()
                                    }
                                    silenceTimeout = null;
                                }, SILENCE_DELAY_MS);
                            }
                        }
                    }
                } catch (e) {
                    // 忽略错误
                }

                if (isRecording) {
                    setTimeout(detectVolume, 200);
                }
            };

            setTimeout(detectVolume, 200);
            isRecording = true;
            console.log("🎙️ 录音中 · 正在聆听 ... (说完后自动停止)", true);
            console.log("开始录音，启用智能静音检测 (1.8秒停顿自动结束)");

        } else {
            console.log("警告: 音频上下文未初始化，无法进行录音", true);
        }
        return myPromise
    }
    // curl -o text-to-audio.mp3 -X POST 'http://agent.jszcai.com/v1/text-to-audio' \
    // --header 'Authorization: Bearer {api_key}' \
    // --header 'Content-Type: application/json' \
    // --data-raw '{
    //   "text": "Hello Dify",
    //   "user": "abc-123",
    // }'
    async TTSOnline(args) {
        let text = args.TEXT.trim()
        let voice_id = args.VOICE
        if (text.length == 0 || this.tts_busy) {
            return
        } else {
            this.tts_busy = true
        }
        try {
            let response = await axios.post(tts_url, { text: JSON.stringify({ text, voice_id }), "user": "lepi scratch client" }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'blob'
            })
            console.log(response)

            return new Promise(resolve => {
                let src = URL.createObjectURL(response.data)
                this.audio.src = src
                this.audio.play()
                this.audio.onended = () => {
                    URL.revokeObjectURL(src)
                    this.tts_busy = false
                    resolve()
                }
                this.audio.onpause = () => {
                    URL.revokeObjectURL(src)
                    this.tts_busy = false
                    resolve()
                }
            })

        } catch (error) {
            console.log(error)
        }
    }

    async TTSOnlineStream(args) {
        let text = args.TEXT.trim()
        let voice_id = args.VOICE
        if (text.length == 0 || this.tts_busy) {
            return
        } else {
            this.tts_busy = true
        }
        return new Promise(resolve => {
            // 停止当前播放
            // if (this.player) {
            //     this.player.stop();
            // }


            this.player = new StreamingTTSPlayer()

            // 设置回调
            this.player.onProgress((progress, processed, total) => {
                // console.log(progress, processed, total);
            });

            this.player.onEnd(() => {
                console.log('播放完成');
                this.tts_busy = false
                resolve()
            });

            this.player.onError((error) => {
                console.error('播放错误:', error);
                console.log(`错误: ${error.message}`);
            });

            let chunkCount = 0;

            const url = `wss://agent.jszcai.com/stream-audio/v1/audio/speech`;
            const ws = new WebSocket(url);

            ws.addEventListener('open', () => {
                console.log('Connected to server.');

            });

            ws.addEventListener('close', () => {
                console.log('Connection closed.');
            });

            ws.addEventListener('message', (message) => {
                let msg = JSON.parse(message.data.toString())
                // console.log(msg);
                if (msg.event_type == 'speech.created') {
                    let format = {
                        "id": crypto.randomUUID(),
                        "event_type": "speech.update",
                        "data": {
                            "output_audio": { "codec": "pcm", "voice_id": voice_id }
                        },
                    }
                    ws.send(JSON.stringify(format))
                    // 发送文本内容
                    let content = {
                        "id": crypto.randomUUID(),
                        "event_type": "input_text_buffer.append",
                        "data": { "delta": text },
                    }
                    ws.send(JSON.stringify(content))

                    // 完成输入
                    let complete = {
                        "id": crypto.randomUUID(),
                        "event_type": "input_text_buffer.complete",
                    }
                    ws.send(JSON.stringify(complete))

                }
                if (msg.event_type == 'speech.audio.update') {
                    if (!this.tts_busy) {
                        ws.close()
                    } else {
                        chunkCount++
                        // 处理base64音频片段
                        let b64 = msg.data.delta
                        let value = base64ToArrayBuffer(b64)
                        // console.log(b64,value)
                        // 立即添加到播放队列
                        this.player.addChunk(value, 24000, 1);
                    }
                }
                if (msg.event_type === 'speech.audio.completed') {
                    this.player.setTotalChunks(chunkCount)
                    ws.close()
                }
                // event_type: 'transcriptions.created'
            });
        })


    }

    StopTTSOnline() {
        if (this.tts_busy) {
            this.audio.pause()
        }
        if (this.player) {
            this.tts_busy = false
            this.player.stop()
        }
    }

    async TTSOnlineSave(args, util) {
        let text = args.TEXT.trim()
        let voice_id = args.VOICE
        let file_name = args.FILE_NAME
        if (file_name == '-') {
            file_name = text
        }

        if (text.length == 0) {
            return
        }
        try {
            let response = await axios.post(tts_url, { text: JSON.stringify({ text, voice_id }), "user": "lepi scratch client" }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'blob'
            })
            console.log(response)
            return new Promise(resolve => {
                let audioURL = URL.createObjectURL(response.data);
                // this.audio.src = this.recordingURL;
                // this.audio.play()


                if (!(this.runtime.ros && this.runtime.ros.isConnected())) {
                    // 创建一个 a 标签，并设置 href 和 download 属性
                    const el = document.createElement('a');
                    // 设置 href 为图片经过 base64 编码后的字符串，默认为 png 格式
                    el.href = audioURL;
                    el.download = file_name + ".mp3";
                    el.click()
                    resolve('下载本地')
                } else {
                    this.saveAudio(response.data, file_name).then((msg) => {
                        resolve(msg)
                    })
                }
            })
        } catch (error) {
            console.log(error)
        }

    }

    saveAudio(blob, file_name) {

        return new Promise(resolve => {
            var reader = new FileReader();
            reader.onload = (e) => {
                this.runtime.ros.saveFileData(file_name + ".mp3", e.target.result);
                resolve('保存主机成功')
            }
            reader.readAsDataURL(blob);
        })
    }
}


(() => {
    const Blockly = document.Blockly
    if (!(Blockly && Blockly.Python)) {
        console.log('Blockly.Python not defined')
        return
    }
    const prefix = 'lepiFaceRecognize_'
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

module.exports = LepiSmartAudio;