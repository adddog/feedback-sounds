import Mesh from "./music-geometry"
import { mat4, vec3 } from "gl-matrix"
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

  const getHits = () => engineInteraction.getHits(meshes)

  engineInteraction.on("ray:click", ray => {
    const flyHits = getHits()
  })

  let _currentHits = []
  engineInteraction.on("ray:down", ray => {
    _currentHits = getHits()
    if (_currentHits.length) {
      const mesh = meshes[0]
      mesh.onDown()
    }
  })

  engineInteraction.on("ray:up", ray => {
    _currentHits.length = 0
  })

  engineInteraction.on("ray:move", ray => {
    if (_currentHits.length) {
      const mesh = meshes[0]
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
    }
  })

  function add(audioBuffer) {
    const mesh = meshGeometry.createFromAudioBuffer(audioBuffer)

    meshes.push(mesh)

    regl.frame(function() {
      regl.clear({
        color: [0, 0, 0, 1],
      })
      reglEngine.setupCamera(() => {
        mesh.draw()
        /*mesh.draw({
          color: [1, 0, 0],
          ambientLightAmount: 0.3,
          diffuseLightAmount: 0.8,
          scaleAmount: 1,
          positionAmount: 0,
        })*/
      })
      //drawRegl()
    })
  }

  return {
    add,
  }
}

module.exports = MusicRegl
