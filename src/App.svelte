<script>
  import Router from "svelte-spa-router";
  import Home from "./routes/Home.svelte";
  import Importer from "./routes/Importer.svelte";

  const routes = {
    "/": Home,
    "/importer": Importer
  };
</script>

<style type="scss" global>
  /* custom variables and variable overwrites */

  @import "uikit/src/scss/variables-theme.scss";
  @import "uikit/src/scss/mixins-theme.scss";

  /* custom mixin overwrites */

  @import "uikit/src/scss/uikit-theme.scss";
</style>

<Router {routes} />
