import Tone from "tone"

function Music() {
  function makeFader(track, name) {
    var player = new Tone.Player(
      "audio/" + track + ".[mp3|ogg]"
    ).sync()
    player.autostart = true
    player.loop = true
    var soloCtrl = new Tone.Solo()
    var panVol = new Tone.PanVol()
    panVol.volume.value = -10
    player.chain(panVol, soloCtrl, Tone.Master)
  }

  //makeFader("bass")
  //makeFader("chords")
  //makeFader("drone")

  /*Interface.Button({
  type: "toggle",
  text: "Start",
  activeText: "Stop",
  start: function() {},
  end: function() {
    Tone.Transport.stop()
  },
})*/
  Tone.Transport.start()
}

module.exports = Music
