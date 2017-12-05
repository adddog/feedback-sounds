import normals from 'angle-normals'
import { BaseMesh, reglGeo } from "geometry/base"
import { VERT, FRAG } from "geometry/glsl"
import { REGL_CONST } from "common/common"
import { mat4 } from "gl-matrix"

const SphereGeometry = regl => {
  const icosphere = require("primitive-icosphere")(1, {
    subdivisions: 2,
  })

  class SphereMesh extends BaseMesh {
    constructor(geo, props) {
      super(geo, props)
    }
  }

  SphereMesh.prototype.draw = regl(reglGeo(regl, icosphere))

  function create(props) {
    return new SphereMesh(icosphere, props)
  }

  return {
    create,
  }
}

export default SphereGeometry
