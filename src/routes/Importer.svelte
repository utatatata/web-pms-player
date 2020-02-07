<script>
  import { onMount } from "svelte";
  import { link } from "svelte-spa-router";
  import FilePond from "filepond";
  import UIkit from "uikit";
  import Header from "../components/Header.svelte";
  import { parsePMS } from "../parser.js";
  import { insertPMS } from "../db.js";
  import { readBinary } from "../file.js";
  import * as P from "../promise.js";

  let importing = false;
  let filepondInput;
  let filepond;
  let pmsFiles = [];
  let importingPms = null;

  const pd = f => e => e.preventDefault() || f(e);

  const notification = (status, msg) => {
    const icon =
      status === "danger" ? "ban" : status === "warning" ? "warning" : "check";
    UIkit.notification(
      `<div class="uk-text-center uk-text-large uk-text-bold">${msg}<span class="uk-margin-small-left" uk-icon="${icon}" /></div>`,
      { status }
    );
  };

  const startImporting = pd(async e => {
    importing = true;

    if (filepond.status === 0) {
      // EMPTY
      notification("warning", "Select files");
      importing = false;
      return;
    } else if (filepond.status === 1) {
      // IDLE
    } else if (filepond.status === 2) {
      // ERROR
      notification("danger", "Failed to load files");
      importing = false;
      return;
    } else if (filepond.status === 3) {
      // BUSY
      notification("warning", "Loading files...");
      importing = false;
      return;
    } else if (filepond.status === 4) {
      // READY
    }

    const files = filepond.getFiles();

    const pmses = await P.bind(async f => ({
      name: f.filename,
      base: f.filenameWithoutExtension,
      ext: f.fileExtension,
      data: parsePMS(await f.file.text())
    }))(files.filter(f => f.fileExtension === "pms"));

    const others = await P.bind(async f => ({
      name: f.filename,
      base: f.filenameWithoutExtension,
      ext: f.fileExtension,
      data: await readBinary(f.file)
    }))(files.filter(f => f.fileExtension !== "pms"));

    if (pmses.length !== 0) {
      importingPms = {
        player: pmses[0].data.player,
        genre: pmses[0].data.genre,
        title: pmses[0].data.title,
        artist: pmses[0].data.artist,
        playlevel: pmses[0].data.playlevel,
        pms: pmses,
        files: others
      };
      return;
    } else {
      notification("danger", "Failed to add PMS");
    }

    importing = false;
  });

  const doImport = pd(async _ => {
    try {
      await insertPMS(importingPms);
      notification("success", "Succeeded to add PMS");
      filepond.removeFiles();
      importingPms = null;
      importing = false;
    } catch (_) {
      notification("danger", "Failed to add PMS");
      importingPms = null;
      importing = false;
    }
  });

  const cancelImport = pd(_ => {
    filepond.removeFiles();
    importingPms = null;
    importing = false;
    notification("warning", "Cancelled to add PMS");
  });

  onMount(() => {
    filepond = FilePond.create(filepondInput);
  });
</script>

<style global>
  @import "filepond/dist/filepond.min.css";
</style>

<Header route="/importer" />

<main>
  <div class="uk-container">
    <form class="uk-text-center">
      {#if importingPms === null}
        <div class="uk-flex-inline uk-flex-left uk-flex-middle uk-width-max">
          <button
            class="uk-button uk-button-default"
            on:click={startImporting}
            disabled={importing}>
            Import
          </button>
          <button
            class="uk-button uk-button-danger"
            on:click={pd(_ => filepond.removeFiles())}>
            reset
          </button>
          <div
            class="uk-margin-left{importing ? '' : ' uk-invisible'}"
            uk-spinner />
        </div>
      {:else}
        <div class="uk-card uk-card-default uk-card-body uk-margin-bottom">
          <h3 class="uk-card-title">Would you import it?</h3>
          <div class="uk-flex uk-flex-center">
            <button class="uk-button uk-button-default" on:click={doImport}>
              Import
            </button>
            <button class="uk-button uk-button-danger" on:click={cancelImport}>
              Cancel
            </button>
          </div>
          <dl class="uk-description-list uk-description-list-divider">
            <dt>Genre</dt>
            <dd>{importingPms.genre}</dd>
            <dd />
            <dt>Title</dt>
            <dd>{importingPms.title}</dd>
            <dd />
            <dt>Artist</dt>
            <dd>{importingPms.artist}</dd>
            <dd />
            <dt>Level</dt>
            <dd>{importingPms.playlevel}</dd>
          </dl>
        </div>
      {/if}
      <hr />
      <input
        bind:this={filepondInput}
        type="file"
        class="filepond"
        name="filepond"
        multiple
        data-allow-reporter="true"
        data-max-file-size="3MB"
        data-max-files="1000" />
    </form>
  </div>
</main>
