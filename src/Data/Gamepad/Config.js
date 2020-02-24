export class Config {
  constructor({ gamepadId, fps }) {
    this.gamepadId = gamepadId || 0
    this.fps = fps || 60
  }
}
