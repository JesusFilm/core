import type { PollingTask } from '../types'

import { startPolling } from './startPolling'

describe('startPolling', () => {
  const mockDependencies = {
    hasShownStartNotification: { current: new Set<string>() },
    showSnackbar: jest.fn(),
    t: jest.fn((key: string) => key),
    setPollingTasks: jest.fn(),
    stopQueryRefs: { current: new Map<string, () => void>() }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDependencies.hasShownStartNotification.current.clear()
    mockDependencies.stopQueryRefs.current.clear()
  })

  it('should create polling task with correct properties', () => {
    const videoId = 'video-1'
    const languageCode = 'en'
    const onComplete = jest.fn()

    startPolling(videoId, languageCode, onComplete, mockDependencies)

    expect(mockDependencies.setPollingTasks).toHaveBeenCalledTimes(1)
    const updateFn = mockDependencies.setPollingTasks.mock.calls[0][0]
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
    expect(typeof task?.stopPolling).toBe('function')
  })

  it('should show notification on first call', () => {
    const videoId = 'video-1'

    startPolling(videoId, undefined, undefined, mockDependencies)

    expect(mockDependencies.showSnackbar).toHaveBeenCalledWith(
      'Video upload in progress',
      'success',
      true
    )
    expect(
      mockDependencies.hasShownStartNotification.current.has(videoId)
    ).toBe(true)
  })

  it('should not show notification on subsequent calls for same video', () => {
    const videoId = 'video-1'
    mockDependencies.hasShownStartNotification.current.add(videoId)

    startPolling(videoId, undefined, undefined, mockDependencies)

    expect(mockDependencies.showSnackbar).not.toHaveBeenCalled()
  })

  it('should handle undefined language code', () => {
    const videoId = 'video-1'

    startPolling(videoId, undefined, undefined, mockDependencies)

    const updateFn = mockDependencies.setPollingTasks.mock.calls[0][0]
    const prev = new Map<string, PollingTask>()
    const result = updateFn(prev)

    const task = result.get(videoId)
    expect(task?.languageCode).toBeUndefined()
  })

  it('should handle undefined onComplete callback', () => {
    const videoId = 'video-1'

    startPolling(videoId, 'en', undefined, mockDependencies)

    const updateFn = mockDependencies.setPollingTasks.mock.calls[0][0]
    const prev = new Map<string, PollingTask>()
    const result = updateFn(prev)

    const task = result.get(videoId)
    expect(task?.onComplete).toBeUndefined()
  })

  it('should create stopPolling function that calls stopQueryRefs', () => {
    const videoId = 'video-1'
    const stopQuery = jest.fn()
    mockDependencies.stopQueryRefs.current.set(videoId, stopQuery)

    startPolling(videoId, undefined, undefined, mockDependencies)

    const updateFn = mockDependencies.setPollingTasks.mock.calls[0][0]
    const prev = new Map<string, PollingTask>()
    const result = updateFn(prev)

    const task = result.get(videoId)
    if (task != null) {
      task.stopPolling()
      expect(stopQuery).toHaveBeenCalled()
    }
  })

  it('should handle stopPolling when stopQueryRefs does not have videoId', () => {
    const videoId = 'video-1'

    startPolling(videoId, undefined, undefined, mockDependencies)

    const updateFn = mockDependencies.setPollingTasks.mock.calls[0][0]
    const prev = new Map<string, PollingTask>()
    const result = updateFn(prev)

    const task = result.get(videoId)
    if (task != null) {
      expect(() => task.stopPolling()).not.toThrow()
    }
  })
})
