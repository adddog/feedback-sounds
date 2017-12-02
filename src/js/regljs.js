import Regl from "regl"
import { v4 } from "uuid"
import { mat4, vec3 } from "gl-matrix"
import { assign, compact, values, sample } from "lodash"
import EaseNumber from "./ease-number"
import Mouse from "./mouse"
import Emitter from "./emitter"
import {
  SAMPLE_TYPES,
  STATE,
  REGL_CONST,
  getColor,
  IS_DEV,
} from "./common"
import Geometry from "./geometry"
import ReglGeometryActions from "./regl-actions"
import { cover } from "intrinsic-scale"
var pick = require("camera-picking-ray")
var intersect = require("ray-sphere-intersection")

/*import { WIDTH, HEIGHT } from "common/constants"
import SDFs from "common/sdfs"*/

const REGL = el => {
  let regl
  if (IS_DEV) {
    console.warn("STARTED FEEDBACK SOUNDS WITH NEW REGL")
    regl = Regl({
      container: el,
    })
  } else {
    console.warn("STARTED FEEDBACK SOUNDS WITH EXISTING REGL")
    regl = el
  }

  console.warn(`process.env.NODE_ENV: ${process.env.NODE_ENV}`)

  const reglGeometryActions = ReglGeometryActions(regl)

  const EYE = [0, 0, 1]
  let projectionMat = mat4.create()
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

  const eyeMatrix = vec3.fromValues(0, 0, 1)
  const viewMatrix = mat4.create()

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
          projectionMat,
          Math.PI / 2.1,
          viewportWidth / viewportHeight,
          0.001,
          REGL_CONST.MAX_Z
        )
        return projectionMat
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
      latEase.update()
      lonEase.update()

      //polarToVector3(lonEase.value, latEase.value, REGL_CONST.MAX_Z_HALF , eyeMatrix)

      reglGeometryActions.update()

      //newS.draw({color:[0.39, 0.87, 0.29]})
    })
  }

  function update() {
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

  const geometries = Geometry(regl)

  const _defaultGeoprops = (props = {}) =>
    assign(
      {
        ambientLightAmount: {
          value: REGL_CONST.AMBIENT_LIGHT,
        },
        diffuseLightAmount: {
          value: REGL_CONST.DIFFUSE_LIGHT,
        },
        scaleAmount: {
          value: REGL_CONST.SCALE,
        },
        positionAmount: {
          value: 0,
        },
      },
      props
    )

  function createGeometry(soundData, type = "fly", props = {}) {
    props = _defaultGeoprops(props)
    soundData = soundData || { ...sample(values(SAMPLE_TYPES)) }
    assign(props, {
      color: {
        value: soundData.color
          .rgb()
          .array()
          .map(v => v / 255),
      },
    })

    const newS = geometries[soundData.shape].create(props)
    props.shape = soundData
    reglGeometryActions.add(newS, type, props)
  }

  function destroy() {
    regl.destroy()
  }

  Emitter.on("object:finished", shape => {
    createGeometry()
  })

  Emitter.on("object:clicked", ({ soundData, props, hit }) => {
    createGeometry(soundData, "static", props)
  })

  createGeometry()

  const ray = {
    ro: [0, 0, 0],
    rd: [0, 0, 0],
  }

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
      .map(pos => intersect([], ray.ro, ray.rd, pos, (RADIUS+mouse.getClicks())  * scale))

  const addToSequener = (object, hit, props = {}) =>
    Emitter.emit("object:clicked", {
      soundData: object.props.shape,
      props: _defaultGeoprops({
        ...object.props,
        uuid: v4(),
        position: object.position,
        positionAmount: {
          value: REGL_CONST.POSITION_AMOUNT,
        },
        ...props,
      }),
      hit: hit,
    })

  const onCheckRay = () => {}

  const mouse = Mouse(IS_DEV ? document.body : el, onCheckRay)

  /*window.addEventListener("dblclick", e => {
    console.log("dblclick")
    clearTimeout(_clickTimeout)
    setPickRay(e)
    const staticObjects = reglGeometryActions.getObjectsAndPositions(
      "static"
    )
    const staticHits = getHits(staticObjects)
    let i = 0
    for (i = 0; i < staticHits.length; i++) {
      if (staticHits[i] && staticObjects[i].mesh.canInteract()) {
        Emitter.emit(
          "object:removed",
          reglGeometryActions.removeAt(i, "static")
        )
        break
      }
    }
  })
*/
  window.addEventListener("click", e => {
    setPickRay(e)
    const flyObjects = reglGeometryActions.getObjectsAndPositions()
    const staticObjects = reglGeometryActions.getObjectsAndPositions(
      "static"
    )
    const flyHits = getHits(flyObjects, 1)
    const staticHits = getHits(staticObjects, REGL_CONST.STATIC_SCALE)

    let i = 0
    for (i = 0; i < staticHits.length; i++) {
      if (staticHits[i] && staticObjects[i].mesh.canInteract()) {
        if (mouse.isStill()) {
          Emitter.emit(
            "object:removed",
            reglGeometryActions.removeAt(i, "static")
          )
        } else {
          /*
          CLONE
          */
          addToSequener(staticObjects[i], staticHits[i], {
            position: staticObjects[i].position.map(
              value => (value += Math.random() * 0.5 - 0.25)
            ),
          })
        }
        break
      }
    }
    i = 0

    for (i; i < flyHits.length; i++) {
      const hit = flyHits[i]
      if (hit) {
        /*
        Create a new object with these settings
        this will be the statis mesh
        */
        addToSequener(flyObjects[i], hit)

        break
      }
    }
  })

  return {
    update,
    destroy,
  }
}

export default REGL
