import normals from 'angle-normals'
import { BaseMesh, reglGeo } from "geometry/base"
import { VERT, FRAG } from "geometry/glsl"
import { REGL_CONST } from "common/common"
import { mat4 } from "gl-matrix"

const CapsuleGeometry = regl => {
  const capsule = require("primitive-capsule")(1,1,4,4)

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
