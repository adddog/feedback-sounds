import { REGL_CONST } from "../common"
import { BaseMesh, reglGeo } from "./base"
import { VERT, FRAG } from "./glsl"
import { mat4 } from "gl-matrix"

const SphereGeometry = regl => {
  const box = require("primitive-quad")()

  class QuadMesh extends BaseMesh {
    constructor(geo, props) {
      super(geo, props)
    }
  }
  QuadMesh.prototype.draw = regl(reglGeo(regl, box))

  function create(props) {
    return new QuadMesh(box, props)
  }

  return {
    create,
  }
}

export default SphereGeometry
