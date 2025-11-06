import { UpChunk } from '@mux/upchunk'

import { TASK_CLEANUP_DELAY } from '../constants'
import type { UploadTask } from '../types'

import { processUpload } from './processUpload'

// Mock UpChunk
jest.mock('@mux/upchunk', () => ({
  UpChunk: {
    createUpload: jest.fn()
  }
}))

describe('processUpload', () => {
  let mockDependencies: {
    setUploadTasks: jest.Mock
    createMuxVideoUploadByFile: jest.Mock
    setCurrentlyUploading: jest.Mock
    startPolling: jest.Mock
    uploadInstanceRef: { current: { abort: () => void } | null }
  }

  let mockUpload: {
    on: jest.Mock
  }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()

    mockUpload = {
      on: jest.fn()
    }
    ;(UpChunk.createUpload as jest.Mock).mockReturnValue(mockUpload)

    mockDependencies = {
      setUploadTasks: jest.fn(),
      createMuxVideoUploadByFile: jest.fn(),
      setCurrentlyUploading: jest.fn(),
      startPolling: jest.fn(),
      uploadInstanceRef: { current: null }
    }
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should update status to uploading', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    expect(mockDependencies.setUploadTasks).toHaveBeenCalled()
    const updateFn = mockDependencies.setUploadTasks.mock.calls[0][0]
    const prev = new Map([['block-1', task]])
    const result = updateFn(prev)

    expect(result.get('block-1')?.status).toBe('uploading')
    expect(result.get('block-1')?.progress).toBe(0)
  })

  it('should create upload mutation with correct variables', async () => {
    const file = new File(['test'], 'my-video.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0,
      languageCode: 'en',
      languageName: 'English'
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    expect(mockDependencies.createMuxVideoUploadByFile).toHaveBeenCalledWith({
      variables: {
        name: 'my-video',
        generateSubtitlesInput: {
          languageCode: 'en',
          languageName: 'English'
        }
      }
    })
  })

  it('should not include generateSubtitlesInput when language is not provided', async () => {
    const file = new File(['test'], 'my-video.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    expect(mockDependencies.createMuxVideoUploadByFile).toHaveBeenCalledWith({
      variables: {
        name: 'my-video',
        generateSubtitlesInput: undefined
      }
    })
  })

  it('should create UpChunk upload with correct parameters', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    expect(UpChunk.createUpload).toHaveBeenCalledWith({
      file,
      endpoint: 'https://upload.url',
      chunkSize: 5120
    })
  })

  it('should set uploadInstanceRef', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    expect(mockDependencies.uploadInstanceRef.current).toBe(mockUpload)
  })

  it('should register success, error, and progress event handlers', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    expect(mockUpload.on).toHaveBeenCalledWith('success', expect.any(Function))
    expect(mockUpload.on).toHaveBeenCalledWith('error', expect.any(Function))
    expect(mockUpload.on).toHaveBeenCalledWith('progress', expect.any(Function))
  })

  it('should update task with videoId after mutation', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    // Second call should update with videoId
    expect(mockDependencies.setUploadTasks).toHaveBeenCalledTimes(2)
    const updateFn = mockDependencies.setUploadTasks.mock.calls[1][0]
    const prev = new Map([
      [
        'block-1',
        {
          ...task,
          status: 'uploading',
          progress: 0
        }
      ]
    ])
    const result = updateFn(prev)

    expect(result.get('block-1')?.videoId).toBe('video-1')
  })

  it('should handle upload success and start polling', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0,
      languageCode: 'en'
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    // Get success handler
    const successCall = mockUpload.on.mock.calls.find(
      (call) => call[0] === 'success'
    )
    const successHandler = successCall?.[1]

    if (successHandler != null) {
      successHandler()

      expect(mockDependencies.setCurrentlyUploading).toHaveBeenCalledWith(null)
      expect(mockDependencies.startPolling).toHaveBeenCalledWith(
        'video-1',
        'en',
        expect.any(Function)
      )
    }
  })

  it('should update status to processing on success', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0,
      videoId: 'video-1'
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    const successCall = mockUpload.on.mock.calls.find(
      (call) => call[0] === 'success'
    )
    const successHandler = successCall?.[1]

    if (successHandler != null) {
      successHandler()

      // Find the call that sets status to processing
      const processingCall = mockDependencies.setUploadTasks.mock.calls.find(
        (call) => {
          const updateFn = call[0]
          const prev = new Map([
            [
              'block-1',
              {
                ...task,
                status: 'uploading',
                videoId: 'video-1'
              }
            ]
          ])
          const result = updateFn(prev)
          return result.get('block-1')?.status === 'processing'
        }
      )

      expect(processingCall).toBeDefined()
    }
  })

  it('should call onComplete callback when polling completes', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const onComplete = jest.fn()
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0,
      onComplete
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    const successCall = mockUpload.on.mock.calls.find(
      (call) => call[0] === 'success'
    )
    const successHandler = successCall?.[1]

    if (successHandler != null) {
      successHandler()

      // Get the onComplete callback passed to startPolling
      const startPollingCall = mockDependencies.startPolling.mock.calls[0]
      const pollingOnComplete = startPollingCall[2]

      if (pollingOnComplete != null) {
        pollingOnComplete()

        // Find the call that sets status to completed
        const completedCall = mockDependencies.setUploadTasks.mock.calls.find(
          (call) => {
            const updateFn = call[0]
            const prev = new Map([
              [
                'block-1',
                {
                  ...task,
                  status: 'processing',
                  videoId: 'video-1'
                }
              ]
            ])
            const result = updateFn(prev)
            return result.get('block-1')?.status === 'completed'
          }
        )

        expect(completedCall).toBeDefined()

        // Advance timers to trigger cleanup
        jest.advanceTimersByTime(TASK_CLEANUP_DELAY)

        // Verify onComplete was called
        const finalCall =
          mockDependencies.setUploadTasks.mock.calls[
            mockDependencies.setUploadTasks.mock.calls.length - 1
          ]
        const finalUpdateFn = finalCall[0]
        const finalPrev = new Map([
          [
            'block-1',
            {
              ...task,
              status: 'completed',
              videoId: 'video-1'
            }
          ]
        ])
        finalUpdateFn(finalPrev)

        // onComplete should be called when status is set to completed
        expect(onComplete).toHaveBeenCalledWith('video-1')
      }
    }
  })

  it('should handle upload error', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    const errorCall = mockUpload.on.mock.calls.find(
      (call) => call[0] === 'error'
    )
    const errorHandler = errorCall?.[1]

    if (errorHandler != null) {
      const error = { detail: new Error('Upload failed') }
      errorHandler(error)

      expect(mockDependencies.setCurrentlyUploading).toHaveBeenCalledWith(null)

      // Find the call that sets status to error
      const errorStatusCall = mockDependencies.setUploadTasks.mock.calls.find(
        (call) => {
          const updateFn = call[0]
          const prev = new Map([
            [
              'block-1',
              {
                ...task,
                status: 'uploading',
                videoId: 'video-1'
              }
            ]
          ])
          const result = updateFn(prev)
          return result.get('block-1')?.status === 'error'
        }
      )

      expect(errorStatusCall).toBeDefined()

      // Advance timers to trigger cleanup
      jest.advanceTimersByTime(TASK_CLEANUP_DELAY)

      // Verify cleanup removes the task
      const cleanupCall =
        mockDependencies.setUploadTasks.mock.calls[
          mockDependencies.setUploadTasks.mock.calls.length - 1
        ]
      const cleanupFn = cleanupCall[0]
      const cleanupPrev = new Map([
        [
          'block-1',
          {
            ...task,
            status: 'error',
            error: error.detail
          }
        ]
      ])
      const cleanupResult = cleanupFn(cleanupPrev)

      expect(cleanupResult.size).toBe(0)
    }
  })

  it('should update progress on progress event', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    const progressCall = mockUpload.on.mock.calls.find(
      (call) => call[0] === 'progress'
    )
    const progressHandler = progressCall?.[1]

    if (progressHandler != null) {
      progressHandler({ detail: 50 })

      // Find the call that updates progress
      const progressUpdateCall =
        mockDependencies.setUploadTasks.mock.calls.find((call) => {
          const updateFn = call[0]
          const prev = new Map([
            [
              'block-1',
              {
                ...task,
                status: 'uploading',
                videoId: 'video-1'
              }
            ]
          ])
          const result = updateFn(prev)
          return result.get('block-1')?.progress === 50
        })

      expect(progressUpdateCall).toBeDefined()
    }
  })

  it('should handle mutation error', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockRejectedValue(
      new Error('Mutation failed')
    )

    await processUpload('block-1', task, mockDependencies)

    // Should set error status
    const errorCall = mockDependencies.setUploadTasks.mock.calls.find(
      (call) => {
        const updateFn = call[0]
        const prev = new Map([['block-1', task]])
        const result = updateFn(prev)
        return result.get('block-1')?.status === 'error'
      }
    )

    expect(errorCall).toBeDefined()
    expect(mockDependencies.setCurrentlyUploading).toHaveBeenCalledWith(null)

    // Advance timers to trigger cleanup
    jest.advanceTimersByTime(TASK_CLEANUP_DELAY)

    // Verify cleanup removes the task
    const cleanupCall =
      mockDependencies.setUploadTasks.mock.calls[
        mockDependencies.setUploadTasks.mock.calls.length - 1
      ]
    const cleanupFn = cleanupCall[0]
    const cleanupPrev = new Map([
      [
        'block-1',
        {
          ...task,
          status: 'error',
          error: expect.any(Error)
        }
      ]
    ])
    const cleanupResult = cleanupFn(cleanupPrev)

    expect(cleanupResult.size).toBe(0)
  })

  it('should throw error when upload URL is missing', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: null,
          id: 'video-1'
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    // Should set error status
    const errorCall = mockDependencies.setUploadTasks.mock.calls.find(
      (call) => {
        const updateFn = call[0]
        const prev = new Map([['block-1', task]])
        const result = updateFn(prev)
        return result.get('block-1')?.status === 'error'
      }
    )

    expect(errorCall).toBeDefined()
  })

  it('should throw error when video ID is missing', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const task: UploadTask = {
      videoBlockId: 'block-1',
      file,
      status: 'waiting',
      progress: 0
    }

    mockDependencies.createMuxVideoUploadByFile.mockResolvedValue({
      data: {
        createMuxVideoUploadByFile: {
          uploadUrl: 'https://upload.url',
          id: null
        }
      }
    })

    await processUpload('block-1', task, mockDependencies)

    // Should set error status
    const errorCall = mockDependencies.setUploadTasks.mock.calls.find(
      (call) => {
        const updateFn = call[0]
        const prev = new Map([['block-1', task]])
        const result = updateFn(prev)
        return result.get('block-1')?.status === 'error'
      }
    )

    expect(errorCall).toBeDefined()
  })
})
