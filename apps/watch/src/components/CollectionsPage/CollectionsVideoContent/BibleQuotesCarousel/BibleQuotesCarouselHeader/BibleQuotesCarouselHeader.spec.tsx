import { fireEvent, render, screen } from '@testing-library/react'

import { BibleQuotesCarouselHeader } from './BibleQuotesCarouselHeader'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

describe('BibleQuotesCarouselHeader', () => {
  const defaultProps = {
    contentId: '123',
    bibleQuotesTitle: 'Bible Quotes Title',
    shareButtonText: 'Share',
    shareDataTitle: 'Share Data Title'
  }

  const originalNavigator = { ...global.navigator }
  const mockShare = jest.fn().mockResolvedValue(undefined)
  const mockClipboard = {
    writeText: jest.fn().mockResolvedValue(undefined)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(global.navigator, 'share', {
      value: mockShare,
      configurable: true
    })
    Object.defineProperty(global.navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true
    })
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://watch.jesusfilm.org/easter'
      },
      writable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    })
  })

  it('renders the title correctly', () => {
    render(<BibleQuotesCarouselHeader {...defaultProps} />)

    expect(screen.getByText('Bible Quotes Title')).toBeInTheDocument()
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('calls navigator.share when the share button is clicked and share API is available', async () => {
    render(<BibleQuotesCarouselHeader {...defaultProps} />)

    fireEvent.click(screen.getByText('Share'))

    expect(mockShare).toHaveBeenCalledTimes(1)
    expect(mockShare).toHaveBeenCalledWith({
      url: expect.stringContaining(
        'https://watch.jesusfilm.org/easter?utm_source=share'
      ),
      title: expect.any(String),
      text: expect.any(String)
    })
  })

  it('falls back to clipboard.writeText when navigator.share is not available', async () => {
    Object.defineProperty(global.navigator, 'share', {
      value: undefined,
      configurable: true
    })

    render(<BibleQuotesCarouselHeader {...defaultProps} />)

    fireEvent.click(screen.getByText('Share'))

    expect(mockClipboard.writeText).toHaveBeenCalledTimes(1)
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://watch.jesusfilm.org/easter?utm_source=share'
      )
    )
  })

  it('calls share handler when Enter key is pressed on the share button', () => {
    render(<BibleQuotesCarouselHeader {...defaultProps} />)

    const shareButton = screen.getByText('Share').closest('button')!
    fireEvent.keyDown(shareButton, { key: 'Enter' })

    expect(mockShare).toHaveBeenCalledTimes(1)
  })

  it('calls share handler when Space key is pressed on the share button', () => {
    render(<BibleQuotesCarouselHeader {...defaultProps} />)

    const shareButton = screen.getByText('Share').closest('button')!
    fireEvent.keyDown(shareButton, { key: ' ' })

    expect(mockShare).toHaveBeenCalledTimes(1)
  })
})
