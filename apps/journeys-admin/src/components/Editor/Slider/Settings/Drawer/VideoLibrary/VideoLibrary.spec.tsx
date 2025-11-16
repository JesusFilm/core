import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
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

import { VideoBlockSource } from '../../../../../../../__generated__/globalTypes'
import { MuxVideoUploadProvider } from '../../../../../MuxVideoUploadProvider'

import { videoItems } from './data'
import { GET_VIDEO } from './VideoFromLocal/LocalDetails/LocalDetails'

import { VideoLibrary } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockGetUploadStatus = jest.fn()
jest.mock('../../../../../MuxVideoUploadProvider', () => ({
  ...jest.requireActual('../../../../../MuxVideoUploadProvider'),
  useMuxVideoUpload: jest.fn(() => ({
    getUploadStatus: mockGetUploadStatus,
    addUploadTask: jest.fn(),
    cancelUploadForBlock: jest.fn()
  }))
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

jest.mock('react-instantsearch')

const mockUseSearchBox = useSearchBox as jest.MockedFunction<
  typeof useSearchBox
>
const mockUseInstantSearch = useInstantSearch as jest.MockedFunction<
  typeof useInstantSearch
>
const mockUseInfiniteHits = useInfiniteHits as jest.MockedFunction<
  typeof useInfiniteHits
>

describe('VideoLibrary', () => {
  const push = jest.fn()
  const on = jest.fn()

  beforeAll(() => {
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'visible'
    })
    Object.defineProperty(document, 'clearImmediate', {
      writable: true,
      configurable: true,
      value: jest.fn()
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseSearchBox.mockReturnValue({
      refine: jest.fn()
    } as unknown as SearchBoxRenderState)

    mockUseInfiniteHits.mockReturnValue({
      items: videoItems,
      showMore: jest.fn(),
      isLastPage: false
    } as unknown as InfiniteHitsRenderState)

    mockUseInstantSearch.mockReturnValue({
      status: 'idle',
      results: {
        __isArtificial: false,
        nbHits: videoItems.length
      }
    } as unknown as InstantSearchApi)

    mockedUseRouter.mockReturnValue({
      query: { tab: 'active' },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
  })

  afterEach(async () => {
    cleanup()
    jest.clearAllTimers()
  })

  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

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
      const onClose = jest.fn()
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
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

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
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

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

  it('when video selected calls onSelect', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()
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
          <MuxVideoUploadProvider>
            <VideoLibrary open onSelect={onSelect} onClose={onClose} />
          </MuxVideoUploadProvider>
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
      true
    )
  })

  it('should render video details if videoId is not null', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()

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
                children: []
              }}
              onSelect={onSelect}
              onClose={onClose}
            />
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(screen.getByText('Video Details')).toBeVisible())
  })

  it('should render YouTube', async () => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <VideoLibrary open />
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
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

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
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

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
})
