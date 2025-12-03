import type { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '@core/journeys/ui/block/__generated__/BlockFields'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { findBlocksByTypename } from '../../../../libs/findBlocksByTypename'
import { clearPollingInterval } from '../clearPollingInterval'
import type { UploadTask } from '../types'

import { cancelUploadForBlock } from './cancelUploadForBlock'

jest.mock('../clearPollingInterval')
jest.mock('../../../../libs/findBlocksByTypename')

const mockClearPollingInterval = clearPollingInterval as jest.MockedFunction<
  typeof clearPollingInterval
>
const mockFindBlocksByTypename = findBlocksByTypename as jest.MockedFunction<
  typeof findBlocksByTypename
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

  describe('VideoBlock', () => {
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
  })

  describe('StepBlock', () => {
    it('should cancel upload for all VideoBlocks in StepBlock', () => {
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

      const videoBlock1: TreeBlock<VideoBlock> = {
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
        children: []
      }

      const videoBlock2: TreeBlock<VideoBlock> = {
        id: 'video-block-2',
        __typename: 'VideoBlock',
        parentBlockId: 'card2',
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
        children: []
      }

      mockFindBlocksByTypename.mockReturnValue([videoBlock1, videoBlock2])

      const uploadTask1: UploadTask = {
        videoBlockId: 'video-block-1',
        file: new File([''], 'test1.mp4'),
        status: 'uploading',
        progress: 50
      }

      const uploadTask2: UploadTask = {
        videoBlockId: 'video-block-2',
        file: new File([''], 'test2.mp4'),
        status: 'uploading',
        progress: 75
      }

      uploadTasks.set('video-block-1', uploadTask1)
      uploadTasks.set('video-block-2', uploadTask2)

      const mockAbort1 = jest.fn()
      const mockAbort2 = jest.fn()
      uploadInstanceRefs.current.set('video-block-1', { abort: mockAbort1 })
      uploadInstanceRefs.current.set('video-block-2', { abort: mockAbort2 })

      cancelUploadForBlock(stepBlock, dependencies)

      expect(mockFindBlocksByTypename).toHaveBeenCalledWith(
        stepBlock,
        'VideoBlock'
      )
      expect(mockAbort1).toHaveBeenCalledTimes(1)
      expect(mockAbort2).toHaveBeenCalledTimes(1)
      expect(setUploadTasks).toHaveBeenCalled()
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

      mockFindBlocksByTypename.mockReturnValue([])

      cancelUploadForBlock(stepBlock, dependencies)

      expect(mockFindBlocksByTypename).toHaveBeenCalledWith(
        stepBlock,
        'VideoBlock'
      )
      expect(setUploadTasks).not.toHaveBeenCalled()
    })

    it('should handle StepBlock with VideoBlocks that have videoIds', () => {
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
        children: []
      }

      mockFindBlocksByTypename.mockReturnValue([videoBlock])

      const uploadTask: UploadTask = {
        videoBlockId: 'video-block-1',
        file: new File([''], 'test.mp4'),
        status: 'processing',
        progress: 100,
        videoId: 'video-123'
      }

      uploadTasks.set('video-block-1', uploadTask)
      hasShownStartNotification.current.add('video-123')

      cancelUploadForBlock(stepBlock, dependencies)

      expect(mockClearPollingInterval).toHaveBeenCalledWith(
        'video-123',
        pollingIntervalsRef
      )
      expect(hasShownStartNotification.current.has('video-123')).toBe(false)
    })
  })

  describe('other block types', () => {
    it('should do nothing for non-VideoBlock and non-StepBlock', () => {
      const otherBlock = {
        id: 'other-block-1',
        __typename: 'CardBlock',
        children: []
      } as unknown as TreeBlock

      cancelUploadForBlock(otherBlock, dependencies)

      expect(mockFindBlocksByTypename).not.toHaveBeenCalled()
      expect(setUploadTasks).not.toHaveBeenCalled()
      expect(mockClearPollingInterval).not.toHaveBeenCalled()
    })
  })
})
