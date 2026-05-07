import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { offsetLimitPagination } from '@apollo/client/utilities'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GetMyMuxVideos } from '../../../../../../../../../__generated__/GetMyMuxVideos'

import { GET_MY_MUX_VIDEOS, MyMuxVideosGrid } from './MyMuxVideosGrid'

jest.mock('../../VideoDetails', () => ({
  __esModule: true,
  VideoDetails: ({
    id,
    playbackId,
    onSelect
  }: {
    id: string
    playbackId?: string | null
    onSelect: (block: { videoId: string }) => void
  }) => (
    <div data-testid="mock-video-details" data-id={id} data-playback-id={playbackId ?? ''}>
      <button
        data-testid="mock-video-details-select"
        onClick={() => onSelect({ videoId: id })}
      >
        Select
      </button>
    </div>
  )
}))

const buildMock = (
  videos: GetMyMuxVideos['getMyMuxVideos'],
  variables: { offset: number; limit: number } = { offset: 0, limit: 9 }
): MockedResponse<GetMyMuxVideos> => ({
  request: { query: GET_MY_MUX_VIDEOS, variables },
  result: { data: { getMyMuxVideos: videos } }
})

const readyVideo = (id: string): GetMyMuxVideos['getMyMuxVideos'][number] => ({
  __typename: 'MuxVideo',
  id,
  playbackId: `${id}-playback`,
  readyToStream: true
})

const notReadyVideo = (id: string): GetMyMuxVideos['getMyMuxVideos'][number] => ({
  __typename: 'MuxVideo',
  id,
  playbackId: null,
  readyToStream: false
})

describe('MyMuxVideosGrid', () => {
  it('should render only ready-to-stream videos with playbackId', async () => {
    render(
      <MockedProvider
        mocks={[buildMock([readyVideo('a'), notReadyVideo('b'), readyVideo('c')])]}
      >
        <MyMuxVideosGrid onSelect={jest.fn()} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-a')).toBeInTheDocument()
    })
    expect(screen.getByTestId('my-mux-video-c')).toBeInTheDocument()
    expect(screen.queryByTestId('my-mux-video-b')).not.toBeInTheDocument()
  })

  it('should render uploading skeleton tile when uploading is true', async () => {
    render(
      <MockedProvider mocks={[buildMock([readyVideo('a')])]}>
        <MyMuxVideosGrid onSelect={jest.fn()} uploading />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-uploading')).toBeInTheDocument()
    })
  })

  it('should render nothing when no videos and not uploading', async () => {
    const { container } = render(
      <MockedProvider mocks={[buildMock([])]}>
        <MyMuxVideosGrid onSelect={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.queryByTestId('MyMuxVideosGrid')).not.toBeInTheDocument()
    })
    // sanity: container is empty (only React internals)
    expect(container.querySelector('[data-testid="MyMuxVideosGrid"]')).toBeNull()
  })

  it('should open the preview when a tile is clicked and apply the selection on confirm', async () => {
    const onSelect = jest.fn()
    render(
      <MockedProvider mocks={[buildMock([readyVideo('a')])]}>
        <MyMuxVideosGrid onSelect={onSelect} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-a')).toBeInTheDocument()
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Select uploaded video' })
    )
    const preview = await screen.findByTestId('mock-video-details')
    expect(preview.getAttribute('data-id')).toBe('a')
    expect(preview.getAttribute('data-playback-id')).toBe('a-playback')

    fireEvent.click(screen.getByTestId('mock-video-details-select'))
    expect(onSelect).toHaveBeenCalledWith({ videoId: 'a' }, true)
  })

  const buildCache = (): InMemoryCache =>
    new InMemoryCache({
      typePolicies: {
        Query: { fields: { getMyMuxVideos: offsetLimitPagination() } }
      }
    })

  it('should show Load More when results are full page; clicking fetches next page', async () => {
    const firstPage = Array.from({ length: 9 }, (_, i) => readyVideo(`v${i}`))
    const secondPage = [readyVideo('v9')]

    render(
      <MockedProvider
        cache={buildCache()}
        mocks={[
          buildMock(firstPage, { offset: 0, limit: 9 }),
          buildMock(secondPage, { offset: 9, limit: 9 })
        ]}
      >
        <MyMuxVideosGrid onSelect={jest.fn()} />
      </MockedProvider>
    )

    const loadMore = await screen.findByRole('button', { name: 'Load More' })
    fireEvent.click(loadMore)

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-v9')).toBeInTheDocument()
    })
  })

  it('should show "No more to load" disabled state once a partial page is returned', async () => {
    const firstPage = Array.from({ length: 9 }, (_, i) => readyVideo(`v${i}`))
    const secondPage = [readyVideo('v9')]

    render(
      <MockedProvider
        cache={buildCache()}
        mocks={[
          buildMock(firstPage, { offset: 0, limit: 9 }),
          buildMock(secondPage, { offset: 9, limit: 9 })
        ]}
      >
        <MyMuxVideosGrid onSelect={jest.fn()} />
      </MockedProvider>
    )

    const loadMore = await screen.findByRole('button', { name: 'Load More' })
    fireEvent.click(loadMore)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'No more to load' })
      ).toBeDisabled()
    })
  })

  it('should highlight the selected video tile', async () => {
    render(
      <MockedProvider mocks={[buildMock([readyVideo('a'), readyVideo('b')])]}>
        <MyMuxVideosGrid selectedVideoId="b" onSelect={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-b')).toBeInTheDocument()
    })
    // the selected tile gets a 2px outline; assert via inline style fragment
    const selected = screen.getByTestId('my-mux-video-b')
    expect(selected).toBeInTheDocument()
  })
})
