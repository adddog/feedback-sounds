import Regl from "./regljs"
import { cover, contain } from "intrinsic-scale"
import { keys, values } from "lodash"
import { SAMPLE_TYPES, STATE } from "./common"
import observable from "proxy-observable"
import pathParse from "path-parse"
import Music from "./music"
import request from "xhr-request"

const Sequencer = () => {
  function start(regl, audioPath) {
    return request(
      audioPath || "audio.json",
      {
        json: true,
      },
      (err, data) => {
        if (err) throw err

        const files = data.files.split("\n")
        keys(SAMPLE_TYPES).forEach(type => (STATE.files[type] = []))
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

        console.log("LOADED SOUNDS")
        console.log(STATE.files)

        const regl = Regl(regl || document.querySelector(".app"))
        const music = Music()

        return regl
      }
    )
  }

  return {
    start,
  }
}

window.Sequencer = Sequencer()
