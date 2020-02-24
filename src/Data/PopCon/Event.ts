import { PopConButton } from "./Button"

export type PopConEventListener = {
  buttons: PopConButton[]
  event: PopConEvent
  handler: () => void
}

export type PopConEvent = PopConEventPushed | PopConEventKeepPressed

interface PopConEventPushed {
  type: PopConEventType.PopConEventPushed
}

interface PopConEventKeepPressed {
  type: PopConEventType.PopConEventKeepPressed
  delay: number
  interval: number
}

enum PopConEventType {
  PopConEventPushed,
  PopConEventKeepPressed,
}

export const pushed = (
  buttons: PopConButton[],
  handler: () => void
): PopConEventListener => ({
  buttons,
  event: { type: PopConEventType.PopConEventPushed },
  handler,
})

export const keepPressed = (
  buttons: PopConButton[],
  delay: number,
  interval: number,
  handler: () => void
): PopConEventListener => ({
  buttons,
  event: { type: PopConEventType.PopConEventKeepPressed, delay, interval },
  handler,
})
