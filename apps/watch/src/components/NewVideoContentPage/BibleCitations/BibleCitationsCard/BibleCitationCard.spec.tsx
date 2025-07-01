import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import { NextRouter, useRouter } from 'next/router'

import { BibleCitationCard } from './BibleCitationCard'

// Mock axios
jest.mock('axios', () => {
  const originalModule = jest.requireActual('axios')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})

// Mock next/router
jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockAxios = axios as jest.MockedFunction<typeof axios>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

let mockAxiosGet: jest.Mock
let mockAxiosPost: jest.Mock

const mockCitation = {
  __typename: 'BibleCitation' as const,
  bibleBook: {
    __typename: 'BibleBook' as const,
    name: [{ __typename: 'BibleBookName' as const, value: 'John' }]
  },
  chapterStart: 3,
  chapterEnd: null,
  verseStart: 16,
  verseEnd: null
}

const mockCitationWithEndVerse = {
  __typename: 'BibleCitation' as const,
  bibleBook: {
    __typename: 'BibleBook' as const,
    name: [{ __typename: 'BibleBookName' as const, value: 'Matthew' }]
  },
  chapterStart: 5,
  chapterEnd: 7,
  verseStart: 3,
  verseEnd: 12
}

const mockScriptureResponse = {
  text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
  reference: 'John 3:16'
}

describe('BibleCitationCard', () => {
  let push: jest.Mock

  beforeEach(() => {
    push = jest.fn()
    mockUseRouter.mockReturnValue({
      push,
      locale: 'en',
      query: {}
    } as unknown as NextRouter)

    // Setup axios mocks
    mockAxiosGet = jest.fn()
    mockAxiosPost = jest.fn()
    mockAxios.get = mockAxiosGet
    mockAxios.post = mockAxiosPost

    jest.clearAllMocks()
  })

  it('should render with basic citation data', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <BibleCitationCard
        citation={mockCitation}
        imageUrl="https://example.com/image.jpg"
      />
    )

    expect(screen.getByText('John 3:16')).toBeInTheDocument()
    expect(screen.getByAltText('Bible Citation')).toBeInTheDocument()
  })

  it('should make axios request with correct URL', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <BibleCitationCard
        citation={mockCitation}
        imageUrl="https://example.com/image.jpg"
      />
    )

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-asv/books/john/chapters/3/verses/16.json'
      )
    })
  })

  it('should display scripture text when axios request succeeds', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <BibleCitationCard
        citation={mockCitation}
        imageUrl="https://example.com/image.jpg"
      />
    )

    await waitFor(() => {
      expect(screen.getByText(mockScriptureResponse.text)).toBeInTheDocument()
    })
  })

  it('should handle axios request failure gracefully', async () => {
    mockAxiosGet.mockRejectedValue(new Error('Network error'))

    render(
      <BibleCitationCard
        citation={mockCitation}
        imageUrl="https://example.com/image.jpg"
      />
    )
    // Should still render citation reference
    expect(screen.getByText('John 3:16')).toBeInTheDocument()
  })

  it('should show "Read more" link when verseEnd is present', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <BibleCitationCard
        citation={mockCitationWithEndVerse}
        imageUrl="https://example.com/image.jpg"
      />
    )

    await waitFor(() => {
      const readMoreLink = screen.getByText('Read more...')
      expect(readMoreLink).toBeInTheDocument()
      expect(readMoreLink.closest('a')).toHaveAttribute(
        'href',
        expect.stringContaining('biblegateway.com')
      )
      expect(readMoreLink.closest('a')).toHaveAttribute('target', '_blank')
      expect(readMoreLink.closest('a')).toHaveAttribute(
        'rel',
        'noopener noreferrer'
      )
    })
  })

  it('should not show "Read more" link when verseEnd is null', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <BibleCitationCard
        citation={mockCitation}
        imageUrl="https://example.com/image.jpg"
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Read more...')).not.toBeInTheDocument()
    })
  })

  it('should generate correct Bible Gateway URL for verse range', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <BibleCitationCard
        citation={mockCitationWithEndVerse}
        imageUrl="https://example.com/image.jpg"
      />
    )

    await waitFor(() => {
      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=NIV')
    })
  })

  it('should display correct citation format for chapter range', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <BibleCitationCard
        citation={mockCitationWithEndVerse}
        imageUrl="https://example.com/image.jpg"
      />
    )

    expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
  })

  it('should display correct citation format for single chapter', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <BibleCitationCard
        citation={mockCitation}
        imageUrl="https://example.com/image.jpg"
      />
    )

    expect(screen.getByText('John 3:16')).toBeInTheDocument()
  })

  it('should use correct locale from router', async () => {
    mockUseRouter.mockReturnValue({
      push,
      locale: 'en',
      query: {}
    } as unknown as NextRouter)

    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <BibleCitationCard
        citation={mockCitation}
        imageUrl="https://example.com/image.jpg"
      />
    )

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining('en-asv')
      )
    })
  })

  it('should default to "en" locale when router locale is undefined', async () => {
    mockUseRouter.mockReturnValue({
      push,
      locale: undefined,
      query: {}
    } as unknown as NextRouter)

    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <BibleCitationCard
        citation={mockCitation}
        imageUrl="https://example.com/image.jpg"
      />
    )

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining('en-asv')
      )
    })
  })
})
