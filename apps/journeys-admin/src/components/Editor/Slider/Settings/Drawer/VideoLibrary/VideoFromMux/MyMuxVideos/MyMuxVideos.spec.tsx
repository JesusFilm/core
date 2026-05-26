import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { offsetLimitPagination } from '@apollo/client/utilities'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GetMyMuxVideos } from '../../../../../../../../../__generated__/GetMyMuxVideos'

import { GET_MY_MUX_VIDEOS, MyMuxVideos, PAGE_SIZE } from './MyMuxVideos'

const PEEK_LIMIT = PAGE_SIZE + 1

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
    <div
      data-testid="mock-video-details"
      data-id={id}
      data-playback-id={playbackId ?? ''}
    >
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
  variables: { offset: number; limit: number } = {
    offset: 0,
    limit: PEEK_LIMIT
  }
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

const notReadyVideo = (
  id: string
): GetMyMuxVideos['getMyMuxVideos'][number] => ({
  __typename: 'MuxVideo',
  id,
  playbackId: null,
  readyToStream: false
})

describe('MyMuxVideos', () => {
  it('should render only ready-to-stream videos with playbackId', async () => {
    render(
      <MockedProvider
        mocks={[
          buildMock([readyVideo('a'), notReadyVideo('b'), readyVideo('c')])
        ]}
      >
        <MyMuxVideos onSelect={jest.fn()} />
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
        <MyMuxVideos onSelect={jest.fn()} uploading />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-uploading')).toBeInTheDocument()
    })
  })

  it('should render nothing when no videos and not uploading', async () => {
    const { container } = render(
      <MockedProvider mocks={[buildMock([])]}>
        <MyMuxVideos onSelect={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.queryByTestId('MyMuxVideos')).not.toBeInTheDocument()
    })
    expect(container.querySelector('[data-testid="MyMuxVideos"]')).toBeNull()
  })

  it('should open the preview when a tile is clicked and apply the selection on confirm', async () => {
    const onSelect = jest.fn()
    render(
      <MockedProvider mocks={[buildMock([readyVideo('a')])]}>
        <MyMuxVideos onSelect={onSelect} />
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

  it('should render only PAGE_SIZE tiles when the server returns a full peek', async () => {
    const firstPage = Array.from({ length: PEEK_LIMIT }, (_, i) =>
      readyVideo(`v${i}`)
    )

    render(
      <MockedProvider cache={buildCache()} mocks={[buildMock(firstPage)]}>
        <MyMuxVideos onSelect={jest.fn()} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-v0')).toBeInTheDocument()
    })
    // peek item beyond PAGE_SIZE is not rendered
    expect(
      screen.queryByTestId(`my-mux-video-v${PAGE_SIZE}`)
    ).not.toBeInTheDocument()
  })

  it('should show Load More when results are full peek; clicking fetches next page', async () => {
    const firstPage = Array.from({ length: PEEK_LIMIT }, (_, i) =>
      readyVideo(`v${i}`)
    )
    const secondPage = [readyVideo(`v${PEEK_LIMIT}`)]

    render(
      <MockedProvider
        cache={buildCache()}
        mocks={[
          buildMock(firstPage, { offset: 0, limit: PEEK_LIMIT }),
          buildMock(secondPage, { offset: PAGE_SIZE, limit: PEEK_LIMIT })
        ]}
      >
        <MyMuxVideos onSelect={jest.fn()} />
      </MockedProvider>
    )

    const loadMore = await screen.findByRole('button', { name: 'Load More' })
    fireEvent.click(loadMore)

    await waitFor(() => {
      expect(
        screen.getByTestId(`my-mux-video-v${PEEK_LIMIT}`)
      ).toBeInTheDocument()
    })
  })

  it('should hide the Load More button when no more results', async () => {
    const firstPage = Array.from({ length: 3 }, (_, i) => readyVideo(`v${i}`))

    render(
      <MockedProvider cache={buildCache()} mocks={[buildMock(firstPage)]}>
        <MyMuxVideos onSelect={jest.fn()} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-v0')).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('button', { name: 'Load More' })
    ).not.toBeInTheDocument()
  })

  it('should highlight the selected video tile', async () => {
    render(
      <MockedProvider mocks={[buildMock([readyVideo('a'), readyVideo('b')])]}>
        <MyMuxVideos selectedVideoId="b" onSelect={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-b')).toBeInTheDocument()
    })
    expect(
      screen.getByTestId('my-mux-video-b').getAttribute('aria-pressed')
    ).toBe('true')
    expect(
      screen.getByTestId('my-mux-video-a').getAttribute('aria-pressed')
    ).toBe('false')
  })
})
