import { PopConButton } from "./PopCon/Button"
import { PopConEventListener, pushed, keepPressed } from "./PopCon/Event"

type PopConConfig = { gamepadId: number; fps: number }

// type PopnController = { config: PopConConfig }

/**
 *
 * e.g.
 * const manager = new PopConManager()
 * manager
 *   .on(B5).pushed(() => { ... })
 *   .on(B3).keepPressed(20, 15, () => { ... })
 *   .on(B2, B8).pushed(() => { ... })
 */
export class PopConManager {
  private config: PopConConfig
  private listeners: PopConEventListener[]
  constructor(config: PopConConfig) {
    this.config = config

    this.loop()
  }
  addEventListener(listener: PopConEventListener): void {
    this.listeners.push(listener)
  }
  on(...buttons: PopConButton[]): PopConEventListenerBuilder {
    return new PopConEventListenerBuilder(this, buttons)
  }
  private loop(): void {}
}

class PopConEventListenerBuilder {
  private manager: PopConManager
  private buttons: PopConButton[]
  constructor(manager: PopConManager, buttons: PopConButton[]) {
    this.manager = manager
    this.buttons = buttons
  }
  public pushed(handler: () => void): PopConManager {
    this.manager.addEventListener(pushed(this.buttons, handler))
    return this.manager
  }
  public keepPressed(
    delay: number,
    interval: number,
    handler: () => void
  ): PopConManager
  public keepPressed(interval: number, handler: () => void): PopConManager
  public keepPressed(...args: any): PopConManager {
    if (args.length === 3) {
      const [delay, interval, handler]: [number, number, () => void] = args
      this.manager.addEventListener(
        keepPressed(this.buttons, delay, interval, handler)
      )
      return this.manager
    } else if (args.length === 2) {
      const [interval, handler]: [number, () => void] = args
      this.manager.addEventListener(
        keepPressed(this.buttons, interval, interval, handler)
      )
      return this.manager
    } else {
      ;((): never => {
        throw Error("Unreached")
      })()
    }
  }
}
