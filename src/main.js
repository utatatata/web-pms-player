import App from "./App.svelte"
import UIkit from "uikit"
import Icons from "uikit/dist/js/uikit-icons"

UIkit.use(Icons)

const app = new App({
  target: document.body,
})

export default app
