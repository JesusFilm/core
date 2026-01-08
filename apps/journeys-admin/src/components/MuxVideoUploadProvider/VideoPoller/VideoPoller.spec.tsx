import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, render, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { GetMyMuxVideoQuery } from '../../../../__generated__/GetMyMuxVideoQuery'
import { GET_MY_MUX_VIDEO_QUERY } from '../MuxVideoUploadProvider'

import { VideoPoller } from './VideoPoller'

// Mock the constants to speed up tests
jest.mock('../utils/constants', () => ({
  POLL_INTERVAL: 100, // Fast polling for tests
  MAX_POLL_TIME: 500 // Short timeout for tests
}))

describe('VideoPoller', () => {
  const defaultProps = {
    videoId: 'video-123',
    startTime: Date.now(),
    onComplete: jest.fn(),
    onError: jest.fn(),
    onTimeout: jest.fn(),
    registerStopPolling: jest.fn(),
    unregisterStopPolling: jest.fn()
  }

  const createMock = (
    readyToStream: boolean,
    assetId: string | null = 'asset-123',
    playbackId: string | null = 'playback-123'
  ): MockedResponse<GetMyMuxVideoQuery> => ({
    request: {
      query: GET_MY_MUX_VIDEO_QUERY,
      variables: { id: 'video-123' }
    },
    result: {
      data: {
        getMyMuxVideo: {
          __typename: 'MuxVideo',
          id: 'video-123',
          assetId,
          playbackId,
          readyToStream
        }
      }
    }
  })

  const wrapper = (mocks: MockedResponse[]) => {
    return ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register stopPolling on mount', async () => {
    const registerStopPolling = jest.fn()
    const mocks = [createMock(false)]

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <VideoPoller
          {...defaultProps}
          registerStopPolling={registerStopPolling}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(registerStopPolling).toHaveBeenCalledWith(
        'video-123',
        expect.any(Function)
      )
    })
  })

  it('should call onComplete when video is ready', async () => {
    const onComplete = jest.fn()
    const unregisterStopPolling = jest.fn()
    const mocks = [createMock(true)]

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <VideoPoller
          {...defaultProps}
          onComplete={onComplete}
          unregisterStopPolling={unregisterStopPolling}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    expect(unregisterStopPolling).toHaveBeenCalledWith('video-123')
  })

  it('should call onError when query fails', async () => {
    const onError = jest.fn()
    const unregisterStopPolling = jest.fn()

    const errorMock: MockedResponse = {
      request: {
        query: GET_MY_MUX_VIDEO_QUERY,
        variables: { id: 'video-123' }
      },
      error: new Error('Network error')
    }

    render(
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        <VideoPoller
          {...defaultProps}
          onError={onError}
          unregisterStopPolling={unregisterStopPolling}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Network error')
    })

    expect(unregisterStopPolling).toHaveBeenCalledWith('video-123')
  })

  it('should call onTimeout when polling exceeds MAX_POLL_TIME', async () => {
    const onTimeout = jest.fn()
    const unregisterStopPolling = jest.fn()
    // Set startTime to past MAX_POLL_TIME
    const startTime = Date.now() - 600 // 600ms ago, MAX_POLL_TIME is 500ms in test

    const mocks = [createMock(false)]

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <VideoPoller
          {...defaultProps}
          startTime={startTime}
          onTimeout={onTimeout}
          unregisterStopPolling={unregisterStopPolling}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(onTimeout).toHaveBeenCalledTimes(1)
    })

    expect(unregisterStopPolling).toHaveBeenCalledWith('video-123')
  })

  it('should not call onComplete if video is not ready', async () => {
    const onComplete = jest.fn()
    // Video not ready - no assetId
    const mocks = [createMock(false, null, null)]

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <VideoPoller {...defaultProps} onComplete={onComplete} />
      </MockedProvider>
    )

    // Wait a bit and verify onComplete was not called
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
    })

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('should unregister stopPolling on unmount', async () => {
    const unregisterStopPolling = jest.fn()
    const mocks = [createMock(false)]

    const { unmount } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <VideoPoller
          {...defaultProps}
          unregisterStopPolling={unregisterStopPolling}
        />
      </MockedProvider>
    )

    // Wait for initial registration
    await waitFor(() => {
      expect(defaultProps.registerStopPolling).toHaveBeenCalled()
    })

    unmount()

    expect(unregisterStopPolling).toHaveBeenCalledWith('video-123')
  })

  it('should render null (invisible component)', () => {
    const mocks = [createMock(false)]

    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <VideoPoller {...defaultProps} />
      </MockedProvider>
    )

    expect(container.firstChild).toBeNull()
  })
})
