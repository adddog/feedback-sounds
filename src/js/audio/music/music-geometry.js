import normals from "angle-normals"
import cylinder from "primitive-cylinder"
import { BaseMesh, reglGeo } from "geometry/base"
import { VERT, FRAG } from "geometry/glsl"
import { REGL_CONST } from "common/common"
import { mat4, vec3 } from "gl-matrix"

const MusicGeometry = reglEngine => {
  const { regl } = reglEngine

  const SCALE = 6
  const SAMPLES = 40
  const G_HEIGHT = 2
  const G_SEG = Math.floor(SAMPLES / 2)

  class Mesh {
    constructor(geo, props = {}) {
      this.modelMatrix = mat4.create()
      mat4.translate(this.modelMatrix, this.modelMatrix, [
        -G_HEIGHT / 2,
        0,
        -5,
      ])

      this.geo = geo
    }

    get position(){
      return mat4.getTranslation(vec3.create(), this.modelMatrix)
    }

    draw() {
      return regl({
        vert: `
      precision lowp float;
    uniform mat4 projection, view, model;
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uvs;

    varying vec3 vNormal;
    varying vec3 vColor;

    uniform float tick;

          mat3 rotateX(float rad) {
        float c = cos(rad);
        float s = sin(rad);
        return mat3(
            1.0, 0.0, 0.0,
            0.0, c, s,
            0.0, -s, c
        );
    }

          mat3 rotateZ(float rad) {
          float c = cos(rad);
          float s = sin(rad);
          return mat3(
              c, s, 0.0,
              -s, c, 0.0,
              0.0, 0.0, 1.0
          );
      }



      const float DEG_TO_RAD = 3.141592653589793 / 180.0;

    void main () {
      vec3 pos = position;
      vec3 norm = normal;
      float yRad = tick * DEG_TO_RAD;
      pos = rotateZ(90. * DEG_TO_RAD) * pos;
      pos = rotateX(-20. *DEG_TO_RAD) * pos;
      norm = rotateZ(90. * DEG_TO_RAD) * norm;
      norm = rotateX(-20. *DEG_TO_RAD) * norm;
      vNormal = norm;
      vColor = norm;
      gl_Position = projection * view * model * vec4(pos, 1);
    }
    `,
        frag: `precision lowp float;
          varying vec3 vNormal;
          varying vec3 vColor;
    void main () {
      gl_FragColor = vec4(vColor, 1.);
    }`,

        uniforms: {
          model: regl.prop("modelMatrix"),
          view: regl.context("view"),
          tick: regl.context("tick"),
          projection: regl.context("projection"),
        },

        attributes: {
          position: regl.prop("positions"),
          uvs: regl.prop("uvs"),
          normal: regl.prop("normals"),
        },

        elements: regl.prop("cells"),
      })({
        modelMatrix: this.modelMatrix,
        positions: this.geo.positions,
        uvs: this.geo.uvs,
        normals: this.geo.normals,
        cells: this.geo.cells,
      })
    }
  }

  function createFromAudioBuffer(audioBuffer, props = {}) {
    const tempArray = audioBuffer.getChannelData(0)
    var len = tempArray.length

    const _vectorPositions = []
    const step = Math.floor(len / SAMPLES)
    const xI = 1 / len

    for (var i = 0; i < len; i += step) {
      _vectorPositions.push([
        xI * i,
        Math.min(
          Math.abs(tempArray[Math.min(i, len - 1)]) * SCALE,
          12
        ),
        xI * i,
      ])
    }
    const geo = cylinder(
      0.2, //size
      0.2, //size

      G_HEIGHT, // height
      G_SEG, //heighSeg

      3, // radialSeg
      _vectorPositions
    )

    return new Mesh(geo, props)
  }

  return {
    createFromAudioBuffer,
  }
}

export default MusicGeometry
