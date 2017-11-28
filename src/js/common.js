import Tone from "tone"
import { sample } from "lodash"
import Colors from "nice-color-palettes"
import observable from "proxy-observable"

export const SEQUENCE_LENGTH = 32
export const getColor = () => sample(Colors)

export const STATE = observable({
  files: {},
  fps: 60,
  bmp: Tone.Transport.bpm.value,
  sequenceDuration: 4,
})

let _aspect = window.innerWidth / window.innerHeight
export const REGL_CONST = {
  MAX_X: 40 * _aspect,
  MAX_Y: 40,
  MAX_Z: 40,
}
window.addEventListener(
  "resize",
  () => window.innerWidth / window.innerHeight
)
export const SAMPLE_TYPES = {
  kick: {
    value: "kick",
    names: ["kick"],
    shape: "box",
  },
  tom: {
    value: "tom",
    names: ["tom", "bongo"],
    shape: "capsule",
  },
  conga: {
    value: "conga",
    names: ["conga", "clave"],
    shape: "sphere",
  },
  hihat: {
    value: "hihat",
    names: ["hi hat", "hh", "snap", "agogo", "cowbell"],
    shape: "chevron",
  },
  snare: {
    value: "snare",
    names: ["snare", "rim"],
    shape: "torus",
  },
  cymbal: {
    value: "cymbal",
    names: ["cymbal", "ride", "crash"],
    shape: "arc",
  },
}
