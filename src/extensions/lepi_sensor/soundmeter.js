var initiated = false;
var audioContext = null;
var mediaStreamSource = null;
var rafID = null;
var GuiScaling = 0x1;
var lineWidth = 0x1;
var meterRange = 0x82;
var readoutElement;
var averageElement;
var holdMaxElement;
var averageLabelElement;
var holdMaxLabelElement;
var startedMetering = ![];

function didntGetStream() {
    initiated = false;
    alert('Could not get permission to use microphone.');
}

function gotStream(t) {
    mediaStreamSource = audioContext.createMediaStreamSource(t);
    var u = createAudioMeter(audioContext, ![]);
    mediaStreamSource.connect(u);
    drawLoop();
}

function decode(v, w) {
    try {
        audioContext.decodeAudioData(v, function (x) {
            ResetAll();
            volumeAudioProcess(x);
            fileProgress.push(0x0);
            fileProgress[fileProgress.length - 0x1] = 0x1;
            printLoudnessFromFile(w);
        }, function () {
            fileProgress.push(0x0);
            fileProgress[fileProgress.length - 0x1] = 0x1;
            alert('Error decoding: ' + w.name);
        });
    } catch (y) {
        alert('Decoding error: ' + y.message);
    }
}

function updateReadout(ao, ap, aq) {
    ap += meterRange;
    if (ap < 0x0) {
        ao.innerText = '-';
    } else {
        var ar = Number(ap).toFixed(0x0);
        if (!isNaN(ap)) {
            if (aq) {
                ao.innerText = ar + ' dB';
                if (ar <= 40) {
                    ao.style.background = "lightgreen";
                } else if (ar > 40 && ar <= 50) {
                    ao.style.background = "lightblue";
                } else if (ar > 50 && ar <= 60) {
                    ao.style.background = "#f5c875";
                } else {
                    ao.style.background = "#fba5a5";
                }
            } else {
                ao.innerText = Number(ap).toFixed(0x1);
            }
        } else {
            ao.innerText = '-';
        }
    }
}

function drawLoop() {
    // get calibration value
    let calibrationValue = eval(localStorage.getItem('calibration-value')) || 0;
    updateReadout(readoutElement, values.volume + calibrationValue, !![]);
    updateReadout(holdMaxElement, values.volumeMax + calibrationValue, ![]);
    updateReadout(averageElement, values.volumeAveraged + calibrationValue, ![]);
    rafID = window.requestAnimationFrame(drawLoop);
}

var readFromBuffer;
var envelopeObject;
var averageVolumeObject;
var loudnessObject;
var integratedObject;
var maxVolumeObject;
var maxMomentaryObject;
var maxShortObject;
var RefreshRate;
var RefreshCount = 0x0;
var fileProgress;
var pauseMeasurements = ![];
var aWeightFilerArray = null;
var values = {};
values.momentaryLoudness = -0xc8;
values.shortTermLoudness = -0xc8;
values.integratedLoudness = -0xc8;
values.volumeMax = -0xc8;
values.momentaryLoudnessMax = -0xc8;
values.shortTermLoudnessMax = -0xc8;
values.volumeAveraged = -0xc8;

class Delay {
    constructor() {
        this.buffer = new Array();
        this.n = 0x0;
        this.prevDelaySize = 0x0;
    }

    ['resize_array'](aK, aL) {
        while (aK > this.buffer['length']) {
            this.buffer['push'](aL);
        }
        this.buffer['length'] = aK;
    }

    ['delay_in_samples'](aM, aN) {
        if (this.prevDelaySize != aN) {
            this.resize_array(aN, 0x0);
            this.prevDelaySize = aN;
            for (var aO = 0x0; aO < aN; aO++) this.buffer[aO] = 0x0;
        }
        this.buffer[this.n] = aM;
        this.n++;
        if (this.n >= aN) {
            this.n = 0x0;
        }
        return this.buffer[this.n];
    }

    ['reset']() {
        for (var aP = 0x0; aP < this.buffer['length']; aP++) {
            this.buffer[aP] = 0x0;
        }
    }
}

class MovingAverage {
    constructor() {
        this.delayObject = new Delay();
        this.out = 0x0;
        this.samplesize = 0x0;
    }

    ['average'](aQ) {
        var aR = this.delayObject['delay_in_samples'](aQ, this.samplesize);
        this.out = this.out + aQ - aR;
        return this.out / this.samplesize;
    }

    ['setup_moving_average'](aS, aT) {
        this.samplesize = aS * aT * 0.001;
        this.reset();
    }

    ['setup_moving_average_no_reset'](aU, aV) {
        var aW = this.samplesize;
        this.samplesize = aU * aV * 0.001;
        if (aW != this.samplesize) {
            this.reset();
        }
    }

    ['reset']() {
        this.delayObject.reset();
        this.out = 0x0;
    }
}

class AWeightFilter {
    constructor() {
        this.biquad_one_coeffs_48kHz = {};
        this.biquad_one_coeffs_48kHz['fs'] = 0xbb80;
        this.biquad_one_coeffs_48kHz['a1'] = -1.34730722798;
        this.biquad_one_coeffs_48kHz['a2'] = 0.34905752979;
        this.biquad_one_coeffs_48kHz['b0'] = 0.96525096525;
        this.biquad_one_coeffs_48kHz['b1'] = -1.34730163086;
        this.biquad_one_coeffs_48kHz['b2'] = 0.38205066561;
        this.biquad_two_coeffs_48kHz = {};
        this.biquad_two_coeffs_48kHz['fs'] = 0xbb80;
        this.biquad_two_coeffs_48kHz['a1'] = -1.89387049481;
        this.biquad_two_coeffs_48kHz['a2'] = 0.89515976917;
        this.biquad_two_coeffs_48kHz['b0'] = 0.94696969696;
        this.biquad_two_coeffs_48kHz['b1'] = -1.89393939393;
        this.biquad_two_coeffs_48kHz['b2'] = 0.94696969696;
        this.biquad_three_coeffs_48kHz = {};
        this.biquad_three_coeffs_48kHz['fs'] = 0xbb80;
        this.biquad_three_coeffs_48kHz['a1'] = -1.34730722798;
        this.biquad_three_coeffs_48kHz['a2'] = 0.34905752979;
        this.biquad_three_coeffs_48kHz['b0'] = 0.6466654281;
        this.biquad_three_coeffs_48kHz['b1'] = -0.38362237137;
        this.biquad_three_coeffs_48kHz['b2'] = -0.26304305672;
        this.biquad_one_coeffs = {};
        this.biquad_one_coeffs['fs'] = 0x0;
        this.biquad_one_coeffs['a1'] = 0x0;
        this.biquad_one_coeffs['a2'] = 0x0;
        this.biquad_one_coeffs['b0'] = 0x0;
        this.biquad_one_coeffs['b1'] = 0x0;
        this.biquad_one_coeffs['b2'] = 0x0;
        this.biquad_two_coeffs = {};
        this.biquad_two_coeffs['fs'] = 0x0;
        this.biquad_two_coeffs['a1'] = 0x0;
        this.biquad_two_coeffs['a2'] = 0x0;
        this.biquad_two_coeffs['b0'] = 0x0;
        this.biquad_two_coeffs['b1'] = 0x0;
        this.biquad_two_coeffs['b2'] = 0x0;
        this.biquad_three_coeffs = {};
        this.biquad_three_coeffs['fs'] = 0x0;
        this.biquad_three_coeffs['a1'] = 0x0;
        this.biquad_three_coeffs['a2'] = 0x0;
        this.biquad_three_coeffs['b0'] = 0x0;
        this.biquad_three_coeffs['b1'] = 0x0;
        this.biquad_three_coeffs['b2'] = 0x0;
        this.one_in1 = 0x0;
        this.one_in2 = 0x0;
        this.one_out1 = 0x0;
        this.one_out2 = 0x0;
        this.one_out = 0x0;
        this.two_in1 = 0x0;
        this.two_in2 = 0x0;
        this.two_out1 = 0x0;
        this.two_out2 = 0x0;
        this.two_out = 0x0;
        this.three_in1 = 0x0;
        this.three_in2 = 0x0;
        this.three_out1 = 0x0;
        this.three_out2 = 0x0;
        this.three_out = 0x0;
    }

    ['biquad_get_ps'](aX, aY) {
        var aZ = aX.a1 - 0x2;
        var b3 = aX.a1;
        var b4 = -aX.a1 - 0x2;
        var b5 = aX.a2 - 0x1;
        var b6 = aX.a2 + 0x1;
        var b7 = -aX.a2 + 0x1;
        var b8 = b6 * aZ - b3 * b5;
        var b9 = (b6 * b4 - b3 * b7) / b8;
        var ba = (aZ * b7 - b5 * b4) / b8;
        var bb = 0x1 + ba + b9;
        aY.k = Math.sqrt(b9);
        aY.q = aY.k / ba;
        aY.vb = 0.5 * bb * (aX.b0 - aX.b2) / ba;
        aY.vl = 0.25 * bb * (aX.b0 + aX.b1 + aX.b2) / b9;
        aY.vh = 0.25 * bb * (aX.b0 - aX.b1 + aX.b2);
    }

    ['biquad_requantize'](bc, bd) {
        if (bc.fs == bd.fs) {
            bd.a1 = bc.a1;
            bd.a2 = bc.a2;
            bd.b0 = bc.b0;
            bd.b1 = bc.b1;
            bd.b2 = bc.b2;
        } else {
            var be = {};
            be.k = 0x0;
            be.q = 0x0;
            be.vb = 0x0;
            be.vl = 0x0;
            be.vh = 0x0;
            var bf, bg, bh, bi;
            this.biquad_get_ps(bc, be);
            bf = Math.tan(bc.fs / bd.fs * Math.atan(be.k));
            bg = bf * bf;
            bh = bf / be.q;
            bi = 0x1 + bh + bg;
            bd.a1 = 0x2 * (bg - 0x1) / bi;
            bd.a2 = (0x1 - bh + bg) / bi;
            bd.b0 = (be.vh + be.vb * bh + be.vl * bg) / bi;
            bd.b1 = 0x2 * (be.vl * bg - be.vh) / bi;
            bd.b2 = (be.vh - be.vb * bh + be.vl * bg) / bi;
        }
    }

    ['biquad_one'](bj, bk) {
        this.one_out = bj * bk.b0 + this.one_in1 * bk.b1 + this.one_in2 * bk.b2 - this.one_out1 * bk.a1 - this.one_out2 * bk.a2;
        this.one_out2 = this.one_out1;
        this.one_out1 = this.one_out;
        this.one_in2 = this.one_in1;
        this.one_in1 = bj;
        return this.one_out;
    }

    ['biquad_two'](bl, bm) {
        this.two_out = bl * bm.b0 + this.two_in1 * bm.b1 + this.two_in2 * bm.b2 - this.two_out1 * bm.a1 - this.two_out2 * bm.a2;
        this.two_out2 = this.two_out1;
        this.two_out1 = this.two_out;
        this.two_in2 = this.two_in1;
        this.two_in1 = bl;
        return this.two_out;
    }

    ['biquad_three'](bn, bo) {
        this.three_out = bn * bo.b0 + this.three_in1 * bo.b1 + this.three_in2 * bo.b2 - this.three_out1 * bo.a1 - this.three_out2 * bo.a2;
        this.three_out2 = this.three_out1;
        this.three_out1 = this.three_out;
        this.three_in2 = this.three_in1;
        this.three_in1 = bn;
        return this.three_out;
    }

    ['perform_aweighting'](bp) {
        bp = this.biquad_one(bp, this.biquad_one_coeffs);
        bp = this.biquad_two(bp, this.biquad_two_coeffs);
        return this.biquad_three(bp, this.biquad_three_coeffs);
    }

    ['setup_aweight_filter'](bq) {
        this.biquad_one_coeffs['fs'] = bq;
        this.biquad_two_coeffs['fs'] = bq;
        this.biquad_three_coeffs['fs'] = bq;
        this.biquad_requantize(this.biquad_one_coeffs_48kHz, this.biquad_one_coeffs);
        this.biquad_requantize(this.biquad_two_coeffs_48kHz, this.biquad_two_coeffs);
        this.biquad_requantize(this.biquad_three_coeffs_48kHz, this.biquad_three_coeffs);
    }

    ['reset']() {
        this.in1 = 0x0;
        this.in2 = 0x0;
        this.out1 = 0x0;
        this.out2 = 0x0;
        this.out = 0x0;
        this.two_in1 = 0x0;
        this.two_in2 = 0x0;
        this.two_out1 = 0x0;
        this.two_out2 = 0x0;
        this.two_out = 0x0;
        this.three_in1 = 0x0;
        this.three_in2 = 0x0;
        this.three_out1 = 0x0;
        this.three_out2 = 0x0;
        this.three_out = 0x0;
    }
}

class KWeightFilter {
    constructor() {
        this.biquad_one_coeffs_48kHz = {};
        this.biquad_one_coeffs_48kHz['fs'] = 0xbb80;
        this.biquad_one_coeffs_48kHz['a1'] = -1.69065929318241;
        this.biquad_one_coeffs_48kHz['a2'] = 0.73248077421585;
        this.biquad_one_coeffs_48kHz['b0'] = 1.53512485958697;
        this.biquad_one_coeffs_48kHz['b1'] = -2.69169618940638;
        this.biquad_one_coeffs_48kHz['b2'] = 1.19839281085285;
        this.biquad_two_coeffs_48kHz = {};
        this.biquad_two_coeffs_48kHz['fs'] = 0xbb80;
        this.biquad_two_coeffs_48kHz['a1'] = -1.99004745483398;
        this.biquad_two_coeffs_48kHz['a2'] = 0.99007225036621;
        this.biquad_two_coeffs_48kHz['b0'] = 0x1;
        this.biquad_two_coeffs_48kHz['b1'] = -0x2;
        this.biquad_two_coeffs_48kHz['b2'] = 0x1;
        this.biquad_one_coeffs = {};
        this.biquad_one_coeffs['fs'] = 0x0;
        this.biquad_one_coeffs['a1'] = 0x0;
        this.biquad_one_coeffs['a2'] = 0x0;
        this.biquad_one_coeffs['b0'] = 0x0;
        this.biquad_one_coeffs['b1'] = 0x0;
        this.biquad_one_coeffs['b2'] = 0x0;
        this.biquad_two_coeffs = {};
        this.biquad_two_coeffs['fs'] = 0x0;
        this.biquad_two_coeffs['a1'] = 0x0;
        this.biquad_two_coeffs['a2'] = 0x0;
        this.biquad_two_coeffs['b0'] = 0x0;
        this.biquad_two_coeffs['b1'] = 0x0;
        this.biquad_two_coeffs['b2'] = 0x0;
        this.in1 = 0x0;
        this.in2 = 0x0;
        this.out1 = 0x0;
        this.out2 = 0x0;
        this.out = 0x0;
        this._in1 = 0x0;
        this._in2 = 0x0;
        this._out1 = 0x0;
        this._out2 = 0x0;
        this._out = 0x0;
    }

    ['biquad_get_ps'](br, bs) {
        var bt = br.a1 - 0x2;
        var bu = br.a1;
        var bv = -br.a1 - 0x2;
        var bw = br.a2 - 0x1;
        var bx = br.a2 + 0x1;
        var by = -br.a2 + 0x1;
        var bz = bx * bt - bu * bw;
        var bA = (bx * bv - bu * by) / bz;
        var bB = (bt * by - bw * bv) / bz;
        var bC = 0x1 + bB + bA;
        bs.k = Math.sqrt(bA);
        bs.q = bs.k / bB;
        bs.vb = 0.5 * bC * (br.b0 - br.b2) / bB;
        bs.vl = 0.25 * bC * (br.b0 + br.b1 + br.b2) / bA;
        bs.vh = 0.25 * bC * (br.b0 - br.b1 + br.b2);
    }

    ['biquad_requantize'](bD, bE) {
        if (bD.fs == bE.fs) {
            bE.a1 = bD.a1;
            bE.a2 = bD.a2;
            bE.b0 = bD.b0;
            bE.b1 = bD.b1;
            bE.b2 = bD.b2;
        } else {
            var bF = {};
            bF.k = 0x0;
            bF.q = 0x0;
            bF.vb = 0x0;
            bF.vl = 0x0;
            bF.vh = 0x0;
            var bG, bH, bI, bJ;
            this.biquad_get_ps(bD, bF);
            bG = Math.tan(bD.fs / bE.fs * Math.atan(bF.k));
            bH = bG * bG;
            bI = bG / bF.q;
            bJ = 0x1 + bI + bH;
            bE.a1 = 0x2 * (bH - 0x1) / bJ;
            bE.a2 = (0x1 - bI + bH) / bJ;
            bE.b0 = (bF.vh + bF.vb * bI + bF.vl * bH) / bJ;
            bE.b1 = 0x2 * (bF.vl * bH - bF.vh) / bJ;
            bE.b2 = (bF.vh - bF.vb * bI + bF.vl * bH) / bJ;
        }
    }

    ['biquad_one'](bK, bL) {
        this.out = bK * bL.b0 + this.in1 * bL.b1 + this.in2 * bL.b2 - this.out1 * bL.a1 - this.out2 * bL.a2;
        this.out2 = this.out1;
        this.out1 = this.out;
        this.in2 = this.in1;
        this.in1 = bK;
        return this.out;
    }

    ['biquad_two'](bM, bN) {
        this._out = bM * bN.b0 + this._in1 * bN.b1 + this._in2 * bN.b2 - this._out1 * bN.a1 - this._out2 * bN.a2;
        this._out2 = this._out1;
        this._out1 = this._out;
        this._in2 = this._in1;
        this._in1 = bM;
        return this._out;
    }

    ['perform_kweighting'](bO) {
        bO = this.biquad_one(bO, this.biquad_one_coeffs);
        return this.biquad_two(bO, this.biquad_two_coeffs);
    }

    ['setup_kweight_filter'](bP) {
        this.biquad_one_coeffs['fs'] = bP;
        this.biquad_two_coeffs['fs'] = bP;
        this.biquad_requantize(this.biquad_one_coeffs_48kHz, this.biquad_one_coeffs);
        this.biquad_requantize(this.biquad_two_coeffs_48kHz, this.biquad_two_coeffs);
    }

    ['reset']() {
        this.in1 = 0x0;
        this.in2 = 0x0;
        this.out1 = 0x0;
        this.out2 = 0x0;
        this.out = 0x0;
        this._in1 = 0x0;
        this._in2 = 0x0;
        this._out1 = 0x0;
        this._out2 = 0x0;
        this._out = 0x0;
    }
}

class Loudness {
    constructor(bQ) {
        this.maxChannels = bQ;
        this.momentary = 1e-10;
        this.short = 1e-10;
        this.kWeight = new Array();
        this.averageMomentary = new MovingAverage();
        this.averageShortTerm = new MovingAverage();
        for (var bR = 0x0; bR < bQ; bR++) {
            this.kWeight['push'](new KWeightFilter());
        }
        this.channelWeights = new Array(0x5);
        for (bR = 0x0; bR < this.channelWeights['length']; bR++) this.channelWeights[bR] = new Array(0x6);
        this.channelWeights[0x0][0x0] = 0x1;
        this.channelWeights[0x0][0x1] = 0x0;
        this.channelWeights[0x0][0x2] = 0x0;
        this.channelWeights[0x0][0x3] = 0x0;
        this.channelWeights[0x0][0x4] = 0x0;
        this.channelWeights[0x0][0x5] = 0x0;
        this.channelWeights[0x1][0x0] = 0x1;
        this.channelWeights[0x1][0x1] = 0x1;
        this.channelWeights[0x1][0x2] = 0x0;
        this.channelWeights[0x1][0x3] = 0x0;
        this.channelWeights[0x1][0x4] = 0x0;
        this.channelWeights[0x1][0x5] = 0x0;
        this.channelWeights[0x2][0x0] = 0x1;
        this.channelWeights[0x2][0x1] = 0x1;
        this.channelWeights[0x2][0x2] = 1.4125375446227544;
        this.channelWeights[0x2][0x3] = 1.4125375446227544;
        this.channelWeights[0x2][0x4] = 0x1;
        this.channelWeights[0x2][0x5] = 0x0;
        this.channelWeights[0x3][0x0] = 0x1;
        this.channelWeights[0x3][0x1] = 0x1;
        this.channelWeights[0x3][0x2] = 0x1;
        this.channelWeights[0x3][0x3] = 0x0;
        this.channelWeights[0x3][0x4] = 1.4125375446227544;
        this.channelWeights[0x3][0x5] = 1.4125375446227544;
        this.channelWeights[0x4][0x0] = 0x1;
        this.channelWeights[0x4][0x1] = 0x1;
        this.channelWeights[0x4][0x2] = 0x1;
        this.channelWeights[0x4][0x3] = 1.4125375446227544;
        this.channelWeights[0x4][0x4] = 1.4125375446227544;
        this.channelWeights[0x4][0x5] = 0x0;
    }

    ['calculate'](bS, bT, bU) {
        var bV = 0x0;
        var bW = 0x0;
        if (bU < 0x6) bW = bU - 0x1;
        else bW = 0x3;
        for (var bX = 0x0; bX < bU; bX++) {
            bV += Math.pow(this.kWeight[bX].perform_kweighting(bS[bX][bT]) * this.channelWeights[bW][bX], 0x2);
        }
        this.momentary = this.averageMomentary['average'](bV) * 0.8529037030705663;
        this.short = this.averageShortTerm['average'](bV) * 0.8529037030705663;
    }

    ['get_momentary']() {
        return this.momentary;
    }

    ['get_short_term']() {
        return this.short;
    }

    ['set_samplerate'](bY) {
        this.averageMomentary['setup_moving_average'](0x190, bY);
        this.averageShortTerm['setup_moving_average'](0xbb8, bY);
        for (var bZ = 0x0; bZ < this.maxChannels; bZ++) {
            this.kWeight[bZ].setup_kweight_filter(bY);
        }
    }

    ['reset']() {
        for (var c0 = 0x0; c0 < this.maxChannels; c0++) {
            this.kWeight[c0].reset();
        }
        this.averageMomentary['reset']();
        this.averageShortTerm['reset']();
    }
}

class Integrated {
    constructor() {
        this.buffer = new Array();
        this.integratedFirstThreshSum = 0x0;
        this.integratedFirstThreshCounter = 0x0;
    }

    ['resize_array'](c1, c2) {
        while (c1 > this.buffer['length']) {
            this.buffer['push'](c2);
        }
        this.buffer['length'] = c1;
    }

    ['get_relative_gate'](c3) {
        this.integratedFirstThreshSum += c3;
        this.integratedFirstThreshCounter++;
        return this.integratedFirstThreshSum / this.integratedFirstThreshCounter * 0.1;
    }

    ['get_integrated'](c4) {
        this.buffer['push'](c4);
        var c5 = this.get_relative_gate(c4);
        return volumeToLUFS(this.get_average_above_relative_gate(c5));
    }

    ['get_average_above_relative_gate'](c6) {
        var c7 = 0x0;
        var c8 = 0x0;
        for (var c9 = 0x0; c9 < this.buffer['length']; c9++) {
            if (this.buffer[c9] > c6) {
                c7 += this.buffer[c9];
                c8++;
            }
        }
        if (c8 > 0x0) return c7 / c8;
        return 0x0;
    }

    ['reset']() {
        for (var ca = 0x0; ca < this.buffer['length']; ca++) {
            this.buffer[ca] = 0x0;
        }
        this.resize_array(0x0, 0x0);
        this.integratedFirstThreshSum = 0x0;
        this.integratedFirstThreshCounter = 0x0;
    }
}

class AverageContinuous {
    constructor() {
        this.count = 0x0;
        this.sum = 0x0;
    }

    ['average'](ch) {
        this.sum += ch;
        this.count++;
        return this.sum / this.count;
    }

    ['reset']() {
        this.count = 0x0;
        this.sum = 0x0;
    }
}

class HoldMax {
    constructor() {
        this.out = -0xf423f;
    }

    ['hold'](ci) {
        this.out = Math.max(this.out, ci);
        return this.out;
    }

    ['reset']() {
        this.out = -0xf423f;
    }
}

function createAudioMeter(cj, ck) {
    audioContext = cj
    readFromBuffer = ck;
    envelopeObject = new MovingAverage();
    loudnessObject = new Loudness(0x6);
    averageVolumeObject = new AverageContinuous();
    integratedObject = new Integrated();
    maxVolumeObject = new HoldMax();
    maxMomentaryObject = new HoldMax();
    maxShortObject = new HoldMax();
    fileProgress = new Array();
    aWeightFilerArray = new Array();
    for (var cl = 0x0; cl < 0x6; cl++) {
        aWeightFilerArray.push(new AWeightFilter());
    }
    var cm;
    if (!readFromBuffer) {
        // cm = cj.createScriptProcessor(0x100);
        // cm.onaudioprocess = volumeAudioProcess;
        loudnessObject.set_samplerate(cj.sampleRate);
        for (var cl = 0x0; cl < 0x6; cl++) {
            aWeightFilerArray[cl].setup_aweight_filter(cj.sampleRate);
        }
    }
    RefreshRate = msToSamples(16.666667, cj.sampleRate);
    values.volume = -0xc8;
    values.momentaryLoudness = -0xc8;
    values.shortTermLoudness = -0xc8;
    values.integratedLoudness = -0xc8;
    values.volumeMax = -0xc8;
    values.momentaryLoudnessMax = -0xc8;
    values.shortTermLoudnessMax = -0xc8;
    values.volumeAveraged = -0xc8;
    values.integratedLoudness = -0xc8;
    // if (!readFromBuffer) {
    //     cm.connect(cj.destination);
    //     cm.shutdown = function () {
    //         this.disconnect();
    //         this.onaudioprocess = null;
    //     };
    //     return cm;
    // }
}

function volumeToDb(co) {
    if (co > 1e-7) {
        return Math.log10(co) * 20;
    } else {
        return -200;
    }
}

function volumeToLUFS(cp) {
    if (cp > 1e-10) {
        return Math.log10(cp) * 0xa;
    } else {
        return -0x64;
    }
}

function msToSamples(cq, cr) {
    return Math.round(cr * 0.001 * cq);
}

function ResetAll() {
    envelopeObject.reset();
    averageVolumeObject.reset();
    loudnessObject.reset();
    integratedObject.reset();
    maxVolumeObject.reset();
    maxMomentaryObject.reset();
    maxShortObject.reset();
    values.volume = -0xc8;
    values.momentaryLoudness = -0xc8;
    values.shortTermLoudness = -0xc8;
    values.integratedLoudness = -0xc8;
    values.volumeMax = -0xc8;
    values.momentaryLoudnessMax = -0xc8;
    values.shortTermLoudnessMax = -0xc8;
    values.volumeAveraged = -0xc8;
    values.integratedLoudness = -0xc8;
    for (var cs = 0x0; cs < 0x6; cs++) {
        aWeightFilerArray[cs].reset();
    }
    RefreshCount = 0x0;
}

function ResetHoldMax() {
    maxVolumeObject.reset();
    maxMomentaryObject.reset();
    maxShortObject.reset();
    values.volumeMax = -0xc8;
    values.momentaryLoudnessMax = -0xc8;
    values.shortTermLoudnessMax = -0xc8;
}

function ResetAverage() {
    averageVolumeObject.reset();
    integratedObject['reset']();
    values.volumeAveraged = -0xc8;
    values.integratedLoudness = -0xc8;
}

function volumeAudioProcess(ct) {
    if (pauseMeasurements) return;
    var cu = new Array();
    var cv;
    var cw;
    if (readFromBuffer) {
        cv = ct.numberOfChannels;
        cw = ct.sampleRate;
        loudnessObject.set_samplerate(cw);
    } else {
        cv = ct.inputBuffer['numberOfChannels'];
        cw = ct.inputBuffer['sampleRate'];
    }
    for (var cx = 0x0; cx < cv; cx++) {
        if (readFromBuffer) cu.push(ct.getChannelData(cx));
        else cu.push(ct.inputBuffer['getChannelData'](cx));
    }
    var cy = cu[0x0].length;
    for (var cx = 0x0; cx < cy; cx++) {
        var cA = 0x0;
        for (var cB = 0x0; cB < cv; cB++) {
            cA = aWeightFilerArray[cB].perform_aweighting(cu[cB][cx]);
            cA = Math.max(cA, Math.abs(cA));
        }
        envelopeObject.setup_moving_average_no_reset(0x190, audioContext.sampleRate);
        var cC = envelopeObject.average(cA);
        var cD;
        var cE;
        loudnessObject.calculate(cu, cx, cv, cw);
        cD = loudnessObject.get_momentary();
        cE = loudnessObject.get_short_term();
        if (RefreshCount % RefreshRate === 0x0) {
            values.volume = volumeToDb(cC);
            values.momentaryLoudness = volumeToLUFS(cD);
            values.shortTermLoudness = volumeToLUFS(cE);
            values.volumeMax = maxVolumeObject.hold(values.volume);
            values.momentaryLoudnessMax = maxMomentaryObject.hold(values.momentaryLoudness);
            values.shortTermLoudnessMax = maxShortObject.hold(values.shortTermLoudness);
            if (values.momentaryLoudness > -0x46) {
                values.integratedLoudness = integratedObject.get_integrated(cD);
            }
            values.volumeAveraged = averageVolumeObject.average(values.volume);
        }
        RefreshCount++;
    }
    return values.volume
}

module.exports = {
    volumeAudioProcess: volumeAudioProcess,
    createAudioMeter: createAudioMeter
}