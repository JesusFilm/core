import { fireEvent, render, screen } from '@testing-library/react'

import { MuxVideoCard } from './MuxVideoCard'

describe('MuxVideoCard', () => {
  const insert = {
    source: 'mux' as const,
    id: 'welcome-start',
    overlay: {
      label: 'Today’s Pick',
      title: 'Morning Nature Background',
      collection: 'Daily Inspirations',
      description: 'A calm intro before your playlist.'
    },
    playbackId: 'abc123',
    playbackIndex: 0,
    urls: {
      hls: 'https://stream.mux.com/abc123.m3u8',
      poster: 'https://image.mux.com/abc123/thumbnail.jpg?time=1',
      mp4: {}
    }
  }

  const playSpy = jest
    .spyOn(window.HTMLMediaElement.prototype, 'play')
    .mockImplementation(async () => undefined)
  const pauseSpy = jest
    .spyOn(window.HTMLMediaElement.prototype, 'pause')
    .mockImplementation(() => {})

  class ImmediateIntersectionObserver {
    callback: IntersectionObserverCallback

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback
    }

    observe(target: Element): void {
      this.callback(
        [
          {
            isIntersecting: true,
            target
          } as IntersectionObserverEntry
        ],
        this as unknown as IntersectionObserver
      )
    }

    disconnect(): void {}

    unobserve(): void {}
  }

  beforeEach(() => {
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: ImmediateIntersectionObserver
    })

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: no-preference)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    playSpy.mockRestore()
    pauseSpy.mockRestore()
  })

  it('renders overlay content and video element', async () => {
    const { findByText } = render(<MuxVideoCard insert={insert} />)

    expect(await findByText('Morning Nature Background')).toBeInTheDocument()
    expect(playSpy).toHaveBeenCalled()
  })

  it('shows manual play button when reduced motion is preferred', () => {
    ;(window.matchMedia as jest.Mock).mockImplementation(() => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))

    render(<MuxVideoCard insert={insert} />)

    expect(
      screen.getByRole('button', { name: 'Play background video' })
    ).toBeInTheDocument()
    expect(playSpy).not.toHaveBeenCalled()
  })

  it('renders fallback when video errors', () => {
    render(<MuxVideoCard insert={insert} />)
    const video = document.querySelector('video')
    expect(video).not.toBeNull()

    fireEvent.error(video as HTMLVideoElement)

    expect(screen.getByTestId('MuxVideoFallback')).toBeInTheDocument()
    expect(pauseSpy).toHaveBeenCalled()
  })
})
