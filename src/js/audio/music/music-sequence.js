import Tone from "tone"
import { SAMPLE_TYPES, STATE, IS_DEV } from "common/common"
import BaseSequence from "common/sequence"

export default class MusicSequence extends BaseSequence {
  constructor(opts) {
    super(opts)

    this.samplePlayer = new Tone.Players()
    this.samplePlayer.connect(Tone.Master)

    this.pitchShift = new Tone.PitchShift({
      windowSize: 0.1,
      feedback: 0.0,
      wet: 1.0,
    })

    //this.pitchShift.connect(Tone.Master);

    this._samples = []
  }

  _createSampleKey() {
    return this._samples.length
  }

  _onUpdate(time, col) {
    this._currentIndex = col

    this.SEQUENCE_DATA[
      this._currentIndex
    ].sampleKeys.forEach(soundObj => {
      this.samplePlayer.get(soundObj.sampleKey).start()
    })

    this._previousIndex = this._currentIndex
  }

  _addToSequence(sequnceDataStep, sampleKey) {
    sequnceDataStep.sampleKeys.push({
      sampleKey,
    })
  }

  add(soundBuffer, controller) {
    const sound = {
      sampleKey: this._createSampleKey(),
    }
    this._samples.push(sound)
    this.samplePlayer.add(sound.sampleKey, soundBuffer)
    this._addToSequence(
      this.SEQUENCE_DATA[this._currentIndex],
      sound.sampleKey
    )

    //this.samplePlayer.get(sound.sampleKey).connect(this.pitchShift)

    controller.on(
      "pitch",
      v => {
        //console.log(v);
       // (this.pitchShift.pitch = Math.floor(v * 12))
      }
    )
  }
}
