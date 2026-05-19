import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey as mockJourneyBase } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import {
  IdType,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import { VIDEO_BLOCK_UPDATE } from '../../../Editor/Slider/Settings/CanvasDetails/Properties/blocks/Video/Options/VideoOptions'

import { useUploadTaskMap } from './useUploadTaskMap'
import { useYouTubeVideoLinking } from './useYouTubeVideoLinking'

jest.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const mockEnqueueSnackbar = jest.fn()
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

const mockJourney = { ...mockJourneyBase, id: 'journey-1' }

const videoBlockUpdateSuccessMock: MockedResponse = {
  request: {
    query: VIDEO_BLOCK_UPDATE,
    variables: {
      id: 'video-block-1',
      input: {
        videoId: 'yt-video-id',
        source: VideoBlockSource.youTube
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

const videoBlockUpdateErrorMock: MockedResponse = {
  request: {
    query: VIDEO_BLOCK_UPDATE,
    variables: {
      id: 'video-block-1',
      input: {
        videoId: 'yt-video-id',
        source: VideoBlockSource.youTube
      }
    }
  },
  error: new Error('Network error')
}

function useYouTubeLinkingWithTaskMap() {
  const taskMap = useUploadTaskMap()
  const linking = useYouTubeVideoLinking({
    setUploadTasks: taskMap.setUploadTasks,
    updateTask: taskMap.updateTask,
    removeTask: taskMap.removeTask,
    activeBlocksRef: taskMap.activeBlocksRef
  })
  return { ...taskMap, ...linking }
}

function createWrapper(
  mocks: MockedResponse[] = [],
  journey = mockJourney
): React.FC<{ children: ReactNode }> {
  const Wrapper = function Wrapper({
    children
  }: {
    children: ReactNode
  }): ReactElement {
    return (
      <MockedProvider mocks={mocks} addTypename={false}>
        <JourneyProvider value={{ journey, variant: 'customize' }}>
          {children}
        </JourneyProvider>
      </MockedProvider>
    )
  }
  return Wrapper
}

describe('useYouTubeVideoLinking', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets task to updating then removes on success', async () => {
    const Wrapper = createWrapper([videoBlockUpdateSuccessMock])
    const { result } = renderHook(() => useYouTubeLinkingWithTaskMap(), {
      wrapper: Wrapper
    })

    let returnValue: boolean | undefined
    await act(async () => {
      returnValue = await result.current.startYouTubeLink(
        'video-block-1',
        'yt-video-id'
      )
    })

    expect(returnValue).toBe(true)
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'YouTube video set successfully',
      { variant: 'success', autoHideDuration: 2000 }
    )
    expect(result.current.getUploadStatus('video-block-1')).toBeNull()
  })

  it('marks task as error and shows snackbar on mutation failure', async () => {
    const Wrapper = createWrapper([videoBlockUpdateErrorMock])
    const { result } = renderHook(() => useYouTubeLinkingWithTaskMap(), {
      wrapper: Wrapper
    })

    let returnValue: boolean | undefined
    await act(async () => {
      returnValue = await result.current.startYouTubeLink(
        'video-block-1',
        'yt-video-id'
      )
    })

    expect(returnValue).toBe(false)
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'Failed to set YouTube video. Please try again',
      { variant: 'error', autoHideDuration: 2000 }
    )
    const status = result.current.getUploadStatus('video-block-1')
    expect(status?.status).toBe('error')
    expect(status?.error).toBe('Failed to set YouTube video. Please try again')
  })

  it('returns false and skips mutation when block is already active', async () => {
    const Wrapper = createWrapper([videoBlockUpdateSuccessMock])
    const { result } = renderHook(() => useYouTubeLinkingWithTaskMap(), {
      wrapper: Wrapper
    })

    act(() => {
      result.current.activeBlocksRef.current.add('video-block-1')
    })

    let returnValue: boolean | undefined
    await act(async () => {
      returnValue = await result.current.startYouTubeLink(
        'video-block-1',
        'yt-video-id'
      )
    })

    expect(returnValue).toBe(false)
    expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
  })

  it('returns false when journey id is null', async () => {
    const Wrapper = createWrapper([videoBlockUpdateSuccessMock], {
      ...mockJourney,
      id: null
    } as unknown as typeof mockJourney)
    const { result } = renderHook(() => useYouTubeLinkingWithTaskMap(), {
      wrapper: Wrapper
    })

    let returnValue: boolean | undefined
    await act(async () => {
      returnValue = await result.current.startYouTubeLink(
        'video-block-1',
        'yt-video-id'
      )
    })

    expect(returnValue).toBe(false)
    expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
  })

  it('cleans up activeBlocksRef after success', async () => {
    const Wrapper = createWrapper([videoBlockUpdateSuccessMock])
    const { result } = renderHook(() => useYouTubeLinkingWithTaskMap(), {
      wrapper: Wrapper
    })

    await act(async () => {
      await result.current.startYouTubeLink('video-block-1', 'yt-video-id')
    })

    expect(result.current.activeBlocksRef.current.has('video-block-1')).toBe(
      false
    )
  })

  it('cleans up activeBlocksRef after failure', async () => {
    const Wrapper = createWrapper([videoBlockUpdateErrorMock])
    const { result } = renderHook(() => useYouTubeLinkingWithTaskMap(), {
      wrapper: Wrapper
    })

    await act(async () => {
      await result.current.startYouTubeLink('video-block-1', 'yt-video-id')
    })

    expect(result.current.activeBlocksRef.current.has('video-block-1')).toBe(
      false
    )
  })
})
