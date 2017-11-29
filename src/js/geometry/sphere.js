const normals = require("angle-normals")
import { BaseMesh, reglGeo } from "./base"
import { VERT, FRAG } from "./glsl"
import { REGL_CONST } from "../common"
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

  console.log(icosphere)

  SphereMesh.prototype.draw = regl(reglGeo(regl, icosphere))

  function create(props) {
    return new SphereMesh(icosphere, props)
  }

  return {
    create,
  }
}

export default SphereGeometry
