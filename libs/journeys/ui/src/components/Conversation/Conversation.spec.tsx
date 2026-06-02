import { act, fireEvent, render } from '@testing-library/react'
import { type Mock } from 'vitest'

import { Conversation } from './Conversation'

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const observers: ResizeObserverCallback[] = []

class ResizeObserverMock {
  constructor(cb: ResizeObserverCallback) {
    observers.push(cb)
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

function mockScrollMetrics({
  scrollHeight,
  scrollTop,
  clientHeight
}: {
  scrollHeight: number
  scrollTop: number
  clientHeight: number
}): void {
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(
    scrollHeight
  )
  vi.spyOn(HTMLElement.prototype, 'scrollTop', 'get').mockReturnValue(scrollTop)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(
    clientHeight
  )
}

function fireResizeObservers(): void {
  act(() => {
    observers.forEach((cb) =>
      cb([] as unknown as ResizeObserverEntry[], {} as ResizeObserver)
    )
  })
}

function getScrollContainer(container: HTMLElement): HTMLElement {
  // Conversation renders <Box(relative)><Box(scroll, ref)>...</Box></Box>
  // — the scroll container is the first child of the outer wrapper.
  const root = container.firstElementChild as HTMLElement
  return root.firstElementChild as HTMLElement
}

describe('Conversation', () => {
  let scrollToSpy: Mock
  let originalScrollTo: typeof Element.prototype.scrollTo | undefined
  let originalResizeObserver: typeof window.ResizeObserver | undefined

  beforeEach(() => {
    observers.length = 0
    originalResizeObserver = window.ResizeObserver
    window.ResizeObserver =
      ResizeObserverMock as unknown as typeof ResizeObserver
    // jsdom does not implement Element.prototype.scrollTo, so we install
    // a fresh vi.fn() each test instead of spying on a missing prop.
    originalScrollTo = (
      Element.prototype as { scrollTo?: typeof Element.prototype.scrollTo }
    ).scrollTo
    scrollToSpy = vi.fn()
    Element.prototype.scrollTo =
      scrollToSpy as unknown as typeof Element.prototype.scrollTo
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalResizeObserver == null) {
      delete (window as Window & { ResizeObserver?: typeof ResizeObserver })
        .ResizeObserver
    } else {
      window.ResizeObserver = originalResizeObserver
    }
    if (originalScrollTo == null) {
      delete (
        Element.prototype as { scrollTo?: typeof Element.prototype.scrollTo }
      ).scrollTo
    } else {
      Element.prototype.scrollTo = originalScrollTo
    }
  })

  it('does not render the scroll-to-bottom pill while the reader is at the bottom', () => {
    mockScrollMetrics({ scrollHeight: 400, scrollTop: 0, clientHeight: 400 })
    const { queryByTestId, container } = render(
      <Conversation scrollKey={1}>
        <div>message</div>
      </Conversation>
    )
    fireEvent.scroll(getScrollContainer(container))
    expect(queryByTestId('ScrollToBottomPill')).not.toBeInTheDocument()
  })

  it('renders the pill when the reader has scrolled away from the bottom', () => {
    mockScrollMetrics({ scrollHeight: 1000, scrollTop: 100, clientHeight: 400 })
    const { queryByTestId, container } = render(
      <Conversation scrollKey={1}>
        <div>message</div>
      </Conversation>
    )
    fireEvent.scroll(getScrollContainer(container))
    expect(queryByTestId('ScrollToBottomPill')).toBeInTheDocument()
  })

  it('hides the pill when the parent sheet collapses (clientHeight === 0)', () => {
    mockScrollMetrics({ scrollHeight: 1000, scrollTop: 100, clientHeight: 400 })
    const { queryByTestId, container } = render(
      <Conversation scrollKey={1}>
        <div>message</div>
      </Conversation>
    )
    fireEvent.scroll(getScrollContainer(container))
    expect(queryByTestId('ScrollToBottomPill')).toBeInTheDocument()

    // Sheet collapses to a thin handle — there is no scrollable area.
    // Pill must not leak through.
    mockScrollMetrics({ scrollHeight: 1000, scrollTop: 100, clientHeight: 0 })
    fireResizeObservers()
    expect(queryByTestId('ScrollToBottomPill')).not.toBeInTheDocument()
  })

  it('scrolls to the bottom when scrollKey changes and the reader was near the bottom', () => {
    mockScrollMetrics({ scrollHeight: 1000, scrollTop: 600, clientHeight: 400 })
    const { rerender } = render(
      <Conversation scrollKey={1}>
        <div>message</div>
      </Conversation>
    )
    // Mount-time scrollTo (instant jump) is a separate concern.
    scrollToSpy.mockClear()

    rerender(
      <Conversation scrollKey={2}>
        <div>message</div>
      </Conversation>
    )
    expect(scrollToSpy).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' })
    )
  })

  it('does not scroll when scrollKey changes after the reader has scrolled away', () => {
    mockScrollMetrics({ scrollHeight: 1000, scrollTop: 600, clientHeight: 400 })
    const { rerender, container } = render(
      <Conversation scrollKey={1}>
        <div>message</div>
      </Conversation>
    )

    mockScrollMetrics({ scrollHeight: 1000, scrollTop: 100, clientHeight: 400 })
    fireEvent.scroll(getScrollContainer(container))

    scrollToSpy.mockClear()
    rerender(
      <Conversation scrollKey={2}>
        <div>message</div>
      </Conversation>
    )
    expect(scrollToSpy).not.toHaveBeenCalled()
  })

  it('clicking the pill scrolls smoothly to the bottom', () => {
    mockScrollMetrics({ scrollHeight: 1000, scrollTop: 100, clientHeight: 400 })
    const { getByTestId, container } = render(
      <Conversation scrollKey={1}>
        <div>message</div>
      </Conversation>
    )
    fireEvent.scroll(getScrollContainer(container))
    scrollToSpy.mockClear()
    fireEvent.click(getByTestId('ScrollToBottomPill'))
    expect(scrollToSpy).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' })
    )
  })

  it('drops the scroll-to-bottom pill after the conversation is reset (NES-1663)', () => {
    // Tall conversation, reader scrolled up → pill visible.
    mockScrollMetrics({ scrollHeight: 1000, scrollTop: 100, clientHeight: 400 })
    const { queryByTestId, container, rerender } = render(
      <Conversation scrollKey={8} bottomClearance={72}>
        <div>messages</div>
      </Conversation>
    )
    fireEvent.scroll(getScrollContainer(container))
    expect(queryByTestId('ScrollToBottomPill')).toBeInTheDocument()

    // Reset clears the conversation (scrollKey shrinks to 0).
    rerender(
      <Conversation scrollKey={0} bottomClearance={72}>
        <div />
      </Conversation>
    )
    expect(queryByTestId('ScrollToBottomPill')).not.toBeInTheDocument()

    // …and it stays gone once the idle sheet finishes shrinking: the bottom-
    // clearance padding (144) now exceeds the viewport (72), which without the
    // reset-pin would re-strand scrollTop above it and resurface the pill.
    mockScrollMetrics({ scrollHeight: 144, scrollTop: 0, clientHeight: 72 })
    fireResizeObservers()
    expect(queryByTestId('ScrollToBottomPill')).not.toBeInTheDocument()
  })

  it('resumes normal pill behaviour once a new message follows a reset (NES-1663)', () => {
    mockScrollMetrics({ scrollHeight: 1000, scrollTop: 100, clientHeight: 400 })
    const { queryByTestId, container, rerender } = render(
      <Conversation scrollKey={3}>
        <div>messages</div>
      </Conversation>
    )

    // Reset, then a fresh message arrives (scrollKey grows again) → the
    // reset-pin is released.
    rerender(
      <Conversation scrollKey={0}>
        <div />
      </Conversation>
    )
    rerender(
      <Conversation scrollKey={1}>
        <div>new</div>
      </Conversation>
    )

    // Reader scrolls up in the new conversation → the pill works again.
    mockScrollMetrics({ scrollHeight: 1000, scrollTop: 100, clientHeight: 400 })
    fireEvent.scroll(getScrollContainer(container))
    expect(queryByTestId('ScrollToBottomPill')).toBeInTheDocument()
  })
})
