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
  import { pd } from "../eventHandler.js";

  /* Utilities */
  const notification = (status, msg) => {
    const icon =
      status === "danger" ? "ban" : status === "warning" ? "warning" : "check";
    UIkit.notification(
      `<div class="uk-text-center uk-text-large uk-text-bold">${msg}<span class="uk-margin-small-left" uk-icon="${icon}" /></div>`,
      { status }
    );
  };

  /* Globals */
  // for filepont bind
  let filepondInput;
  let filepond;
  let importing = false;
  let importingPms = null;

  /* Externals */
  onMount(() => {
    // init filepond
    filepond = FilePond.create(filepondInput);
  });

  /* Handlers */
  const startImport = pd(async _ => {
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

    // difficulty is 'n', 'h', or 'ex' (probably)
    const difficulty = pms => pms.base.split("-").slice(-1)[0];

    if (pmses.length !== 0) {
      importingPms = {
        player: pmses[0].data.player,
        genre: pmses[0].data.genre,
        title: pmses[0].data.title,
        artist: pmses[0].data.artist,
        levels: pmses
          .map(pms => ({ [difficulty(pms)]: pms.data.playlevel }))
          .reduce((x, y) => ({ ...x, ...y })),
        files: [...pmses, ...others]
      };
      return;
    } else {
      notification("danger", "Found no PMS files");
      importing = false;
    }
  });

  const doImport = pd(async _ => {
    try {
      await insertPMS(importingPms);
      notification("success", "Succeeded to add PMS");
      importing = false;
      importingPms = null;
      filepond.removeFiles();
    } catch (e) {
      notification("danger", "Failed to add PMS");
      console.error(e);
      importing = false;
      importingPms = null;
    }
  });

  const cancelImport = pd(_ => {
    importing = false;
    importingPms = null;
    filepond.removeFiles();
    notification("warning", "Cancelled to add PMS");
  });
</script>

<style>

</style>

<Header route="/importer" />

<main>
  <div class="uk-container">
    <form>
      {#if importingPms === null}
        <div class="uk-flex uk-flex-left uk-flex-middle">
          <button
            class="uk-button uk-button-default"
            on:click={startImport}
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
        <div
          class="uk-card uk-card-default uk-card-body uk-margin-bottom
          uk-text-center">
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
            <dd>
              <div class="uk-flex uk-flex-center">
                <div>NORMAL</div>
                <div class="uk-margin-small-left">
                  {importingPms.levels['n']}
                </div>
                <div class="uk-margin-left">HARD</div>
                <div class="uk-margin-small-left">
                  {importingPms.levels['h']}
                </div>
                <div class="uk-margin-left">EX</div>
                <div class="uk-margin-small-left">
                  {importingPms.levels['ex']}
                </div>
              </div>
            </dd>
          </dl>
        </div>
      {/if}
      <hr class="uk-margin-large-bottom" />
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
