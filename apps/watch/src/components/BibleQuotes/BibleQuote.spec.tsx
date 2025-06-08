import { render, screen } from '@testing-library/react'

import { BibleQuote } from './BibleQuote'

describe('BibleQuote Component', () => {
  const mockCitation = {
    id: '1',
    videoId: 'video1',
    osisId: 'Genesis 1:1',
    bibleBookId: 'Genesis',
    order: 1,
    chapterStart: 1,
    chapterEnd: 1,
    verseStart: 1,
    verseEnd: 1
  }

  const mockProps = {
    citation: mockCitation,
    children: 'In the beginning God created the heavens and the earth.',
    imageUrl: '/path/to/image.jpg',
    bgColor: '#ffffff'
  }

  it('renders quote text correctly', () => {
    render(<BibleQuote {...mockProps} />)
    expect(screen.getByText(mockProps.children)).toBeInTheDocument()
  })

  it('renders citation reference correctly', () => {
    render(<BibleQuote {...mockProps} />)
    expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
  })

  it('renders with correct styling classes', () => {
    render(<BibleQuote {...mockProps} />)
    const quoteElement = screen.getByText(mockProps.children)
    expect(quoteElement).toHaveClass('text-base')
    expect(quoteElement).toHaveClass('leading-relaxed')
  })
})
