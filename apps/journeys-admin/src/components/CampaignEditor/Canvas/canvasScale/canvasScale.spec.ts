import {
  DESKTOP_FRAME_WIDTH,
  MIN_CANVAS_SCALE,
  PHONE_FRAME_WIDTH,
  canvasScale,
  frameWidthOf
} from './canvasScale'

describe('canvasScale', () => {
  it('fits the frame to the available width', () => {
    expect(canvasScale(600, 1200)).toBe(0.5)
    expect(canvasScale(900, 1200)).toBe(0.75)
  })

  it('never enlarges the frame', () => {
    expect(canvasScale(1200, 1200)).toBe(1)
    expect(canvasScale(1472, 1200)).toBe(1)
  })

  it('never goes below the floor', () => {
    expect(canvasScale(400, 1200)).toBe(MIN_CANVAS_SCALE)
    expect(canvasScale(0, 1200)).toBe(MIN_CANVAS_SCALE)
  })

  // The editor width minus the 56 px rail, the 328 px Inspector and the 64 px
  // canvas padding; a pushed panel (from 1440 px) takes 300 px more.
  it.each([
    ['1280 px', 1280 - 56 - 328 - 64, 832 / 1200],
    ['1440 px', 1440 - 56 - 328 - 64, 992 / 1200],
    ['1440 px with a pushed panel', 1440 - 56 - 300 - 328 - 64, 692 / 1200],
    ['1920 px', 1920 - 56 - 328 - 64, 1],
    ['1920 px with a pushed panel', 1920 - 56 - 300 - 328 - 64, 1172 / 1200]
  ])('scales the Desktop frame at %s', (_name, available, expected) => {
    const scale = canvasScale(available, DESKTOP_FRAME_WIDTH)
    expect(scale).toBeCloseTo(expected)
    expect(scale).toBeGreaterThanOrEqual(MIN_CANVAS_SCALE)
  })

  it('leaves the Phone frame unscaled at every supported editor width', () => {
    expect(canvasScale(1440 - 56 - 300 - 328 - 64, PHONE_FRAME_WIDTH)).toBe(1)
    expect(canvasScale(1280 - 56 - 328 - 64, PHONE_FRAME_WIDTH)).toBe(1)
  })
})

describe('frameWidthOf', () => {
  it('is 1200 px for Desktop and 390 px for Phone', () => {
    expect(frameWidthOf('desktop')).toBe(1200)
    expect(frameWidthOf('phone')).toBe(390)
  })
})
