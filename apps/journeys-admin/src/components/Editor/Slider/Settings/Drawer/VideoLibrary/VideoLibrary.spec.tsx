import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
import { MuxVideoUploadProvider } from '../../../../../MuxVideoUploadProvider/MuxVideoUploadProvider'
import { videoItems } from './data'
import { GET_VIDEO } from './VideoFromLocal/LocalDetails/LocalDetails'

import { VideoLibrary } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

jest.mock('video.js', () => {
  const mockPlayer = {
    dispose: jest.fn(),
    on: jest.fn(),
    poster: jest.fn(),
    src: jest.fn()
  }
  return jest.fn(() => mockPlayer)
})

jest.mock('../../../../../MuxVideoUploadProvider/MuxVideoUploadProvider', () => {
  const React = require('react')
  const mockContextValue = {
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
    getPollingStatus: jest.fn(),
    getUploadStatus: jest.fn(),
    addUploadToQueue: jest.fn()
  }
  return {
    __esModule: true,
    MuxVideoUploadProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useMuxVideoUpload: () => mockContextValue
  }
})

if (typeof global.clearImmediate !== 'function') {
  ;(
    global as typeof globalThis & { clearImmediate: (handle: unknown) => void }
  ).clearImmediate = (handle: unknown) => {
    clearTimeout(handle as NodeJS.Timeout)
  }
}

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

type VideoLibraryProps = Parameters<typeof VideoLibrary>[0]

function renderVideoLibraryComponent(
  props: Partial<VideoLibraryProps> = {},
  mocks: MockedResponse[] = []
) {
  return render(
    <MockedProvider mocks={mocks}>
      <SnackbarProvider maxSnack={1}>
        <MuxVideoUploadProvider>
          <VideoLibrary open {...props} />
        </MuxVideoUploadProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('VideoLibrary', () => {
  const push = jest.fn()
  const on = jest.fn()

  beforeEach(() => {
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

    jest.clearAllMocks()
  })

  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should render the Video Library on the right', () => {
      renderVideoLibraryComponent()
      expect(screen.getByText('Video Library')).toBeInTheDocument()
      expect(
        screen.getByTestId('VideoLibrary').parentElement?.parentElement
      ).toHaveClass('MuiDrawer-paperAnchorRight')
    })

    it('should close VideoLibrary on close Icon click', () => {
      const onClose = jest.fn()
      renderVideoLibraryComponent({ onClose })
      expect(screen.getAllByRole('button')[0]).toContainElement(
        screen.getByTestId('X2Icon')
      )
      fireEvent.click(screen.getAllByRole('button')[0])
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('xsDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render the VideoLibrary from the bottom', () => {
      renderVideoLibraryComponent()
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
      renderVideoLibraryComponent()
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
    renderVideoLibraryComponent()
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
    renderVideoLibraryComponent({ onSelect, onClose }, mocks)
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
    expect(onClose).toHaveBeenCalled()
  })

  it('should render video details if videoId is not null', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()

    renderVideoLibraryComponent({
      selectedBlock: {
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
      },
      onSelect,
      onClose
    })

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

    renderVideoLibraryComponent()
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

    const { getByRole } = renderVideoLibraryComponent()
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

    renderVideoLibraryComponent()

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

  it('should not show video details when on Upload tab', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()

    const { getByRole } = renderVideoLibraryComponent({
      selectedBlock: {
        id: 'video1.id',
        __typename: 'VideoBlock',
        parentBlockId: 'card1.id',
        description: 'description',
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
        posterBlockId: 'poster1.id',
        children: []
      },
      onSelect,
      onClose
    })

    // Click on Upload tab
    fireEvent.click(getByRole('tab', { name: 'Upload' }))

    // Video details should not be visible when on Upload tab
    await waitFor(() => {
      expect(screen.queryByText('Video Details')).not.toBeVisible()
    })
  })

  it('should call onSelect with shouldCloseDrawer=false when upload completes in background', () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()

    renderVideoLibraryComponent({ onSelect, onClose })

    // The onSelect callback should handle shouldCloseDrawer parameter
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('should switch to Library tab and close drawer after upload completes on Upload tab', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()

    const { getByRole } = renderVideoLibraryComponent({ onSelect, onClose })

    // Click on Upload tab
    fireEvent.click(getByRole('tab', { name: 'Upload' }))

    await waitFor(() => {
      expect(getByRole('tab', { name: 'Upload' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })
  })
})
