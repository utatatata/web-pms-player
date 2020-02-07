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

  const notification = (status, msg) => {
    const icon =
      status === "danger" ? "ban" : status === "warning" ? "warning" : "check";
    UIkit.notification(
      `<div class="uk-text-center uk-text-large uk-text-bold">${msg}<span class="uk-margin-small-left" uk-icon="${icon}" /></div>`,
      { status }
    );
  };

  const startImporting = async e => {
    e.preventDefault();
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

    console.log(pmses);
    console.log(others);
    console.log({
      player: pmses[0].data.player,
      genre: pmses[0].data.genre,
      title: pmses[0].data.title,
      artist: pmses[0].data.artist,
      playlevel: pmses[0].data.playlevel,
      pms: pmses,
      files: others
    });

    if (pmses.length !== 0) {
      try {
        await insertPMS({
          player: pmses[0].data.player,
          genre: pmses[0].data.genre,
          title: pmses[0].data.title,
          artist: pmses[0].data.artist,
          playlevel: pmses[0].data.playlevel,
          pms: pmses,
          files: others
        });
        notification("success", "Succeeded to add PMS");
        filepond.removeFiles();
      } catch (_) {
        notification("danger", "Failed to add PMS");
      }
    } else {
      notification("danger", "Failed to add PMS");
    }

    importing = false;
  };

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
      <div class="uk-flex-inline uk-flex-left uk-flex-middle uk-width-max">
        <button
          class="uk-button uk-button-default"
          on:click={startImporting}
          disabled={importing}>
          Import
        </button>
        <button
          class="uk-button uk-button-danger"
          on:click={e => e.preventDefault() || filepond.removeFiles()}>
          reset
        </button>
        <div
          class="uk-margin-left{importing ? '' : ' uk-invisible'}"
          uk-spinner />
      </div>
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
