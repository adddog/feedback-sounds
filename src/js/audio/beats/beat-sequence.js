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
import BaseSequence from "common/sequence"

export default class Beats extends BaseSequence {
  constructor(opts) {
    super(opts)

    this._samples = {}
    for (let key in STATE.files) {
      const files = STATE.files[key]
      files.forEach(({ soundUrl }, i) => {
        const sampleKey = `${key}:${i}`
        this._samples[sampleKey] = soundUrl
      })
    }
    /*
  samples:
  {[sample:key]:<soundUrl>}
  */
    this.samplePlayer = new Tone.Players(this._samples)
    this.samplePlayer.connect(Tone.Master)
    this._selectedIndexs = []
    this._currentTime = 0
    this._previousIndex = 0

    let container
    if (!IS_DEV) {
      container = document.createElement("div")
      container.classList.add("sequencer")
      STATE.containerEl.appendChild(container)
    } else {
      container = document.querySelector(".sequencer")
      document.body.appendChild(container)
    }
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
      container.appendChild(el)
      this.SEQUENCE_DATA[i].el = el
      this.setColorByIndex(i)
    })

    Emitter.on("object:clicked", ({ props, hit }) => {
      const type = props.shape.value
      const files = STATE.files[type]
      const sampleKey = `${type}:${random(files.length - 1)}`
      if (this._selectedIndexs.length) {
        this._selectedIndexs.forEach(i => {
          this._addToSequence(this.SEQUENCE_DATA[i], props, sampleKey)
          this.setColorByIndex(i)
          this._setClassOnStep(this.SEQUENCE_DATA[i].el, false)
        })
      } else {
        this._addToSequence(
          this.SEQUENCE_DATA[this._currentIndex],
          props,
          sampleKey
        )
        this.setColorByIndex(this._currentIndex)
      }
      this._selectedIndexs.length = 0
    })

    Emitter.on("object:removed", ({ uuid, props }) => {
      const type = props.shape.value
      this.SEQUENCE_DATA.forEach((sequenceData, i) => {
        let _tmp = sequenceData.sampleKeys.filter(
          soundObj => soundObj.meshProps.uuid !== uuid
        )
        if (_tmp.length !== sequenceData.sampleKeys.length) {
          sequenceData.sampleKeys = _tmp
          this.setColorByIndex(i, -1)
        }
      })
    })
  }

  _setClassOnStep(el, isActive = false) {
    el.classList[isActive ? "add" : "remove"]("active")
  }

  _addToSequence(sequnceDataStep, props, sampleKey) {
    console.log(
      `${sampleKey} ${this._samples[sampleKey]}`,
      `with ${props.uuid}`
    )
    sequnceDataStep.sampleKeys.push({
      meshProps: props,
      sampleKey,
    })
  }

  setColorByIndex(index, dir = 1) {
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
    this._currentIndex = col

    if (this._selectedIndexs.indexOf(this._previousIndex) < 0) {
      this._setClassOnStep(
        this.SEQUENCE_DATA[this._previousIndex].el,
        false
      )
    }
    this._setClassOnStep(
      this.SEQUENCE_DATA[this._currentIndex].el,
      true
    )

    if (this._currentIndex === 0 && this._currentTime) {
      STATE.sequenceDuration = time - this._currentTime
      this._currentTime = time
    }

    this.SEQUENCE_DATA[
      this._previousIndex
    ].sampleKeys.forEach(soundObj => {
      soundObj.meshProps.ambientLightAmount.value =
        REGL_CONST.AMBIENT_LIGHT
      soundObj.meshProps.ambientLightAmount.value =
        REGL_CONST.DIFFUSE_LIGHT
      soundObj.meshProps.scaleAmount.value = REGL_CONST.SCALE
    })

    this.SEQUENCE_DATA[
      this._currentIndex
    ].sampleKeys.forEach(soundObj => {
      soundObj.meshProps.ambientLightAmount.value = 1
      soundObj.meshProps.diffuseLightAmount.value = 1
      soundObj.meshProps.scaleAmount.value =
        1 +
        1 *
          Math.abs(soundObj.meshProps.position[2]) /
          REGL_CONST.MAX_Z
      let vel = Math.random() * 0.2 + 0.2
      this.samplePlayer
        .get(soundObj.sampleKey)
        .start(time, 0, "32n", 0, vel)
    })

    this._previousIndex = this._currentIndex
  }
}
