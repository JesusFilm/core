import type { PollingTask } from '../types'

import { stopPolling } from './stopPolling'

describe('stopPolling', () => {
  const mockDependencies = {
    setPollingTasks: jest.fn(),
    stopQueryRefs: { current: new Map<string, () => void>() },
    hasShownStartNotification: { current: new Set<string>() }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockDependencies.stopQueryRefs.current.clear()
    mockDependencies.hasShownStartNotification.current.clear()
  })

  it('should remove polling task from map', () => {
    const videoId = 'video-1'
    const stopPollingFn = jest.fn()
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: stopPollingFn
    }

    stopPolling(videoId, mockDependencies)

    expect(mockDependencies.setPollingTasks).toHaveBeenCalledTimes(1)
    const updateFn = mockDependencies.setPollingTasks.mock.calls[0][0]
    const prev = new Map([['video-1', task]])
    const result = updateFn(prev)

    expect(result.size).toBe(0)
    expect(result.has(videoId)).toBe(false)
  })

  it('should call stopPolling on task before removing', () => {
    const videoId = 'video-1'
    const stopPollingFn = jest.fn()
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: stopPollingFn
    }

    stopPolling(videoId, mockDependencies)

    const updateFn = mockDependencies.setPollingTasks.mock.calls[0][0]
    const prev = new Map([['video-1', task]])
    updateFn(prev)

    expect(stopPollingFn).toHaveBeenCalled()
  })

  it('should delete from stopQueryRefs', () => {
    const videoId = 'video-1'
    const stopQuery = jest.fn()
    mockDependencies.stopQueryRefs.current.set(videoId, stopQuery)

    stopPolling(videoId, mockDependencies)

    expect(mockDependencies.stopQueryRefs.current.has(videoId)).toBe(false)
  })

  it('should delete from hasShownStartNotification', () => {
    const videoId = 'video-1'
    mockDependencies.hasShownStartNotification.current.add(videoId)

    stopPolling(videoId, mockDependencies)

    expect(
      mockDependencies.hasShownStartNotification.current.has(videoId)
    ).toBe(false)
  })

  it('should return previous map if task does not exist', () => {
    const videoId = 'video-1'
    const prev = new Map<string, PollingTask>()

    stopPolling(videoId, mockDependencies)

    const updateFn = mockDependencies.setPollingTasks.mock.calls[0][0]
    const result = updateFn(prev)

    expect(result).toBe(prev)
  })

  it('should not affect other tasks in the map', () => {
    const videoId1 = 'video-1'
    const videoId2 = 'video-2'
    const task1: PollingTask = {
      videoId: videoId1,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: jest.fn()
    }
    const task2: PollingTask = {
      videoId: videoId2,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: jest.fn()
    }

    stopPolling(videoId1, mockDependencies)

    const updateFn = mockDependencies.setPollingTasks.mock.calls[0][0]
    const prev = new Map([
      [videoId1, task1],
      [videoId2, task2]
    ])
    const result = updateFn(prev)

    expect(result.size).toBe(1)
    expect(result.has(videoId1)).toBe(false)
    expect(result.has(videoId2)).toBe(true)
  })
})
