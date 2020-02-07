<script>
  import { link } from "svelte-spa-router";
  import { parsePMS } from "../parser.js";
  import { getAllPMS, insertPMS } from "../db.js";
  import Header from "../components/Header.svelte";

  let importing = false;
  let pmsInput = "";

  const startImporting = async () => {
    importing = true;
    const pms = parsePMS(pmsInput);

    if (pms !== null) {
      await insertPMS(pms);
    }

    importing = false;
  };
  const deleteInput = () => {
    pmsInput = "";
  };
</script>

<style>

</style>

<Header route="/importer" subtitle="Importer" />

<main>
  <div class="uk-container">
    <form class="uk-text-center">
      <button
        class="uk-button uk-button-default"
        on:click={startImporting}
        disabled={importing}>
        Import
      </button>
      <button class="uk-button uk-button-danger" on:click={deleteInput}>
        reset
      </button>
      <hr />
      <textarea class="uk-textarea uk-height-large" bind:value={pmsInput} />
    </form>
  </div>
</main>
