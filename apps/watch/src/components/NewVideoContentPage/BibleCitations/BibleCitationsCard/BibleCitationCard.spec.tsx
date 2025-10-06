import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
// eslint-disable-next-line no-restricted-imports
import { I18nextProvider } from 'react-i18next'

import { server } from '../../../../../test/mswServer'
import { makeI18n } from '../../../../../test/i18n'
import { VideoContentFields_bibleCitations as BibleCitation } from '../../../../../__generated__/VideoContentFields'

import { BibleCitationCard } from './BibleCitationCard'

const mockCitation: BibleCitation = {
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

const mockCitationWithEndVerse: BibleCitation = {
  __typename: 'BibleCitation',
  bibleBook: {
    __typename: 'BibleBook',
    name: [{ __typename: 'BibleBookName', value: 'Matthew' }]
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
    // Setup MSW handler for successful responses
    server.use(
      http.get(
        'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/:version/books/:book/chapters/:chapter/verses/:verse.json',
        () => {
          return HttpResponse.json(mockScriptureResponse)
        }
      )
    )
  })

  it('should render with basic citation data', async () => {
    render(
      <BibleCitationCard
        citation={mockCitation}
        imageUrl="https://example.com/image.jpg"
      />
    )

    expect(screen.getByText('John 3:16')).toBeInTheDocument()
    expect(screen.getByAltText('Bible Citation')).toBeInTheDocument()
  })

  it('should make Bible API request and display scripture text', async () => {
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

  it('should display scripture text when API request succeeds', async () => {
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

  it('should handle API request failure gracefully', async () => {
    // Override handler to return error
    server.use(
      http.get(
        'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/:version/books/:book/chapters/:chapter/verses/:verse.json',
        () => {
          return HttpResponse.error()
        }
      )
    )

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
    render(
      <BibleCitationCard
        citation={mockCitationWithEndVerse}
        imageUrl="https://example.com/image.jpg"
      />
    )
    expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
  })

  it('should display correct citation format for single chapter', async () => {
    render(
      <BibleCitationCard
        citation={mockCitation}
        imageUrl="https://example.com/image.jpg"
      />
    )

    expect(screen.getByText('John 3:16')).toBeInTheDocument()
  })

  describe('Languages', () => {
    it('should use correct versions for English (en)', async () => {
      render(
        <BibleCitationCard
          citation={mockCitationWithEndVerse}
          imageUrl="https://example.com/image.jpg"
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=NIV')
    })

    it('should use correct versions for Spanish (es)', async () => {
      const i18n = await makeI18n('es')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=NVI')
    })

    it('should use correct versions for French (fr)', async () => {
      const i18n = await makeI18n('fr')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=BDS')
    })

    it('should use correct versions for Indonesian (id)', async () => {
      const i18n = await makeI18n('id')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=TB')
    })

    it('should use correct versions for Japanese (ja)', async () => {
      const i18n = await makeI18n('ja')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=SHINK2017')
    })

    it('should use correct versions for Korean (ko)', async () => {
      const i18n = await makeI18n('ko')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=NKRV')
    })

    it('should use correct versions for Russian (ru)', async () => {
      const i18n = await makeI18n('ru')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=SYNOD')
    })

    it('should use correct versions for Thai (th)', async () => {
      const i18n = await makeI18n('th')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=TNCV')
    })

    it('should use correct versions for Turkish (tr)', async () => {
      const i18n = await makeI18n('tr')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=TC-2009')
    })

    it('should use correct versions for Traditional Chinese (zh)', async () => {
      const i18n = await makeI18n('zh')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=CUVMPT')
    })

    it('should use correct versions for Simplified Chinese (zh-Hans-CN)', async () => {
      const i18n = await makeI18n('zh-Hans-CN')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=CUVS')
    })

    it('should use english versions for unknown languages', async () => {
      const i18n = await makeI18n('zz')

      render(
        <I18nextProvider i18n={i18n}>
          <BibleCitationCard
            citation={mockCitationWithEndVerse}
            imageUrl="https://example.com/image.jpg"
          />
        </I18nextProvider>
      )

      await waitFor(() => {
        expect(screen.getByText('Matthew 5-7:3-12')).toBeInTheDocument()
      })

      const readMoreLink = screen.getByText('Read more...')
      const href = readMoreLink.closest('a')?.getAttribute('href')
      expect(href)?.toContain('Matthew%205-7%3A3-12')
      expect(href)?.toContain('version=NIV')
    })
  })
})
