import Sono from "sono"
import Effects from "sono/effects"
//import Utils from "audio/utils"
import MusicRegl from "./music-regl"
import MediaRecord from "./mediaRecord"
import MusicSequence from "./music-sequence"
import { SAMPLE_TYPES, STATE, IS_DEV } from "common/common"

function Music(reglEngine) {
  const musicRegl = new MusicRegl(reglEngine)
  const musicSequence = new MusicSequence({ sequenceLength: 64 })

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

    if (_analyzer) {
      _analyzer.destroy()
    }
    _sounds.push(
      Sono.create({
        data: stream,
      })
    )
    const sound = getSound()
    _analyzer = sound.effects.add(
      Effects.analyser({
        fftSize: 128,
        useFloats: true,
      })
    )
    sound.volume = 0
  }

  const onProgress = e => {
    console.log(e)
  }

  const getSound = () => _sounds[_sounds.length - 1]

  let _interval
  var pitches = []

  function start() {
    getSound().volume = 0
    _record.start()
    _interval = setInterval(() => {
      _analyzer.getPitch(pitch => {
        console.log(pitch)
        pitches.push(pitch)
        /*console.log("sound.currentTime", sound.currentTime)
        if (t < 3 && !sound.ended) {
          t += 0.25
          console.log(t)
          setTimeout(() => {
            lookUp()
          }, 250)
        } else {
          console.log(pitches)
        }*/
      })
    }, 250)
  }
  function stop() {
    getSound().volume = 0
    clearInterval(_interval)
    _record.stop(blob => {
      var fileReader = new FileReader()
      fileReader.onloadend = () => {
        Sono.context
          .decodeAudioData(fileReader.result)
          .then(buffer => {
            musicRegl.add(buffer)
            musicSequence.add(buffer)
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
        start()
        setTimeout(() => {
          stop()
        }, 3000)
      })
      .catch(function(err) {
        console.log(err)
      })
  }
  return {
    addStream,
    start,
    stop,
  }
}

module.exports = Music
