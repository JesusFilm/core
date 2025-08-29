import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  GetLanguagesSlug,
  GetLanguagesSlugVariables
} from '../../../__generated__/GetLanguagesSlug'
import { GET_LANGUAGES_SLUG } from '../../libs/useLanguagesSlugQuery'
import { VideoProvider } from '../../libs/videoContext'
import { WatchProvider } from '../../libs/watchContext'
import { TestWatchState } from '../../libs/watchContext/TestWatchState'
import { videos } from '../Videos/__generated__/testData'

import { NewVideoContentPage } from './NewVideoContentPage'

const initialWatchState = {
  siteLanguage: 'en',
  audioLanguage: '529',
  subtitleLanguage: '529',
  subtitleOn: true,
  autoSubtitle: false
}

describe('NewContentPage', () => {
  it('should render', () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider initialState={initialWatchState}>
            <NewVideoContentPage />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('ContentHero')).toBeInTheDocument()
    expect(screen.getByTestId('ContentHeader')).toBeInTheDocument()
    expect(screen.getByTestId('ContentHeroVideoContainer')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
    expect(screen.getByTestId('ContentMetadata')).toBeInTheDocument()
    expect(screen.getByTestId('ContentDiscussionQuestions')).toBeInTheDocument()
    expect(screen.getByTestId('BibleCitations')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument()
  })

  it('should render ShareDialog when button is clicked', async () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider initialState={initialWatchState}>
            <NewVideoContentPage />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Share' }))

    expect(screen.getByTestId('ShareDialog')).toBeInTheDocument()
  })

  it('should render DownloadDialog when button is clicked', async () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider initialState={initialWatchState}>
            <NewVideoContentPage />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )
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
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videoWithBibleCitations }}>
          <WatchProvider initialState={initialWatchState}>
            <NewVideoContentPage />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Genesis 1:1')).toBeInTheDocument()
      expect(screen.getByText('John 3:16')).toBeInTheDocument()
    })
  })

  it('should render free resource card', () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videoWithBibleCitations }}>
          <WatchProvider initialState={initialWatchState}>
            <NewVideoContentPage />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )
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
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videoWithBibleCitations }}>
          <WatchProvider initialState={initialWatchState}>
            <NewVideoContentPage />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )
    const freeResourceButton = screen.getByRole('link', {
      name: 'Join Our Bible Study'
    })
    await user.click(freeResourceButton)
    expect(window.open).toHaveBeenCalledWith(
      'https://join.bsfinternational.org/?utm_source=jesusfilm-watch',
      '_blank'
    )
  })

  it('should show subtitle state in TestWatchState', async () => {
    const getLanguagesSlugMock: MockedResponse<
      GetLanguagesSlug,
      GetLanguagesSlugVariables
    > = {
      request: {
        query: GET_LANGUAGES_SLUG,
        variables: { id: '1_jf-0-0' }
      },
      result: {
        data: {
          video: {
            __typename: 'Video' as const,
            variantLanguagesWithSlug: [
              {
                __typename: 'LanguageWithSlug' as const,
                slug: 'english',
                language: {
                  __typename: 'Language' as const,
                  id: '529',
                  slug: 'english',
                  name: [
                    {
                      __typename: 'LanguageName' as const,
                      value: 'English',
                      primary: true
                    }
                  ]
                }
              }
            ]
          }
        }
      }
    }

    const result = jest.fn().mockReturnValue({ ...getLanguagesSlugMock.result })

    render(
      <MockedProvider mocks={[{ ...getLanguagesSlugMock, result }]}>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider initialState={initialWatchState}>
            <NewVideoContentPage />
            <TestWatchState />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )
    expect(
      screen.getByText('videoAudioLanguagesIdsAndSlugs: 0 audio languages')
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })

    expect(
      screen.getByText('videoAudioLanguagesIdsAndSlugs: 1 audio languages')
    ).toBeInTheDocument()
  })
})
