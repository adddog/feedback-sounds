import Color from "color"
import Tone from "tone"
import MusicLoop from "./music-loop"
import { values, keys, sample, random } from "lodash"
import {
  SEQUENCE_LENGTH,
  SAMPLE_TYPES,
  REGL_CONST,
  STATE,
  colors,
  IS_DEV,
  brightestColor,
} from "./common"
import Emitter from "./emitter"

function Music() {
  const musicLoop = MusicLoop()
  const samples = {}
  for (let key in STATE.files) {
    const files = STATE.files[key]
    files.forEach(({ soundUrl }, i) => {
      const sampleKey = `${key}:${i}`
      samples[sampleKey] = soundUrl
    })
  }
  /*
  samples:
  {[sample:key]:<soundUrl>}
  */
  const player = new Tone.Players(samples)
  player.connect(Tone.Master)

  const SEQUENCE_DATA = new Array(SEQUENCE_LENGTH).fill(0).map(i => ({
    el: null,
    color: brightestColor(colors)[0],
    sampleKeys: [], //{sampleKey, meshProps}
  }))
  console.log(SEQUENCE_DATA)
  const TYPES = keys(SAMPLE_TYPES)
  const SEQUENCE_STEPS_ARR = new Array(SEQUENCE_LENGTH)
    .fill(0)
    .map((v, i) => i)

  let _currentIndex,
    _selectedIndexs = [],
    _currentTime,
    _previousIndex = 0
  var loop = new Tone.Sequence(
    function(time, col) {
      _currentIndex = col

      if (
        _selectedIndexs.indexOf(_currentIndex) < 0 &&
        _selectedIndexs.indexOf(_previousIndex) < 0
      ) {
        setClassOnStep(SEQUENCE_DATA[_previousIndex].el, false)
        setClassOnStep(SEQUENCE_DATA[_currentIndex].el, true)
      }

      if (_currentIndex === 0 && _currentTime) {
        STATE.sequenceDuration = time - _currentTime
        _currentTime = time
      }
      SEQUENCE_DATA[_previousIndex].sampleKeys.forEach(soundObj => {
        soundObj.meshProps.ambientLightAmount.value =
          REGL_CONST.AMBIENT_LIGHT
        soundObj.meshProps.ambientLightAmount.value =
          REGL_CONST.DIFFUSE_LIGHT
        soundObj.meshProps.scaleAmount.value = REGL_CONST.SCALE
      })

      SEQUENCE_DATA[_currentIndex].sampleKeys.forEach(soundObj => {
        soundObj.meshProps.ambientLightAmount.value = 1
        soundObj.meshProps.diffuseLightAmount.value = 1
        soundObj.meshProps.scaleAmount.value =
          1 +
          1 *
            Math.abs(soundObj.meshProps.position[2]) /
            REGL_CONST.MAX_Z
        let vel = Math.random() * 0.2 + 0.2
        player.get(soundObj.sampleKey).start(time, 0, "32n", 0, vel)
      })

      _previousIndex = _currentIndex
    },
    SEQUENCE_STEPS_ARR,
    "16n"
  )

  Emitter.on("window:blur", () => loop.stop())
  Emitter.on("window:focus", () => loop.start())

  Tone.Transport.start()
  loop.start()

  Emitter.on("object:removed", ({ uuid, props }) => {
    const type = props.shape.value
    SEQUENCE_DATA.forEach((sequenceData, i) => {
      let _tmp = sequenceData.sampleKeys.filter(
        soundObj => soundObj.meshProps.uuid !== uuid
      )
      if (_tmp.length !== sequenceData.sampleKeys.length) {
        sequenceData.sampleKeys = _tmp
        setColorByIndex(i, -1)
      }
    })
  })

  const setClassOnStep = (el, isActive = false) =>
    el.classList[isActive ? "add" : "remove"]("active")

  const addToSequence = (sequnceDataStep, props, sampleKey) => {
    console.log(
      `${sampleKey} ${samples[sampleKey]}`,
      `with ${props.uuid}`
    )
    sequnceDataStep.sampleKeys.push({
      meshProps: props,
      sampleKey,
    })
  }

  const setColorByIndex = (index, dir = 1) =>
    (SEQUENCE_DATA[index].el.style.backgroundColor = SEQUENCE_DATA[
      index
    ].color
      .darken(0.25 * dir * SEQUENCE_DATA[index].sampleKeys.length)
      .hsl()
      .string())

  Emitter.on("object:clicked", ({ props, hit }) => {
    const type = props.shape.value
    const files = STATE.files[type]
    const sampleKey = `${type}:${random(files.length - 1)}`
    if (_selectedIndexs.length) {
      console.log(_selectedIndexs)
      _selectedIndexs.forEach(i => {
        addToSequence(SEQUENCE_DATA[i], props, sampleKey)
        setColorByIndex(i)
        console.log(SEQUENCE_DATA[i].el)
        setClassOnStep(SEQUENCE_DATA[i].el, false)
      })
    } else {
      addToSequence(SEQUENCE_DATA[_currentIndex], props, sampleKey)
      setColorByIndex(_currentIndex)
    }
    _selectedIndexs.length = 0
  })

  let container
  if (!IS_DEV) {
    container = document.createElement("div")
    container.classList.add("sequencer")
    STATE.containerEl.appendChild(container)
  } else {
    container = document.querySelector(".sequencer")
    document.body.appendChild(container)
  }
  SEQUENCE_STEPS_ARR.forEach((step, i) => {
    const el = document.createElement("div")
    el.setAttribute("data-index", i)
    el.classList.add("sequencer-step")
    el.addEventListener("click", e => {
      const index = parseInt(e.currentTarget.dataset.index, 10)
      let iOf = _selectedIndexs.indexOf(index)
      if (iOf < 0) {
        _selectedIndexs.push(index)
        setClassOnStep(e.currentTarget, true)
      } else {
        _selectedIndexs.splice(iOf, 1)
        setClassOnStep(e.currentTarget, false)
      }
    })
    container.appendChild(el)
    SEQUENCE_DATA[i].el = el
    setColorByIndex(i)
  })
}

module.exports = Music
