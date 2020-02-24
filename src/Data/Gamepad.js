import { Config } from "./Gamepad/Config.js"
import {
  validButtonNumbers,
  PUSHED,
  KEEP_PRESSED,
} from "./Gamepad/Constants.js"
import { GamepadState } from "./Gamepad/State.js"
import {
  EventListener,
  PushedEvent,
  KeepPressedEvent,
} from "./Gamepad/Event.js"

export { B1, B2, B3, B4, B5, B6, B7, B8, B9 } from "./Gamepad/Constants.js"

const framesToMs = (fps, frames) => (1000 / fps) * frames

export class Gamepad {
  constructor(config) {
    this._eventListeners = []
    this._config = new Config(config || {})
    this._previousState = new GamepadState()

    this._loop()
  }
  get config() {
    return this._config
  }
  get gamepad() {
    return navigator.getGamepads()[this.config.gamepadId]
  }
  pushed(buttonNumbers, callback) {
    this._eventListeners.push(
      new EventListener(buttonNumbers, new PushedEvent(), callback)
    )
    return this
  }
  keepPressed(buttonNumbers, { interval, delay }, callback) {
    this._eventListeners.push(
      new EventListener(
        buttonNumbers,
        new KeepPressedEvent(interval || this.config.fps / 4, delay),
        callback
      )
    )
    return this
  }
  _loop() {
    setInterval(() => {
      const currentState = GamepadState.fromGamepad(this.gamepad)
      if (currentState === null) {
        return
      }

      const judger = new Judger(this._config, this._previousState, currentState)
      this._eventListeners.forEach(l => judger.judge(l))

      this._previousState.update(currentState)
    }, framesToMs(this.config.fps, 1))
  }
}

class Judger {
  constructor(config, previousState, currentState) {
    this._config = config
    this._previousState = previousState
    this._currentState = currentState
  }
  judge(eventListener) {
    const { buttonNumbers, event, callback } = eventListener
    const now = Date.now()

    switch (event.name) {
      case PUSHED:
        if (this._isPushedEvery(buttonNumbers)) {
          console.log("PUSHED!!!!")
          callback()
          buttonNumber.forEach(n => {
            this._previousState.lastTime(n, now)
            this._previousState.performedCount(n, 1)
          })
        } else {
          console.log("NOT PUSHED!!!")
        }
        return
      case KEEP_PRESSED:
        const { interval, delay } = event
        const diff =
          now -
          Math.max(...buttonNumbers.map(n => this._previousState.lastTime(n)))
        const waiting = framesToMs(
          this._config.fps,
          buttonNumbers.every(n => this._previousState.performedCount(n) <= 0)
            ? delay
            : interval
        )

        if (diff > waiting) {
          callback()
          validButtonNumbers.forEach(n => {
            this._previousState.lastTime(n, now)
            this._previousState.incrementPerformedCount(n)
          })
        }
        return
    }
  }
  _isPushed(buttonNumber) {
    return (
      !this._previousState.pressed(buttonNumber) &&
      this._currentState.pressed(buttonNumber)
    )
  }
  _isPushedEvery(buttonNumbers) {
    return buttonNumbers.every(n => this._isPushed(n))
  }
  _keepPressed(buttonNumber) {
    return (
      this._previousState.pressed(buttonNumber) &&
      this._currentState.pressed(buttonNumber)
    )
  }
  _keepPressedEvery(buttonNumbers) {
    return buttonNumbers.every(n => this._keepPressed(n))
  }
}
