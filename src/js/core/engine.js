import Regl from "regl"
import { v4 } from "uuid"
import { mat4, vec3 } from "gl-matrix"
import { assign, compact, values, sample } from "lodash"
import { cover } from "intrinsic-scale"
import pick from "camera-picking-ray"
import intersect from "ray-sphere-intersection"

import EaseNumber from "common/ease-number"
import Mouse from "common/mouse"
import Emitter from "common/emitter"
import {
  SAMPLE_TYPES,
  STATE,
  REGL_CONST,
  getColor,
  IS_DEV,
} from "common/common"
import BeatEngine from "core/beat-engine"
import ReglGeometryActions from "core/geometry-actions"
import EngineInteraction from "core/engine-interaction"

/*import { WIDTH, HEIGHT } from "common/constants"
import SDFs from "common/sdfs"*/

const REGL = el => {
  let regl
  if (IS_DEV) {
    console.warn("STARTED FEEDBACK SOUNDS WITH NEW REGL")
    regl = Regl({
      extensions: ["angle_instanced_arrays"],
      container: el,
    })
  } else {
    console.warn("STARTED FEEDBACK SOUNDS WITH EXISTING REGL")
    regl = el
  }

  console.warn(`process.env.NODE_ENV: ${process.env.NODE_ENV}`)

  let projectionMatrix = mat4.create()
  const eyeMatrix = vec3.fromValues(0, 0, 1)
  const viewMatrix = mat4.create()

  const reglGeometryActions = ReglGeometryActions(regl)
  const mouse = Mouse(IS_DEV ? document.body : el, regl)
  const engineInteraction = EngineInteraction(
    mouse,
    projectionMatrix,
    viewMatrix
  )

  const beatEngine = BeatEngine({
    regl,
    mouse,
    reglGeometryActions,
    engineInteraction,
  })

  const degToRad = degrees => degrees * (Math.PI / 180)

  function polarToVector3(lon, lat, radius, vector) {
    const phi = degToRad(1.5 - lat)
    const theta = degToRad(lon)
    vec3.set(
      vector,
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      Math.abs(radius * Math.sin(phi) * Math.sin(theta))
    )

    return vector
  }

  const latEase = new EaseNumber(0, 0.001)
  const lonEase = new EaseNumber(0, 0.001)

  /*  window.addEventListener("mousemove", e => {
    let { pageX, pageY } = e
    pageX -= window.innerWidth / 2
    pageX /= window.innerWidth
    pageX *= 2
    pageY -= window.innerHeight / 2
    pageY /= window.innerHeight
    pageY *= 2
    latEase.add(3 * pageY)
    lonEase.add(6 * pageX)
  })
*/
  let _updateCounter = 0
  const setupCamera = regl({
    context: {
      projection: ({ viewportWidth, viewportHeight }) => {
        mat4.perspective(
          projectionMatrix,
          Math.PI / 2.1,
          viewportWidth / viewportHeight,
          0.001,
          REGL_CONST.MAX_Z
        )
        return projectionMatrix
      },

      tick: ({ tick }) => (IS_DEV ? tick : _updateCounter),

      view: () =>
        mat4.lookAt(
          viewMatrix,
          eyeMatrix,
          [0, 0, -REGL_CONST.MAX_Z],
          [0, 1, 0]
        ),
    },
  })

  let _allowRender = true
  Emitter.on("window:blur", () => (_allowRender = false))
  Emitter.on("window:focus", () => (_allowRender = true))

  const drawRegl = () => {
    if (!_allowRender) return

    setupCamera(() => {
      //latEase.update()
      //lonEase.update()

      //polarToVector3(lonEase.value, latEase.value, REGL_CONST.MAX_Z_HALF , eyeMatrix)

      reglGeometryActions.update()

      if(_listeners.update.length){
        _listeners.update.forEach(cb => cb())
      }

      //mouse.draw()
    })
  }

  function update() {
    regl.clear({
      color: [0, 0, 0, 1],
    })
    drawRegl()
    _updateCounter++
  }

  if (IS_DEV) {
    regl.frame(function() {
      regl.clear({
        color: [0, 0, 0, 1],
      })
      drawRegl()
    })
  }

  const _listeners = {
    update: [],
  }

  function on(str, cb) {
    _listeners[str] = _listeners[str] || []
    _listeners[str].push(cb)
  }

  function off(str, cb) {
    _listeners[str].splice(_listeners[str].indexOf(cb), 1)
  }

  function destroy() {
    regl.destroy()
  }

  return {
    regl,
    engineInteraction,
    mouse,
    setupCamera,
    update,
    on,
    off,
    destroy,
  }
}

export default REGL
