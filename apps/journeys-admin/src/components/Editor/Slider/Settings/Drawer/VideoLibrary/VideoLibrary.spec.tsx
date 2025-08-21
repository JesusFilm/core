import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { InfiniteHitsRenderState } from 'instantsearch.js/es/connectors/infinite-hits/connectInfiniteHits'
import { SearchBoxRenderState } from 'instantsearch.js/es/connectors/search-box/connectSearchBox'
import { NextRouter, useRouter } from 'next/router'
import {
  InstantSearchApi,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'

import { VideoBlockSource } from '../../../../../../../__generated__/globalTypes'

import { videoItems } from './data'

import { VideoLibrary } from '.'

// Avoid dynamic components invoking network work in tests
jest.mock('./VideoDetails', () => ({
  __esModule: true,
  VideoDetails: ({
    id,
    onSelect
  }: {
    id: string
    onSelect: (v: unknown) => void
  }) => (
    <button
      data-testid="VideoDetailsSelect"
      onClick={() =>
        onSelect({
          videoId: id,
          videoVariantLanguageId: '529',
          duration: 0,
          source: 'internal',
          startAt: 0,
          endAt: 0
        })
      }
    />
  )
}))
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
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
      render(
        <MockedProvider>
          <VideoLibrary open />
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
          <VideoLibrary open onClose={onClose} />
        </MockedProvider>
      )
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
      render(
        <MockedProvider>
          <VideoLibrary open />
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
          <VideoLibrary open />
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
        <VideoLibrary open />
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
    render(
      <MockedProvider>
        <VideoLibrary open onSelect={onSelect} onClose={onClose} />
      </MockedProvider>
    )
    await waitFor(() => expect(screen.getByText('title1')).toBeInTheDocument())
    await waitFor(() =>
      fireEvent.click(screen.getByTestId('VideoListItem-videoId'))
    )
    // Click mocked VideoDetails select button
    fireEvent.click(screen.getByTestId('VideoDetailsSelect'))
    expect(onSelect).toHaveBeenCalledWith({
      duration: 0,
      endAt: 0,
      startAt: 0,
      source: VideoBlockSource.internal,
      videoId: 'videoId',
      videoVariantLanguageId: '529'
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('should render video details if videoId is not null', async () => {
    const onSelect = jest.fn()
    const onClose = jest.fn()

    render(
      <MockedProvider>
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
            posterBlockId: 'poster1.id',
            children: []
          }}
          onSelect={onSelect}
          onClose={onClose}
        />
      </MockedProvider>
    )

    // Our mocked VideoDetails renders a select button as a proxy for being open
    await waitFor(() =>
      expect(screen.getByTestId('VideoDetailsSelect')).toBeInTheDocument()
    )
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
        <VideoLibrary open />
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
        <VideoLibrary open />
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
})
