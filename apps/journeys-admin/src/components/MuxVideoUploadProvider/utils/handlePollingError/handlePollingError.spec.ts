import { TASK_CLEANUP_DELAY } from '../constants'
import type { PollingTask } from '../types'

import { handlePollingError } from './handlePollingError'

describe('handlePollingError', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should update task status to error', () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const pollingIntervalsRef = { current: new Map<string, NodeJS.Timeout>() }
    const videoId = 'video-1'
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now()
    }

    handlePollingError(videoId, 'Test error', {
      setPollingTasks,
      showSnackbar,
      pollingIntervalsRef
    })

    expect(setPollingTasks).toHaveBeenCalledTimes(1)
    const updateFn = setPollingTasks.mock.calls[0][0]
    const prev = new Map([['video-1', task]])
    const result = updateFn(prev)

    expect(result.get(videoId)?.status).toBe('error')
  })

  it('should clear polling interval', () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const pollingIntervalsRef = { current: new Map<string, NodeJS.Timeout>() }
    const videoId = 'video-1'
    const mockInterval = setInterval(() => {}, 1000)
    pollingIntervalsRef.current.set(videoId, mockInterval)
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now()
    }

    handlePollingError(videoId, 'Test error', {
      setPollingTasks,
      showSnackbar,
      pollingIntervalsRef
    })

    expect(pollingIntervalsRef.current.has(videoId)).toBe(false)
  })

  it('should show error snackbar', () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const pollingIntervalsRef = { current: new Map<string, NodeJS.Timeout>() }
    const videoId = 'video-1'
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now()
    }

    handlePollingError(videoId, 'Test error message', {
      setPollingTasks,
      showSnackbar,
      pollingIntervalsRef
    })

    expect(showSnackbar).toHaveBeenCalledWith(
      'Test error message',
      'error',
      true
    )
  })

  it('should remove task after cleanup delay', () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const pollingIntervalsRef = { current: new Map<string, NodeJS.Timeout>() }
    const videoId = 'video-1'
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now()
    }

    handlePollingError(videoId, 'Test error', {
      setPollingTasks,
      showSnackbar,
      pollingIntervalsRef
    })

    // First call sets status to error
    expect(setPollingTasks).toHaveBeenCalledTimes(1)

    // Advance time by cleanup delay
    jest.advanceTimersByTime(TASK_CLEANUP_DELAY)

    // Second call removes the task
    expect(setPollingTasks).toHaveBeenCalledTimes(2)
    const removeFn = setPollingTasks.mock.calls[1][0]
    const prev = new Map([['video-1', task]])
    const result = removeFn(prev)

    expect(result.size).toBe(0)
    expect(result.has(videoId)).toBe(false)
  })

  it('should return previous map if task does not exist', () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const pollingIntervalsRef = { current: new Map<string, NodeJS.Timeout>() }
    const videoId = 'video-1'
    const prev = new Map<string, PollingTask>()

    handlePollingError(videoId, 'Test error', {
      setPollingTasks,
      showSnackbar,
      pollingIntervalsRef
    })

    expect(setPollingTasks).toHaveBeenCalledTimes(1)
    const updateFn = setPollingTasks.mock.calls[0][0]
    const result = updateFn(prev)

    expect(result).toBe(prev)
  })
})
