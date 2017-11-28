import Regl from "regl"
import { mat4, vec3 } from "gl-matrix"
import { compact, values, sample } from "lodash"
import Emitter from "./emitter"
import { SAMPLE_TYPES, REGL_CONST, getColor } from "./common"
import Geometry from "./geometry"
import ReglGeometryActions from "./regl-actions"
import { cover } from "intrinsic-scale"
var pick = require("camera-picking-ray")
var intersect = require("ray-sphere-intersection")

/*import { WIDTH, HEIGHT } from "common/constants"
import SDFs from "common/sdfs"*/

const REGL = el => {
  const regl = Regl({
    container: el,
  })
  const reglGeometryActions = ReglGeometryActions(regl)
  let eyeMatrix = mat4.create()
  let deviceAcceleration = vec3.create()
  const pixels = regl.texture()

  const drawFeedback = regl({
    frag: `

    #define PI 3.14159265359;
    #define TAU 6.28318530718;
    #define MOIRE 100.;
    #define amount 8.0;

  precision lowp float;
  varying vec2 uv;

  void main () {
    vec2 st = uv;

    gl_FragColor = vec4(vec3(1,1,1),1.);
  }`,

    vert: `
  precision lowp float;
  attribute vec2 position;
  varying vec2 uv;
  void main () {
    uv = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
  }`,

    attributes: {
      position: [-2, 0, 0, -2, 2, 2],
    },

    uniforms: {
      texture: pixels,
      aspect: ({ viewportHeight, viewportWidth }) =>
        viewportWidth / viewportHeight,
      t: ({ tick }) => tick * 0.01,
    },

    count: 3,
  })

  const EYE = [0, 0, 1]
  let projectionMat = mat4.create()
  let viewMatrix = mat4.lookAt([], EYE, [0, 0, 0], [0, 1, 0])
  const setupCamera = regl({
    context: {
      projection: ({ viewportWidth, viewportHeight }) => {
        mat4.perspective(
          projectionMat,
          Math.PI / 2.1,
          viewportWidth / viewportHeight,
          0.001,
          REGL_CONST.MAX_Z
        )
        return projectionMat
      },

      deviceAcceleration: () => deviceAcceleration,
      eyeMatrix: () => eyeMatrix,

      tick: ({ tick }) => tick,

      view: viewMatrix,
    },
  })

  const geometries = Geometry(regl)

  function createGeometry(s, type = "fly", props) {
    s = s || { ...sample(values(SAMPLE_TYPES)) }
    const newS = geometries[s.shape].create(props)
    reglGeometryActions.add(newS, type, {
      color: [0.5, 0.2, 0.7],
      shape: s,
    })
  }

  regl.frame(function() {
    setupCamera(() => {
      regl.clear({
        color: [0, 0, 0, 1],
      })

      reglGeometryActions.update()

      //newS.draw({color:[0.39, 0.87, 0.29]})
    })
  })

  function destroy() {
    console.log("destroy")
    regl.destroy()
  }

  Emitter.on("object:finished", shape => {
    createGeometry()
  })

  Emitter.on("object:clicked", ({ object, hit }) => {
    createGeometry(object.props.shape, "static", {
      position: object.position,
    })
  })

  createGeometry()

  var ray = {
    ro: [0, 0, 0],
    rd: [0, 0, 0],
  }
  const outputC = [Math.random(), Math.random(), Math.random()]
  window.addEventListener("mouseup", e => {
    var projView = mat4.multiply([], projectionMat, viewMatrix)
    var invProjView = mat4.invert([], projView)

    var screenHeight = window.innerHeight
    var screenWidth = window.innerWidth
    var mouse = [e.pageX, e.pageY]
    var viewport = [0, 0, screenWidth, screenHeight]

    pick(ray.ro, ray.rd, mouse, viewport, invProjView)

    const flyObjects = reglGeometryActions.getObjectsAndPositions()
    const positions = flyObjects.map(({ position }) => position)

    const staticObjects = reglGeometryActions.getObjectsAndPositions(
      "static"
    )
    const staticHits = staticObjects
      .map(({ position }) => position)
      .map(pos => intersect([], ray.ro, ray.rd, pos, 1.5))
    let i = 0
    for (i = 0; i < staticHits.length; i++) {
      if (staticHits[i]) {
        Emitter.emit(
          "object:removed",
          reglGeometryActions.removeAt(i, "static")
        )
        break
      }
    }

    const flyHits = positions.map(pos =>
      intersect([], ray.ro, ray.rd, pos, 1.5)
    )
    i = 0
    for (i; i < flyHits.length; i++) {
      const hit = flyHits[i]
      if (hit) {
        Emitter.emit("object:clicked", {
          object: flyObjects[i],
          hit: hit,
        })
        break
      }
    }
  })

  return {
    destroy,
  }
}

export default REGL
