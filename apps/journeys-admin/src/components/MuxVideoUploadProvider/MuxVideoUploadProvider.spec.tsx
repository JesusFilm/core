import { UpChunk } from '@mux/upchunk'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, render, renderHook, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'
import { type Mock } from 'vitest'

import { prependMuxVideo } from '../../libs/apolloClient/prependMuxVideo'
import { useAuth } from '../../libs/auth'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'

import {
  CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
  GET_MY_MUX_VIDEO_QUERY,
  MuxVideoUploadProvider,
  useMuxVideoUpload
} from './MuxVideoUploadProvider'

vi.mock('@mux/upchunk', () => ({
  UpChunk: {
    createUpload: vi.fn()
  }
}))

vi.mock('../../libs/auth', () => ({
  useAuth: vi.fn()
}))

vi.mock('../../libs/apolloClient/prependMuxVideo', () => ({
  prependMuxVideo: vi.fn()
}))

const mockUseAuth = useAuth as Mock
const mockPrependMuxVideo = prependMuxVideo as Mock

const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <MockedProvider mocks={[]}>
    <ApolloLoadingProvider>
      <SnackbarProvider>
        <MuxVideoUploadProvider>{children}</MuxVideoUploadProvider>
      </SnackbarProvider>
    </ApolloLoadingProvider>
  </MockedProvider>
)

describe('MuxVideoUploadProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } })
  })

  it('should render children', () => {
    const { getByText } = render(
      <MockedProvider mocks={[]}>
        <ApolloLoadingProvider>
          <SnackbarProvider>
            <MuxVideoUploadProvider>
              <div>Test Content</div>
            </MuxVideoUploadProvider>
          </SnackbarProvider>
        </ApolloLoadingProvider>
      </MockedProvider>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('should provide context value', () => {
    const { result } = renderHook(() => useMuxVideoUpload(), {
      wrapper
    })

    expect(result.current).toHaveProperty('getUploadStatus')
    expect(result.current).toHaveProperty('addUploadTask')
    expect(result.current).toHaveProperty('cancelUploadForBlock')
  })

  it('should throw error when hook is used outside provider', () => {
    expect(() => {
      renderHook(() => useMuxVideoUpload())
    }).toThrow('useMuxVideoUpload must be used within a MuxVideoUploadProvider')
  })

  describe('getUploadStatus', () => {
    it('should return null when no upload task exists', () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      expect(result.current.getUploadStatus('block-1')).toBeNull()
    })

    it('should return upload task when it exists', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      await act(async () => {
        result.current.addUploadTask('block-1', file)
      })

      const uploadStatus = result.current.getUploadStatus('block-1')
      expect(uploadStatus).not.toBeNull()
      expect(uploadStatus?.videoBlockId).toBe('block-1')
      // Status may be 'waiting' or 'uploading' depending on processing
      expect(['waiting', 'uploading']).toContain(uploadStatus?.status)
    })
  })

  describe('addUploadTask', () => {
    it('should add upload task to queue', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
      const onComplete = vi.fn()

      await act(async () => {
        result.current.addUploadTask(
          'block-1',
          file,
          'en',
          'English',
          onComplete
        )
      })

      const uploadStatus = result.current.getUploadStatus('block-1')
      expect(uploadStatus).not.toBeNull()
      expect(uploadStatus?.videoBlockId).toBe('block-1')
      expect(uploadStatus?.file).toBe(file)
      expect(uploadStatus?.languageCode).toBe('en')
      expect(uploadStatus?.languageName).toBe('English')
      // Status may be 'waiting' or 'uploading' depending on processing
      expect(['waiting', 'uploading']).toContain(uploadStatus?.status)
      expect(uploadStatus?.onComplete).toBe(onComplete)
    })

    it('should handle undefined language code and name', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      await act(async () => {
        result.current.addUploadTask('block-1', file)
      })

      const uploadStatus = result.current.getUploadStatus('block-1')
      expect(uploadStatus?.languageCode).toBeUndefined()
      expect(uploadStatus?.languageName).toBeUndefined()
    })
  })

  describe('upload task processing', () => {
    it('should add upload to queue with waiting status', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      await act(async () => {
        result.current.addUploadTask('block-1', file)
      })

      const uploadStatus = result.current.getUploadStatus('block-1')
      expect(uploadStatus).not.toBeNull()
      // Status may be 'waiting' or 'uploading' depending on processing
      expect(['waiting', 'uploading']).toContain(uploadStatus?.status)
    })
  })

  describe('handlePollingComplete user guard', () => {
    const VIDEO_ID = 'mux-video-1'
    const PLAYBACK_ID = 'playback-1'

    // Captures the UpChunk 'success' handler so the test can drive the upload
    // through to the processing/polling stage synchronously.
    function setupUpChunk(): { fireSuccess: () => void } {
      const handlers = new Map<string, () => void>()
      const mockUpload = {
        on: vi.fn((event: string, cb: () => void) => {
          handlers.set(event, cb)
        }),
        abort: vi.fn()
      }
      ;(UpChunk.createUpload as Mock).mockReturnValue(mockUpload)
      return {
        fireSuccess: () => handlers.get('success')?.()
      }
    }

    const mocks: MockedResponse[] = [
      {
        request: {
          query: CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION
        },
        variableMatcher: () => true,
        result: {
          data: {
            createMuxVideoUploadByFile: {
              __typename: 'MuxVideoUpload',
              uploadUrl: 'https://upload.url',
              id: VIDEO_ID
            }
          }
        }
      },
      {
        request: {
          query: GET_MY_MUX_VIDEO_QUERY,
          variables: { id: VIDEO_ID }
        },
        result: {
          data: {
            getMyMuxVideo: {
              __typename: 'MuxVideo',
              id: VIDEO_ID,
              assetId: 'asset-1',
              playbackId: PLAYBACK_ID,
              readyToStream: true
            }
          }
        }
      }
    ]

    it('should not prepend to the cache but still complete the upload when there is no authenticated user', async () => {
      mockUseAuth.mockReturnValue({ user: null })
      const { fireSuccess } = setupUpChunk()
      const onComplete = vi.fn()

      const guardWrapper = ({
        children
      }: {
        children: ReactNode
      }): ReactElement => (
        <MockedProvider mocks={mocks} addTypename={false}>
          <SnackbarProvider>
            <MuxVideoUploadProvider>{children}</MuxVideoUploadProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper: guardWrapper
      })

      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      await act(async () => {
        result.current.addUploadTask(
          'block-1',
          file,
          undefined,
          undefined,
          onComplete
        )
      })

      // Let processUpload run the create mutation and register UpChunk handlers.
      await waitFor(() => {
        expect(UpChunk.createUpload).toHaveBeenCalled()
      })

      // Drive the upload to 'processing', which starts polling. The poll query
      // resolves ready, firing handlePollingComplete.
      await act(async () => {
        fireSuccess()
      })

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(VIDEO_ID)
      })

      // The user-null guard means the optimistic cache prepend is skipped.
      expect(mockPrependMuxVideo).not.toHaveBeenCalled()
    })
  })
})
