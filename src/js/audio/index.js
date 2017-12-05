import { STATE, IS_DEV } from "common/common"
import html from "choo/html"
import Sono from "sono"
import Beats from "audio/beats/beats"
import Music from "audio/music/music"

function Audio(reglEngine) {
  STATE.containerEl.appendChild(html`
        <div class="feedback-sequencer">
          <div class="feedback-sequencer--beats"></div>
          <div class="feedback-sequencer--music"></div>
        </div>
      `)

  const beats = Beats()
  const music = Music(reglEngine)

  return {
    beats,
    music,
  }
}

module.exports = Audio
