import { MockedProvider } from '@apollo/client/testing'
import { act, render, renderHook } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'

import {
  MuxVideoUploadProvider,
  useMuxVideoUpload
} from './MuxVideoUploadProvider'

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
      const onComplete = jest.fn()

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
})
