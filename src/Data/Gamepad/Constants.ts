export const B1 = 0
export const B2 = 1
export const B3 = 7
export const B4 = 2
export const B5 = 6
export const B6 = 3
export const B7 = 5
export const B8 = 12
export const B9 = 4

export const validButtonNumbers = [B1, B2, B3, B4, B5, B6, B7, B8, B9]
export const isValidButtonNumber = buttonNumber =>
  validButtonNumbers.includes(buttonNumber)

export const PUSHED = "pushed"
export const KEEP_PRESSED = "keepPressed"
export const validEventNames = [PUSHED, KEEP_PRESSED]
export const isValidEventName = eventName => validEventNames.includes(eventName)
