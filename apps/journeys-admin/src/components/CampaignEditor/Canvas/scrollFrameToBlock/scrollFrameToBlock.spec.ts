import { scrollFrameToBlock } from './scrollFrameToBlock'

function rect(top: number, height: number): DOMRect {
  return {
    top,
    bottom: top + height,
    height,
    left: 0,
    right: 100,
    width: 100,
    x: 0,
    y: top,
    toJSON: () => ({})
  }
}

function setup(targetRect: DOMRect): {
  scroller: HTMLElement
  outerScroll: ReturnType<typeof vi.fn>
} {
  document.body.innerHTML = `
    <div data-testid="CampaignCanvasPage"><div id="blockId"></div></div>
  `
  const scroller = document.querySelector<HTMLElement>(
    '[data-testid="CampaignCanvasPage"]'
  ) as HTMLElement
  scroller.scrollTop = 300
  scroller.getBoundingClientRect = () => rect(0, 500)
  const target = document.getElementById('blockId') as HTMLElement
  target.getBoundingClientRect = () => targetRect
  const outerScroll = vi.fn()
  window.scrollTo = outerScroll as never
  target.scrollIntoView = outerScroll
  return { scroller, outerScroll }
}

describe('scrollFrameToBlock', () => {
  it('scrolls up to a block above the visible area', () => {
    const { scroller, outerScroll } = setup(rect(-120, 100))

    scrollFrameToBlock(document, 'blockId')

    expect(scroller.scrollTop).toBe(180)
    expect(outerScroll).not.toHaveBeenCalled()
  })

  it('scrolls down to a block below the visible area, to its nearest edge', () => {
    const { scroller } = setup(rect(480, 100))

    scrollFrameToBlock(document, 'blockId')

    expect(scroller.scrollTop).toBe(380)
  })

  it('keeps the top of a block taller than the scroller in view', () => {
    const { scroller } = setup(rect(100, 900))

    scrollFrameToBlock(document, 'blockId')

    expect(scroller.scrollTop).toBe(400)
  })

  it('keeps the block clear of the sticky header by its scroll margin', () => {
    const { scroller } = setup(rect(20, 100))
    const target = document.getElementById('blockId') as HTMLElement
    target.style.scrollMarginTop = '64px'

    scrollFrameToBlock(document, 'blockId')

    expect(scroller.scrollTop).toBe(256)
  })

  it('leaves a visible block where it is', () => {
    const { scroller } = setup(rect(100, 100))

    scrollFrameToBlock(document, 'blockId')

    expect(scroller.scrollTop).toBe(300)
  })

  it('ignores an unknown block', () => {
    const { scroller } = setup(rect(-120, 100))

    scrollFrameToBlock(document, 'missingId')

    expect(scroller.scrollTop).toBe(300)
  })
})
