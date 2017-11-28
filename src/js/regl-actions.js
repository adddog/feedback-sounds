import { mat4, vec3 } from "gl-matrix"
import { random, keys } from "lodash"
import resl from "resl"
import Emitter from "./emitter"
import { SEQUENCE_LENGTH, REGL_CONST, STATE } from "./common"

const TIME = 4

const ReglGeometryActions = regl => {
  const _ACTIONS = {
    fly: [],
    static: [],
  }
  const DESINATIONS = [
    [-0.5, -0.5, 0],
    [-0.5, -0.5, 0],
    [0.5, 0.5, 0],
    [0.5, 0.5, 0],
  ]

  let _desinationIndex = 0

  function update() {
    for (let j = _ACTIONS.static.length - 1; j >= 0; j--) {
      let meshObj = _ACTIONS.static[j]
      meshObj.geo.draw({
        texture: meshObj.props.texture,
        color: meshObj.props.color,
      })
    }
    for (let i = _ACTIONS.fly.length - 1; i >= 0; i--) {
      let meshObj = _ACTIONS.fly[i]
      mat4.translate(
        meshObj.geo.modelMatrix,
        meshObj.geo.modelMatrix,
        [
          meshObj.props.increment.x,
          meshObj.props.increment.y,
          meshObj.props.increment.z,
        ]
      )
      meshObj.geo.draw({
        texture: meshObj.props.texture,
        color: meshObj.props.color,
      })
      if (meshObj.geo.modelMatrix[14] > 0) {
        Emitter.emit("object:finished", meshObj.props.shape)
        removeAt(i)
      }
    }
  }

  const chooseSample = type => {
    const files = STATE.files[type]
    const index = random(files.length - 1)
    return files[index]
  }

  const loadAsset = (
    image,
    cb // Here we call resl and tell it to start preloading resources
  ) =>
    require("resl")({
      manifest: {
        soundImg: {
          type: "image",
          src: image,
        },
      },
      onDone: cb,
    })

  function removeAt(index, type = "fly") {
    let m = _ACTIONS[type].splice(index, 1)[0]
    m.props.texture.destroy()
    return { uuid: m.geo.uuid, props: m.props }
  }

  function add(geo, type, props = {}) {
    /*const modelMatrix = mat4.create([0, 0, 0])
    mat4.translate(modelMatrix, modelMatrix, [
      (props.position.x * 2 - 1) * FAR_Z / 2,
      props.position.y * -1 * 2 - 1 * FAR_Z / 2,
      -FAR_Z,
    ])*/
    console.log(geo)
    const { shape } = props
    const sample = chooseSample(shape.value)

    console.log(sample)

    loadAsset(sample.imageUrl, assets => {
      const imageTexture = regl.texture(assets.soundImg)
      const time = SEQUENCE_LENGTH * 16 / (STATE.bmp / STATE.fps)
      const tr = mat4.getTranslation(vec3.create(), geo.modelMatrix)
      const increment = {
        x: tr[0] / (STATE.fps * STATE.sequenceDuration) * -1,
        y: tr[1] / (STATE.fps * STATE.sequenceDuration) * -1,
        z: Math.abs(tr[2]) / (STATE.fps * STATE.sequenceDuration),
      }
      if (type === "fly") {
        mat4.translate(
          geo.modelMatrix,
          geo.modelMatrix,
          DESINATIONS[_desinationIndex]
        )
      }

      _ACTIONS[type].push({
        geo,
        props: {
          ...props,
          texture: imageTexture,
          increment,
        },
      })
      _desinationIndex = (_desinationIndex + 1) % DESINATIONS.length
    })
  }

  function getObjectsAndPositions(type = "fly") {
    return _ACTIONS[type].map(obj => ({
      id: obj.geo.uuid,
      position: mat4.getTranslation(
        vec3.create(),
        obj.geo.modelMatrix
      ),
      props: obj.props,
    }))
  }

  return {
    getObjectsAndPositions,
    update,
    add,
    removeAt,
  }
}

export default ReglGeometryActions
