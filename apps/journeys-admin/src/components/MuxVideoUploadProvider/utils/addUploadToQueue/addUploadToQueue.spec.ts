import type { UploadTask } from '../types'

import { addUploadToQueue } from './addUploadToQueue'

describe('addUploadToQueue', () => {
  it('should add upload task to queue with waiting status', () => {
    const setUploadTasks = jest.fn()
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const videoBlockId = 'block-1'
    const languageCode = 'en'
    const languageName = 'English'
    const onComplete = jest.fn()

    addUploadToQueue(
      videoBlockId,
      file,
      languageCode,
      languageName,
      onComplete,
      { setUploadTasks }
    )

    expect(setUploadTasks).toHaveBeenCalledTimes(1)
    const updateFn = setUploadTasks.mock.calls[0][0]
    const prev = new Map<string, UploadTask>()
    const result = updateFn(prev)

    expect(result.size).toBe(1)
    const task = result.get(videoBlockId)
    expect(task).toEqual({
      videoBlockId,
      file,
      languageCode,
      languageName,
      status: 'waiting',
      progress: 0,
      onComplete
    })
  })

  it('should handle undefined language code and name', () => {
    const setUploadTasks = jest.fn()
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' })
    const videoBlockId = 'block-1'

    addUploadToQueue(videoBlockId, file, undefined, undefined, undefined, {
      setUploadTasks
    })

    expect(setUploadTasks).toHaveBeenCalledTimes(1)
    const updateFn = setUploadTasks.mock.calls[0][0]
    const prev = new Map<string, UploadTask>()
    const result = updateFn(prev)

    const task = result.get(videoBlockId)
    expect(task?.languageCode).toBeUndefined()
    expect(task?.languageName).toBeUndefined()
    expect(task?.onComplete).toBeUndefined()
  })

  it('should add to existing map without overwriting other tasks', () => {
    const setUploadTasks = jest.fn()
    const file1 = new File(['test1'], 'test1.mp4', { type: 'video/mp4' })
    const file2 = new File(['test2'], 'test2.mp4', { type: 'video/mp4' })
    const existingTask: UploadTask = {
      videoBlockId: 'block-1',
      file: file1,
      status: 'uploading',
      progress: 50,
      languageCode: 'en',
      languageName: 'English'
    }

    addUploadToQueue('block-2', file2, 'es', 'Spanish', undefined, {
      setUploadTasks
    })

    const updateFn = setUploadTasks.mock.calls[0][0]
    const prev = new Map([['block-1', existingTask]])
    const result = updateFn(prev)

    expect(result.size).toBe(2)
    expect(result.get('block-1')).toEqual(existingTask)
    expect(result.get('block-2')?.status).toBe('waiting')
  })
})
