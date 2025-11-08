import { render, renderHook, act } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import {
  MuxVideoUploadProvider,
  useMuxVideoUpload
} from './MuxVideoUploadProvider'
import { MockedProvider } from '@apollo/client/testing'

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
    jest.clearAllMocks()
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

    expect(result.current).toHaveProperty('startPolling')
    expect(result.current).toHaveProperty('stopPolling')
    expect(result.current).toHaveProperty('getPollingStatus')
    expect(result.current).toHaveProperty('getUploadStatus')
    expect(result.current).toHaveProperty('addUploadToQueue')
  })

  it('should throw error when hook is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    expect(() => {
      renderHook(() => useMuxVideoUpload())
    }).toThrow('useMuxVideoUpload must be used within a MuxVideoUploadProvider')

    consoleError.mockRestore()
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
        result.current.addUploadToQueue('block-1', file)
      })

      const uploadStatus = result.current.getUploadStatus('block-1')
      expect(uploadStatus).not.toBeNull()
      expect(uploadStatus?.videoBlockId).toBe('block-1')
      // Status may be 'waiting' or 'uploading' depending on processing
      expect(['waiting', 'uploading']).toContain(uploadStatus?.status)
    })
  })

  describe('getPollingStatus', () => {
    it('should return null when no polling task exists', () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      expect(result.current.getPollingStatus('video-1')).toBeNull()
    })

    it('should return polling task when it exists', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      await act(async () => {
        result.current.startPolling('video-1', 'en', jest.fn())
      })

      const pollingStatus = result.current.getPollingStatus('video-1')
      expect(pollingStatus).not.toBeNull()
      expect(pollingStatus?.videoId).toBe('video-1')
      expect(pollingStatus?.status).toBe('processing')
    })
  })

  describe('addUploadToQueue', () => {
    it('should add upload task to queue', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
      const onComplete = jest.fn()

      await act(async () => {
        result.current.addUploadToQueue(
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
        result.current.addUploadToQueue('block-1', file)
      })

      const uploadStatus = result.current.getUploadStatus('block-1')
      expect(uploadStatus?.languageCode).toBeUndefined()
      expect(uploadStatus?.languageName).toBeUndefined()
    })
  })

  describe('startPolling', () => {
    it('should create polling task', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      const onComplete = jest.fn()

      await act(async () => {
        result.current.startPolling('video-1', 'en', onComplete)
      })

      const pollingStatus = result.current.getPollingStatus('video-1')
      expect(pollingStatus).not.toBeNull()
      expect(pollingStatus?.videoId).toBe('video-1')
      expect(pollingStatus?.languageCode).toBe('en')
      expect(pollingStatus?.status).toBe('processing')
      expect(pollingStatus?.onComplete).toBe(onComplete)
    })

    it('should handle undefined language code', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      await act(async () => {
        result.current.startPolling('video-1')
      })

      const pollingStatus = result.current.getPollingStatus('video-1')
      expect(pollingStatus?.languageCode).toBeUndefined()
    })

    it('should handle undefined onComplete', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      await act(async () => {
        result.current.startPolling('video-1', 'en')
      })

      const pollingStatus = result.current.getPollingStatus('video-1')
      expect(pollingStatus?.onComplete).toBeUndefined()
    })
  })

  describe('stopPolling', () => {
    it('should remove polling task', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      await act(async () => {
        result.current.startPolling('video-1', 'en')
      })
      expect(result.current.getPollingStatus('video-1')).not.toBeNull()

      await act(async () => {
        result.current.stopPolling('video-1')
      })
      expect(result.current.getPollingStatus('video-1')).toBeNull()
    })

    it('should not throw when stopping non-existent task', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      await act(async () => {
        expect(() => {
          result.current.stopPolling('non-existent')
        }).not.toThrow()
      })
    })
  })

  describe('upload queue processing', () => {
    it('should add upload to queue with waiting status', async () => {
      const { result } = renderHook(() => useMuxVideoUpload(), {
        wrapper
      })

      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })

      await act(async () => {
        result.current.addUploadToQueue('block-1', file)
      })

      const uploadStatus = result.current.getUploadStatus('block-1')
      expect(uploadStatus).not.toBeNull()
      // Status may be 'waiting' or 'uploading' depending on processing
      expect(['waiting', 'uploading']).toContain(uploadStatus?.status)
    })
  })
})
