import { renderHook } from '@testing-library/react'

import VideoJsPlayer from '../../utils/videoJsTypes'

import {
  CAPTIONS_ABOVE_CONTROLS_CLASS,
  useCaptionOffset
} from './useCaptionOffset'

function mockRect(element: Element, rect: Partial<DOMRect>): void {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...rect
  } as DOMRect)
}

function mockOrientation(orientation: 'landscape' | 'portrait'): void {
  // jsdom has no matchMedia
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: query === `(orientation: ${orientation})`
    })
  })
}

describe('useCaptionOffset', () => {
  let playerEl: HTMLDivElement
  let buttonRow: HTMLDivElement
  let updateDisplay: ReturnType<typeof vi.fn>
  let player: VideoJsPlayer

  beforeEach(() => {
    playerEl = document.createElement('div')
    buttonRow = document.createElement('div')
    const time = document.createElement('span')
    const buttons = document.createElement('div')
    buttonRow.append(time, buttons)
    document.body.append(playerEl, buttonRow)
    // jsdom has no layout, so the row reads as displayed only when mocked
    Object.defineProperty(buttonRow, 'offsetParent', {
      configurable: true,
      get: () => document.body
    })
    mockRect(playerEl, { top: 0, right: 844, bottom: 390, left: 0 })
    mockRect(buttonRow, { top: 269, right: 820, bottom: 309, left: 24 })
    mockRect(time, { right: 96 })
    mockRect(buttons, { left: 700 })
    updateDisplay = vi.fn()
    player = {
      el: () => playerEl,
      getChild: () => ({ updateDisplay })
    } as unknown as VideoJsPlayer
  })

  afterEach(() => {
    playerEl.remove()
    buttonRow.remove()
    vi.restoreAllMocks()
  })

  it('should keep captions level with the button row and between its ends in landscape', () => {
    mockOrientation('landscape')

    renderHook(() => useCaptionOffset(player, { current: buttonRow }))

    expect(playerEl).toHaveClass(CAPTIONS_ABOVE_CONTROLS_CLASS)
    // 390 - 309 from the bottom; the wider of 96 and 844 - 700, plus a gap
    expect(playerEl.style.getPropertyValue('--caption-bottom')).toBe('81px')
    expect(playerEl.style.getPropertyValue('--caption-inline')).toBe('152px')
    expect(updateDisplay).toHaveBeenCalled()
  })

  it('should keep captions above the controls in portrait', () => {
    mockOrientation('portrait')
    mockRect(playerEl, { top: 0, right: 390, bottom: 844, left: 0 })
    mockRect(buttonRow, { top: 647, right: 374, bottom: 687, left: 16 })

    renderHook(() => useCaptionOffset(player, { current: buttonRow }))

    // 844 - 647 to the top of the controls, plus a gap
    expect(playerEl.style.getPropertyValue('--caption-bottom')).toBe('205px')
    expect(playerEl.style.getPropertyValue('--caption-inline')).toBe('0px')
  })

  it('should leave captions alone when the mobile controls are not displayed', () => {
    mockOrientation('landscape')
    Object.defineProperty(buttonRow, 'offsetParent', {
      configurable: true,
      get: () => null
    })

    renderHook(() => useCaptionOffset(player, { current: buttonRow }))

    expect(playerEl).not.toHaveClass(CAPTIONS_ABOVE_CONTROLS_CLASS)
    expect(playerEl.style.getPropertyValue('--caption-bottom')).toBe('')
  })

  it('should move captions when the window is resized', () => {
    mockOrientation('landscape')
    renderHook(() => useCaptionOffset(player, { current: buttonRow }))

    mockRect(buttonRow, { top: 249, right: 820, bottom: 289, left: 24 })
    window.dispatchEvent(new Event('resize'))

    expect(playerEl.style.getPropertyValue('--caption-bottom')).toBe('101px')
  })

  it('should put captions back when unmounted', () => {
    mockOrientation('landscape')
    const { unmount } = renderHook(() =>
      useCaptionOffset(player, { current: buttonRow })
    )

    unmount()

    expect(playerEl).not.toHaveClass(CAPTIONS_ABOVE_CONTROLS_CLASS)
    expect(playerEl.style.getPropertyValue('--caption-bottom')).toBe('')
    expect(playerEl.style.getPropertyValue('--caption-inline')).toBe('')
  })
})
