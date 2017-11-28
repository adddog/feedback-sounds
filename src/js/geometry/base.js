const normals = require("angle-normals")
import { VERT, FRAG } from "./glsl"
import { REGL_CONST } from "../common"
import { mat4 } from "gl-matrix"
import { v4 } from "uuid"

export const reglGeo = (regl, geo) => {
  return {
    vert: VERT,
    frag: FRAG,

    uniforms: {
      // dynamic properties are invoked with the same `this` as the command
      model: regl.this("modelMatrix"),
      view: regl.context("view"),
      projection: regl.context("projection"),
      ambientLightAmount: 0.6,
      diffuseLightAmount: 0.3,
      color: regl.prop("color"),
      texture: regl.prop("texture"),
      tick: regl.context("tick"),
      lightDir: [0.39, 0.87, 0.29],
    },

    attributes: {
      position: geo.positions,
      uvs: geo.uvs,
      normal: geo.normals || regl.this("_normals"),
    },

    elements: geo.cells,
  }
}

export class BaseMesh {
  constructor(geo, props = {}) {
    this.uuid = v4()
    this._normals = normals(geo.cells, geo.positions)
    this.modelMatrix = mat4.create()
    if (props.position) {
      mat4.translate(
        this.modelMatrix,
        this.modelMatrix,
        props.position
      )
    } else {
      const randomX =
        Math.random() * REGL_CONST.MAX_X * 2 - REGL_CONST.MAX_X
      const randomY =
        Math.random() * REGL_CONST.MAX_Y * 2 - REGL_CONST.MAX_Y

      mat4.translate(this.modelMatrix, this.modelMatrix, [
        randomX,
        randomY,
        -REGL_CONST.MAX_Z,
      ])
    }
  }
}
