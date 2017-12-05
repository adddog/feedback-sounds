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
import Geometry from "geometry"
import EngineInteraction from "core/engine-interaction"
import ReglGeometryActions from "core/geometry-actions"

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

      //mouse.draw()
    })
  }

  function update() {
    drawRegl()
    _updateCounter++
  }

  if (IS_DEV) {
    /*regl.frame(function() {
      regl.clear({
        color: [0, 0, 0, 1],
      })
      drawRegl()
    })*/
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

  engineInteraction.on("ray:click", ray => {
    const flyObjects = reglGeometryActions.getObjectsAndPositions()
    const staticObjects = reglGeometryActions.getObjectsAndPositions(
      "static"
    )
    const flyHits = engineInteraction.getHits(flyObjects, 1)
    const staticHits = engineInteraction.getHits(
      staticObjects,
      REGL_CONST.STATIC_SCALE
    )

    let i = 0
    for (i = 0; i < staticHits.length; i++) {
      if (staticHits[i] && staticObjects[i].mesh.canInteract()) {
        if (mouse.isStill()) {
          //mouse.updateMeshPosition(staticHits[i])
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
        mouse.reset()
        //mouse.updateMeshPosition(hit)
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
    regl,
    engineInteraction,
    mouse,
    setupCamera,
    update,
    destroy,
  }
}

export default REGL