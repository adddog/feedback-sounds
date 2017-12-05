import observable from "proxy-observable"
import {autobind} from "core-decorators"

export default class Keyboard {
  constructor() {
    this.keyCodes = o({

    })

    window.addEventListener("keyup", this._keyUp.bind(this.))
  }

  on(label, callback) {
    this.listeners.has(label) || this.listeners.set(label, [])
    this.listeners.get(label).push(callback)
  }

  off(label, callback) {
    let listeners = this.listeners.get(label),
      index

    if (listeners && listeners.length) {
      index = listeners.reduce((i, listener, index) => {
        return isFunction(listener) && listener === callback
          ? (i = index)
          : i
      }, -1)

      if (index > -1) {
        listeners.splice(index, 1)
        this.listeners.set(label, listeners)
        return true
      }
    }
    return false
  }
  emit(label, ...args) {
    let listeners = this.listeners.get(label)

    if (listeners && listeners.length) {
      listeners.forEach(listener => {
        listener(...args)
      })
      return true
    }
    return false
  }
}
