import normals from 'angle-normals'
import { VERT, FRAG } from "geometry/glsl"
import { BaseMesh, reglGeo,torusSettings } from "geometry/base"
import { REGL_CONST } from "common/common"
import { mat4 } from "gl-matrix"

const torusGeometry = regl => {
  const torus = require("primitive-torus")(torusSettings)

  class torusMesh extends BaseMesh {
    constructor(geo,props){
      super(geo,props)
    }
  }

  torusMesh.prototype.draw = regl(reglGeo(regl, torus))

  function create(props) {
    return new torusMesh(torus,props)
  }

  return {
    create,
  }
}

export default torusGeometry
