import {
  DESKTOP_FRAME_WIDTH,
  MIN_CANVAS_SCALE,
  MIN_STAGE_WIDTH,
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

  // The editor width minus the 56 px rail, the 300 px docked panel (one is
  // always open), the 328 px Inspector and the 64 px canvas padding.
  it.each([
    ['1348 px, the minimum', 1348 - 56 - 300 - 328 - 64, 0.5],
    ['1440 px', 1440 - 56 - 300 - 328 - 64, 692 / 1200],
    ['1920 px', 1920 - 56 - 300 - 328 - 64, 1172 / 1200]
  ])('scales the Desktop frame at %s', (_name, available, expected) => {
    const scale = canvasScale(available, DESKTOP_FRAME_WIDTH)
    expect(scale).toBeCloseTo(expected)
    expect(scale).toBeGreaterThanOrEqual(MIN_CANVAS_SCALE)
  })

  it('fits the Desktop frame inside the minimum stage, and no narrower one', () => {
    expect(MIN_STAGE_WIDTH).toBe(600)
    expect(
      canvasScale(MIN_STAGE_WIDTH, DESKTOP_FRAME_WIDTH) * DESKTOP_FRAME_WIDTH
    ).toBeLessThanOrEqual(MIN_STAGE_WIDTH)
    expect(
      canvasScale(MIN_STAGE_WIDTH - 1, DESKTOP_FRAME_WIDTH) *
        DESKTOP_FRAME_WIDTH
    ).toBeGreaterThan(MIN_STAGE_WIDTH - 1)
  })

  it('leaves the Phone frame unscaled at every supported editor width', () => {
    expect(canvasScale(MIN_STAGE_WIDTH, PHONE_FRAME_WIDTH)).toBe(1)
    expect(canvasScale(1440 - 56 - 300 - 328 - 64, PHONE_FRAME_WIDTH)).toBe(1)
  })
})

describe('frameWidthOf', () => {
  it('is 1200 px for Desktop and 390 px for Phone', () => {
    expect(frameWidthOf('desktop')).toBe(1200)
    expect(frameWidthOf('phone')).toBe(390)
  })
})
