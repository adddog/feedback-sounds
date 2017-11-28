import quad from "./quad"
import chevron from "./chevron"
import sphere from "./sphere"
import capsule from "./capsule"
import torus from "./torus"
import box from "./box"
import arc from "./arc"
function Geometry(regl) {
  return  {
    sphere: sphere(regl),
    quad: quad(regl),
    capsule: capsule(regl),
    chevron: chevron(regl),
    torus: torus(regl),
    arc: arc(regl),
    box: box(regl),
  }
}
export default Geometry