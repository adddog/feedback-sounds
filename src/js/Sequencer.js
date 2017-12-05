import Tone from "tone"
import observable from "proxy-observable"
import pathParse from "path-parse"
import request from "xhr-request"
import { cover, contain } from "intrinsic-scale"
import { keys, values } from "lodash"
import { SAMPLE_TYPES, STATE, IS_DEV } from "common/common"
import Audio from "audio"
import ReglEngine from "core/engine"

const Sequencer = () => {
  function start(regl, cb, audioPath, containerEl, options = {}) {
    if (!IS_DEV) {
      if (!regl || !cb || !audioPath || !containerEl) {
        throw new Error(`Supply arguments: regl, cb, audioPath, containerEl.
        audioPath should be in the format of audio.json
        `)
      }
    }

    request(
      audioPath || "audio.json",
      {
        json: true,
      },
      (err, data) => {
        if (err) throw err

        STATE.containerEl = containerEl

        const files = data.files.split("\n")
        console.log(files)
        keys(SAMPLE_TYPES).forEach(type => (STATE.files[type] = []))
        console.log(STATE.files)
        files.forEach(path => {
          const type = path.split("/")[1]
          STATE.files[type] = STATE.files[type] || []
          const { names } = SAMPLE_TYPES[type]
          names.forEach(name => {
            if (path.toLowerCase().indexOf(name) > -1) {
              const { dir, name } = pathParse(path)
              STATE.files[type].push({
                soundUrl: path,
                imageUrl: `${dir}/${name}.png`,
              })
            }
          })
        })

        for (let key in options) {
          STATE[key] = options[key]
        }

        console.log("LOADED SOUNDS")
        console.log(STATE.files)

        const reglEngine = ReglEngine(
          IS_DEV ? document.querySelector(".app") : regl
        )

        const audio = Audio(reglEngine)

        if (!IS_DEV) {
          cb({ visual: reglEngine, state: STATE, music: audio, Tone })
        }
      }
    )
  }

  return {
    start,
  }
}

window.Sequencer = Sequencer()
