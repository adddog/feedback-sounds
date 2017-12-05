import Sono from "sono"
import Beats from "audio/beats/beats"
import Music from "audio/music/music"

function Audio(reglEngine) {
  const beats = Beats()
  const music = Music(reglEngine)

  return {
    beats,
    music
  }
}

module.exports = Audio
