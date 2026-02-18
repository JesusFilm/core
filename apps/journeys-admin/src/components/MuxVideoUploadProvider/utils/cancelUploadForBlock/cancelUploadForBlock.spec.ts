import type { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '@core/journeys/ui/block/__generated__/BlockFields'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { clearPollingInterval } from '../clearPollingInterval'
import type { UploadTask } from '../types'

import { cancelUploadForBlock } from './cancelUploadForBlock'

jest.mock('../clearPollingInterval')

const mockClearPollingInterval = clearPollingInterval as jest.MockedFunction<
  typeof clearPollingInterval
>

describe('cancelUploadForBlock', () => {
  let uploadTasks: Map<string, UploadTask>
  let setUploadTasks: jest.Mock
  let setPollingTasks: jest.Mock
  let uploadInstanceRefs: { current: Map<string, { abort: jest.Mock }> }
  let pollingIntervalsRef: { current: Map<string, NodeJS.Timeout> }
  let hasShownStartNotification: { current: Set<string> }
  let dependencies: {
    uploadTasks: Map<string, UploadTask>
    setUploadTasks: jest.Mock
    setPollingTasks: jest.Mock
    uploadInstanceRefs: { current: Map<string, { abort: jest.Mock }> }
    pollingIntervalsRef: { current: Map<string, NodeJS.Timeout> }
    hasShownStartNotification: { current: Set<string> }
  }

  beforeEach(() => {
    jest.clearAllMocks()

    uploadTasks = new Map<string, UploadTask>()
    setUploadTasks = jest.fn((updater) => {
      if (typeof updater === 'function') {
        uploadTasks = updater(uploadTasks)
      } else {
        uploadTasks = updater
      }
    })
    setPollingTasks = jest.fn((updater) => {
      // Mock implementation for setPollingTasks
    })
    uploadInstanceRefs = {
      current: new Map<string, { abort: jest.Mock }>()
    }
    pollingIntervalsRef = {
      current: new Map<string, NodeJS.Timeout>()
    }
    hasShownStartNotification = {
      current: new Set<string>()
    }

    dependencies = {
      uploadTasks,
      setUploadTasks,
      setPollingTasks,
      uploadInstanceRefs,
      pollingIntervalsRef,
      hasShownStartNotification
    }
  })

  it('should cancel upload for VideoBlock when task exists', () => {
    const videoBlock: TreeBlock<VideoBlock> = {
      id: 'video-block-1',
      __typename: 'VideoBlock',
      parentBlockId: 'card1',
      parentOrder: 0,
      startAt: 0,
      endAt: null,
      muted: true,
      autoplay: true,
      fullsize: true,
      action: null,
      videoId: null,
      videoVariantLanguageId: null,
      source: VideoBlockSource.mux,
      title: null,
      description: null,
      duration: null,
      image: null,
      objectFit: null,
      subtitleLanguage: null,
      showGeneratedSubtitles: null,
      mediaVideo: null,
      posterBlockId: null,
      eventLabel: null,
      endEventLabel: null,
      customizable: null,
      children: []
    }

    const uploadTask: UploadTask = {
      videoBlockId: 'video-block-1',
      file: new File([''], 'test.mp4'),
      status: 'uploading',
      progress: 50
    }

    uploadTasks.set('video-block-1', uploadTask)

    const mockAbort = jest.fn()
    uploadInstanceRefs.current.set('video-block-1', { abort: mockAbort })

    cancelUploadForBlock(videoBlock, dependencies)

    expect(mockAbort).toHaveBeenCalledTimes(1)
    expect(uploadInstanceRefs.current.has('video-block-1')).toBe(false)
    expect(setUploadTasks).toHaveBeenCalled()
    const updateFn = setUploadTasks.mock.calls[0][0]
    const result = updateFn(new Map(uploadTasks))
    expect(result.has('video-block-1')).toBe(false)
  })

  it('should clear polling interval when task has videoId', () => {
    const videoBlock: TreeBlock<VideoBlock> = {
      id: 'video-block-1',
      __typename: 'VideoBlock',
      parentBlockId: 'card1',
      parentOrder: 0,
      startAt: 0,
      endAt: null,
      muted: true,
      autoplay: true,
      fullsize: true,
      action: null,
      videoId: 'video-123',
      videoVariantLanguageId: null,
      source: VideoBlockSource.mux,
      title: null,
      description: null,
      duration: null,
      image: null,
      objectFit: null,
      subtitleLanguage: null,
      showGeneratedSubtitles: null,
      mediaVideo: null,
      posterBlockId: null,
      eventLabel: null,
      endEventLabel: null,
      customizable: null,
      children: []
    }

    const uploadTask: UploadTask = {
      videoBlockId: 'video-block-1',
      file: new File([''], 'test.mp4'),
      status: 'processing',
      progress: 100,
      videoId: 'video-123'
    }

    uploadTasks.set('video-block-1', uploadTask)
    hasShownStartNotification.current.add('video-123')

    cancelUploadForBlock(videoBlock, dependencies)

    expect(mockClearPollingInterval).toHaveBeenCalledTimes(1)
    expect(mockClearPollingInterval).toHaveBeenCalledWith(
      'video-123',
      pollingIntervalsRef
    )
    expect(setPollingTasks).toHaveBeenCalled()
    expect(hasShownStartNotification.current.has('video-123')).toBe(false)
  })

  it('should do nothing when task does not exist', () => {
    const videoBlock: TreeBlock<VideoBlock> = {
      id: 'video-block-1',
      __typename: 'VideoBlock',
      parentBlockId: 'card1',
      parentOrder: 0,
      startAt: 0,
      endAt: null,
      muted: true,
      autoplay: true,
      fullsize: true,
      action: null,
      videoId: null,
      videoVariantLanguageId: null,
      source: VideoBlockSource.mux,
      title: null,
      description: null,
      duration: null,
      image: null,
      objectFit: null,
      subtitleLanguage: null,
      showGeneratedSubtitles: null,
      mediaVideo: null,
      posterBlockId: null,
      eventLabel: null,
      endEventLabel: null,
      customizable: null,
      children: []
    }

    cancelUploadForBlock(videoBlock, dependencies)

    expect(setUploadTasks).not.toHaveBeenCalled()
    expect(mockClearPollingInterval).not.toHaveBeenCalled()
  })

  it('should handle task without upload instance', () => {
    const videoBlock: TreeBlock<VideoBlock> = {
      id: 'video-block-1',
      __typename: 'VideoBlock',
      parentBlockId: 'card1',
      parentOrder: 0,
      startAt: 0,
      endAt: null,
      muted: true,
      autoplay: true,
      fullsize: true,
      action: null,
      videoId: null,
      videoVariantLanguageId: null,
      source: VideoBlockSource.mux,
      title: null,
      description: null,
      duration: null,
      image: null,
      objectFit: null,
      subtitleLanguage: null,
      showGeneratedSubtitles: null,
      mediaVideo: null,
      posterBlockId: null,
      eventLabel: null,
      endEventLabel: null,
      customizable: null,
      children: []
    }

    const uploadTask: UploadTask = {
      videoBlockId: 'video-block-1',
      file: new File([''], 'test.mp4'),
      status: 'waiting',
      progress: 0
    }

    uploadTasks.set('video-block-1', uploadTask)

    cancelUploadForBlock(videoBlock, dependencies)

    expect(setUploadTasks).toHaveBeenCalled()
    const updateFn = setUploadTasks.mock.calls[0][0]
    const result = updateFn(new Map(uploadTasks))
    expect(result.has('video-block-1')).toBe(false)
  })

  it('should handle task without videoId', () => {
    const videoBlock: TreeBlock<VideoBlock> = {
      id: 'video-block-1',
      __typename: 'VideoBlock',
      parentBlockId: 'card1',
      parentOrder: 0,
      startAt: 0,
      endAt: null,
      muted: true,
      autoplay: true,
      fullsize: true,
      action: null,
      videoId: null,
      videoVariantLanguageId: null,
      source: VideoBlockSource.mux,
      title: null,
      description: null,
      duration: null,
      image: null,
      objectFit: null,
      subtitleLanguage: null,
      showGeneratedSubtitles: null,
      mediaVideo: null,
      posterBlockId: null,
      eventLabel: null,
      endEventLabel: null,
      customizable: null,
      children: []
    }

    const uploadTask: UploadTask = {
      videoBlockId: 'video-block-1',
      file: new File([''], 'test.mp4'),
      status: 'uploading',
      progress: 50
    }

    uploadTasks.set('video-block-1', uploadTask)

    cancelUploadForBlock(videoBlock, dependencies)

    expect(mockClearPollingInterval).not.toHaveBeenCalled()
    expect(setPollingTasks).not.toHaveBeenCalled()
  })

  it('should handle StepBlock with no VideoBlocks', () => {
    const stepBlock: TreeBlock<StepBlock> = {
      id: 'step-1',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: []
    }

    cancelUploadForBlock(stepBlock, dependencies)

    expect(setUploadTasks).not.toHaveBeenCalled()
  })
})
