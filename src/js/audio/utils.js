const FFT_SIZE = 128
const START_OCTAVE = 2
const OCTAVES = 8

const NOTES = [
    ...[
        new Array(OCTAVES * 12)
            .fill(0)
            .map((v, i) => i)
            .reduce(accum => (accum *= 1.05946), 1),
    ],
    ...new Array(OCTAVES * 12).fill(0),
].map((hz, i, arr) => {
    if (i === 0) return hz
    //return arr[] * Math.pow(1.05946,i)
})

console.log(NOTES)

new Array(OCTAVES * 12).fill(0)

//NOTES.forEach()
//.map((v, i) => Math.max(Math.pow(1.05946, (i+(START_OCTAVE*12))), 1))

console.log(NOTES)
const pitchBlob = new Blob([
    `onmessage = function(e) {
                var data = e.data;
                    var sampleRate = data.sampleRate;
                    var buf = new Float32Array(data.b);
                    var SIZE = buf.length;
                    var MAX_SAMPLES = Math.floor(SIZE / 2);
                    var bestOffset = -1;
                    var bestCorrel = 0;
                    var rms = 0;
                    var foundGoodCorrelation = false;
                    var correls = new Array(MAX_SAMPLES);
                    for (var i = 0; i < SIZE; i++) {
                        var val = buf[i];
                        rms += val * val;
                    }
                    rms = Math.sqrt(rms / SIZE);
                    if (rms < 0.01) {
                        postMessage(-1);
                    } else {
                        var lastCorrelation = 1;
                        for (var offset = 0; offset < MAX_SAMPLES; offset++) {
                            var correl = 0;
                            for (var i = 0; i < MAX_SAMPLES; i++) {
                                correl += Math.abs(buf[i] - buf[i + offset]);
                            }
                            correl = 1 - correl / MAX_SAMPLES;
                            correls[offset] = correl;
                            if (correl > 0.9 && correl > lastCorrelation) {
                                foundGoodCorrelation = true;
                                if (correl > bestCorrel) {
                                    bestCorrel = correl;
                                    bestOffset = offset;
                                }
                            } else if (foundGoodCorrelation) {
                                var shift = (correls[bestOffset + 1] - correls[bestOffset - 1]) / correls[bestOffset];
                                postMessage(sampleRate / (bestOffset + 8 * shift));
                            }
                            lastCorrelation = correl;
                        }
                        if (bestCorrel > 0.01) {
                            postMessage(sampleRate / bestOffset);
                        } else {
                            postMessage(-1);
                        }
                }
            };`,
])

function noteFromPitch(frequency) {
    const noteNum = 12 * (Math.log(frequency / 440) * Math.LOG2E)
    return Math.round(noteNum) + 69
}

function frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2, (note - 69) / 12)
}

function centsOffFromPitch(frequency, note) {
    return Math.floor(
        1200 *
            Math.log(frequency / frequencyFromNoteNumber(note)) *
            Math.LOG2E
    )
}

const pitchBlobURL = URL.createObjectURL(pitchBlob)
const _pitchWorker = new Worker(pitchBlobURL)

const noteStrings = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
]
const pitchCallbackObject = {
    hertz: 0,
    note: "",
    noteIndex: 0,
    detuneCents: 0,
    detune: "",
}

const _createArray = length => {
    return new Float32Array(length)
}

const getWaveform = sound => {
    this._node.getFloatTimeDomainData(_waveform)
    return _waveform
}

const _waveform = _createArray(FFT_SIZE)

const computeChunk = buffer => {
    const fft = 128
    const l = Math.min(buffer.length, 7350)
    console.log("length", l)
    if (!l) return []
    const chunk = buffer.slice(0, l)
    const f = new Float32Array(fft)
    f.set(chunk.slice(0, fft))
    _pitchWorker.postMessage(
        {
            sampleRate: 44100,
            b: f.buffer,
        },
        [f.buffer]
    )
    return buffer.slice(l)
}

const UTILS = {
    getAveragePitch: (sound, callback) => {
        let buffer = sound.data.getChannelData(0)
        let _timout

        if (!callback) {
            return
        }

        const extractFFT = () => {}

        const pitches = []

        _pitchWorker.onmessage = event => {
            const hz = event.data
            if (hz !== -1) {
                const note = noteFromPitch(hz)
                const detune = centsOffFromPitch(hz, note)
                pitchCallbackObject.hertz = hz
                pitchCallbackObject.noteIndex = note % 12
                pitchCallbackObject.note = noteStrings[note % 12]
                pitchCallbackObject.detuneCents = detune
                if (detune === 0) {
                    pitchCallbackObject.detune = ""
                } else if (detune < 0) {
                    pitchCallbackObject.detune = "flat"
                } else {
                    pitchCallbackObject.detune = "sharp"
                }
                console.log(pitchCallbackObject.note)
                pitches.push({ ...pitchCallbackObject })
                clearTimeout(_timout)
                _timout = setTimeout(function() {
                    console.log(pitches)
                    const averageHz =
                        pitches.reduce(
                            (accum, obj) => (accum += obj.hertz),
                            0
                        ) / pitches.length
                    console.log(
                        "averageHz",
                        averageHz,
                        noteStrings[noteFromPitch(averageHz) % 12]
                    )
                    callback(pitches)
                }, 200)
            }
            if (buffer.length > 0) {
                buffer = computeChunk(buffer)
            }
        }
        console.log(buffer)
        console.log(sound)
        console.log(sound._node)

        buffer = computeChunk(buffer)

        /*const f = new Float32Array(buffer.length);
        f.set(buffer);
        _pitchWorker.postMessage({
            sampleRate:sound.data.sampleRate,
            b: f.buffer
        }, [f.buffer]);*/
    },
}

export default UTILS
