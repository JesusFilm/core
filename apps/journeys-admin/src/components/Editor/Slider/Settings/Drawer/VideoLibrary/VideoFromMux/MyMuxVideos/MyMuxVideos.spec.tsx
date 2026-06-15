import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { offsetLimitPagination } from '@apollo/client/utilities'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { type MockedFunction } from 'vitest'

import { GetMyMuxVideos } from '../../../../../../../../../__generated__/GetMyMuxVideos'
import { AuthContext, User } from '../../../../../../../../libs/auth'

import { GET_MY_MUX_VIDEOS, MyMuxVideos, PAGE_SIZE } from './MyMuxVideos'

const PEEK_LIMIT = PAGE_SIZE + 1

vi.mock('@next/third-parties/google', () => ({
  sendGTMEvent: vi.fn()
}))

const mockSendGTMEvent = sendGTMEvent as MockedFunction<typeof sendGTMEvent>

vi.mock('../../VideoDetails', () => ({
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

const readyVideo = (
  id: string,
  duration: number | null = 9,
  userId = 'me'
): GetMyMuxVideos['getMyMuxVideos'][number] => ({
  __typename: 'MuxVideo',
  id,
  playbackId: `${id}-playback`,
  readyToStream: true,
  duration,
  userId
})

describe('MyMuxVideos', () => {
  beforeEach(() => {
    mockSendGTMEvent.mockClear()
  })

  it('should render uploading skeleton tile when uploading is true', async () => {
    render(
      <MockedProvider mocks={[buildMock([readyVideo('a')])]}>
        <MyMuxVideos onSelect={vi.fn()} uploading />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-uploading')).toBeInTheDocument()
    })
  })

  it('should render nothing when no videos and not uploading', async () => {
    const { container } = render(
      <MockedProvider mocks={[buildMock([])]}>
        <MyMuxVideos onSelect={vi.fn()} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.queryByTestId('MyMuxVideos')).not.toBeInTheDocument()
    })
    expect(container.querySelector('[data-testid="MyMuxVideos"]')).toBeNull()
  })

  it('should open the preview when a tile is clicked and apply the selection on confirm', async () => {
    const onSelect = vi.fn()
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
    expect(onSelect).toHaveBeenCalledWith(
      { videoId: 'a', duration: 9, endAt: 9 },
      true
    )
  })

  it('should send video_select event with mux videoSource on confirm', async () => {
    render(
      <MockedProvider mocks={[buildMock([readyVideo('a')])]}>
        <MyMuxVideos onSelect={vi.fn()} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-a')).toBeInTheDocument()
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Select uploaded video' })
    )
    await screen.findByTestId('mock-video-details')

    fireEvent.click(screen.getByTestId('mock-video-details-select'))
    expect(mockSendGTMEvent).toHaveBeenCalledWith({
      event: 'video_select',
      videoSource: 'mux'
    })
  })

  it('should not send video_select when only opening the preview', async () => {
    render(
      <MockedProvider mocks={[buildMock([readyVideo('a')])]}>
        <MyMuxVideos onSelect={vi.fn()} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-a')).toBeInTheDocument()
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Select uploaded video' })
    )
    await screen.findByTestId('mock-video-details')

    expect(mockSendGTMEvent).not.toHaveBeenCalled()
  })

  it('should not set endAt when the selected video has no duration', async () => {
    const onSelect = vi.fn()
    render(
      <MockedProvider mocks={[buildMock([readyVideo('a', null)])]}>
        <MyMuxVideos onSelect={onSelect} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-a')).toBeInTheDocument()
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Select uploaded video' })
    )
    await screen.findByTestId('mock-video-details')

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
        <MyMuxVideos onSelect={vi.fn()} />
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
        <MyMuxVideos onSelect={vi.fn()} />
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
        <MyMuxVideos onSelect={vi.fn()} />
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
        <MyMuxVideos selectedVideoId="b" onSelect={vi.fn()} />
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

  it('should show an error message when the query fails', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_MY_MUX_VIDEOS,
              variables: { offset: 0, limit: PEEK_LIMIT }
            },
            error: new Error('Network error')
          }
        ]}
      >
        <MyMuxVideos onSelect={vi.fn()} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText('Could not load your videos.')
      ).toBeInTheDocument()
    })
    expect(screen.getByTestId('MyMuxVideos')).toBeInTheDocument()
  })

  it('should pass teamId to the query when an active team is provided', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_MY_MUX_VIDEOS,
              variables: { offset: 0, limit: PEEK_LIMIT, teamId: 'team-1' }
            },
            result: { data: { getMyMuxVideos: [readyVideo('shared')] } }
          }
        ]}
      >
        <MyMuxVideos onSelect={vi.fn()} teamId="team-1" />
      </MockedProvider>
    )

    // The tile only renders if the mock keyed on teamId matched the request.
    await waitFor(() => {
      expect(screen.getByTestId('my-mux-video-shared')).toBeInTheDocument()
    })
  })

  it('should surface the generic error banner when the team query is rejected with FORBIDDEN', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_MY_MUX_VIDEOS,
              variables: { offset: 0, limit: PEEK_LIMIT, teamId: 'team-1' }
            },
            result: {
              errors: [
                new GraphQLError('Not a member of this team', {
                  extensions: { code: 'FORBIDDEN' }
                })
              ]
            }
          }
        ]}
      >
        <MyMuxVideos onSelect={vi.fn()} teamId="team-1" />
      </MockedProvider>
    )

    expect(
      await screen.findByText('Could not load your videos.')
    ).toBeInTheDocument()
  })

  it('should tag a teammate upload with a Team tag and leave the caller’s own untagged', async () => {
    const user = { id: 'me', uid: 'me' } as unknown as User
    render(
      <AuthContext.Provider value={{ user }}>
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_MY_MUX_VIDEOS,
                variables: { offset: 0, limit: PEEK_LIMIT, teamId: 'team-1' }
              },
              result: {
                data: {
                  getMyMuxVideos: [
                    readyVideo('mine', 9, 'me'),
                    readyVideo('theirs', 9, 'teammate')
                  ]
                }
              }
            }
          ]}
        >
          <MyMuxVideos onSelect={vi.fn()} teamId="team-1" />
        </MockedProvider>
      </AuthContext.Provider>
    )

    await screen.findByTestId('my-mux-video-mine')
    expect(
      screen.queryByTestId('my-mux-video-team-tag-mine')
    ).not.toBeInTheDocument()
    expect(
      screen.getByTestId('my-mux-video-team-tag-theirs')
    ).toBeInTheDocument()
  })

  it('should not advance pagination when Load More fails', async () => {
    const firstPage = Array.from({ length: PEEK_LIMIT }, (_, i) =>
      readyVideo(`v${i}`)
    )

    render(
      <MockedProvider
        cache={buildCache()}
        mocks={[
          buildMock(firstPage, { offset: 0, limit: PEEK_LIMIT }),
          {
            request: {
              query: GET_MY_MUX_VIDEOS,
              variables: { offset: PAGE_SIZE, limit: PEEK_LIMIT }
            },
            error: new Error('Network error')
          }
        ]}
      >
        <MyMuxVideos onSelect={vi.fn()} />
      </MockedProvider>
    )

    const loadMore = await screen.findByRole('button', { name: 'Load More' })
    fireEvent.click(loadMore)

    // fetchMore rejects: pagesFetched stays at 1, so the peek-beyond tile
    // (v{PAGE_SIZE}) never renders and Load More remains available.
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Load More' })
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByTestId(`my-mux-video-v${PAGE_SIZE}`)
    ).not.toBeInTheDocument()
  })
})
