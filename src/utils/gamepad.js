const B1 = 0
const B2 = 1
const B3 = 7
const B4 = 2
const B5 = 6
const B6 = 3
const B7 = 5
const B8 = 12
const B9 = 4
const validButtonNumbers = [B1, B2, B3, B4, B5, B6, B7, B8, B9]
const isValidButtonNumber = buttonNumber =>
  validButtonNumbers.includes(buttonNumber)

const PUSHED = "pushed"
const KEEP_PRESSED = "keepPressed"
const validEventNames = [PUSHED, KEEP_PRESSED]
const isValidEventName = eventName => validEventNames.includes(eventName)

/**
 *
 * e.g.
 * const controller = new GamepadController()
 * controller.b1.b2.onPressed(() => {
 *   // do something...
 * })
 *
 * controller.b1.onKeepPressed(15, 30, () => {
 *   // do something every 15 frames with first time 30 frames delay
 * })
 */
export class GamepadController extends EventListenerBuilderFactory {
  constructor(config) {
    super(this)

    this._listeners = []
    this._config = new Config(config)
    this._previousButtonState = new PreviousButtonState()

    this._loop()
  }
  get config() {
    return this._config
  }
  addEventListener(listener) {
    this._listeners.push(listener)
  }
  /**
   *
   * e.g.
   * const controller = new GamepadController()
   * window.addEventListener("gamepadconnected", function(e) {
   *   controller.gamepadId = e.gamepad.id
   * });
   */
  set gamepadId(id) {
    this._gamepadId = id
  }
  _loop() {
    setInterval(() => {
      const gamepad = navigator.getGamepads()[this._gamepadId]
      if (gamepad === null) {
        return
      }

      const judger = new Judger({
        config: this._config,
        previousButtonState: this._previousButtonState,
        gamepad,
      })
      this._listeners.forEach(listener => judger._judge(listener))

      this._previousButtonState.update(gamepad)
    }, 1000 / this.fps)
  }
}

class Config {
  constructor({ gamepadId, fps }) {
    this._gamepadId = gamepadId || 0
    this._fps = fps || 60
  }
  get gamepadId() {
    return this._gamepadId
  }
  get fps() {
    return this._fps
  }
  set gamepadId(id) {
    this._gamepadId = id
  }
  set fps(fps) {
    this._fps = fps
  }
}

class Judger {
  constructor({ config, previousButtonState, gamepad }) {
    this._config = config
    this._previousButtonState = previousButtonState
    this._gamepad = gamepad
  }
  _judge(listener) {
    const { buttonNumbers, event, callback } = listener
    const now = Date.now()

    switch (event.tname) {
      case PUSHED:
        if (this._isPushedEvery(buttonNumbers)) {
          callback()
          buttonNumbers.forEach(buttonNumber => {
            this._previousButtonState.updateLastTime(buttonNumber, now)
            this._previousButtonState.setPerformedCount(buttonNumber, 1)
          })
        }
        return
      case KEEP_PRESSED:
        const { interval, delay } = event
        const diff =
          now -
          Math.max(...buttonNumbers.map(this._previousButtonState.lastTime))
        const time =
          (1000 / this._fps) *
          (buttonNumbers.every(
            n => this._previousButtonState.performedCount(n) <= 0
          )
            ? delay
            : interval)

        if (this._keepPressedEvery(buttonNumbers)) {
          callback()
        }
        return
    }
    if (event.name === PUSHED && this._isPushedEvery(buttonNumbers)) {
      callback()
    } else if (
      listener.event.name === KEEP_PRESSED &&
      listener.buttonNumbers.every(this._keepPressed)
    ) {
      if (
        diff >
        (1000 / fps) *
          (Math.min(
            listener.buttonNumbers.map(this._previousButtonState.performedCount)
          ) <= 0
            ? delay
            : interval)
      ) {
        callback()
        buttonNumbers.forEach(buttonNumber => {
          this._previousButtonState.updateLastTime(buttonNumber, now)
          this._previousButtonState.incrementPerformedCount(buttonNumber)
        })
      }
    }
  }
  _isPushed(buttonNumber) {
    return (
      !this._previousButtonState.pressed(buttonNumber) &&
      this._gamepad.buttons[buttonNumber].pressed
    )
  }
  _isPushedEvery(buttonNumbers) {
    return buttonNumbers.length !== 0 && buttonNumbers.every(this._isPushed)
  }
  _keepPressed(buttonNumber) {
    return (
      this._previousButtonState.pressed(buttonNumber) &&
      this._gamepad.buttons[buttonNumber].pressed
    )
  }
  _keepPressedEvery(buttonNumbers) {
    return buttonNumbers.length !== 0 && buttonNumbers.every(this._keepPressed)
  }
}

class PreviousButtonState {
  constructor() {
    this._state = validButtonNumbers.reduce(
      (state, buttonNumber) => ({
        ...state,
        [buttonNumber]: { pressed: false, lastTime: 0, performedCount: 0 },
      }),
      {}
    )
  }
  pressed(buttonNumber) {
    return this._state[buttonNumber].pressed
  }
  updateLastTime(buttonNumber, date) {
    this._state[buttonNumber].lastTime = date
  }
  setPerformedCount(buttonNumber, n) {
    this._state[buttonNumber].performedCount = n
  }
  resetPerformedCount(buttonNumber) {
    this._state[buttonNumber].performedCount = 0
  }
  incrementPerformedCount(buttonNumber) {
    this._state[buttonNumber].performedCount += 1
  }
  update(gamepad) {
    validButtonNumbers.forEach(buttonNumber => {
      this._state[buttonNumber].pressed = gamepad.buttons[buttonNumber].pressed
      if (!gamepad.buttons[buttonNumber].pressed) {
        this.resetPerformedCount(buttonNumber)
      }
    })
  }
}

/**
 * Abstract class
 */
class EventListenerBuilderFactory {
  constructor(controller) {
    this._controller = controller
  }
  create(...buttonNumbers) {
    return new EventListenerBuilder(controller, buttonNumbers)
  }
  /**
   * @return {EventListenerBuilder}
   */
  get b1() {
    return this.create(B1)
  }
  /**
   * @return {EventListenerBuilder}
   */
  get b2() {
    return this.create(B2)
  }
  /**
   * @return {EventListenerBuilder}
   */
  get b3() {
    return this.create(B3)
  }
  /**
   * @return {EventListenerBuilder}
   */
  get b4() {
    return this.create(B4)
  }
  /**
   * @return {EventListenerBuilder}
   */
  get b5() {
    return this.create(B5)
  }
  /**
   * @return {EventListenerBuilder}
   */
  get b6() {
    return this.create(B6)
  }
  /**
   * @return {EventListenerBuilder}
   */
  get b7() {
    return this.create(B7)
  }
  /**
   * @return {EventListenerBuilder}
   */
  get b8() {
    return this.create(B8)
  }
  /**
   * @return {EventListenerBuilder}
   */
  get b9() {
    return this.create(B9)
  }
}

/**
 * build EventListener
 *
 * e.g.
 * const controller = new GamepadController()
 * controller.b1.b2.onPressed(() => {
 *   // do something...
 * })
 */
class EventListenerBuilder extends EventListenerBuilderFactory {
  constructor(controller, ...buttonNumbers) {
    super(controller)

    if (
      buttonNumbers.length === 0 ||
      buttonNumbers.some(b => !isValidButtonNumber(b))
    ) {
      throw new Error(
        `Require one or more valid button numbers: '${buttonNumbers}'`
      )
    }

    this._buttonNumbers = buttonNumbers
  }
  _on(event, callback) {
    this._controller.addEventListener(
      new EventListener(this._buttonNumbers, event, callback)
    )
    return this._controller
  }
  /**
   * @param {function():void} callback
   * @return {EventListener}
   */
  onPushed(callback) {
    return this._on({ name: PUSHED }, callback)
  }
  /**
   * @param {number}
   * @param {number}
   * @param {function():void} callback
   * @return {EventListener}
   */
  onKeepPressed(interval, delay, callback) {
    return this._on({ name: KEEP_PRESSED, interval, delay }, callback)
  }
}

class EventListener {
  constructor(buttonNumbers, event, callback) {
    if (!isValidEventName(event.name)) {
      throw new Error(`found no such event: '${event.name}'`)
    }
    this._buttonNumbers = buttonNumbers
    this._event = event
    this._callback = callback
  }
  get buttonNumbers() {
    return this._buttonNumbers
  }
  get event() {
    return this._event
  }
  get callback() {
    return this._callback
  }
}
