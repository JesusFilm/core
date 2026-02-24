import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VideoProvider } from '../../libs/videoContext'
import { WatchProvider } from '../../libs/watchContext'
import { videos } from '../Videos/__generated__/testData'

import { NewVideoContentPage } from './NewVideoContentPage'

const initialWatchState = {
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
})
