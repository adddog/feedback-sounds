import Regl from "./regljs"
import { cover, contain } from "intrinsic-scale"
import { keys, values } from "lodash"
import { SAMPLE_TYPES, STATE } from "./common"
import observable from "proxy-observable"
import pathParse from "path-parse"
import Music from "./music"
import request from "xhr-request"

const WIDTH = 480
const HEIGHT = 640

function store(state, emitter) {
  emitter.on("DOMContentLoaded", function(el) {

    console.log("DOMContentLoaded")

    request(
      "audio.json",
      {
        json: true,
      },
      function(err, data) {
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

        const regl = Regl(document.querySelector(".app"))
        const music = Music()
      }
    )

    setTimeout(() => {
      /*
    const resizeCanvas = (w = WIDTH, h = HEIGHT) => {
      let { width, height, x, y } = cover(
        window.innerWidth,
        window.innerHeight,
        w,
        h
      )
      console.log(width)
      console.log(height)
      console.log(window.innerWidth, window.innerHeight)
      const scale = Math.max(width / w, height / h)
      canvasEl.style.transform = `scale3d(${scale},${scale},1) translate3d(0, 0, 0)`
      canvasEl.style.webkitTransform = `scale3d(${scale},${scale},1) translate3d(0,0, 0)`
      canvasEl.style.top = `${y / 2}px`
      canvasEl.style.left = `${x / 2}px`
    }

    window.addEventListener("resize", () =>
      resizeCanvas(WIDTH, HEIGHT)
    )

    resizeCanvas(WIDTH, HEIGHT)*/
    }, 2000)
  })
}

module.exports = store
