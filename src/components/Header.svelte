<script lang="typescript">
  import { link } from "svelte-spa-router";
  export let route;

  const activate = r => (r === route ? "uk-active" : "");
</script>

<style>

</style>

<header>
  <div class="uk-margin-bottom">
    <nav class="uk-navbar-container" uk-navbar uk-sticky>
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
