import { TASK_CLEANUP_DELAY } from '../constants'
import type { PollingTask } from '../types'

import { handlePollingComplete } from './handlePollingComplete'

describe('handlePollingComplete', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should update task status to completed', async () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const t = jest.fn((key: string) => key)
    const videoId = 'video-1'
    const stopPollingFn = jest.fn()
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: stopPollingFn
    }
    const pollingTasks = new Map([['video-1', task]])

    await handlePollingComplete(videoId, {
      pollingTasks,
      setPollingTasks,
      showSnackbar,
      t
    })

    expect(setPollingTasks).toHaveBeenCalledTimes(1)
    const updateFn = setPollingTasks.mock.calls[0][0]
    const prev = new Map([['video-1', task]])
    const result = updateFn(prev)

    expect(result.get(videoId)?.status).toBe('completed')
  })

  it('should call stopPolling on task', async () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const t = jest.fn((key: string) => key)
    const videoId = 'video-1'
    const stopPollingFn = jest.fn()
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: stopPollingFn
    }
    const pollingTasks = new Map([['video-1', task]])

    await handlePollingComplete(videoId, {
      pollingTasks,
      setPollingTasks,
      showSnackbar,
      t
    })

    expect(stopPollingFn).toHaveBeenCalled()
  })

  it('should show success snackbar', async () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const t = jest.fn((key: string) => `translated:${key}`)
    const videoId = 'video-1'
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: jest.fn()
    }
    const pollingTasks = new Map([['video-1', task]])

    await handlePollingComplete(videoId, {
      pollingTasks,
      setPollingTasks,
      showSnackbar,
      t
    })

    expect(showSnackbar).toHaveBeenCalledWith(
      'translated:Video upload completed',
      'success',
      {
        autoHideDuration: 4000,
        preventDuplicate: true,
        persist: false
      }
    )
  })

  it('should call onComplete callback if provided', async () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const t = jest.fn((key: string) => key)
    const videoId = 'video-1'
    const onComplete = jest.fn()
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: jest.fn(),
      onComplete
    }
    const pollingTasks = new Map([['video-1', task]])

    await handlePollingComplete(videoId, {
      pollingTasks,
      setPollingTasks,
      showSnackbar,
      t
    })

    expect(onComplete).toHaveBeenCalled()
  })

  it('should not call onComplete if not provided', async () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const t = jest.fn((key: string) => key)
    const videoId = 'video-1'
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: jest.fn()
    }
    const pollingTasks = new Map([['video-1', task]])

    await handlePollingComplete(videoId, {
      pollingTasks,
      setPollingTasks,
      showSnackbar,
      t
    })

    // Should not throw
    expect(setPollingTasks).toHaveBeenCalled()
  })

  it('should remove task after cleanup delay', async () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const t = jest.fn((key: string) => key)
    const videoId = 'video-1'
    const task: PollingTask = {
      videoId,
      status: 'processing',
      startTime: Date.now(),
      stopPolling: jest.fn()
    }
    const pollingTasks = new Map([['video-1', task]])

    await handlePollingComplete(videoId, {
      pollingTasks,
      setPollingTasks,
      showSnackbar,
      t
    })

    // First call sets status to completed
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

  it('should return early if task does not exist', async () => {
    const setPollingTasks = jest.fn()
    const showSnackbar = jest.fn()
    const t = jest.fn((key: string) => key)
    const videoId = 'video-1'
    const pollingTasks = new Map<string, PollingTask>()

    await handlePollingComplete(videoId, {
      pollingTasks,
      setPollingTasks,
      showSnackbar,
      t
    })

    expect(setPollingTasks).not.toHaveBeenCalled()
    expect(showSnackbar).not.toHaveBeenCalled()
  })
})
