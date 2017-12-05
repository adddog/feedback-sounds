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
    this.SEQUENCE_DATA = this.newSequenceData(sequenceLength)

    this.SEQUENCE_STEPS_ARR = new Array(sequenceLength)
      .fill(0)
      .map((v, i) => i)

    this._currentTime = 0
    this._previousIndex = 0

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

  newSequenceData(sequenceLength) {
    return new Array(sequenceLength).fill(0).map(i => ({
      el: null,
      color: brightestColor(colors)[0],
      sampleKeys: [], //{sampleKey, meshProps}
    }))
  }

  toggleActive(v) {
    if (v) {
      this._show()
      //this._resume()
    } else {
      this._hide()
      //this._pause()
    }
  }

  _pause() {
    this.loop.stop(this.loop.sampleTime)
  }

  _resume() {
    this.loop.start(this.loop.sampleTime)
  }

  _show() {
    this._isHidden = false
    this._containerEl.classList.remove("hide")
  }

  _hide() {
    this._isHidden = true
    this._containerEl.classList.add("hide")
  }

  _createSequenceEls() {
    this.SEQUENCE_STEPS_ARR.forEach((step, i) => {
      const el = document.createElement("div")
      el.setAttribute("data-index", i)
      el.classList.add("sequencer-step")
      el.addEventListener("click", e => {
        const index = parseInt(e.currentTarget.dataset.index, 10)
        let iOf = this._selectedIndexs.indexOf(index)
        if (iOf < 0) {
          this._selectedIndexs.push(index)
          this._setClassOnStep(e.currentTarget, true)
        } else {
          this._selectedIndexs.splice(iOf, 1)
          this._setClassOnStep(e.currentTarget, false)
        }
      })
      this._containerEl.appendChild(el)
      this.SEQUENCE_DATA[i].el = el
      this._setColorByIndex(i)
    })
  }

  _setClassOnStep(el, isActive = false) {
    el.classList[isActive ? "add" : "remove"]("active")
  }

  _addToSequence(sequnceDataStep, props, sampleKey) {
    sequnceDataStep.sampleKeys.push({
      props,
      sampleKey,
    })
  }

  _setColorByIndex(index, dir = 1) {
    this.SEQUENCE_DATA[
      index
    ].el.style.backgroundColor = this.SEQUENCE_DATA[index].color
      .darken(
        0.25 * dir * this.SEQUENCE_DATA[index].sampleKeys.length
      )
      .hsl()
      .string()
  }

  _onUpdate(time, col) {

  }

  pause() {}

  resume() {}

  add() {}
}
