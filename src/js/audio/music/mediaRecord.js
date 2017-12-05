var Recorder = (options = { type: "audio/webm" }) => {
  var chunks = []
  var count = 0
  let _cb
  let mediaRecorder

  function log(message) {
    console.warn(message)
  }

  const ondataavailable = e => {
    chunks.push(e.data)
  }

  const onerror = e => {
    log("Error: " + e)
    console.log("Error: ", e)
  }

  const onstart = () => {
    log("Started & state = " + mediaRecorder.state)
  }

  const onstop = () => {
    log("Stopped  & state = " + mediaRecorder.state)

    var blob = new Blob(chunks, {
      type: `${options.type}`,
    })
    /*var fileReader = new FileReader()
    fileReader.onloadend = () => _cb(fileReader.result)
    fileReader.readAsArrayBuffer(blob)
*/
    chunks = []

    _cb(blob)
  }

  const onpause = () => {
    log("Paused & state = " + mediaRecorder.state)
  }

  const onresume = () => {
    log("Resumed  & state = " + mediaRecorder.state)
  }

  const onwarning = e => {
    log("Warning: " + e)
  }

  const addListeners = () => {
    if(!mediaRecorder) return
    mediaRecorder.addEventListener("dataavailable", ondataavailable)
    mediaRecorder.addEventListener("error", onerror)
    mediaRecorder.addEventListener("start", onstart)
    mediaRecorder.addEventListener("stop", onstop)
    mediaRecorder.addEventListener("pause", onpause)
    mediaRecorder.addEventListener("resume", onresume)
    mediaRecorder.addEventListener("warning", onwarning)
  }

  const removeListeners = () => {
    if(!mediaRecorder) return
    mediaRecorder.removeEventListener("dataavailable", onwarning)
    mediaRecorder.removeEventListener("error", onerror)
    mediaRecorder.removeEventListener("start", onstart)
    mediaRecorder.removeEventListener("stop", onstop)
    mediaRecorder.removeEventListener("pause", onpause)
    mediaRecorder.removeEventListener("resume", onresume)
    mediaRecorder.removeEventListener("warning", onwarning)
  }

  function addStream(stream, opt = {}) {
    removeListeners()
    mediaRecorder = new MediaRecorder(
      stream,
      Object.assign({}, options, opt)
    )
    addListeners()
  }

  function stop(cb) {
    _cb = cb
    if (mediaRecorder.state === "recording") {
      mediaRecorder.stop()
    }
    //mediaRecorder.requestData()
  }

  function start(argument) {
    if (!mediaRecorder) {
      log(`No recorder`)
      return
    }
    mediaRecorder.start(0)
  }

  return {
    addStream,
    start,
    stop,
  }
}

export default Recorder
