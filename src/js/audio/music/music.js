import Sono from "sono"
import Effects from "sono/effects"
//import Utils from "audio/utils"
import MusicRegl from "./music-regl"
import MediaRecord from "./mediaRecord"
import MusicSequence from "./music-sequence"
import { SAMPLE_TYPES, STATE, IS_DEV, GUI_O } from "common/common"

function Music(reglEngine) {
  return
  const musicRegl = new MusicRegl(reglEngine)
  const musicSequence = new MusicSequence({ sequenceLength: 32 })

  const _record = MediaRecord({ type: "audio/webm" })

  let _sounds = [],
    _analyzer

  function addStream(stream) {
    /*var el = document.createElement("audio")
    el.srcObject = stream
    document.body.appendChild(el)
    el.play()
    console.log(el)
    console.log(el.srcObject)*/
    _record.addStream(stream)

    const sound = Sono.create({
      data: stream,
    })
    _sounds.push({
      sound: sound,
      analyzer: sound.effects.add(
        Effects.analyser({
          fftSize: 128,
          useFloats: true,
        })
      ),
    })
    sound.volume = 0
  }

  const getSound = () => _sounds[_sounds.length - 1]

  let _interval
  var pitches = []

  function start() {
    const { sound, analyzer } = getSound()
    sound.volume = 0
    _record.start()
    _interval = setInterval(() => {
      analyzer.getPitch(pitch => {
        console.log(`Note: ${pitch.note}`)
        if (pitch.hertz > 0) {
          pitches.push(pitch)
        }
      })
    }, 180)
  }
  function stop() {
    const { sound } = getSound()
    sound.volume = 0
    clearInterval(_interval)
    _record.stop(blob => {
      const fileReader = new FileReader()
      fileReader.onloadend = () => {
        Sono.context
          .decodeAudioData(fileReader.result)
          .then(buffer => {
            const { controller } = musicRegl.add(buffer)
            musicSequence.add(buffer, controller)
            buffer = null
          })
      }
      fileReader.readAsArrayBuffer(blob)
    })
  }

  if (IS_DEV) {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then(function(stream) {
        addStream(stream)
      })
      .catch(function(err) {
        console.log(err)
      })
  }

  const getAverage = pitches =>
    pitches.reduce((accum, obj) => {
      return (accum += Math.floor(obj.hertz))
    }, 0) / pitches.length

  GUI_O.startRecord = () => {
    start()
  }
  GUI_O.stopRecord = () => {
    stop()
  }

  /*GUI_O.makeDrone = () => {
    if (!pitches.length) return
    const squareWave = Sono.create("sine")
    squareWave.frequency = getAverage(pitches)
    squareWave.play()
  }*/

  return {
    addStream,
    start,
    stop,
  }
}

module.exports = Music
