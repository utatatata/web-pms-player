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
  // for `bind:this`
  let readyToPlayModal = null;

  (async () => {
    pmsList = (await DB.getAllPMS())
      // ref: for `bind:this`
      .map(pms => ({ ...pms, ref: null }));
    focusPms = pmsList[0];
  })();

  /* Helpers */
  const scroll = i =>
    i >= pmsList.length
      ? undefined
      : UIkit.scroll(pmsList[i].ref, { offset: 200, duration: 200 }).scrollTo(
          // Caution! `.ref` is initialized by Svelte (`bind:this`)
          pmsList[i].ref
        );
  const focus = i =>
    i >= pmsList.length ? undefined : ((focusPms = pmsList[i]), scroll(i));
  const focusIndex = () => {
    if (focusPms === null) return NaN;
    const i = pmsList.findIndex(p => p.id === focusPms.id);
    return i == -1 ? NaN : i;
  };
  // move focus
  const left = (n = 1) => focus(Math.max(0, focusIndex() - n));
  const right = (n = 1) =>
    focus(Math.min(focusIndex() + n, pmsList.length - 1));
  const up = (n = 1) => left(n * 3);
  const down = (n = 1) => right(n * 3);

  const readyToPlay = () => UIkit.toggle(readyToPlayModal).toggle();

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
      // lastTime: the last time a button pressed and an action performed
      // performedCount: how many times performed during keeping pressed
      (acc, n) => ({
        ...acc,
        [n]: { pressed: false, lastTime: 0, performedCount: 0 }
      }),
      {}
    );
    // helpers
    const access = (object, property, value = null) =>
      value === null ? value : ((object[property] = value), value);
    const beforePressed = (buttonNumber, pressed = null) =>
      access(before, "pressed", pressed);
    const beforeLastTime = (buttonNumber, lastTime = null) =>
      access(before, "lastTime", lastTime);
    const beforePerformedCount = (buttonNumber, performedCount = null) =>
      access(before, "performedCount", performedCount);

    setInterval(
      () => {
        const pad = navigator.getGamepads()[gamepadIndex];
        if (pad === null) {
          return;
        }
        const buttonPressed = buttonNumber => pad.buttons[buttonNumber].pressed;

        const isPushed = buttonNumber =>
          // on button pushed (from up to down)
          !before[buttonNumber].pressed && pad.buttons[buttonNumber].pressed;
        const keepPressed = buttonNumber =>
          // on button keep pressed
          before[buttonNumber].pressed && pad.buttons[buttonNumber].pressed;
        const updateLastTime = (buttonNumber, now) =>
          (before[buttonNumber].lastTime = now);
        const updatePerformedCount = buttonNumber =>
          (before[buttonNumber].performedCount += 1);

        const doNow = f => f(Date.now());

        const onPush = (buttonNumber, action) =>
          isPushed(buttonNumber)
            ? (updateLastTime(buttonNumber, Date.now()),
              updatePerformedCount(buttonNumber),
              action())
            : undefined;

        // const onKeepPressed = (buttonNumber, action, frames, delay) =>
        //   keepPressed(buttonNumber) ? doNow(now => ) : undefined

        // select music
        const judgeMove = (buttonNumber, move) => {
          if (isPushed(buttonNumber)) {
            updateLastTime(buttonNumber);
            move();
          } else if (keepPressed(buttonNumber)) {
            const now = Date.now();
            if (now - before[buttonNumber].lastTime > 250) {
              updateLastTime(buttonNumber);
              move();
            }
          }
        };
        judgeMove(B3, left);
        judgeMove(B7, right);
        judgeMove(B4, up);
        judgeMove(B6, down);

        // decide music
        if (!before[B5].pressed && pad.buttons[B5].pressed) {
          readyToPlay();
        }

        // reset
        [B1, B2, B3, B4, B5, B6, B7, B8, B9].forEach(n => {
          before[n].pressed = pad.buttons[n].pressed;
          if (!pad.buttons[n].pressed) {
            before[n].performedCount = 0;
          }
        });
      },
      // 60 fps
      1000 / 60
    );
  }
</script>

<style>
  .focused {
    border: solid 2px gray !important;
  }
</style>

<svelte:window
  on:keydown={handleKeyDown}
  on:gamepadconnected={e => (gamepadIndex = e.gamepad.index)} />

<Header route="/" />
<main>
  <div class="uk-container">
    <div class="uk-flex-middle uk-child-width-1-3" uk-grid>
      {#if pmsList.length === 0}
        <a href="/importer" use:link>Add PMS files</a>
      {:else}
        {#each pmsList as pms, i}
          <div
            class="uk-position-relative"
            bind:this={pms.ref}
            on:click={preventDefault(_ => focus(i))}>
            <button
              class="uk-button uk-button-default uk-position-top-right
              uk-position-z-index uk-margin-small-top uk-margin-small-right"
              on:click={preventDefault(_ => readyToPlay())}>
              Play
            </button>
            <div
              class="uk-card uk-card-default uk-card-body{focusPms !== null && pms.id === focusPms.id ? ' uk-card-large' : ' uk-card-small'}">
              <h3 class="uk-card-title">{pms.genre}</h3>
              <div class="" uk-grid>
                <div class="uk-width-2-3">
                  <div>{pms.title}</div>
                  <div class="uk-margin-top">{pms.artist}</div>
                </div>
                <div class="uk-width-1-3">
                  <div>N{pms.levels['n']}</div>
                  <div>H{pms.levels['h']}</div>
                  <div>EX{pms.levels['ex']}</div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</main>

<div uk-modal bind:this={readyToPlayModal}>
  <div class="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
    <div class="uk-modal-header">
      <h2 class="uk-modal-title">{focusPms !== null ? focusPms.genre : ''}</h2>
    </div>
    <button class="uk-button uk-button-default uk-modal-close" type="button">
      Play
    </button>
    <button class="uk-button uk-button-danger uk-modal-close" type="button">
      Cancel
    </button>
  </div>
</div>
