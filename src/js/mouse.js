function Mouse(container, onCheckRay) {
  const TIME = 850
  const TIME_I = 10
  const _onCheckRay = onCheckRay
  let _mouseTimeout
  let _isStill = false
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
        reset()
        window.addEventListener("click", _onClick)
      }
    }, TIME_I)
  }
  let _previousX = 0,
    _previousY = 0
  window.addEventListener("mousemove", e => {
    if (
      Math.abs(e.pageX - _previousX) >= 1 ||
      Math.abs(e.pageY - _previousY) >= 1
    ) {
      el.style.display = "none"
      reset()
      _isStill = false
      _mouseTimeout = setTimeout(() => {
        reset()
        startCount()
        el.style.display = "block"
        _onCheckRay()
      }, 400)
    }
    if (!!_interval) {
      el.style.left = `${e.pageX - 5}px`
      el.style.top = `${e.pageY - 5}px`
    }
    _previousX = e.pageX
    _previousY = e.pageY
  })

  const isStill = () => _isStill
  const getClicks = () => _clickCounter * 0.1

  return {
    onCheckRay,
    getClicks,
    isStill,
  }
}

module.exports = Mouse
