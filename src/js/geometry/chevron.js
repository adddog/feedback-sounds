import normals from 'angle-normals'
import { BaseMesh, reglGeo, torusSettings } from "geometry/base"
import {VERT,FRAG} from "geometry/glsl"
import {REGL_CONST} from "common/common"
import { mat4 } from "gl-matrix"

const ChevronGeometry = regl => {
  const chevron = require("primitive-torus")(torusSettings)

  class ChevronMesh extends BaseMesh {
    constructor(geo,props) {
      super(geo,props)
    }
  }

  ChevronMesh.prototype.draw = regl(reglGeo(regl, chevron))

  function create(props) {
    return new ChevronMesh(chevron,props)
  }

  return {
    create,
  }
}

export default ChevronGeometry
