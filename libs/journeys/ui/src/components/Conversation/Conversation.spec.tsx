import { act, fireEvent, render } from '@testing-library/react'

import { Conversation } from './Conversation'

jest.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const observers: ResizeObserverCallback[] = []

class ResizeObserverMock {
  constructor(cb: ResizeObserverCallback) {
    observers.push(cb)
  }
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
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
  jest
    .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    .mockReturnValue(scrollHeight)
  jest
    .spyOn(HTMLElement.prototype, 'scrollTop', 'get')
    .mockReturnValue(scrollTop)
  jest
    .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
    .mockReturnValue(clientHeight)
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
  let scrollToSpy: jest.Mock
  let originalScrollTo: typeof Element.prototype.scrollTo | undefined
  let originalResizeObserver: typeof window.ResizeObserver | undefined

  beforeEach(() => {
    observers.length = 0
    originalResizeObserver = window.ResizeObserver
    window.ResizeObserver =
      ResizeObserverMock as unknown as typeof ResizeObserver
    // jsdom does not implement Element.prototype.scrollTo, so we install
    // a fresh jest.fn() each test instead of spying on a missing prop.
    originalScrollTo = (
      Element.prototype as { scrollTo?: typeof Element.prototype.scrollTo }
    ).scrollTo
    scrollToSpy = jest.fn()
    Element.prototype.scrollTo =
      scrollToSpy as unknown as typeof Element.prototype.scrollTo
  })

  afterEach(() => {
    jest.restoreAllMocks()
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
    const { queryByTestId } = render(
      <Conversation scrollKey={1}>
        <div>message</div>
      </Conversation>
    )
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
})
