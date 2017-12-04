const normals = require("angle-normals")
import { BaseMesh, reglGeo } from "./base"
import {VERT,FRAG} from "./glsl"
import {REGL_CONST} from "common/common"
import { mat4 } from "gl-matrix"

const arcGeometry = regl => {
  const arc = require("geo-arc")({
    cellSize: 3, // 1 == points, 2 == lines, 3 == triangles
    x: 0, // x position of the center of the arc
    y: 0, // y position of the center of the arc
    z: 0, // z position of the center of the arc
    startRadian: 0, // start radian for the arc
    endRadian: 6.28, // end radian for the arc
    innerRadius: .7, // inner radius of the arc
    outerRadius: 1, // outside radius of the arc
    numBands: 2, // subdivision from inside out
    numSlices: 6, // subdivision along curve
    drawOutline: false // if cellSize == 2 draw only the outside of the shape
  })

  class ArcMesh extends BaseMesh {
    constructor(geo,props) {
      super(geo,props)
    }
  }

  ArcMesh.prototype.draw = regl(reglGeo(regl, arc))

  function create(props) {
    return new ArcMesh(arc, props)
  }

  return {
    create,
  }
}

export default arcGeometry
