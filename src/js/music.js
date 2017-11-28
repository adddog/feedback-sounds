import Tone from "tone"
import MusicLoop from "./music-loop"
import { values, keys, random } from "lodash"
import { SEQUENCE_LENGTH, SAMPLE_TYPES, STATE } from "./common"
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
  const player = new Tone.Players(samples)
  player.connect(Tone.Master)

  const TYPES = keys(SAMPLE_TYPES)

  let _currentIndex, _currentTime
  var loop = new Tone.Sequence(
    function(time, col) {
      _currentIndex = col

      if (_currentIndex === 0 && _currentTime) {
        STATE.sequenceDuration = time - _currentTime
        _currentTime = time
      }
      TYPES.forEach(type => {
        const layer = UserSeqeunce[type]
        if (!!layer[col]) {
          var vel = Math.random() * 0.2 + 0.2
          player.get(layer[col]).start(time, 0, "32n", 0, vel)
        }
      })
    },
    new Array(SEQUENCE_LENGTH).fill(0).map((v, i) => i),
    "16n"
  )

  Tone.Transport.start()
  loop.start()

  const UserSeqeunce = {}
  TYPES.forEach(key => (UserSeqeunce[key] = []))
  console.log(UserSeqeunce)

  Emitter.on("object:removed", ({uuid,props}) => {
    const type = props.shape.value
    for (let i = UserSeqeunce[type].length - 1; i >= 0; i--) {
      if (UserSeqeunce[type][i].uuid === uuid) {
        UserSeqeunce[type].splice(i, 1)
        console.log(UserSeqeunce)
      }
    }
  })

  Emitter.on("object:clicked", ({ object, hit }) => {
    const type = object.props.shape.value
    const files = STATE.files[type]
    const sampleKey = `${type}:${random(files.length - 1)}`
    console.log(sampleKey, "at", _currentIndex)

    UserSeqeunce[type][_currentIndex] = {
      meshUuid: object.uuid,
      key: sampleKey,
    }
    //loop.add(3, player.get(sampleKey))
    //player.get(sampleKey).start()
    /*var player = new Tone.Player(`${PATH}Yamaha_DD-10/bongo 2.wav`).sync()
player.autostart = true
player.chain(Tone.Master)*/
  })
}

module.exports = Music
