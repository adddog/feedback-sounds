import Tone from "tone"
import Effects from "sono/effects"
import MediaRecord from "./mediaRecord"
import Utils from "./utils"
import { SAMPLE_TYPES, STATE, IS_DEV } from "common/common"
function MusicSequence() {
  const SEQUENCE_LENGTH = 64
  const SEQUENCE_STEPS_ARR = new Array(SEQUENCE_LENGTH)
    .fill(0)
    .map((v, i) => i)

  const SEQUENCE_DATA = new Array(SEQUENCE_LENGTH).fill(0).map(i => ({
    el: null,
    sampleKeys: [], //{sampleKey, meshProps}
  }))

  const loop = new Tone.Sequence(
    function(time, col) {},
    SEQUENCE_STEPS_ARR,
    "16n"
  )

  function add(sound) {
    console.log(sound)
   /* const player = new Tone.Player(samples)
    player.connect(Tone.Master)*/
  }

  return {
    add,
  }
}

module.exports = MusicSequence
