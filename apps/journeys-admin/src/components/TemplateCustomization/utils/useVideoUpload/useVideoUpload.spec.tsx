import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { UpChunk } from '@mux/upchunk'
import { act, renderHook, waitFor } from '@testing-library/react'

import {
  CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION,
  GET_MY_MUX_VIDEO_QUERY,
  useVideoUpload
} from './useVideoUpload'

jest.mock('@mux/upchunk', () => ({
  UpChunk: {
    createUpload: jest.fn()
  }
}))

jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(() => ({
    getRootProps: jest.fn(),
    getInputProps: jest.fn(),
    open: jest.fn()
  }))
}))

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
        id: 'videoId'
      }
    }
  }
}

const getMyMuxVideoMock: MockedResponse = {
  request: {
    query: GET_MY_MUX_VIDEO_QUERY,
    variables: { id: 'videoId' }
  },
  result: {
    data: {
      getMyMuxVideo: {
        __typename: 'MuxVideo',
        id: 'videoId',
        assetId: 'assetId',
        playbackId: 'playbackId',
        readyToStream: true
      }
    }
  }
}

const getMyMuxVideoProcessingMock: MockedResponse = {
  request: {
    query: GET_MY_MUX_VIDEO_QUERY,
    variables: { id: 'videoId' }
  },
  result: {
    data: {
      getMyMuxVideo: {
        __typename: 'MuxVideo',
        id: 'videoId',
        assetId: 'assetId',
        playbackId: 'playbackId',
        readyToStream: false
      }
    }
  }
}

describe('useVideoUpload', () => {
  const file = new File([''], 'video.mp4', { type: 'video/mp4' })

  it('should handle successful upload and polling', async () => {
    const onUploadComplete = jest.fn()
    const mockUpload = {
      on: jest.fn(),
      abort: jest.fn()
    }
    ;(UpChunk.createUpload as jest.Mock).mockReturnValue(mockUpload)

    const { result } = renderHook(() => useVideoUpload({ onUploadComplete }), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[createMuxVideoUploadByFileMock, getMyMuxVideoMock]}
          addTypename={false}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current.handleUpload(file)
    })

    expect(result.current.status).toBe('uploading')
    expect(UpChunk.createUpload).toHaveBeenCalledWith({
      endpoint: 'https://mux.com/upload',
      file,
      chunkSize: 5120
    })

    // Simulate progress
    const progressCallback = mockUpload.on.mock.calls.find(
      (call) => call[0] === 'progress'
    )[1]
    act(() => {
      progressCallback({ detail: 50 })
    })
    expect(result.current.progress).toBe(50)

    // Simulate success
    const successCallback = mockUpload.on.mock.calls.find(
      (call) => call[0] === 'success'
    )[1]
    await act(async () => {
      successCallback()
    })

    await waitFor(() => expect(result.current.status).toBe('completed'))
    expect(onUploadComplete).toHaveBeenCalledWith('videoId')
  })

  it('should set videoId when upload starts', async () => {
    const mockUpload = {
      on: jest.fn(),
      abort: jest.fn()
    }
    ;(UpChunk.createUpload as jest.Mock).mockReturnValue(mockUpload)

    const { result } = renderHook(() => useVideoUpload(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[createMuxVideoUploadByFileMock]}
          addTypename={false}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current.handleUpload(file)
    })

    expect(result.current.videoId).toBe('videoId')
  })

  it('should handle upload error', async () => {
    const onUploadError = jest.fn()
    const mockUpload = {
      on: jest.fn(),
      abort: jest.fn()
    }
    ;(UpChunk.createUpload as jest.Mock).mockReturnValue(mockUpload)

    const { result } = renderHook(() => useVideoUpload({ onUploadError }), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[createMuxVideoUploadByFileMock]}
          addTypename={false}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current.handleUpload(file)
    })

    const errorCallback = mockUpload.on.mock.calls.find(
      (call) => call[0] === 'error'
    )[1]

    act(() => {
      errorCallback()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Upload failed')
    expect(onUploadError).toHaveBeenCalledWith('Upload failed')
  })

  it('should handle file too large error', async () => {
    const onUploadError = jest.fn()
    const largeFile = new File([''], 'large.mp4', { type: 'video/mp4' })
    Object.defineProperty(largeFile, 'size', { value: 2 * 1024 * 1024 * 1024 }) // 2GB

    const { result } = renderHook(() => useVideoUpload({ onUploadError }), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]} addTypename={false}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current.handleUpload(largeFile)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('File is too large. Max size is 1GB.')
    expect(onUploadError).toHaveBeenCalledWith(
      'File is too large. Max size is 1GB.'
    )
  })

  it('should cancel upload', async () => {
    const mockUpload = {
      on: jest.fn(),
      abort: jest.fn()
    }
    ;(UpChunk.createUpload as jest.Mock).mockReturnValue(mockUpload)

    const { result } = renderHook(() => useVideoUpload(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[createMuxVideoUploadByFileMock]}
          addTypename={false}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current.handleUpload(file)
    })

    expect(result.current.status).toBe('uploading')

    act(() => {
      result.current.cancelUpload()
    })

    expect(mockUpload.abort).toHaveBeenCalled()
    expect(result.current.status).toBe('idle')
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBeUndefined()
    expect(result.current.videoId).toBeUndefined()
  })

  it('should poll with exponential backoff until ready', async () => {
    const onUploadComplete = jest.fn()
    const mockUpload = {
      on: jest.fn(),
      abort: jest.fn()
    }
    ;(UpChunk.createUpload as jest.Mock).mockReturnValue(mockUpload)

    const { result } = renderHook(
      () => useVideoUpload({ onUploadComplete, initialPollInterval: 100 }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              createMuxVideoUploadByFileMock,
              getMyMuxVideoProcessingMock,
              getMyMuxVideoMock
            ]}
            addTypename={false}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      await result.current.handleUpload(file)
    })

    // Simulate success to start polling
    const successCallback = mockUpload.on.mock.calls.find(
      (call) => call[0] === 'success'
    )[1]

    await act(async () => {
      successCallback()
    })

    // Wait for the immediate poll to be called and for status to change to processing
    await waitFor(() => expect(result.current.status).toBe('processing'))

    // Wait for the second poll to complete and status to change to completed
    // We use a shorter timeout since we reduced the interval to 100ms for faster testing.
    // Note: The backoff timing here (100ms, 150ms, etc.) is reduced for test performance
    // and does not match the real-world production intervals (2s, 3s, etc.).
    await waitFor(() => expect(result.current.status).toBe('completed'), {
      timeout: 2000
    })
    expect(onUploadComplete).toHaveBeenCalledWith('videoId')
  })

  it('should handle polling error', async () => {
    const onUploadError = jest.fn()
    const mockUpload = {
      on: jest.fn(),
      abort: jest.fn()
    }
    ;(UpChunk.createUpload as jest.Mock).mockReturnValue(mockUpload)

    const pollingErrorMock: MockedResponse = {
      request: {
        query: GET_MY_MUX_VIDEO_QUERY,
        variables: { id: 'videoId' }
      },
      error: new Error('Polling failed')
    }

    const { result } = renderHook(
      () => useVideoUpload({ onUploadError, initialPollInterval: 100 }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              createMuxVideoUploadByFileMock,
              pollingErrorMock,
              pollingErrorMock,
              pollingErrorMock,
              pollingErrorMock
            ]}
            addTypename={false}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      await result.current.handleUpload(file)
    })

    // Simulate success to start polling
    const successCallback = mockUpload.on.mock.calls.find(
      (call) => call[0] === 'success'
    )[1]

    await act(async () => {
      successCallback()
    })

    // Wait for all 3 retries to exhaust (3 retries * 100ms delay = ~300ms + buffer)
    // Note: The backoff timing here is reduced for test performance and does not match
    // the real-world production intervals.
    await waitFor(() => expect(result.current.status).toBe('error'), {
      timeout: 2000
    })
    expect(result.current.error).toBe('Failed to check video status')
    expect(onUploadError).toHaveBeenCalledWith('Failed to check video status')
  })

  it('should cleanup on unmount', async () => {
    const mockUpload = {
      on: jest.fn(),
      abort: jest.fn()
    }
    ;(UpChunk.createUpload as jest.Mock).mockReturnValue(mockUpload)

    const { result, unmount } = renderHook(() => useVideoUpload(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[createMuxVideoUploadByFileMock, getMyMuxVideoProcessingMock]}
          addTypename={false}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current.handleUpload(file)
    })

    unmount()

    expect(mockUpload.abort).toHaveBeenCalled()
  })
})
