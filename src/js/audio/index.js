import Sono from "sono"
import Beats from "./beats"
import Music from "./music"
function Audio(regl) {
  const beats = Beats()
  const music = Music()

  return {
    beats,
    music
  }
}

module.exports = Audio
