<script>
  import { link } from "svelte-spa-router";
  import UIkit from "uikit";
  import Header from "../components/Header.svelte";
  import { getAllPMS } from "../db.js";
  import { pd } from "../eventHandler.js";

  let pmsList = [];
  let focusPms = null;
  (async () => {
    pmsList = await getAllPMS();
    focusPms = pmsList[0];
  })();

  const scroll = i =>
    i >= pmsList.length
      ? {}
      : UIkit.scroll(pmsList[i].ref, { offset: 200, duration: 200 }).scrollTo(
          pmsList[i].ref
        );
  const focus = i =>
    i >= pmsList.length ? {} : ((focusPms = pmsList[i]), scroll(i));
  const focusIndex = () => {
    if (focusPms === null) return NaN;
    const i = pmsList.findIndex(p => p.id === focusPms.id);
    return i == -1 ? NaN : i;
  };

  const left = (n = 1) => focus(Math.max(0, focusIndex() - n));
  const right = (n = 1) =>
    focus(Math.min(focusIndex() + n, pmsList.length - 1));
  const up = (n = 1) => left(n * 3);
  const down = (n = 1) => right(n * 3);

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

  let gamepadIndex = 0;
  {
    const B1 = 0;
    const B2 = 1;
    const B3 = 7;
    const B4 = 2;
    const B5 = 6;
    const B6 = 3;
    const B7 = 5;
    const B8 = 12;
    const B9 = 4;
    const before = {
      [B1]: { pressed: false, lasttime: 0 },
      [B2]: { pressed: false, lasttime: 0 },
      [B3]: { pressed: false, lasttime: 0 },
      [B4]: { pressed: false, lasttime: 0 },
      [B5]: { pressed: false, lasttime: 0 },
      [B6]: { pressed: false, lasttime: 0 },
      [B7]: { pressed: false, lasttime: 0 },
      [B8]: { pressed: false, lasttime: 0 },
      [B9]: { pressed: false, lasttime: 0 }
    };
    setInterval(() => {
      const pad = navigator.getGamepads()[gamepadIndex];
      if (pad === null) {
        return;
      }
      const move = b => {
        const m =
          b === B3
            ? left
            : b === B7
            ? right
            : b === B4
            ? up
            : b === B6
            ? down
            : null;
        if (m === null) {
          return;
        }
        if (!before[b].pressed && pad.buttons[b].pressed) {
          before[b].lasttime = Date.now();
          m();
        } else if (before[b].pressed && pad.buttons[b].pressed) {
          const now = Date.now();
          if (now - before[b].lasttime > 250) {
            before[b].lasttime = Date.now();
            m();
          }
        }
      };
      move(B3);
      move(B7);
      move(B4);
      move(B6);

      before[B1].pressed = pad.buttons[B1].pressed;
      before[B2].pressed = pad.buttons[B2].pressed;
      before[B3].pressed = pad.buttons[B3].pressed;
      before[B4].pressed = pad.buttons[B4].pressed;
      before[B5].pressed = pad.buttons[B5].pressed;
      before[B6].pressed = pad.buttons[B6].pressed;
      before[B7].pressed = pad.buttons[B7].pressed;
      before[B8].pressed = pad.buttons[B8].pressed;
      before[B9].pressed = pad.buttons[B9].pressed;
    }, 1000 / 60);
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
            on:click={pd(_ => {
              focusPms = pms;
              scroll(i);
            })}>
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
