import { REGL_CONST } from "common/common"
import { BaseMesh, reglGeo } from "geometry/base"
import { VERT, FRAG } from "geometry/glsl"
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
