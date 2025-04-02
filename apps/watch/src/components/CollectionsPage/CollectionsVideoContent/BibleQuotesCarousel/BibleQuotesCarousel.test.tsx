import { fireEvent, render, screen } from '@testing-library/react'

import { BibleQuotesCarousel } from './BibleQuotesCarousel'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'Share' ? 'Share' : key)
  })
}))

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

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with bible quotes and title', () => {
    render(
      <BibleQuotesCarousel
        bibleQuotes={mockBibleQuotes}
        bibleQuotesTitle="Bible Quotes"
        onOpenDialog={mockOpenDialog}
        shareButtonText="Share"
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
        bibleQuotes={[]}
        bibleQuotesTitle="Bible Quotes"
        freeResource={mockFreeResource}
        onOpenDialog={mockOpenDialog}
        shareButtonText="Share"
      />
    )

    expect(screen.getByText('Join now')).toBeInTheDocument()
    expect(screen.getByText('Free Bible Study')).toBeInTheDocument()
    expect(screen.getByText('Start studying')).toBeInTheDocument()
  })

  it('calls onOpenDialog when share button is clicked', () => {
    render(
      <BibleQuotesCarousel
        bibleQuotes={mockBibleQuotes}
        bibleQuotesTitle="Bible Quotes"
        onOpenDialog={mockOpenDialog}
        shareButtonText="Share"
      />
    )

    const shareButton = screen.getByRole('button', {
      name: /share bible quotes/i
    })
    fireEvent.click(shareButton)

    expect(mockOpenDialog).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenDialog when free resource button is clicked', () => {
    render(
      <BibleQuotesCarousel
        bibleQuotes={[]}
        bibleQuotesTitle="Bible Quotes"
        freeResource={mockFreeResource}
        onOpenDialog={mockOpenDialog}
        shareButtonText="Share"
      />
    )

    const joinButton = screen.getByRole('button', { name: /join bible study/i })
    fireEvent.click(joinButton)

    expect(mockOpenDialog).toHaveBeenCalledTimes(1)
  })
})
