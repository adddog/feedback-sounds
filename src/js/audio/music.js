import Sono from "sono"
import Effects from "sono/effects"
import MediaRecord from "./mediaRecord"
import MusicSequence from "./music-sequence"
import Utils from "./utils"
import { SAMPLE_TYPES, STATE, IS_DEV } from "common/common"
function Music() {
  const musicSequence = MusicSequence()

  let _record,
    _sounds = [],
    _analyzer

  function addStream(stream) {
    /*var el = document.createElement("audio")
    el.srcObject = stream
    document.body.appendChild(el)
    el.play()
    console.log(el)
    console.log(el.srcObject)*/
    _record = MediaRecord(stream, { type: "audio/webm" })
    if (_analyzer) {
      _analyzer.destroy()
    }
    _sounds.push(
      Sono.create({
        data: stream,
      })
    )
    _analyzer = _sounds[_sounds.length - 1].effects.add(
      Effects.analyser({
        fftSize: 128,
        useFloats: true,
      })
    )
  }

  const onProgress = e => {
    console.log(e)
  }

  let _interval
  var pitches = []

  function start() {
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
    clearInterval(_interval)
    _record.stop(blob => {
      musicSequence.add(URL.createObjectURL(blob))
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
