import { mat4 } from "gl-matrix"
function Mouse(container, regl) {
  const TIME = 850
  const TIME_I = 10
  let _mouseTimeout
  let _isStill = false
  let _canDraw  = false
  let _interval
  let _clickCounter
  let _iCounter
  const el = document.createElement("div")
  el.style.position = "absolute"
  el.style.display = "none"
  el.classList.add("mesh-timer")
  container.appendChild(el)

  const reset = () => {
    _iCounter = 0
    _clickCounter = 0
    _isStill = false
    _canDraw = false
    window.removeEventListener("click", _onClick)
    clearInterval(_interval)
    clearTimeout(_mouseTimeout)
  }

  const _onClick = () => {
    _clickCounter++
  }

  const startCount = () => {
    reset()
    _interval = setInterval(() => {
      if (_iCounter < TIME) {
        _iCounter += TIME_I
      } else {
        _isStill = true
        el.style.display = "block"
        window.addEventListener("click", _onClick)
      }
    }, TIME_I)
  }
  let _previousX = 0,
    _previousY = 0

  const translation = []
  window.addEventListener("mousemove", e => {
    if (
      Math.abs(e.pageX - _previousX) >= 1 ||
      Math.abs(e.pageY - _previousY) >= 1
    ) {
      el.style.display = "none"
      reset()
      startCount()
    }
    if (!!_interval) {
      el.style.left = `${e.pageX - 5}px`
      el.style.top = `${e.pageY - 5}px`
    }
    _previousX = e.pageX
    _previousY = e.pageY

    /*translation[0] = (e.pageX / window.innerWidth - 0.5) * 2
    translation[1] =
      ((window.innerHeight - e.pageY) / window.innerHeight - 0.5) * 2
    translation[2] = -5

    modelMatrix[12] = (e.pageX / window.innerWidth - 0.5) * 2
    modelMatrix[13] =
      ((window.innerHeight - e.pageY) / window.innerHeight - 0.5) * 2
    modelMatrix[14] = 0.1*/
  })

  const isStill = () => _isStill
  const getClicks = () => _clickCounter * 0.5

  const icosphere = require("primitive-icosphere")(1, {
    subdivisions: 1,
  })

  /*const modelMatrix = mat4.create()
  mat4.translate(modelMatrix, modelMatrix, [0.5, 0.5, -10])
  const COLOR = [1, 0.1, 0.1]
  const draw = () => {
    if (_canDraw) {
      regl({
        vert: `
    precision lowp float;
    uniform mat4 projection, view, model;
    attribute vec3 position;
    attribute vec3 normal;
    uniform vec3 color;
    uniform float scale;

    varying vec3 vColor;

          mat3 rotateY(float rad) {
          float c = cos(rad);
          float s = sin(rad);
          return mat3(
              c, 0.0, -s,
              0.0, 1.0, 0.0,
              s, 0.0, c
          );
      }


    void main () {
      vec3 pos = position * scale;
      vec3 norm = normal;
      float cosTheta = dot(normal, vec3(0.39, 0.87, 0.29));
      vColor = norm / 2. + clamp(color * cosTheta,0.,1.);
      gl_Position = projection * view * model * vec4(pos, 1);
    }
    `,
        frag: `
    precision lowp float;
    varying vec3 vColor;

    void main () {
      gl_FragColor = vec4(vColor, 1.);
    }
    `,

        uniforms: {
          model: modelMatrix,
          scale: regl.prop("scale"),
          view: regl.context("view"),
          projection: regl.context("projection"),
          color: COLOR,
        },

        attributes: {
          position: icosphere.positions,
          normal: icosphere.normals,
        },

        elements: icosphere.cells,
      })({scale:1})
    }
  }

  const updateMeshPosition = pos=>{
    modelMatrix[12] = pos[0]
    modelMatrix[13] =pos[1]
    modelMatrix[14] =pos[2]
    console.log(pos);
    _canDraw = true
  }*/

  return {
    //updateMeshPosition,
    //draw,
    reset,
    getClicks,
    isStill,
  }
}

module.exports = Mouse
