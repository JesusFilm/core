import { act, renderHook } from '@testing-library/react'

import { createInitialTask } from './types'
import { useUploadTaskMap } from './useUploadTaskMap'

describe('useUploadTaskMap', () => {
  it('returns empty map, hasActiveUploads false, getUploadStatus null initially', () => {
    const { result } = renderHook(() => useUploadTaskMap())

    expect(result.current.uploadTasks.size).toBe(0)
    expect(result.current.hasActiveUploads).toBe(false)
    expect(result.current.getUploadStatus('video-block-1')).toBeNull()
  })

  it('updateTask merges partial updates into existing task', () => {
    const { result } = renderHook(() => useUploadTaskMap())

    act(() => {
      result.current.setUploadTasks(
        (prev) => new Map(prev).set('video-block-1', createInitialTask('video-block-1'))
      )
    })

    expect(result.current.getUploadStatus('video-block-1')).toMatchObject({
      status: 'uploading',
      progress: 0
    })

    act(() => {
      result.current.updateTask('video-block-1', { progress: 50 })
    })

    expect(result.current.getUploadStatus('video-block-1')).toMatchObject({
      status: 'uploading',
      progress: 50
    })

    act(() => {
      result.current.updateTask('video-block-1', { status: 'processing', videoId: 'mux-1' })
    })

    expect(result.current.getUploadStatus('video-block-1')).toMatchObject({
      status: 'processing',
      progress: 50,
      videoId: 'mux-1'
    })
  })

  it('updateTask is no-op when task does not exist', () => {
    const { result } = renderHook(() => useUploadTaskMap())

    act(() => {
      result.current.updateTask('video-block-1', { progress: 50 })
    })

    expect(result.current.getUploadStatus('video-block-1')).toBeNull()
  })

  it('removeTask deletes task from map and clears refs', () => {
    const { result } = renderHook(() => useUploadTaskMap())

    act(() => {
      result.current.setUploadTasks(
        (prev) => new Map(prev).set('video-block-1', createInitialTask('video-block-1'))
      )
    })

    result.current.activeBlocksRef.current.add('video-block-1')
    result.current.uploadInstancesRef.current.set('video-block-1', { abort: jest.fn() })

    act(() => {
      result.current.removeTask('video-block-1')
    })

    expect(result.current.getUploadStatus('video-block-1')).toBeNull()
    expect(result.current.activeBlocksRef.current.has('video-block-1')).toBe(false)
    expect(result.current.uploadInstancesRef.current.has('video-block-1')).toBe(false)
  })

  it('getUploadStatus returns state without retryCount internal field', () => {
    const { result } = renderHook(() => useUploadTaskMap())

    const taskWithRetry = {
      ...createInitialTask('video-block-1'),
      retryCount: 2
    }

    act(() => {
      result.current.setUploadTasks(
        (prev) => new Map(prev).set('video-block-1', taskWithRetry)
      )
    })

    const status = result.current.getUploadStatus('video-block-1')
    expect(status).not.toBeNull()
    expect(status).not.toHaveProperty('retryCount')
    expect(status).toMatchObject({
      status: 'uploading',
      progress: 0
    })
  })

  it('hasActiveUploads returns true when any task is uploading, processing, or updating', () => {
    const { result } = renderHook(() => useUploadTaskMap())

    act(() => {
      result.current.setUploadTasks(
        (prev) =>
          new Map(prev).set('video-block-1', {
            ...createInitialTask('video-block-1'),
            status: 'uploading'
          })
      )
    })

    expect(result.current.hasActiveUploads).toBe(true)

    act(() => {
      result.current.updateTask('video-block-1', { status: 'processing' })
    })

    expect(result.current.hasActiveUploads).toBe(true)

    act(() => {
      result.current.updateTask('video-block-1', { status: 'updating' })
    })

    expect(result.current.hasActiveUploads).toBe(true)
  })

  it('hasActiveUploads returns false when all tasks are error or completed', () => {
    const { result } = renderHook(() => useUploadTaskMap())

    act(() => {
      result.current.setUploadTasks(
        (prev) =>
          new Map(prev).set('video-block-1', {
            ...createInitialTask('video-block-1'),
            status: 'error',
            error: 'Failed'
          })
      )
    })

    expect(result.current.hasActiveUploads).toBe(false)

    act(() => {
      result.current.updateTask('video-block-1', { status: 'completed' })
    })

    expect(result.current.hasActiveUploads).toBe(false)
  })
})
