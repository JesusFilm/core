import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GET_ADMIN_VIDEOS_AND_COUNT, VideoList } from './VideoList'

const mockPush = vi.fn()
let mockPathname = '/videos'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams()
}))

const videos = [
  {
    id: 'video-1',
    label: 'episode',
    locked: false,
    published: true,
    title: [{ primary: true, value: 'Breaking Point: Invited' }],
    snippet: [{ primary: true, value: 'A snippet' }]
  },
  {
    id: 'video-2',
    label: 'episode',
    locked: true,
    published: false,
    title: [{ primary: true, value: 'Locked video' }],
    snippet: [{ primary: true, value: 'Another snippet' }]
  }
]

const mocks = [
  {
    request: {
      query: GET_ADMIN_VIDEOS_AND_COUNT,
      variables: {
        limit: 50,
        offset: 0,
        showTitle: true,
        showSnippet: true,
        where: {}
      }
    },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: {
      data: { adminVideos: videos, adminVideosCount: videos.length }
    },
    variableMatcher: () => true
  }
]

function renderVideoList() {
  return render(
    <MockedProvider mocks={mocks}>
      <VideoList />
    </MockedProvider>
  )
}

describe('VideoList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPathname = '/videos'
  })

  it('opens a video from the videos page', async () => {
    renderVideoList()

    fireEvent.click(await screen.findByText('Breaking Point: Invited'))

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/videos/video-1')
    )
  })

  it('opens a video from the library tab at its own route', async () => {
    // The list also renders under /videos/library; appending the id to the
    // current path sends the editor to a route that does not exist.
    mockPathname = '/videos/library'
    renderVideoList()

    fireEvent.click(await screen.findByText('Breaking Point: Invited'))

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/videos/video-1')
    )
  })

  it('does not open a locked video', async () => {
    renderVideoList()

    fireEvent.click(await screen.findByText('Locked video'))

    await waitFor(() => expect(mockPush).not.toHaveBeenCalled())
  })
})
