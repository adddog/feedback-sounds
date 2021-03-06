import { mat4, vec3 } from "gl-matrix"
import TouchEvents from "core/touch-events"
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
    startPosition: vec3.create(),
    x: 0,
    y: 0,
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

    ray.x = e.pageX
    ray.y = e.pageY

    pick(ray.ro, ray.rd, mouse, viewport, invProjView)
  }

  const RADIUS = 1.45

  const allowRemove = () =>
    mouse.isStill() || touchEvents.tapEvent().type === "doubletap"

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

    vec3.set(
      ray.startPosition,
      ray.x / window.innerWidth * 2 - 1,
      (1 - ray.y / window.innerHeight) * 2 - 1,
      0
    )

    _isDown = true
    emitter.emit("ray:down", ray)
  })

  const _onup = e => {
    setPickRay(e)
    _isDown = false
    emitter.emit("ray:up", ray)
  }

  window.addEventListener("mouseleave", _onup)
  window.addEventListener("mouseup", _onup)

  window.addEventListener(
    "mousemove",
    throttle(e => {
      if (!_isDown) return
      setPickRay(e)
      emitter.emit("ray:move", ray)
    }),
    180
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

  const touchEvents = TouchEvents(emitter)
  touchEvents.on("touch:tap", ev => {
    setPickRay(ev.srcEvent)
    console.log(ev)
  })

  touchEvents.on("touch:doubletap", ev => {
    setPickRay(ev.srcEvent)
    emitter.emit("ray:click", ray)
  })

  return {
    allowRemove,
    getHits,
    on,
    off,
  }
}

export default EngineInteraction
