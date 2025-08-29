import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'

import { WatchProvider } from '../../../../libs/watchContext'

import { BibleCitationCard } from './BibleCitationCard'
import { I18nextProvider } from 'react-i18next'
import i18n, { makeI18n } from '../../../../../test/i18n'

// Mock axios
jest.mock('axios', () => {
  const originalModule = jest.requireActual('axios')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})

const mockAxios = axios as jest.MockedFunction<typeof axios>

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
  beforeEach(() => {
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
      <WatchProvider
        initialState={{
          audioLanguage: 'en',
          subtitleLanguage: 'en',
          subtitleOn: false
        }}
      >
        <BibleCitationCard
          citation={mockCitation}
          imageUrl="https://example.com/image.jpg"
        />
      </WatchProvider>
    )

    expect(screen.getByText('John 3:16')).toBeInTheDocument()
    expect(screen.getByAltText('Bible Citation')).toBeInTheDocument()
  })

  it('should make axios request with correct URL', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <WatchProvider
        initialState={{
          audioLanguage: 'en',
          subtitleLanguage: 'en',
          subtitleOn: false
        }}
      >
        <BibleCitationCard
          citation={mockCitation}
          imageUrl="https://example.com/image.jpg"
        />
      </WatchProvider>
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
      <WatchProvider
        initialState={{
          audioLanguage: 'en',
          subtitleLanguage: 'en',
          subtitleOn: false
        }}
      >
        <BibleCitationCard
          citation={mockCitation}
          imageUrl="https://example.com/image.jpg"
        />
      </WatchProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(mockScriptureResponse.text)).toBeInTheDocument()
    })
  })

  it('should handle axios request failure gracefully', async () => {
    mockAxiosGet.mockRejectedValue(new Error('Network error'))

    render(
      <WatchProvider
        initialState={{
          audioLanguage: 'en',
          subtitleLanguage: 'en',
          subtitleOn: false
        }}
      >
        <BibleCitationCard
          citation={mockCitation}
          imageUrl="https://example.com/image.jpg"
        />
      </WatchProvider>
    )
    // Should still render citation reference
    expect(screen.getByText('John 3:16')).toBeInTheDocument()
  })

  it('should show "Read more" link when verseEnd is present', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <WatchProvider
        initialState={{
          audioLanguage: 'en',
          subtitleLanguage: 'en',
          subtitleOn: false
        }}
      >
        <BibleCitationCard
          citation={mockCitationWithEndVerse}
          imageUrl="https://example.com/image.jpg"
        />
      </WatchProvider>
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
      <WatchProvider
        initialState={{
          audioLanguage: 'en',
          subtitleLanguage: 'en',
          subtitleOn: false
        }}
      >
        <BibleCitationCard
          citation={mockCitation}
          imageUrl="https://example.com/image.jpg"
        />
      </WatchProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Read more...')).not.toBeInTheDocument()
    })
  })

  it('should generate correct Bible Gateway URL for verse range', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <WatchProvider
        initialState={{
          audioLanguage: 'en',
          subtitleLanguage: 'en',
          subtitleOn: false
        }}
      >
        <BibleCitationCard
          citation={mockCitationWithEndVerse}
          imageUrl="https://example.com/image.jpg"
        />
      </WatchProvider>
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
      <WatchProvider
        initialState={{
          audioLanguage: 'en',
          subtitleLanguage: 'en',
          subtitleOn: false
        }}
      >
        <BibleCitationCard
          citation={mockCitationWithEndVerse}
          imageUrl="https://example.com/image.jpg"
        />
      </WatchProvider>
    )
    expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
  })

  it('should display correct citation format for single chapter', async () => {
    mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

    render(
      <WatchProvider
        initialState={{
          audioLanguage: 'en',
          subtitleLanguage: 'en',
          subtitleOn: false
        }}
      >
        <BibleCitationCard
          citation={mockCitation}
          imageUrl="https://example.com/image.jpg"
        />
      </WatchProvider>
    )

    expect(screen.getByText('John 3:16')).toBeInTheDocument()
  })

  describe('Languages', () => {
    it('should use correct versions for English (en)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })

      render(
        <WatchProvider
          initialState={{
            audioLanguage: 'en',
            subtitleLanguage: 'en',
            subtitleOn: false
          }}
        >
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </WatchProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-asv/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=NIV')
    })

    it('should use correct versions for Spanish (es)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })
      const i18n = await makeI18n('es')

      render(
        <I18nextProvider i18n={i18n}>
          <WatchProvider
            initialState={{
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <BibleCitationCard
              citation={mockCitationWithEndVerse}
              imageUrl="https://example.com/image.jpg"
            />
          </WatchProvider>
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/es-rvr1960/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=NVI')
    })

    it('should use correct versions for French (fr)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })
      const i18n = await makeI18n('fr')

      render(
        <I18nextProvider i18n={i18n}>
          <WatchProvider
            initialState={{
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <BibleCitationCard
              citation={mockCitationWithEndVerse}
              imageUrl="https://example.com/image.jpg"
            />
          </WatchProvider>
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/fr-s21/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=BDS')
    })

    it('should use correct versions for Indonesian (id)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })
      const i18n = await makeI18n('id')

      render(
        <I18nextProvider i18n={i18n}>
          <WatchProvider
            initialState={{
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <BibleCitationCard
              citation={mockCitationWithEndVerse}
              imageUrl="https://example.com/image.jpg"
            />
          </WatchProvider>
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/id-tlab/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=TB')
    })

    it('should use correct versions for Japanese (ja)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })
      const i18n = await makeI18n('ja')

      render(
        <I18nextProvider i18n={i18n}>
          <WatchProvider
            initialState={{
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <BibleCitationCard
              citation={mockCitationWithEndVerse}
              imageUrl="https://example.com/image.jpg"
            />
          </WatchProvider>
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/ja-jc/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=SHINK2017')
    })

    it('should use correct versions for Korean (ko)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })
      const i18n = await makeI18n('ko')

      render(
        <I18nextProvider i18n={i18n}>
          <WatchProvider
            initialState={{
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <BibleCitationCard
              citation={mockCitationWithEndVerse}
              imageUrl="https://example.com/image.jpg"
            />
          </WatchProvider>
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/ko-askv/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=NKRV')
    })

    it('should use correct versions for Russian (ru)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })
      const i18n = await makeI18n('ru')

      render(
        <I18nextProvider i18n={i18n}>
          <WatchProvider
            initialState={{
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <BibleCitationCard
              citation={mockCitationWithEndVerse}
              imageUrl="https://example.com/image.jpg"
            />
          </WatchProvider>
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/ru-synod/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=SYNOD')
    })

    it('should use correct versions for Thai (th)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })
      const i18n = await makeI18n('th')

      render(
        <I18nextProvider i18n={i18n}>
          <WatchProvider
            initialState={{
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <BibleCitationCard
              citation={mockCitationWithEndVerse}
              imageUrl="https://example.com/image.jpg"
            />
          </WatchProvider>
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/th-tkjv/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=TNCV')
    })

    it('should use correct versions for Turkish (tr)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })
      const i18n = await makeI18n('tr')

      render(
        <I18nextProvider i18n={i18n}>
          <WatchProvider
            initialState={{
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <BibleCitationCard
              citation={mockCitationWithEndVerse}
              imageUrl="https://example.com/image.jpg"
            />
          </WatchProvider>
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/tr-tcl02/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=TC-2009')
    })

    it('should use correct versions for Traditional Chinese (zh)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })
      const i18n = await makeI18n('zh')

      render(
        <I18nextProvider i18n={i18n}>
          <WatchProvider
            initialState={{
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <BibleCitationCard
              citation={mockCitationWithEndVerse}
              imageUrl="https://example.com/image.jpg"
            />
          </WatchProvider>
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/zh-cunp-s/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=CUVMPT')
    })

    it('should use correct versions for Simplified Chinese (zh-Hans-CN)', async () => {
      mockAxiosGet.mockResolvedValue({ data: mockScriptureResponse })
      const i18n = await makeI18n('zh-Hans-CN')

      render(
        <I18nextProvider i18n={i18n}>
          <WatchProvider
            initialState={{
              audioLanguage: 'en',
              subtitleLanguage: 'en',
              subtitleOn: false
            }}
          >
            <BibleCitationCard
              citation={mockCitationWithEndVerse}
              imageUrl="https://example.com/image.jpg"
            />
          </WatchProvider>
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenCalledWith(
          'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/zh-cn-cmn-s-cuv/books/matthew/chapters/5/verses/3.json'
        )
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href).toContain('Matthew%205-7%3A3-12')
      expect(href).toContain('version=CUVS')
    })
  })
})
