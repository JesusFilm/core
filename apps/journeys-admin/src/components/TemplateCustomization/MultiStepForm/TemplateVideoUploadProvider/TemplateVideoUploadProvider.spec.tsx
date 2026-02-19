import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { UpChunk } from '@mux/upchunk'
import { act, render, renderHook } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey as mockJourneyBase } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { VIDEO_BLOCK_UPDATE } from '../../../Editor/Slider/Settings/CanvasDetails/Properties/blocks/Video/Options/VideoOptions'

import {
  CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
  GET_MY_MUX_VIDEO_QUERY,
  TemplateVideoUploadProvider,
  useTemplateVideoUpload
} from './TemplateVideoUploadProvider'

jest.mock('@mux/upchunk', () => ({
  UpChunk: {
    createUpload: jest.fn()
  }
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const mockJourney = { ...mockJourneyBase, id: 'journey-1' }

const createMuxVideoUploadByFileMock: MockedResponse = {
  request: {
    query: CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
    variables: { name: 'video.mp4' }
  },
  result: {
    data: {
      createMuxVideoUploadByFile: {
        __typename: 'MuxVideo',
        uploadUrl: 'https://mux.com/upload',
        id: 'mux-video-id'
      }
    }
  }
}

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
          <JourneyProvider value={{ journey: mockJourney, variant: 'customize' }}>
            <TemplateVideoUploadProvider>{children}</TemplateVideoUploadProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
  }
  return Wrapper
}

describe('TemplateVideoUploadProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children', () => {
    const Wrapper = createWrapper([])
    const { getByText } = render(
      <Wrapper>
        <div>Test Content</div>
      </Wrapper>
    )
    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('provides context value with startUpload, getUploadStatus, hasActiveUploads', () => {
    const Wrapper = createWrapper()
    const { result } = renderHook(() => useTemplateVideoUpload(), {
      wrapper: Wrapper
    })

    expect(result.current).toHaveProperty('startUpload')
    expect(result.current).toHaveProperty('getUploadStatus')
    expect(result.current).toHaveProperty('hasActiveUploads')
    expect(typeof result.current.startUpload).toBe('function')
    expect(typeof result.current.getUploadStatus).toBe('function')
    expect(typeof result.current.hasActiveUploads).toBe('boolean')
  })

  it('throws when useTemplateVideoUpload is used outside provider', () => {
    expect(() => {
      renderHook(() => useTemplateVideoUpload())
    }).toThrow(
      'useTemplateVideoUpload must be used within a TemplateVideoUploadProvider'
    )
  })

  describe('getUploadStatus', () => {
    it('returns null when no upload task exists', () => {
      const Wrapper = createWrapper([])
      const { result } = renderHook(() => useTemplateVideoUpload(), {
        wrapper: Wrapper
      })

      expect(result.current.getUploadStatus('video-block-1')).toBeNull()
    })
  })

  describe('hasActiveUploads', () => {
    it('returns false when no uploads', () => {
      const Wrapper = createWrapper([])
      const { result } = renderHook(() => useTemplateVideoUpload(), {
        wrapper: Wrapper
      })

      expect(result.current.hasActiveUploads).toBe(false)
    })
  })

  describe('startUpload', () => {
    it('adds upload task with uploading status and hasActiveUploads becomes true', async () => {
      const mockUpload = {
        on: jest.fn(),
        abort: jest.fn()
      }
      ;(UpChunk.createUpload as jest.Mock).mockReturnValue(mockUpload)

      const Wrapper = createWrapper([
        createMuxVideoUploadByFileMock,
        getMyMuxVideoReadyMock,
        videoBlockUpdateMock
      ])
      const { result } = renderHook(() => useTemplateVideoUpload(), {
        wrapper: Wrapper
      })

      const file = new File([''], 'video.mp4', { type: 'video/mp4' })

      await act(async () => {
        result.current.startUpload('video-block-1', file)
      })

      const status = result.current.getUploadStatus('video-block-1')
      expect(status).not.toBeNull()
      expect(status?.status).toBe('uploading')
      expect(status?.progress).toBe(0)
      expect(result.current.hasActiveUploads).toBe(true)
    })

    it('does not start duplicate upload for same videoBlockId when one is active', async () => {
      const mockUpload = {
        on: jest.fn(),
        abort: jest.fn()
      }
      ;(UpChunk.createUpload as jest.Mock).mockReturnValue(mockUpload)

      const Wrapper = createWrapper([
        createMuxVideoUploadByFileMock,
        getMyMuxVideoProcessingMock
      ])
      const { result } = renderHook(() => useTemplateVideoUpload(), {
        wrapper: Wrapper
      })

      const file = new File([''], 'video.mp4', { type: 'video/mp4' })

      await act(async () => {
        result.current.startUpload('video-block-1', file)
      })

      const createUploadCallCountBefore = (
        UpChunk.createUpload as jest.Mock
      ).mock.calls.length

      await act(async () => {
        result.current.startUpload('video-block-1', file)
      })

      const createUploadCallCountAfter = (
        UpChunk.createUpload as jest.Mock
      ).mock.calls.length

      expect(createUploadCallCountAfter).toBe(createUploadCallCountBefore)
    })

    it('allows concurrent uploads for different video blocks', async () => {
      const mockUpload1 = { on: jest.fn(), abort: jest.fn() }
      const mockUpload2 = { on: jest.fn(), abort: jest.fn() }
      ;(UpChunk.createUpload as jest.Mock)
        .mockReturnValueOnce(mockUpload1)
        .mockReturnValueOnce(mockUpload2)

      const createMuxMock2: MockedResponse = {
        ...createMuxVideoUploadByFileMock,
        request: {
          ...createMuxVideoUploadByFileMock.request,
          variables: { name: 'video2.mp4' }
        },
        result: {
          data: {
            createMuxVideoUploadByFile: {
              __typename: 'MuxVideo',
              uploadUrl: 'https://mux.com/upload2',
              id: 'mux-video-id-2'
            }
          }
        }
      }

      const Wrapper = createWrapper([
        createMuxVideoUploadByFileMock,
        createMuxMock2,
        getMyMuxVideoReadyMock,
        {
          ...getMyMuxVideoReadyMock,
          request: {
            query: GET_MY_MUX_VIDEO_QUERY,
            variables: { id: 'mux-video-id-2' }
          }
        },
        videoBlockUpdateMock,
        {
          ...videoBlockUpdateMock,
          request: {
            query: VIDEO_BLOCK_UPDATE,
            variables: {
              id: 'video-block-2',
              input: {
                videoId: 'mux-video-id-2',
                source: 'mux'
              }
            }
          }
        }
      ])
      const { result } = renderHook(() => useTemplateVideoUpload(), {
        wrapper: Wrapper
      })

      const file1 = new File([''], 'video.mp4', { type: 'video/mp4' })
      const file2 = new File([''], 'video2.mp4', { type: 'video/mp4' })

      await act(async () => {
        result.current.startUpload('video-block-1', file1)
      })
      await act(async () => {
        result.current.startUpload('video-block-2', file2)
      })

      expect(result.current.getUploadStatus('video-block-1')).not.toBeNull()
      expect(result.current.getUploadStatus('video-block-2')).not.toBeNull()
      expect(result.current.hasActiveUploads).toBe(true)
    })

    it('adds error task when file exceeds max size so label can display', async () => {
      const Wrapper = createWrapper([])
      const { result } = renderHook(() => useTemplateVideoUpload(), {
        wrapper: Wrapper
      })

      const largeFile = new File([''], 'large.mp4', { type: 'video/mp4' })
      Object.defineProperty(largeFile, 'size', {
        value: 2 * 1024 * 1024 * 1024,
        configurable: true
      })

      await act(async () => {
        result.current.startUpload('video-block-1', largeFile)
      })

      const status = result.current.getUploadStatus('video-block-1')
      expect(status).not.toBeNull()
      expect(status?.status).toBe('error')
      expect(status?.error).toBe('File is too large. Max size is 1GB.')
    })
  })
})
