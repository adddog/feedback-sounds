import Color from "color"
import Tone from "tone"
import Emitter from "./emitter"
import { sample } from "lodash"
import Colors from "nice-color-palettes"
import observable from "proxy-observable"

export const IS_DEV = process.env.NODE_ENV==="development"

export const SEQUENCE_LENGTH = 32
export const getColor = () => sample(Colors)
export const colors = getColor()
export const brightestColor = (colors, exportHex = false) =>
  colors
    .map(hex => Color(hex))
    .sort((a, b) => b.rgbNumber() > a.rgbNumber())
    .map(color => (exportHex ? color.hex() : color))

export const STATE = observable({
  files: {},
  fps: 60,
  bmp: Tone.Transport.bpm.value,
  sequenceDuration: 4,
})

let _aspect = window.innerWidth / window.innerHeight
const MAX_Z = 40
export const REGL_CONST = {
  MAX_X: 40 * _aspect,
  MAX_Y: 40,
  MAX_Z: MAX_Z,
  MAX_Z_HALF: MAX_Z / 2,
  AMBIENT_LIGHT: 0.7,
  DIFFUSE_LIGHT: 0.5,
  POSITION_AMOUNT: 0.1,
  SCALE: 1,
  STATIC_SCALE: 0.5,
}
window.addEventListener(
  "resize",
  () => window.innerWidth / window.innerHeight
)

window.addEventListener("focus", () => Emitter.emit("window:focus"))
window.addEventListener("blur", () => Emitter.emit("window:blur"))

export const SAMPLE_TYPES = {
  kick: {
    value: "kick",
    names: ["kick"],
    shape: "box",
    color: Color("#2427E0")
      .darken(Math.random() * 0.3)
      .lighten(Math.random() * 0.3),
  },
  tom: {
    value: "tom",
    names: ["tom", "bongo"],
    shape: "capsule",
    color: Color("#DA24E0")
      .darken(Math.random() * 0.3)
      .lighten(Math.random() * 0.3),
  },
  conga: {
    value: "conga",
    names: ["conga", "clave"],
    shape: "sphere",
    color: Color("#24CEE0")
      .darken(Math.random() * 0.3)
      .lighten(Math.random() * 0.3),
  },
  hihat: {
    value: "hihat",
    names: ["hi hat", "hh", "snap", "agogo", "cowbell"],
    shape: "chevron",
    color: Color("#E04D24")
      .darken(Math.random() * 0.3)
      .lighten(Math.random() * 0.3),
  },
  snare: {
    value: "snare",
    names: ["snare", "rim"],
    shape: "torus",
    color: Color("#24E027")
      .darken(Math.random() * 0.3)
      .lighten(Math.random() * 0.3),
  },
  cymbal: {
    value: "cymbal",
    names: ["cymbal", "ride", "crash"],
    shape: "arc",
    color: Color("#E0E024")
      .darken(Math.random() * 0.3)
      .lighten(Math.random() * 0.3),
  },

  /*keyboard: {
    value: "keyboard",
    names: ["cymbal", "ride", "crash"],
    shape: "arc",
    color: Color("#E0E024")
      .darken(Math.random() * 0.3)
      .lighten(Math.random() * 0.3),
  },*/
}
