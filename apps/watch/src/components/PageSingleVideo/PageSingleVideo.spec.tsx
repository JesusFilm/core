import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VideoProvider } from '../../libs/videoContext'
import { WatchProvider } from '../../libs/watchContext'
import { useVideoChildren } from '../../libs/useVideoChildren/useVideoChildren'
import { videos } from '../Videos/__generated__/testData'

import { PageSingleVideo } from './PageSingleVideo'

jest.mock('../../libs/useVideoChildren/useVideoChildren', () => ({
  ...jest.requireActual('../../libs/useVideoChildren/useVideoChildren'),
  useVideoChildren: jest.fn()
}))

const mockUseVideoChildren = useVideoChildren as jest.MockedFunction<
  typeof useVideoChildren
>

const initialWatchState = {
  audioLanguage: '529',
  subtitleLanguage: '529',
  subtitleOn: true,
  autoSubtitle: false
}

const mockChildren = [
  {
    __typename: 'Video' as const,
    id: 'child-1',
    slug: 'child-one',
    title: [{ __typename: 'VideoTitle' as const, value: 'Child One' }],
    images: [
      {
        __typename: 'CloudflareImage' as const,
        mobileCinematicHigh: 'https://example.com/child-one.jpg'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt' as const, value: 'Child One Alt' }],
    label: 'segment' as const,
    variant: {
      __typename: 'VideoVariant' as const,
      id: 'child-1-var',
      slug: 'child-one/en',
      duration: 120,
      hls: null,
      downloadable: false,
      downloads: [],
      language: {
        __typename: 'Language' as const,
        id: '529',
        name: [{ __typename: 'LanguageName' as const, value: 'English', primary: true }],
        bcp47: 'en'
      },
      subtitleCount: 0
    },
    childrenCount: 0
  },
  {
    __typename: 'Video' as const,
    id: 'child-2',
    slug: 'child-two',
    title: [{ __typename: 'VideoTitle' as const, value: 'Child Two' }],
    images: [
      {
        __typename: 'CloudflareImage' as const,
        mobileCinematicHigh: 'https://example.com/child-two.jpg'
      }
    ],
    imageAlt: [{ __typename: 'VideoImageAlt' as const, value: 'Child Two Alt' }],
    label: 'segment' as const,
    variant: {
      __typename: 'VideoVariant' as const,
      id: 'child-2-var',
      slug: 'child-two/en',
      duration: 180,
      hls: null,
      downloadable: false,
      downloads: [],
      language: {
        __typename: 'Language' as const,
        id: '529',
        name: [{ __typename: 'LanguageName' as const, value: 'English', primary: true }],
        bcp47: 'en'
      },
      subtitleCount: 0
    },
    childrenCount: 0
  }
]

describe('PageSingleVideo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseVideoChildren.mockReturnValue({
      children: [],
      loading: false
    })
  })

  it('should render', () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider initialState={initialWatchState}>
            <PageSingleVideo />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('ContentHero')).toBeInTheDocument()
    expect(screen.getByTestId('ContentHeader')).toBeInTheDocument()
    expect(screen.getByTestId('ContentHeroVideoContainer')).toBeInTheDocument()
    expect(screen.getByTestId('ContentMetadata')).toBeInTheDocument()
    expect(screen.getByTestId('ContentDiscussionQuestions')).toBeInTheDocument()
    expect(screen.getByTestId('BibleCitations')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument()
  })

  it('should render carousel when children exist', () => {
    mockUseVideoChildren.mockReturnValue({
      children: mockChildren,
      loading: false
    })

    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider initialState={initialWatchState}>
            <PageSingleVideo />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('should not render carousel when no children and not loading', () => {
    mockUseVideoChildren.mockReturnValue({
      children: [],
      loading: false
    })

    const videoWithoutChildren = {
      ...videos[0],
      childrenCount: 0
    }

    render(
      <MockedProvider>
        <VideoProvider value={{ content: videoWithoutChildren }}>
          <WatchProvider initialState={initialWatchState}>
            <PageSingleVideo />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.queryByTestId('VideoCarousel')).not.toBeInTheDocument()
  })

  it('should render carousel when loading and container has childrenCount', () => {
    mockUseVideoChildren.mockReturnValue({
      children: [],
      loading: true
    })

    const videoWithChildrenCount = {
      ...videos[0],
      childrenCount: 5
    }

    render(
      <MockedProvider>
        <VideoProvider value={{ content: videoWithChildrenCount }}>
          <WatchProvider initialState={initialWatchState}>
            <PageSingleVideo />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
  })

  it('should use activeVideoIdForCarousel when current video is in children', () => {
    mockUseVideoChildren.mockReturnValue({
      children: mockChildren,
      loading: false
    })

    const videoThatIsChild = {
      ...videos[0],
      id: 'child-1',
      children: mockChildren
    }

    render(
      <MockedProvider>
        <VideoProvider value={{ content: videoThatIsChild }}>
          <WatchProvider initialState={initialWatchState}>
            <PageSingleVideo />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarouselSlide-child-1')).toBeInTheDocument()
  })

  it('should use first child as activeVideoIdForCarousel when current video is container', () => {
    mockUseVideoChildren.mockReturnValue({
      children: mockChildren,
      loading: false
    })

    const containerVideo = {
      ...videos[0],
      id: 'container-video',
      childrenCount: 2
    }

    render(
      <MockedProvider>
        <VideoProvider value={{ content: containerVideo }}>
          <WatchProvider initialState={initialWatchState}>
            <PageSingleVideo />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('VideoCarousel')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCarouselSlide-child-1')).toBeInTheDocument()
  })

  it('should apply correct padding class (py-14)', () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider initialState={initialWatchState}>
            <PageSingleVideo />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )

    const contentPage = screen.getByTestId('ContentPageContent')
    expect(contentPage).toHaveClass('py-14')
  })

  it('should render DialogShare when button is clicked', async () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider initialState={initialWatchState}>
            <PageSingleVideo />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Share' }))

    expect(screen.getByTestId('DialogShare')).toBeInTheDocument()
  })

  it('should render DialogDownload when button is clicked', async () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <WatchProvider initialState={initialWatchState}>
            <PageSingleVideo />
          </WatchProvider>
        </VideoProvider>
      </MockedProvider>
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Download' }))

    await waitFor(() =>
      expect(screen.getByTestId('DialogDownload')).toBeInTheDocument()
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
            <PageSingleVideo />
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
            <PageSingleVideo />
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
            <PageSingleVideo />
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
