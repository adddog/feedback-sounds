const normals = require("angle-normals")
import { VERT, FRAG } from "./glsl"
import { BaseMesh, reglGeo,torusSettings } from "./base"
import { REGL_CONST } from "../common"
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
