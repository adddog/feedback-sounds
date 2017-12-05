import { mat4, vec3 } from "gl-matrix"
import { throttle } from "lodash"
import pick from "camera-picking-ray"
import intersect from "ray-sphere-intersection"
import BaseEmitter from "common/emitter-base"
import {
  SAMPLE_TYPES,
  STATE,
  REGL_CONST,
  getColor,
  IS_DEV,
} from "common/common"

const EngineInteraction = (mouse, projectionMat, viewMatrix) => {
  const ray = {
    ro: [0, 0, 0],
    rd: [0, 0, 0],
  }

  const emitter = new BaseEmitter()

  const setPickRay = e => {
    const projView = mat4.multiply([], projectionMat, viewMatrix)
    const invProjView = mat4.invert([], projView)

    const screenHeight = window.innerHeight
    const screenWidth = window.innerWidth
    const mouse = [e.pageX, e.pageY]
    const viewport = [0, 0, screenWidth, screenHeight]

    pick(ray.ro, ray.rd, mouse, viewport, invProjView)
  }

  const RADIUS = 1.45

  const getHits = (objects, scale = 1) =>
    objects
      .map(({ position }) => position)
      .map(pos =>
        intersect(
          [],
          ray.ro,
          ray.rd,
          pos,
          (RADIUS + mouse.getClicks()) * scale
        )
      )

  let _isDown = false
  window.addEventListener("mousedown", e => {
    setPickRay(e)
    _isDown = true
    emitter.emit("ray:down", ray)
  })

  window.addEventListener("mouseup", e => {
    setPickRay(e)
    _isDown = false
    emitter.emit("ray:up", ray)
  })

  window.addEventListener(
    "mousemove",
    throttle(e => {
      if (!_isDown) return
      setPickRay(e)
      emitter.emit("ray:move", ray)
    }),
    150
  )

  window.addEventListener("click", e => {
    setPickRay(e)
    emitter.emit("ray:click", ray)
  })

  function on(label, callback) {
    emitter.on(label, callback)
  }

  function off(label, callback) {
    emitter.off(label, callback)
  }

  return {
    getHits,
    on,
    off,
  }
}

export default EngineInteraction
