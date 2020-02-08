<script>
  import { link } from "svelte-spa-router";
  import UIkit from "uikit";
  import Header from "../components/Header.svelte";
  import * as DB from "../utils/db.js";
  import { preventDefault } from "../utils/eventHandler.js";

  /* Globals */
  let pmsList = [];
  let focusPms = null;
  let gamepadIndex = 0;

  (async () => {
    pmsList = (await DB.getAllPMS())
      // ref: for `bind:this`
      .map(pms => ({ ...pms, ref: null }));
    focusPms = pmsList[0];
  })();

  /* Helpers */
  const scroll = i =>
    i >= pmsList.length
      ? {}
      : UIkit.scroll(pmsList[i].ref, { offset: 200, duration: 200 }).scrollTo(
          // Caution! `.ref` is initialized by Svelte (`bind:this`)
          pmsList[i].ref
        );
  const focus = i =>
    i >= pmsList.length ? {} : ((focusPms = pmsList[i]), scroll(i));
  const focusIndex = () => {
    if (focusPms === null) return NaN;
    const i = pmsList.findIndex(p => p.id === focusPms.id);
    return i == -1 ? NaN : i;
  };

  /* move focus */
  const left = (n = 1) => focus(Math.max(0, focusIndex() - n));
  const right = (n = 1) =>
    focus(Math.min(focusIndex() + n, pmsList.length - 1));
  const up = (n = 1) => left(n * 3);
  const down = (n = 1) => right(n * 3);

  /* Handlers */
  const handleKeyDown = e => {
    if (focusPms === null) {
      return;
    }
    if (e.key === "ArrowLeft") {
      left();
    } else if (e.key === "ArrowRight") {
      right();
    } else if (e.key === "ArrowUp") {
      up();
    } else if (e.key === "ArrowDown") {
      down();
    }
  };

  /* Gamepad */
  {
    // button numbers of pop'n
    const B1 = 0;
    const B2 = 1;
    const B3 = 7;
    const B4 = 2;
    const B5 = 6;
    const B6 = 3;
    const B7 = 5;
    const B8 = 12;
    const B9 = 4;

    const before = [B1, B2, B3, B4, B5, B6, B7, B8, B9].reduce(
      // lasttime: the last time a button pressed and an action performed
      (acc, n) => ({ ...acc, [n]: { pressed: false, lasttime: 0 } }),
      {}
    );

    setInterval(
      () => {
        const pad = navigator.getGamepads()[gamepadIndex];
        if (pad === null) {
          return;
        }

        const judgeMove = (buttonNumber, move) => {
          if (
            !before[buttonNumber].pressed &&
            pad.buttons[buttonNumber].pressed
          ) {
            // on button pushed (from up to down)
            before[buttonNumber].lasttime = Date.now();
            move();
          } else if (
            before[buttonNumber].pressed &&
            pad.buttons[buttonNumber].pressed
          ) {
            // on button keep pressed
            const now = Date.now();
            if (now - before[buttonNumber].lasttime > 250) {
              before[buttonNumber].lasttime = Date.now();
              move();
            }
          }
        };
        judgeMove(B3, left);
        judgeMove(B7, right);
        judgeMove(B4, up);
        judgeMove(B6, down);

        // reset
        [B1, B2, B3, B4, B5, B6, B7, B8, B9].forEach(n => {
          before[n].pressed = pad.buttons[n].pressed;
        });
      },
      // 60 fps
      1000 / 60
    );
  }
</script>

<style>
  .focused {
    border: solid 2px #ee395b !important;
  }
</style>

<svelte:window
  on:keydown={handleKeyDown}
  on:gamepadconnected={e => (gamepadIndex = e.gamepad.index)} />

<Header route="/" />

<main>
  <div class="uk-container">
    <ul class="uk-child-width-1-3 uk-list-striped" uk-grid>
      {#if pmsList.length === 0}
        <a href="/importer" use:link>Add PMS files</a>
      {:else}
        {#each pmsList as pms, i}
          <li
            class={focusPms !== null && pms.id === focusPms.id ? 'focused' : ''}
            bind:this={pms.ref}
            on:click={preventDefault(_ => focus(i))}>
            <div class="uk-card uk-card-body">
              <h3 class="uk-card-title">{pms.genre}</h3>
              <div class="uk-flex uk-flex-between">
                <div>{pms.title}</div>
                <div>{pms.artist}</div>
                <div class="uk-flex">
                  <div>N{pms.levels['n']}</div>
                  <div class="uk-margin-small-left">H{pms.levels['h']}</div>
                  <div class="uk-margin-small-left">EX{pms.levels['ex']}</div>
                </div>
              </div>
            </div>
          </li>
        {/each}
      {/if}
    </ul>
  </div>
</main>
