import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import {
  InstantSearchApi,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'
import { SWRConfig } from 'swr'
import { type Mock, type MockedFunction } from 'vitest'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../__generated__/globalTypes'
import { mswServer } from '../../../../../../../test/mswServer'
import {
  MuxVideoUploadProvider,
  useMuxVideoUpload
} from '../../../../../MuxVideoUploadProvider'

import { videoItems } from './data'
import { GET_VIDEO } from './VideoFromLocal/LocalDetails/LocalDetails'
import {
  getPlaylistItemsEmpty,
  getVideosWithOffsetAndUrl
} from './VideoFromYouTube/VideoFromYouTube.handlers'

import { VideoLibrary } from '.'

// Stub VideoFromMux so we can drive the documented background-upload contract
// (onSelect with shouldCloseDrawer=false) directly from a test.
vi.mock('./VideoFromMux', async () => ({
  __esModule: true,
  VideoFromMux: ({
    onSelect
  }: {
    onSelect: (
      block: { videoId: string; source: 'mux' },
      shouldCloseDrawer?: boolean
    ) => void
  }) => (
    <button
      type="button"
      data-testid="mock-mux-background-complete"
      onClick={() => onSelect({ videoId: 'mux-bg-id', source: 'mux' }, false)}
    >
      simulate-mux-background-complete
    </button>
  )
}))

vi.mock('@mui/material/useMediaQuery', async () => ({
  __esModule: true,
  default: vi.fn()
}))

vi.mock('../../../../../MuxVideoUploadProvider', async () => ({
  ...(await vi.importActual('../../../../../MuxVideoUploadProvider')),
  useMuxVideoUpload: vi.fn(() => ({
    getUploadStatus: vi.fn(),
    addUploadTask: vi.fn(),
    cancelUploadForBlock: vi.fn()
  }))
}))

vi.mock('next/router', async () => ({
  __esModule: true,
  useRouter: vi.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>

vi.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as MockedFunction<typeof useSearchBox>
const mockUseInstantSearch = useInstantSearch as MockedFunction<
  typeof useInstantSearch
>
const mockUseInfiniteHits = useInfiniteHits as MockedFunction<
  typeof useInfiniteHits
>

const mockUseMuxVideoUpload = useMuxVideoUpload as MockedFunction<
  typeof useMuxVideoUpload
>

const mockGetUploadStatus = vi.fn()
const mockCancelUploadForBlock = vi.fn()
const mockAddUploadTask = vi.fn()
const push = vi.fn()
const on = vi.fn()

const mockRouter = (query = { param: null }) => {
  mockedUseRouter.mockReturnValue({
    query,
    push,
    events: { on }
  } as unknown as NextRouter)
}

describe('VideoLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSearchBox.mockReturnValue({
      refine: vi.fn()
    } as unknown as SearchBoxRenderState)

    mockUseInfiniteHits.mockReturnValue({
      items: videoItems,
      showMore: vi.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    mockUseInstantSearch.mockReturnValue({
      status: 'idle',
      results: {
        __isArtificial: false,
        nbHits: videoItems.length
      }
    } as unknown as InstantSearchApi)

    mockRouter()

    mockUseMuxVideoUpload.mockReturnValue({
      getUploadStatus: mockGetUploadStatus,
      addUploadTask: mockAddUploadTask,
      cancelUploadForBlock: mockCancelUploadForBlock
    })
  })

  afterEach(async () => {
    cleanup()
  })

  describe('smUp', () => {
    beforeEach(() => (useMediaQuery as Mock).mockImplementation(() => true))

    it('should render the Video Library on the right', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <MuxVideoUploadProvider>
              <VideoLibrary open />
            </MuxVideoUploadProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getByText('Video Library')).toBeInTheDocument()
      expect(
        screen.getByTestId('VideoLibrary').parentElement?.parentElement
      ).toHaveClass('MuiDrawer-paperAnchorRight')
    })

    it('should close VideoLibrary on close Icon click', () => {
      const onClose = vi.fn()
      render(
        <MockedProvider>
          <SnackbarProvider>
            <MuxVideoUploadProvider>
              <VideoLibrary open onClose={onClose} />
            </MuxVideoUploadProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getAllByRole('button')[0]).toContainElement(
        screen.getByTestId('X2Icon')
      )
      fireEvent.click(screen.getAllByRole('button')[0])
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('should set initial tab to upload tab during an upload', () => {
    const videoBlockId = 'videoBlock-1'
    mockGetUploadStatus.mockImplementation((id: string) =>
      id === videoBlockId
        ? {
            videoBlockId,
            file: new File(['test'], 'test.mp4', { type: 'video/mp4' }),
            status: 'uploading',
            progress: 50
          }
        : null
    )

    render(
      <MockedProvider>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <VideoLibrary
              open
              selectedBlock={{
                id: videoBlockId,
                __typename: 'VideoBlock',
                parentBlockId: 'card1.id',
                videoId: 'existing-video-id',
                videoVariantLanguageId: null,
                source: VideoBlockSource.internal,
                parentOrder: 0,
                action: null,
                muted: false,
                autoplay: true,
                startAt: 0,
                endAt: null,
                fullsize: true,
                title: null,
                description: null,
                duration: null,
                image: null,
                subtitleLanguage: null,
                showGeneratedSubtitles: null,
                mediaVideo: null,
                objectFit: null,
                posterBlockId: null,
                eventLabel: null,
                endEventLabel: null,
                customizable: null,
                notes: null,
                children: []
              }}
            />
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('tab', { name: 'Upload' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.queryByText('Video Details')).not.toBeInTheDocument()
  })

  it('should not open video details tab if there is a pending upload even if the videoId is not null', () => {
    const videoBlockId = 'videoBlock-1'
    mockGetUploadStatus.mockImplementation((id: string) =>
      id === videoBlockId
        ? {
            videoBlockId,
            file: new File(['test'], 'test.mp4', { type: 'video/mp4' }),
            status: 'uploading',
            progress: 50
          }
        : null
    )

    render(
      <MockedProvider>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <VideoLibrary
              open
              selectedBlock={{
                id: videoBlockId,
                __typename: 'VideoBlock',
                parentBlockId: 'card1.id',
                videoId: 'existing-video-id',
                videoVariantLanguageId: null,
                source: VideoBlockSource.internal,
                parentOrder: 0,
                action: null,
                muted: false,
                autoplay: true,
                startAt: 0,
                endAt: null,
                fullsize: true,
                title: null,
                description: null,
                duration: null,
                image: null,
                subtitleLanguage: null,
                showGeneratedSubtitles: null,
                mediaVideo: null,
                objectFit: null,
                posterBlockId: null,
                eventLabel: null,
                endEventLabel: null,
                customizable: null,
                notes: null,
                children: []
              }}
            />
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.queryByText('Video Details')).not.toBeInTheDocument()
  })

  describe('xsDown', () => {
    beforeEach(() => (useMediaQuery as Mock).mockImplementation(() => false))

    it('should render the VideoLibrary from the bottom', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <MuxVideoUploadProvider>
              <VideoLibrary open />
            </MuxVideoUploadProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getByText('Video Library')).toBeInTheDocument()
      expect(
        screen.getByTestId('VideoLibrary').parentElement?.parentElement
      ).toHaveClass('MuiDrawer-paperAnchorBottom')
    })
  })

  describe('VideoSearch', () => {
    beforeEach(() => (useMediaQuery as Mock).mockImplementation(() => true))

    it('displays searched video', async () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <MuxVideoUploadProvider>
              <VideoLibrary open />
            </MuxVideoUploadProvider>
          </SnackbarProvider>
        </MockedProvider>
      )
      const searchBox = screen.getByRole('searchbox')
      fireEvent.change(searchBox, {
        target: { value: 'Andreas' }
      })
      await waitFor(() =>
        expect(screen.getByText('title1')).toBeInTheDocument()
      )
    })
  })

  it('when video selected calls onSelect', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()
    const mocks = [
      {
        request: {
          query: GET_VIDEO,
          variables: { id: 'videoId', languageId: '529' }
        },
        result: {
          data: {
            video: {
              id: 'videoId',
              primaryLanguageId: '529',
              images: [],
              title: [
                { primary: true, value: 'title1', __typename: 'Language' }
              ],
              description: [
                { primary: true, value: 'desc', __typename: 'Language' }
              ],
              variant: {
                id: 'v1',
                duration: 0,
                hls: 'https://example.com/video.m3u8',
                __typename: 'VideoVariant'
              },
              variantLanguages: [
                {
                  __typename: 'Language',
                  id: '529',
                  slug: 'english',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'LanguageName'
                    }
                  ]
                }
              ],
              __typename: 'Video'
            }
          }
        }
      }
    ]
    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              selectedBlock: {
                id: 'video1.id',
                __typename: 'VideoBlock',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                triggerStart: 0,
                triggerAction: 'play',
                notes: null
              } as unknown as TreeBlock<VideoBlock>
            }}
          >
            <MuxVideoUploadProvider>
              <VideoLibrary open onSelect={onSelect} onClose={onClose} />
            </MuxVideoUploadProvider>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(screen.getByText('title1')).toBeInTheDocument())
    await waitFor(() =>
      fireEvent.click(screen.getByTestId('VideoListItem-videoId'))
    )
    // wait for Select button to be enabled after data load
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith(
      {
        duration: 0,
        endAt: 0,
        startAt: 0,
        source: VideoBlockSource.internal,
        videoId: 'videoId',
        videoVariantLanguageId: '529'
      },
      // shouldFocus is false: the block is already in view, so selecting must
      // not slide the canvas back. The outer drawer still closes via onClose.
      false
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('should render video details if videoId is not null', async () => {
    mswServer.use(getPlaylistItemsEmpty, getVideosWithOffsetAndUrl)
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <MockedProvider>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <SWRConfig value={{ provider: () => new Map() }}>
              <VideoLibrary
                open
                selectedBlock={{
                  id: 'video1.id',
                  __typename: 'VideoBlock',
                  parentBlockId: 'card1.id',
                  description:
                    'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
                  duration: 348,
                  endAt: 348,
                  fullsize: true,
                  image: 'https://i.ytimg.com/vi/ak06MSETeo4/default.jpg',
                  muted: false,
                  autoplay: true,
                  startAt: 0,
                  title: 'What is the Bible?',
                  videoId: 'ak06MSETeo4',
                  videoVariantLanguageId: null,
                  parentOrder: 0,
                  action: null,
                  source: VideoBlockSource.youTube,
                  mediaVideo: {
                    __typename: 'YouTube',
                    id: 'videoId'
                  },
                  objectFit: null,
                  subtitleLanguage: null,
                  showGeneratedSubtitles: null,
                  posterBlockId: 'poster1.id',
                  eventLabel: null,
                  endEventLabel: null,
                  customizable: null,
                  notes: null,
                  children: []
                }}
                onSelect={onSelect}
                onClose={onClose}
              />
            </SWRConfig>
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('Video Details')).toBeVisible())
  })

  it('should render YouTube', async () => {
    mswServer.use(getPlaylistItemsEmpty)

    mockRouter()

    render(
      <MockedProvider>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <SWRConfig value={{ provider: () => new Map() }}>
              <VideoLibrary open />
            </SWRConfig>
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('tab', { name: 'YouTube' }))
    await waitFor(() =>
      expect(screen.getByText('Paste any YouTube Link')).toBeInTheDocument()
    )
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-youtube' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should update url params on library tab click', async () => {
    mockRouter()

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <VideoLibrary open />
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('tab', { name: 'Upload' }))
    fireEvent.click(getByRole('tab', { name: 'Library' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-library' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should render Upload tab with VideoFromMux', async () => {
    mockRouter()

    render(
      <MockedProvider>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <VideoLibrary open />
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-upload' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should cancel video upload when changing to different video source', async () => {
    const onSelect = vi.fn()
    const selectedBlock: TreeBlock<VideoBlock> = {
      id: 'video1.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      startAt: 0,
      endAt: null,
      muted: false,
      autoplay: true,
      fullsize: true,
      action: null,
      videoId: null,
      videoVariantLanguageId: null,
      source: VideoBlockSource.mux,
      title: null,
      description: null,
      duration: null,
      image: null,
      objectFit: null,
      subtitleLanguage: null,
      showGeneratedSubtitles: null,
      mediaVideo: null,
      posterBlockId: null,
      eventLabel: null,
      endEventLabel: null,
      customizable: null,
      notes: null,
      children: []
    }

    const mocks = [
      {
        request: {
          query: GET_VIDEO,
          variables: { id: 'videoId', languageId: '529' }
        },
        result: {
          data: {
            video: {
              id: 'videoId',
              primaryLanguageId: '529',
              images: [],
              title: [
                { primary: true, value: 'title1', __typename: 'Language' }
              ],
              description: [
                { primary: true, value: 'desc', __typename: 'Language' }
              ],
              variant: {
                id: 'v1',
                duration: 144,
                hls: 'https://example.com/video.m3u8',
                __typename: 'VideoVariant'
              },
              variantLanguages: [
                {
                  __typename: 'Language',
                  id: '529',
                  slug: 'english',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'LanguageName'
                    }
                  ]
                }
              ],
              __typename: 'Video'
            }
          }
        }
      }
    ]

    mockRouter()

    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              selectedBlock,
              selectedAttributeId: selectedBlock.id
            }}
          >
            <MuxVideoUploadProvider>
              <VideoLibrary open onSelect={onSelect} />
            </MuxVideoUploadProvider>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('title1')).toBeInTheDocument())
    await waitFor(() =>
      fireEvent.click(screen.getByTestId('VideoListItem-videoId'))
    )
    // wait for Select button to be enabled after data load
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select' }))

    await waitFor(() => {
      expect(mockCancelUploadForBlock).toHaveBeenCalledWith(selectedBlock)
    })
  })

  it('should show a cancellation snackbar when an active upload is interrupted by a new selection', async () => {
    const onSelect = vi.fn()
    const selectedBlock: TreeBlock<VideoBlock> = {
      id: 'video1.id',
      __typename: 'VideoBlock',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      startAt: 0,
      endAt: null,
      muted: false,
      autoplay: true,
      fullsize: true,
      action: null,
      videoId: null,
      videoVariantLanguageId: null,
      source: VideoBlockSource.mux,
      title: null,
      description: null,
      duration: null,
      image: null,
      objectFit: null,
      subtitleLanguage: null,
      showGeneratedSubtitles: null,
      mediaVideo: null,
      posterBlockId: null,
      eventLabel: null,
      endEventLabel: null,
      customizable: null,
      notes: null,
      children: []
    }

    mockGetUploadStatus.mockImplementation((id: string) =>
      id === selectedBlock.id
        ? {
            videoBlockId: selectedBlock.id,
            file: new File(['test'], 'test.mp4', { type: 'video/mp4' }),
            status: 'uploading',
            progress: 25
          }
        : null
    )

    const mocks = [
      {
        request: {
          query: GET_VIDEO,
          variables: { id: 'videoId', languageId: '529' }
        },
        result: {
          data: {
            video: {
              id: 'videoId',
              primaryLanguageId: '529',
              images: [],
              title: [
                { primary: true, value: 'title1', __typename: 'Language' }
              ],
              description: [
                { primary: true, value: 'desc', __typename: 'Language' }
              ],
              variant: {
                id: 'v1',
                duration: 144,
                hls: 'https://example.com/video.m3u8',
                __typename: 'VideoVariant'
              },
              variantLanguages: [
                {
                  __typename: 'Language',
                  id: '529',
                  slug: 'english',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'LanguageName'
                    }
                  ]
                }
              ],
              __typename: 'Video'
            }
          }
        }
      }
    ]

    mockRouter()

    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <EditorProvider
            initialState={{
              selectedBlock,
              selectedAttributeId: selectedBlock.id
            }}
          >
            <MuxVideoUploadProvider>
              <VideoLibrary open onSelect={onSelect} />
            </MuxVideoUploadProvider>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('title1')).toBeInTheDocument())
    await waitFor(() =>
      fireEvent.click(screen.getByTestId('VideoListItem-videoId'))
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Select' })).toBeEnabled()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Select' }))

    await waitFor(() => {
      expect(screen.getByText('Video upload cancelled')).toBeInTheDocument()
    })
    expect(mockCancelUploadForBlock).toHaveBeenCalledWith(selectedBlock)
    mockGetUploadStatus.mockReset()
  })

  it('should navigate to YouTube tab when clicking Change Video on a YouTube video', async () => {
    mswServer.use(getPlaylistItemsEmpty, getVideosWithOffsetAndUrl)
    const onSelect = vi.fn()
    const onClose = vi.fn()

    mockRouter()

    render(
      <MockedProvider>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <SWRConfig value={{ provider: () => new Map() }}>
              <VideoLibrary
                open
                selectedBlock={{
                  id: 'video1.id',
                  __typename: 'VideoBlock',
                  parentBlockId: 'card1.id',
                  description:
                    'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
                  duration: 348,
                  endAt: 348,
                  fullsize: true,
                  image: 'https://i.ytimg.com/vi/ak06MSETeo4/default.jpg',
                  muted: false,
                  autoplay: true,
                  startAt: 0,
                  title: 'What is the Bible?',
                  videoId: 'ak06MSETeo4',
                  videoVariantLanguageId: null,
                  parentOrder: 0,
                  action: null,
                  source: VideoBlockSource.youTube,
                  mediaVideo: {
                    __typename: 'YouTube',
                    id: 'videoId'
                  },
                  objectFit: null,
                  subtitleLanguage: null,
                  showGeneratedSubtitles: null,
                  posterBlockId: 'poster1.id',
                  eventLabel: null,
                  endEventLabel: null,
                  customizable: null,
                  notes: null,
                  children: []
                }}
                onSelect={onSelect}
                onClose={onClose}
              />
            </SWRConfig>
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('Video Details')).toBeVisible())

    fireEvent.click(screen.getByRole('button', { name: 'Change Video' }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'YouTube' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-youtube' }
        },
        undefined,
        { shallow: true }
      )
    })
  })

  it('should navigate to Library tab when clicking Change Video on an internal video', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()
    const mocks = [
      {
        request: {
          query: GET_VIDEO,
          variables: { id: 'videoId', languageId: '529' }
        },
        result: {
          data: {
            video: {
              id: 'videoId',
              primaryLanguageId: '529',
              images: [],
              title: [
                { primary: true, value: 'title1', __typename: 'Language' }
              ],
              description: [
                { primary: true, value: 'desc', __typename: 'Language' }
              ],
              variant: {
                id: 'v1',
                duration: 144,
                hls: 'https://example.com/video.m3u8',
                __typename: 'VideoVariant'
              },
              variantLanguages: [
                {
                  __typename: 'Language',
                  id: '529',
                  slug: 'english',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'LanguageName'
                    }
                  ]
                }
              ],
              __typename: 'Video'
            }
          }
        }
      }
    ]

    mockRouter()

    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <VideoLibrary
              open
              selectedBlock={{
                id: 'video1.id',
                __typename: 'VideoBlock',
                parentBlockId: 'card1.id',
                videoId: 'videoId',
                videoVariantLanguageId: '529',
                parentOrder: 0,
                action: null,
                muted: false,
                autoplay: true,
                startAt: 0,
                endAt: 144,
                fullsize: true,
                title: null,
                description: null,
                duration: 144,
                image: null,
                subtitleLanguage: null,
                showGeneratedSubtitles: null,
                mediaVideo: null,
                objectFit: null,
                posterBlockId: null,
                eventLabel: null,
                endEventLabel: null,
                customizable: null,
                notes: null,
                children: [],
                source: VideoBlockSource.internal
              }}
              onSelect={onSelect}
              onClose={onClose}
            />
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('Video Details')).toBeVisible())

    fireEvent.click(screen.getByRole('button', { name: 'Change Video' }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Library' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-library' }
        },
        undefined,
        { shallow: true }
      )
    })
    // Change Video must keep the outer Video Library drawer open
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should navigate to Upload tab when clicking Change Video on a mux video', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    mockRouter()

    render(
      <MockedProvider>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <VideoLibrary
              open
              selectedBlock={{
                id: 'video1.id',
                __typename: 'VideoBlock',
                parentBlockId: 'card1.id',
                videoId: 'mux-video-id',
                videoVariantLanguageId: null,
                parentOrder: 0,
                action: null,
                muted: false,
                autoplay: true,
                startAt: 0,
                endAt: null,
                fullsize: true,
                title: null,
                description: null,
                duration: null,
                image: null,
                subtitleLanguage: null,
                showGeneratedSubtitles: null,
                mediaVideo: null,
                objectFit: null,
                posterBlockId: null,
                eventLabel: null,
                endEventLabel: null,
                customizable: null,
                notes: null,
                children: [],
                source: VideoBlockSource.mux
              }}
              onSelect={onSelect}
              onClose={onClose}
            />
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('Video Details')).toBeVisible())

    fireEvent.click(screen.getByRole('button', { name: 'Change Video' }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Upload' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        {
          query: { param: 'video-upload' }
        },
        undefined,
        { shallow: true }
      )
    })
    // Change Video must keep the outer Video Library drawer open
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should close both drawers when Apply is clicked in the language picker for an existing internal video', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()
    const mocks = [
      {
        request: {
          query: GET_VIDEO,
          variables: { id: 'videoId', languageId: '529' }
        },
        result: {
          data: {
            video: {
              id: 'videoId',
              primaryLanguageId: '529',
              images: [],
              title: [
                { primary: true, value: 'title1', __typename: 'Language' }
              ],
              description: [
                { primary: true, value: 'desc', __typename: 'Language' }
              ],
              variant: {
                id: 'v1',
                duration: 144,
                hls: 'https://example.com/video.m3u8',
                __typename: 'VideoVariant'
              },
              variantLanguages: [
                {
                  __typename: 'Language',
                  id: '529',
                  slug: 'english',
                  name: [
                    {
                      value: 'English',
                      primary: true,
                      __typename: 'LanguageName'
                    }
                  ]
                }
              ],
              __typename: 'Video'
            }
          }
        }
      }
    ]

    mockRouter()

    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <VideoLibrary
              open
              selectedBlock={{
                id: 'video1.id',
                __typename: 'VideoBlock',
                parentBlockId: 'card1.id',
                videoId: 'videoId',
                videoVariantLanguageId: '529',
                parentOrder: 0,
                action: null,
                muted: false,
                autoplay: true,
                startAt: 0,
                endAt: 144,
                fullsize: true,
                title: null,
                description: null,
                duration: 144,
                image: null,
                subtitleLanguage: null,
                showGeneratedSubtitles: null,
                mediaVideo: null,
                objectFit: null,
                posterBlockId: null,
                eventLabel: null,
                endEventLabel: null,
                customizable: null,
                notes: null,
                children: [],
                source: VideoBlockSource.internal
              }}
              onSelect={onSelect}
              onClose={onClose}
            />
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('Video Details')).toBeVisible())
    // wait for variant data to load so the language chip is enabled
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'English' })).toBeEnabled()
    )
    // open the language picker
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    expect(screen.getByText('Available Languages')).toBeInTheDocument()
    // click Apply: commits language and closes both drawers
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onSelect).toHaveBeenCalledWith(
      {
        duration: 144,
        endAt: 144,
        startAt: 0,
        source: VideoBlockSource.internal,
        videoId: 'videoId',
        videoVariantLanguageId: '529'
      },
      // shouldFocus is false: the block is already in view, so selecting must
      // not slide the canvas back. The outer drawer still closes via onClose.
      false
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('should not close the outer drawer when onSelect is called with shouldCloseDrawer=false (background mux upload)', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    mockRouter()

    render(
      <MockedProvider>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <VideoLibrary open onSelect={onSelect} onClose={onClose} />
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }))
    await waitFor(() =>
      expect(
        screen.getByTestId('mock-mux-background-complete')
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByTestId('mock-mux-background-complete'))

    // Background completions pass shouldCloseDrawer=false: the parent
    // onSelect is invoked with shouldFocus=false and the outer Video
    // Library drawer must remain open.
    expect(onSelect).toHaveBeenCalledWith(
      { videoId: 'mux-bg-id', source: 'mux' },
      false
    )
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should not show a cancellation snackbar when an upload completes naturally (shouldCloseDrawer=false)', async () => {
    const onSelect = vi.fn()
    const editorBlock = {
      id: 'bg-card-id',
      __typename: 'CardBlock',
      parentBlockId: null,
      parentOrder: 0,
      children: []
    } as unknown as TreeBlock<VideoBlock>

    // Active upload exists for the block, but the completion path passes
    // shouldCloseDrawer=false — the snackbar must stay suppressed.
    mockGetUploadStatus.mockImplementation((id: string) =>
      id === editorBlock.id
        ? {
            videoBlockId: editorBlock.id,
            file: new File(['test'], 'test.mp4', { type: 'video/mp4' }),
            status: 'processing',
            progress: 100
          }
        : null
    )

    mockRouter()

    render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={{ selectedBlock: editorBlock }}>
            <MuxVideoUploadProvider>
              <VideoLibrary open onSelect={onSelect} />
            </MuxVideoUploadProvider>
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }))
    await waitFor(() =>
      expect(
        screen.getByTestId('mock-mux-background-complete')
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByTestId('mock-mux-background-complete'))

    expect(onSelect).toHaveBeenCalledWith(
      { videoId: 'mux-bg-id', source: 'mux' },
      false
    )
    expect(screen.queryByText('Video upload cancelled')).not.toBeInTheDocument()
    mockGetUploadStatus.mockReset()
  })
})
