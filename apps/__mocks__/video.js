// Minimal mock for video.js
const videojs = jest.fn(() => ({
  ready: jest.fn(),
  dispose: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
}))

videojs.getComponent = jest.fn()
videojs.registerComponent = jest.fn()
videojs.registerPlugin = jest.fn()

module.exports = videojs
