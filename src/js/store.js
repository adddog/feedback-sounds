import Desktop from "./desktop"

/*
DEV ONLY
*/

function store(state, emitter) {
  emitter.on("DOMContentLoaded", function(el) {

    console.log("DOMContentLoaded")

    window.DesktopSequencer.start()
  })
}

module.exports = store
