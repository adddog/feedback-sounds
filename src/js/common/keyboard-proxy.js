import observable from "lib/observable"
import KeyCode from "keycode-js"
import { autobind } from "core-decorators"

class Keyboard {
  constructor() {
    const model = {}
    new Array(224).fill().forEach((_, i) => (model[i] = false))
    this.keyCodes = observable(model)
    window.addEventListener("keyup", this._keyUp)
    window.addEventListener("keydown", this._keyDown)
  }

  @autobind
  _keyUp(e) {
    this.keyCodes[e.keyCode] = false
  }
  @autobind
  _keyDown(e) {
    this.keyCodes[e.keyCode] = true
  }

  isDown(code){
    return this.keyCodes[code]
  }
}

export default new Keyboard()
