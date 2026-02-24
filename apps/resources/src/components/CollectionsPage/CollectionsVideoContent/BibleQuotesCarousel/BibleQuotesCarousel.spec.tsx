import { fireEvent, render, screen } from '@testing-library/react'

import { changeJSDOMURL } from '../../../../libs/utils/changeJSDOMURL'

import { BibleQuotesCarousel } from './BibleQuotesCarousel'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'Share' ? 'Share' : key)
  })
}))

jest.mock('@next/third-parties/google')

describe('BibleQuotesCarousel', () => {
  const mockBibleQuotes = [
    {
      imageUrl: 'https://example.com/image1.jpg',
      bgColor: '#123456',
      author: 'John',
      text: 'For God so loved the world...'
    },
    {
      imageUrl: 'https://example.com/image2.jpg',
      bgColor: '#654321',
      text: 'The Lord is my shepherd...'
    }
  ]

  const mockFreeResource = {
    imageUrl: 'https://example.com/resource.jpg',
    bgColor: '#789012',
    title: 'Free Bible Study',
    subtitle: 'Join now',
    buttonText: 'Start studying'
  }

  const mockOpenDialog = jest.fn()

  // Store original navigator methods
  const originalNavigator = { ...global.navigator }
  const mockShare = jest.fn().mockResolvedValue(undefined)
  const mockClipboard = {
    writeText: jest.fn().mockResolvedValue(undefined)
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock the navigator.share API
    Object.defineProperty(global.navigator, 'share', {
      value: mockShare,
      configurable: true
    })

    // Mock the navigator.clipboard API
    Object.defineProperty(global.navigator, 'clipboard', {
      value: mockClipboard,
      configurable: true
    })

    // Mock window.location - Jest v30 compatible
    changeJSDOMURL('https://watch.jesusfilm.org/easter')
  })

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    })
  })

  it('renders with bible quotes and title', () => {
    render(
      <BibleQuotesCarousel
        contentId="123"
        bibleQuotes={mockBibleQuotes}
        bibleQuotesTitle="Bible Quotes"
        onOpenDialog={mockOpenDialog}
        shareButtonText="Share"
        shareDataTitle="Share Data Title"
      />
    )

    expect(screen.getByText('Bible Quotes')).toBeInTheDocument()
    expect(screen.getAllByTestId('BibleQuotesSwiperSlide')).toHaveLength(2)
    expect(screen.getByText('John:')).toBeInTheDocument()
    expect(
      screen.getByText('For God so loved the world...')
    ).toBeInTheDocument()
    expect(screen.getByText('The Lord is my shepherd...')).toBeInTheDocument()
  })

  it('renders with free resource', () => {
    render(
      <BibleQuotesCarousel
        contentId="123"
        bibleQuotes={[]}
        bibleQuotesTitle="Bible Quotes"
        freeResource={mockFreeResource}
        onOpenDialog={mockOpenDialog}
        shareButtonText="Share"
        shareDataTitle="Share Data Title"
      />
    )

    expect(screen.getByText('Join now')).toBeInTheDocument()
    expect(screen.getByText('Free Bible Study')).toBeInTheDocument()
    expect(screen.getByText('Start studying')).toBeInTheDocument()
  })

  it('calls navigator.share when the share button is clicked', async () => {
    render(
      <BibleQuotesCarousel
        contentId="123"
        bibleQuotes={mockBibleQuotes}
        bibleQuotesTitle="Bible Quotes"
        shareButtonText="Share"
        shareDataTitle="Share Data Title"
      />
    )

    const shareButton = screen.getByRole('button', {
      name: /share bible quotes/i
    })
    fireEvent.click(shareButton)

    expect(mockShare).toHaveBeenCalledTimes(1)
    expect(mockShare).toHaveBeenCalledWith({
      url: expect.stringContaining('/easter?utm_source=share'),
      title: expect.any(String),
      text: expect.any(String)
    })
  })

  it('has correct link for free resource button', () => {
    render(
      <BibleQuotesCarousel
        contentId="123"
        bibleQuotes={[]}
        bibleQuotesTitle="Bible Quotes"
        freeResource={mockFreeResource}
        shareButtonText="Share"
        shareDataTitle="Share Data Title"
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'href',
      'https://join.bsfinternational.org/?utm_source=jesusfilm-watch'
    )
  })
})
