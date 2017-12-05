console.log("process.env.NODE_ENV", process.env.NODE_ENV)

const html = require("choo/html")
const choo = require("choo")

const app = choo()

app.use(require("choo-devtools")())

//app.use(require("./store"))

function mainView(state, emit) {
  return html`
    <div
    class="app"
    onload=${onload}
    >
    <div class="sequencer"></div>
    </div>
  `
}

app.route(`/*`, mainView)

const tree = app.start()
document.body.appendChild(tree)
