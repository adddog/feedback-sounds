const normals = require("angle-normals")
import { BaseMesh, reglGeo } from "./base"
import { VERT, FRAG } from "./glsl"
import { REGL_CONST } from "../common"
import { mat4 } from "gl-matrix"

const CapsuleGeometry = regl => {
  const capsule = require("primitive-capsule")(1,1,6,6)

  class CapsuleMesh extends BaseMesh {
    constructor(geo,props) {
      super(geo,props)
    }
  }

  CapsuleMesh.prototype.draw = regl(reglGeo(regl, capsule))

  function create(props) {
    return new CapsuleMesh(capsule,props)
  }

  return {
    create,
  }
}

export default CapsuleGeometry
