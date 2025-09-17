import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VideoProvider } from '../../libs/videoContext'
import { WatchProvider } from '../../libs/watchContext'
import { GET_SUBTITLES } from '../../libs/watchContext/useSubtitleUpdate/useSubtitleUpdate'
import { videos } from '../Videos/__generated__/testData'

jest.mock('./VideoContentHero', () => ({
  __esModule: true,
  VideoContentHero: () => {
    const React = require('react')
    return React.createElement(
      'div',
      { 'data-testid': 'ContentHero' },
      React.createElement('div', { 'data-testid': 'ContentHeroVideoContainer' })
    )
  }
}))

jest.mock('../../libs/useVideoChildren', () => ({
  useVideoChildren: () => ({ children: [], loading: false })
}))

import { NewVideoContentPage } from './NewVideoContentPage'

const initialWatchState = {
  audioLanguageId: '529',
  subtitleLanguageId: '529',
  subtitleOn: false
}

const subtitlesMock = {
  request: {
    query: GET_SUBTITLES,
    variables: { id: 'jesus/english' }
  },
  result: {
    data: {
      video: {
        variant: {
          subtitle: [
            {
              language: {
                id: '529',
                bcp47: 'en',
                name: [{ value: 'English' }]
              },
              value: 'https://example.com/subtitles/english.vtt'
            }
          ]
        }
      }
    }
  }
}

const subtitleResponse = `WEBVTT

00:00:01.000 --> 00:00:04.000
Test subtitle line
`

const originalFetch = global.fetch

function renderPage(video = videos[0]) {
  return render(
    <MockedProvider mocks={[subtitlesMock]} addTypename={false}>
      <VideoProvider value={{ content: video }}>
        <WatchProvider initialState={initialWatchState}>
          <NewVideoContentPage />
        </WatchProvider>
      </VideoProvider>
    </MockedProvider>
  )
}

describe('NewContentPage', () => {
  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({
        ok: true,
        text: async () => subtitleResponse
      }) as unknown as typeof fetch
  })

  afterEach(() => {
    jest.clearAllMocks()
    if (originalFetch != null) global.fetch = originalFetch
  })

  it('should render', () => {
    renderPage()

    expect(screen.getByTestId('ContentHero')).toBeInTheDocument()
    expect(screen.getByTestId('NewVideoContentHeader')).toBeInTheDocument()
    expect(screen.getByTestId('ContentHeroVideoContainer')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
    expect(screen.getByTestId('ContentMetadata')).toBeInTheDocument()
    expect(screen.getByTestId('ContentDiscussionQuestions')).toBeInTheDocument()
    expect(screen.getByTestId('VideoSubtitlesPanel')).toBeInTheDocument()
    expect(screen.getByTestId('BibleCitations')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument()
  })

  it('should render ShareDialog when button is clicked', async () => {
    renderPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Share' }))

    expect(screen.getByTestId('ShareDialog')).toBeInTheDocument()
  })

  it('should render DownloadDialog when button is clicked', async () => {
    renderPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Download' }))

    await waitFor(() =>
      expect(screen.getByTestId('DownloadDialog')).toBeInTheDocument()
    )
  })

  const videoWithBibleCitations = {
    ...videos[0],
    bibleCitations: [
      {
        __typename: 'BibleCitation' as const,
        bibleBook: {
          __typename: 'BibleBook' as const,
          name: [{ __typename: 'BibleBookName' as const, value: 'Genesis' }]
        },
        chapterStart: 1,
        chapterEnd: null,
        verseStart: 1,
        verseEnd: null
      },
      {
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
    ]
  }

  it('should render bible citations', async () => {
    renderPage(videoWithBibleCitations)

    await waitFor(() => {
      expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      expect(screen.getByText('John 3:16')).toBeInTheDocument()
    })
  })

  it('should render free resource card', () => {
    renderPage(videoWithBibleCitations)
    expect(screen.getByText('Free Resources')).toBeInTheDocument()
    expect(
      screen.getByText('Want to grow deep in your understanding of the Bible?')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Join Our Bible Study' })
    ).toBeInTheDocument()
  })

  it('should open new tab when free resource button is clicked', async () => {
    const user = userEvent.setup()
    window.open = jest.fn()
    renderPage(videoWithBibleCitations)
    const freeResourceButton = screen.getByRole('link', {
      name: 'Join Our Bible Study'
    })
    await user.click(freeResourceButton)
    expect(window.open).toHaveBeenCalledWith(
      'https://join.bsfinternational.org/?utm_source=jesusfilm-watch',
      '_blank'
    )
  })
})
