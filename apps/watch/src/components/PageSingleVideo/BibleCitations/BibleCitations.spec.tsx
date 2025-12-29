import { render, screen } from '@testing-library/react'

import { VideoContentFields_bibleCitations } from '../../../../__generated__/VideoContentFields'

import { BibleCitations } from './BibleCitations'

const mockBibleCitations: VideoContentFields_bibleCitations[] = [
  {
    __typename: 'BibleCitation',
    bibleBook: {
      __typename: 'BibleBook',
      name: [{ __typename: 'BibleBookName', value: 'Genesis' }]
    },
    chapterStart: 1,
    chapterEnd: null,
    verseStart: 1,
    verseEnd: null
  },
  {
    __typename: 'BibleCitation',
    bibleBook: {
      __typename: 'BibleBook',
      name: [{ __typename: 'BibleBookName', value: 'John' }]
    },
    chapterStart: 3,
    chapterEnd: null,
    verseStart: 16,
    verseEnd: null
  }
]

const mockFreeResource = {
  heading: 'Free Resource',
  text: 'Get your free resource now',
  cta: {
    label: 'Download',
    onClick: jest.fn()
  }
}

describe('BibleCitations', () => {
  it('renders bible citations correctly', () => {
    render(
      <BibleCitations
        bibleCitations={mockBibleCitations}
        freeResource={mockFreeResource}
      />
    )

    expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
    expect(screen.getByText('John 3:16')).toBeInTheDocument()
  })

  it('renders free resource card when provided', () => {
    render(
      <BibleCitations
        bibleCitations={mockBibleCitations}
        freeResource={mockFreeResource}
      />
    )

    expect(screen.getByText('Free Resource')).toBeInTheDocument()
    expect(screen.getByText('Get your free resource now')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Download' })).toBeInTheDocument()
  })

  it('does not render free resource card when not provided', () => {
    render(<BibleCitations bibleCitations={mockBibleCitations} />)

    expect(screen.queryByText('Free Resource')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Get your free resource now')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Download' })
    ).not.toBeInTheDocument()
  })

  it('handles empty bible citations array', () => {
    render(
      <BibleCitations bibleCitations={[]} freeResource={mockFreeResource} />
    )

    expect(screen.queryByText(/Genesis/)).not.toBeInTheDocument()
    expect(screen.queryByText(/John/)).not.toBeInTheDocument()
  })

  it('calls cta onClick handler when free resource button is clicked', () => {
    render(
      <BibleCitations
        bibleCitations={mockBibleCitations}
        freeResource={mockFreeResource}
      />
    )

    const downloadButton = screen.getByRole('link', { name: 'Download' })
    downloadButton.click()

    expect(mockFreeResource.cta.onClick).toHaveBeenCalledTimes(1)
  })
})
