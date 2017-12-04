import { mat4, vec3 } from "gl-matrix"
import { v4 } from "uuid"
import { random, keys } from "lodash"
import resl from "resl"
import Emitter from "common/emitter"
import { SEQUENCE_LENGTH, REGL_CONST, STATE } from "common/common"

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

  const draw = meshObj =>
    meshObj.geo.draw({
      texture: meshObj.texture,
      diffuseLightAmount: meshObj.props.diffuseLightAmount.value,
      positionAmount: meshObj.props.positionAmount.value,
      scaleAmount: meshObj.props.scaleAmount.value,
      ambientLightAmount: meshObj.props.ambientLightAmount.value,
      color: meshObj.props.color.value,
    })

  function update() {
    //const MIN_Z = -REGL_CONST.MAX_Z * 0.75
    for (let j = _ACTIONS.static.length - 1; j >= 0; j--) {
      let meshObj = _ACTIONS.static[j]
      meshObj.geo.framesRendered++
      /*if (meshObj.geo.modelMatrix[14] > MIN_Z) {
        mat4.translate(
          meshObj.geo.modelMatrix,
          meshObj.geo.modelMatrix,
          [
            0,
            0,
            -meshObj.increment.z,
          ]
        )
      }*/
      draw(meshObj)
    }
    for (let i = _ACTIONS.fly.length - 1; i >= 0; i--) {
      let meshObj = _ACTIONS.fly[i]
      meshObj.geo.framesRendered++
      mat4.translate(
        meshObj.geo.modelMatrix,
        meshObj.geo.modelMatrix,
        [
          meshObj.increment.x,
          meshObj.increment.y,
          meshObj.increment.z,
        ]
      )
      draw(meshObj)
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
    m.texture.destroy()
    return { uuid: m.geo.uuid, props: m.props }
  }

  function add(geo, type, props = {}) {
    /*const modelMatrix = mat4.create([0, 0, 0])
    mat4.translate(modelMatrix, modelMatrix, [
      (props.position.x * 2 - 1) * FAR_Z / 2,
      props.position.y * -1 * 2 - 1 * FAR_Z / 2,
      -FAR_Z,
    ])*/
    const { shape } = props
    const sample = chooseSample(shape.value)

    //***8
    const SEQ_DUR_ADJUSTED = STATE.sequenceDuration * 0.6
    //***8

    loadAsset(sample.imageUrl, assets => {
      const imageTexture = regl.texture(assets.soundImg)
      const time = SEQUENCE_LENGTH * 16 / (STATE.bmp / STATE.fps)
      const tr = mat4.getTranslation(vec3.create(), geo.modelMatrix)
      const increment = {
        x: tr[0] / (STATE.fps * SEQ_DUR_ADJUSTED) * -1,
        y: tr[1] / (STATE.fps * SEQ_DUR_ADJUSTED) * -1,
        z: Math.abs(tr[2]) / (STATE.fps * SEQ_DUR_ADJUSTED),
      }
      if (type === "fly") {
        mat4.translate(
          geo.modelMatrix,
          geo.modelMatrix,
          DESINATIONS[_desinationIndex]
        )
      } else if (type === "static") {
        mat4.scale(geo.modelMatrix, geo.modelMatrix, [
          REGL_CONST.STATIC_SCALE,
          REGL_CONST.STATIC_SCALE,
          REGL_CONST.STATIC_SCALE,
        ])
      }

      _ACTIONS[type].push({
        geo,
        increment,
        texture: imageTexture,
        props,
      })
      _desinationIndex = (_desinationIndex + 1) % DESINATIONS.length
    })
  }

  function getObjectsAndPositions(type = "fly") {
    return _ACTIONS[type].map(obj => ({
      mesh: obj.geo,
      uuid: obj.geo.uuid,
      framesRendered: obj.geo.framesRendered,
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
