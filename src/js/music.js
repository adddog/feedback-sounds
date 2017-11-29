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
    _currentTime,
    _previousIndex = 0
  var loop = new Tone.Sequence(
    function(time, col) {
      _currentIndex = col

      SEQUENCE_DATA[_previousIndex].el.classList.remove("active")
      SEQUENCE_DATA[_currentIndex].el.classList.add("active")

      if (_currentIndex === 0 && _currentTime) {
        STATE.sequenceDuration = time - _currentTime
        _currentTime = time
      }
      SEQUENCE_DATA[_previousIndex].sampleKeys.forEach(soundObj => {
        soundObj.meshProps.ambientLightAmount.value =
          REGL_CONST.AMBIENT_LIGHT
        soundObj.meshProps.ambientLightAmount.value =
          REGL_CONST.DIFFUSE_LIGHT
      })

      SEQUENCE_DATA[_currentIndex].sampleKeys.forEach(soundObj => {
        soundObj.meshProps.ambientLightAmount.value = 1
        soundObj.meshProps.diffuseLightAmount.value = 1
        let vel = Math.random() * 0.2 + 0.2
        player.get(soundObj.sampleKey).start(time, 0, "32n", 0, vel)
      })
      /*TYPES.forEach(type => {
        const layer = UserSeqeunce[type]
        if (!!layer[col]) {
          UserSeqeunce[type][col].forEach(soundObj => {
            let vel = Math.random() * 0.2 + 0.2
            player.get(soundObj.key).start(time, 0, "32n", 0, vel)
          })
        }
      })*/

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
      if(_tmp.length !== sequenceData.sampleKeys.length){
        sequenceData.sampleKeys = _tmp
        setColorByIndex(i, -1)
      }
    })
  })

  Emitter.on("object:clicked", ({ props, hit }) => {
    const type = props.shape.value
    const files = STATE.files[type]
    const sampleKey = `${type}:${random(files.length - 1)}`
    console.log(sampleKey, "at", _currentIndex, `with ${props.uuid}`)

    SEQUENCE_DATA[_currentIndex].sampleKeys.push({
      meshProps: props,
      sampleKey,
    })

    setColorByIndex(_currentIndex)
  })

  const setColorByIndex = (index, dir = 1) =>
    (SEQUENCE_DATA[index].el.style.backgroundColor = SEQUENCE_DATA[
      index
    ].color
      .darken(0.25 * dir * SEQUENCE_DATA[index].sampleKeys.length)
      .hsl()
      .string())

  const container = document.querySelector(".sequencer")
  SEQUENCE_STEPS_ARR.forEach((step, i) => {
    const el = document.createElement("div")
    el.classList.add("sequencer-step")
    container.appendChild(el)
    SEQUENCE_DATA[i].el = el
    setColorByIndex(i)
  })
}

module.exports = Music
