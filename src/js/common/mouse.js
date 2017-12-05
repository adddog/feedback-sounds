import { mat4 } from "gl-matrix"
import KeyCode from "keycode-js"
import { keyboard , IS_DEV} from "common/common"

function Mouse(container, regl) {
  const TIME = 850
  const TIME_I = 10
  let _mouseTimeout
  let _isStill = false
  let _canDraw = false
  let _interval
  let _clickCounter
  let _iCounter
  const el = document.createElement("div")
  el.style.position = "absolute"
  el.style.display = "none"
  el.classList.add("mesh-timer")
  if(IS_DEV){
    container.appendChild(el)
  }

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
        show()
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
      hide()
      reset()
      startCount()
    }
    if (!!_interval) {
      el.style.left = `${e.pageX - 5}px`
      el.style.top = `${e.pageY - 5}px`
    }
    _previousX = e.pageX
    _previousY = e.pageY
  })

  const isStill = () => _isStill
  const getClicks = () => _clickCounter * 0.5

  const show = () => (el.style.display = "block")
  const hide = () => (el.style.display = "none")

  keyboard.keyCodes.on(KeyCode.KEY_SHIFT, v => (v ? show() : hide()))

  return {
    //updateMeshPosition,
    //draw,
    reset,
    getClicks,
    isStill,
  }
}

module.exports = Mouse
