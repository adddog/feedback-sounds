import Hammerjs from "hammerjs"

const EngineInteraction = emitter => {
  const hammer = new Hammer.Manager(window, {
    recognizers: [
      // RecognizerClass, [options], [recognizeWith, ...], [requireFailure, ...]
      //[Hammer.Rotate],
      [Hammer.Tap, { event: "doubletap", taps: 2, interval: 350 }],
      [Hammer.Pinch, { enable: true }],
      //[Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }],
    ],
  })

  hammer.on("pinch", ev => {
    console.log(ev)
    emitter.emit("touch:pinch", ev)
  })

  let _tapEvent
  hammer.on("tap", ev => {
    _tapEvent = ev
    emitter.emit("touch:tap", ev)
  })

  hammer.on("doubletap", ev => {
    _tapEvent = ev
    emitter.emit("touch:doubletap", ev)
  })

  function on(label, callback) {
    emitter.on(label, callback)
  }

  function off(label, callback) {
    emitter.off(label, callback)
  }

  const tapEvent = () => _tapEvent || {}

  return {
    tapEvent,
    on,
    off,
  }
}

export default EngineInteraction
