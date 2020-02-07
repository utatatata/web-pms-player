<script>
  import { link } from "svelte-spa-router";
  export let subtitle;
  export let route;

  const activate = r => (r === route ? "uk-active" : "");
</script>

<style>
  h1 a {
    color: #ee395b;
    /*color: #ff3e00;*/
  }
</style>

<header>
  <div class="uk-margin-bottom">
    <div>
      <h1 class="uk-heading-small uk-heading-divider">
        <a class="uk-link-heading" href="/" use:link>Web PMS Player</a>
      </h1>
    </div>
    <nav class="uk-navbar-container" uk-navbar>
      <div class="uk-navbar-left">
        <ul class="uk-navbar-nav">
          <li class={activate('/')}>
            <a href="/" use:link>Home</a>
          </li>
          <li class={activate('/importer')}>
            <a href="/importer" use:link>Importer</a>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</header>
