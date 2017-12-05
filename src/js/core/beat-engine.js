import Regl from "regl"
import KeyCode from "keycode-js"
import { v4 } from "uuid"
import { mat4, vec3 } from "gl-matrix"
import { assign, compact, values, sample } from "lodash"
import { cover } from "intrinsic-scale"
import Emitter from "common/emitter"
import {
  SAMPLE_TYPES,
  STATE,
  REGL_CONST,
  getColor,
  keyboard,
  IS_DEV,
} from "common/common"
import Geometry from "geometry"

const BeatEngine = props => {
  const {
    regl,
    mouse,
    engineInteraction,
    reglGeometryActions,
  } = props

  const geometries = Geometry(regl)
  const SAMPLE_TYPES_VALUES = values(SAMPLE_TYPES)

  let _nextSample = -1
  const getNextSample = () =>
    (_nextSample += 1) % SAMPLE_TYPES_VALUES.length

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
    soundData = soundData || {
      ...SAMPLE_TYPES_VALUES[getNextSample()],
    }
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
        if (mouse.isStill() || keyboard.isDown(KeyCode.KEY_SHIFT)) {
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

  return {}
}

export default BeatEngine
