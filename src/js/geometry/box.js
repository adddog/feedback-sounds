const normals = require("angle-normals")
import { REGL_CONST } from "../common"
import { BaseMesh, reglGeo } from "./base"
import { VERT, FRAG } from "./glsl"
import { mat4 } from "gl-matrix"

const SphereGeometry = regl => {
  const box = require("primitive-cube")(1, 1, 1, 3, 3, 3)

  class BoxMesh extends BaseMesh {
    constructor(geo,props) {
      super(geo,props)
    }
  }
  console.log(box);
  BoxMesh.prototype.draw = regl(reglGeo(regl, box))

  function create(props) {
    return new BoxMesh(box,props)
  }

  return {
    create,
  }
}

export default SphereGeometry
