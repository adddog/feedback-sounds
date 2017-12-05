import Mesh from "./music-geometry"
import { IS_DEV, GUI_O } from "common/common"
import { mat4, vec3 } from "gl-matrix"
import { compact } from "lodash"
import Geometry from "geometry"

//const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

function MusicRegl(reglEngine) {
  const { regl, engineInteraction, mouse } = reglEngine
  const meshes = []
  const meshGeometry = Mesh(reglEngine)

  const getAllMeshPositions = () =>
    meshes.map(mesh => {
      return {
        position: vec3.add(
          vec3.create(),
          mat4.getTranslation(vec3.create(), mesh.modelMatrix),
          [1, 0, 0]
        ),
      }
    })

  const getMeshesFromHits = () =>
    compact(
      engineInteraction
        .getHits(meshes)
        .map((hit, i) => (!!hit ? meshes[i] : null))
    )

  engineInteraction.on("ray:click", ray => {})

  let _currentHitMeshes = []
  engineInteraction.on("ray:down", ray => {
    _currentHitMeshes = getMeshesFromHits()
    _currentHitMeshes.forEach(mesh => mesh.onDown())
  })

  engineInteraction.on("ray:up", ray => {
    _currentHitMeshes.length = 0
  })

  engineInteraction.on("ray:move", ray => {
    _currentHitMeshes.forEach(mesh =>
      mesh.updatePosition(
        vec3.sub(
          vec3.create(),
          ray.startPosition,
          vec3.fromValues(
            ray.x / window.innerWidth * 2 - 1,
            (1 - ray.y / window.innerHeight) * 2 - 1,
            0
          )
        )
      )
    )
  })

  function add(audioBuffer) {
    const mesh = meshGeometry.createFromAudioBuffer(audioBuffer)
    meshes.push(mesh)
    return mesh
  }

  if (IS_DEV) {
    regl.frame(function() {
      regl.clear({
        color: [0, 0, 0, 1],
      })
      reglEngine.setupCamera(() => {
        meshes.forEach(mesh => mesh.draw())
        /*mesh.draw({
          color: [1, 0, 0],
          ambientLightAmount: 0.3,
          diffuseLightAmount: 0.8,
          scaleAmount: 1,
          positionAmount: 0,
        })*/
      })
      //drawRegl()
      /*line2d({
        thickness: 4,
        points: [0.25, 0, 0.3, 1.5, 0, 2],
        close: false,
        color: "red",
      })*/
    })
  }


  return {
    add,
  }
}

module.exports = MusicRegl
