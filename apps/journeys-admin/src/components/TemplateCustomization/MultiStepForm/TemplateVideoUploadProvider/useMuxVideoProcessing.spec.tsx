import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey as mockJourneyBase } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { VIDEO_BLOCK_UPDATE } from '../../../Editor/Slider/Settings/CanvasDetails/Properties/blocks/Video/Options/VideoOptions'

import { GET_MY_MUX_VIDEO_QUERY } from './graphql'
import { createInitialTask } from './types'
import { useMuxVideoProcessing } from './useMuxVideoProcessing'
import { useUploadTaskMap } from './useUploadTaskMap'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const mockJourney = { ...mockJourneyBase, id: 'journey-1' }

const getMyMuxVideoReadyMock: MockedResponse = {
  request: {
    query: GET_MY_MUX_VIDEO_QUERY,
    variables: { id: 'mux-video-id' }
  },
  result: {
    data: {
      getMyMuxVideo: {
        __typename: 'MuxVideo',
        id: 'mux-video-id',
        assetId: 'asset-id',
        playbackId: 'playback-id',
        readyToStream: true
      }
    }
  }
}

const getMyMuxVideoProcessingMock: MockedResponse = {
  request: {
    query: GET_MY_MUX_VIDEO_QUERY,
    variables: { id: 'mux-video-id' }
  },
  result: {
    data: {
      getMyMuxVideo: {
        __typename: 'MuxVideo',
        id: 'mux-video-id',
        assetId: 'asset-id',
        playbackId: 'playback-id',
        readyToStream: false
      }
    }
  }
}

const videoBlockUpdateMock: MockedResponse = {
  request: {
    query: VIDEO_BLOCK_UPDATE,
    variables: {
      id: 'video-block-1',
      input: {
        videoId: 'mux-video-id',
        source: 'mux'
      }
    }
  },
  result: {
    data: {
      videoBlockUpdate: {
        __typename: 'VideoBlock',
        id: 'video-block-1'
      }
    }
  }
}

function useMuxVideoProcessingWithTaskMap() {
  const taskMap = useUploadTaskMap()
  const processing = useMuxVideoProcessing({
    updateTask: taskMap.updateTask,
    removeTask: taskMap.removeTask,
    activeBlocksRef: taskMap.activeBlocksRef
  })
  return { ...taskMap, ...processing }
}

function createWrapper(mocks: MockedResponse[] = []): React.FC<{
  children: ReactNode
}> {
  const Wrapper = function Wrapper({
    children
  }: {
    children: ReactNode
  }): ReactElement {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        <SnackbarProvider>
          <JourneyProvider
            value={{ journey: mockJourney, variant: 'customize' }}
          >
            {children}
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
  }
  return Wrapper
}

describe('useMuxVideoProcessing', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('startPolling sets status to processing', async () => {
    const Wrapper = createWrapper([
      getMyMuxVideoReadyMock,
      videoBlockUpdateMock
    ])
    const { result } = renderHook(() => useMuxVideoProcessingWithTaskMap(), {
      wrapper: Wrapper
    })

    act(() => {
      result.current.setUploadTasks((prev) =>
        new Map(prev).set('video-block-1', createInitialTask('video-block-1'))
      )
    })

    act(() => {
      result.current.startPolling('video-block-1', 'mux-video-id')
    })

    expect(result.current.getUploadStatus('video-block-1')).toMatchObject({
      status: 'processing',
      videoId: 'mux-video-id'
    })
  })

  it('polls getMyMuxVideo and calls VIDEO_BLOCK_UPDATE when readyToStream', async () => {
    const Wrapper = createWrapper([
      getMyMuxVideoReadyMock,
      videoBlockUpdateMock
    ])
    const { result } = renderHook(() => useMuxVideoProcessingWithTaskMap(), {
      wrapper: Wrapper
    })

    act(() => {
      result.current.setUploadTasks((prev) =>
        new Map(prev).set('video-block-1', createInitialTask('video-block-1'))
      )
    })

    act(() => {
      result.current.startPolling('video-block-1', 'mux-video-id')
    })

    await act(async () => {
      await jest.runAllTimersAsync()
    })

    expect(result.current.getUploadStatus('video-block-1')).toBeNull()
  })

  it('retries on transient query errors up to MAX_RETRIES then marks error', async () => {
    const errorMock: MockedResponse = {
      request: {
        query: GET_MY_MUX_VIDEO_QUERY,
        variables: { id: 'mux-video-id' }
      },
      error: new Error('Network error')
    }

    const Wrapper = createWrapper([errorMock, errorMock, errorMock, errorMock])
    const { result } = renderHook(() => useMuxVideoProcessingWithTaskMap(), {
      wrapper: Wrapper
    })

    act(() => {
      result.current.setUploadTasks((prev) =>
        new Map(prev).set('video-block-1', createInitialTask('video-block-1'))
      )
    })

    act(() => {
      result.current.startPolling('video-block-1', 'mux-video-id')
    })

    await act(async () => {
      await jest.runAllTimersAsync()
    })

    const status = result.current.getUploadStatus('video-block-1')
    expect(status?.status).toBe('error')
    expect(status?.error).toBe('Failed to check video status')
  })

  it('clearPollingForBlock cancels pending timeout', async () => {
    const Wrapper = createWrapper([getMyMuxVideoProcessingMock])
    const { result } = renderHook(() => useMuxVideoProcessingWithTaskMap(), {
      wrapper: Wrapper
    })

    act(() => {
      result.current.setUploadTasks((prev) =>
        new Map(prev).set('video-block-1', createInitialTask('video-block-1'))
      )
    })

    act(() => {
      result.current.startPolling('video-block-1', 'mux-video-id')
    })

    act(() => {
      result.current.clearPollingForBlock('video-block-1')
    })

    expect(result.current.getUploadStatus('video-block-1')).toMatchObject({
      status: 'processing'
    })

    await act(async () => {
      await jest.advanceTimersByTimeAsync(100)
    })

    expect(result.current.getUploadStatus('video-block-1')).toMatchObject({
      status: 'processing'
    })
  })
})
