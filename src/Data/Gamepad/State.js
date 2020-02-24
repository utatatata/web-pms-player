import { validButtonNumbers } from "./Constants.js"

export class GamepadState {
  constructor() {
    this._state = validButtonNumbers.reduce(
      (state, buttonNumber) => ({
        ...state,
        // lastTime: last time performed
        // performedCount: how many count performed during button keeping pressed
        [buttonNumber]: { pressed: false, lastTime: 0, performedCount: 0 },
      }),
      {}
    )
  }
  static fromGamepad(gamepad) {
    if (gamepad === null) {
      return null
    }
    const state = new GamepadState()
    validButtonNumbers.forEach(n =>
      state.pressed(n, gamepad.buttons[n].pressed)
    )
    return state
  }
  pressed(buttonNumber) {
    return this._state[buttonNumber].pressed
  }
  lastTime(buttonNumber, date = null) {
    return date === null
      ? this._state[buttonNumber].lastTime
      : (this._state[buttonNumber].lastTime = date)
  }
  performedCount(buttonNumber, count = null) {
    return count === null
      ? this._state[buttonNumber].performedCount
      : (this._state[buttonNumber].performedCount = count)
  }
  incrementPerformedCount(buttonNumber) {
    return (this._state[buttonNumber].performedCount += 1)
  }
  update(currentState) {
    validButtonNumbers.forEach(buttonNumber => {
      this.pressed(buttonNumber, currentState.pressed(buttonNumber))

      if (!this.pressed(buttonNumber)) {
        this.performedCount(buttonNumber, 0)
      }
    })
  }
}
