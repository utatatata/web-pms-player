<script>
  import { link } from "svelte-spa-router";
  import Header from "../components/Header.svelte";
  import { getAllPMS } from "../db.js";

  let pmsList = [];
  let focusPms = null;
  (async () => {
    pmsList = await getAllPMS();
    console.log(pmsList);
    focusPms = pmsList[0];
  })();
</script>

<style>

</style>

<Header route="/" />

<main>
  <div class="uk-container">
    <div>
      <ul class="uk-list uk-list-striped">
        {#each pmsList as pms}
          {#if focusPms !== null && pms.id === focusPms.id}
            <li>{pms.title}</li>
          {:else}
            <li>{pms.title}</li>
          {/if}
        {/each}
      </ul>
    </div>
  </div>
</main>
