import Color from "color"
import Tone from "tone"
import { values, keys, sample, random } from "lodash"
import {
  SEQUENCE_LENGTH,
  SAMPLE_TYPES,
  REGL_CONST,
  STATE,
  colors,
  IS_DEV,
  brightestColor,
} from "common/common"
import Emitter from "common/emitter"

export default class Sequence {
  constructor(opts = {}) {
    this.options = Object.assign(
      {},
      {
        sequenceLength: SEQUENCE_LENGTH,
      },
      opts
    )

    const { sequenceLength } = this.options

    this.SEQUENCE_DATA = new Array(sequenceLength).fill(0).map(i => ({
      el: null,
      color: brightestColor(colors)[0],
      sampleKeys: [], //{sampleKey, meshProps}
    }))

    this.SEQUENCE_STEPS_ARR = new Array(sequenceLength)
      .fill(0)
      .map((v, i) => i)

    this._currentIndex = 0

    this.loop = new Tone.Sequence(
      this._onUpdate.bind(this),
      this.SEQUENCE_STEPS_ARR,
      "16n"
    )

    Emitter.on("window:blur", () => this.loop.stop())
    Emitter.on("window:focus", () => this.loop.start())

    Tone.Transport.start()
    this.loop.start()
  }

  _onUpdate(time, col) {}

  pause() {}

  resume() {}

  add() {}
}
