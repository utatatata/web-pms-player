import {
  isValidButtonNumber,
  isValidEventName,
  PUSHED,
  KEEP_PRESSED,
} from "./Constants.js"

export class EventListener {
  constructor(buttonNumbers, event, callback) {
    if (
      buttonNumbers.length === 0 ||
      buttonNumbers.some(n => !isValidButtonNumber(n))
    ) {
      throw new Error(
        `Require one or more valid button numbers: '${buttonNumbers}'`
      )
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

export class Event {
  constructor(eventName) {
    if (!isValidEventName(eventName)) {
      throw new Error(`Invalid event: '${eventName}'`)
    }
    this._name = eventName
  }
  get name() {
    return this._name
  }
}

export class PushedEvent extends Event {
  constructor() {
    super(PUSHED)
  }
}

export class KeepPressedEvent extends Event {
  constructor(interval, delay = null) {
    super(KEEP_PRESSED)
    this._interval = interval
    this._delay = delay || interval
  }
  get interval() {
    return this._interval
  }
  get delay() {
    return this._delay
  }
}
