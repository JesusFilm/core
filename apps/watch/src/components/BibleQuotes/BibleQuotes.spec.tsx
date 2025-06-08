import { fireEvent, render, screen } from '@testing-library/react'

import { BibleQuotes } from './BibleQuotes'

jest.mock('./BibleQuote', () => ({
  BibleQuote: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bible-quote">{children}</div>
  )
}))

describe('BibleQuotes Component', () => {
  const mockCitations = [
    {
      id: '1',
      videoId: 'video1',
      osisId: 'Genesis 1:1',
      bibleBookId: 'Genesis',
      order: 1,
      chapterStart: 1,
      chapterEnd: 1,
      verseStart: 1,
      verseEnd: 1
    },
    {
      id: '2',
      videoId: 'video1',
      osisId: 'John 3:16',
      bibleBookId: 'John',
      order: 2,
      chapterStart: 3,
      chapterEnd: 3,
      verseStart: 16,
      verseEnd: 16
    }
  ]

  const mockProps = {
    contentId: '123',
    bibleCitations: mockCitations,
    bibleQuotesTitle: 'Bible Quotes',
    shareButtonText: 'Share',
    shareDataTitle: 'Share this content'
  }

  it('renders title correctly', () => {
    render(<BibleQuotes {...mockProps} />)
    expect(screen.getByText('Bible Quotes')).toBeInTheDocument()
  })

  it('renders share button correctly', () => {
    render(<BibleQuotes {...mockProps} />)
    expect(screen.getByText('Share')).toBeInTheDocument()
    expect(screen.getByTestId('ShareButton')).toBeInTheDocument()
  })

  it('renders bible quotes correctly', () => {
    render(<BibleQuotes {...mockProps} />)
    const quotes = screen.getAllByTestId('bible-quote')
    expect(quotes).toHaveLength(2)
  })

  it('handles share button click', () => {
    render(<BibleQuotes {...mockProps} />)
    const shareButton = screen.getByTestId('ShareButton')
    fireEvent.click(shareButton)
    // Add expectations for GTM event if needed
  })
})
