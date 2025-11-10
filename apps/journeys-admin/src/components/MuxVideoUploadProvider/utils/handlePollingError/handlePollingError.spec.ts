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
    const videoId = 'video-1'
    const stopPollingFn = jest.fn()
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: stopPollingFn
    }

    handlePollingError(videoId, 'Test error', { setPollingTasks, showSnackbar })

    expect(setPollingTasks).toHaveBeenCalledTimes(1)
    const updateFn = setPollingTasks.mock.calls[0][0]
    const prev = new Map([['video-1', task]])
    const result = updateFn(prev)

    expect(result.get(videoId)?.status).toBe('error')
  })

  it('should call stopPolling on task', () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const videoId = 'video-1'
    const stopPollingFn = jest.fn()
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: stopPollingFn
    }

    handlePollingError(videoId, 'Test error', { setPollingTasks, showSnackbar })

    const updateFn = setPollingTasks.mock.calls[0][0]
    const prev = new Map([['video-1', task]])
    updateFn(prev)

    expect(stopPollingFn).toHaveBeenCalled()
  })

  it('should show error snackbar', () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const videoId = 'video-1'
    const stopPollingFn = jest.fn()
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: stopPollingFn
    }

    handlePollingError(videoId, 'Test error message', {
      setPollingTasks,
      showSnackbar
    })

    expect(showSnackbar).toHaveBeenCalledWith('Test error message', 'error', {
      autoHideDuration: 4000,
      preventDuplicate: true,
      persist: false
    })

    // Verify task.stopPolling is called
    const updateFn = setPollingTasks.mock.calls[0][0]
    const prev = new Map([['video-1', task]])
    updateFn(prev)
    expect(stopPollingFn).toHaveBeenCalled()
  })

  it('should remove task after cleanup delay', () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const videoId = 'video-1'
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: jest.fn()
    }

    handlePollingError(videoId, 'Test error', { setPollingTasks, showSnackbar })

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
    const videoId = 'video-1'
    const prev = new Map<string, PollingTask>()

    handlePollingError(videoId, 'Test error', { setPollingTasks, showSnackbar })

    expect(setPollingTasks).toHaveBeenCalledTimes(1)
    const updateFn = setPollingTasks.mock.calls[0][0]
    const result = updateFn(prev)

    expect(result).toBe(prev)
  })
})
