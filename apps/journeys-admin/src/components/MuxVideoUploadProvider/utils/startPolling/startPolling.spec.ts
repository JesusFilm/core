import type { PollingTask } from '../types'

import { startPolling } from './startPolling'

describe('startPolling', () => {
  const mockServices = {
    hasShownStartNotification: { current: new Set<string>() },
    showSnackbar: jest.fn(),
    t: jest.fn((key: string) => key),
    setPollingTasks: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockServices.hasShownStartNotification.current.clear()
  })

  it('should create polling task with correct properties', () => {
    const videoId = 'video-1'
    const languageCode = 'en'
    const onComplete = jest.fn()

    startPolling(videoId, languageCode, onComplete, mockServices)

    expect(mockServices.setPollingTasks).toHaveBeenCalledTimes(1)
    const updateFn = mockServices.setPollingTasks.mock.calls[0][0]
    const prev = new Map<string, PollingTask>()
    const result = updateFn(prev)

    expect(result.size).toBe(1)
    const task = result.get(videoId)
    expect(task).toMatchObject({
      videoId,
      languageCode,
      status: 'processing',
      onComplete
    })
    expect(task?.startTime).toBeGreaterThan(0)
  })

  it('should show notification on first call', () => {
    const videoId = 'video-1'

    startPolling(videoId, undefined, undefined, mockServices)

    expect(mockServices.showSnackbar).toHaveBeenCalledWith(
      'Video upload in progress',
      'success',
      {
        autoHideDuration: 4000,
        preventDuplicate: true,
        persist: false
      }
    )
    expect(mockServices.hasShownStartNotification.current.has(videoId)).toBe(
      true
    )
  })

  it('should not show notification on subsequent calls for same video', () => {
    const videoId = 'video-1'
    mockServices.hasShownStartNotification.current.add(videoId)

    startPolling(videoId, undefined, undefined, mockServices)

    expect(mockServices.showSnackbar).not.toHaveBeenCalled()
  })

  it('should handle undefined language code', () => {
    const videoId = 'video-1'

    startPolling(videoId, undefined, undefined, mockServices)

    const updateFn = mockServices.setPollingTasks.mock.calls[0][0]
    const prev = new Map<string, PollingTask>()
    const result = updateFn(prev)

    const task = result.get(videoId)
    expect(task?.languageCode).toBeUndefined()
  })

  it('should handle undefined onComplete callback', () => {
    const videoId = 'video-1'

    startPolling(videoId, 'en', undefined, mockServices)

    const updateFn = mockServices.setPollingTasks.mock.calls[0][0]
    const prev = new Map<string, PollingTask>()
    const result = updateFn(prev)

    const task = result.get(videoId)
    expect(task?.onComplete).toBeUndefined()
  })
})
