import Sequencer from "./Sequencer"

/*
DEV ONLY
*/

function store(state, emitter) {
  emitter.on("DOMContentLoaded", function(el) {

    console.log("DOMContentLoaded")

    window.Sequencer.start()
  })
}

module.exports = store
