import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prismaMock } from '../../../../test/prismaMock'
import { getVideo } from '../../../schema/mux/video/service'
import { jobName as processVideoDownloadsNowJobName } from '../../processVideoDownloads/config'
import { queue as processVideoDownloadsQueue } from '../../processVideoDownloads/queue'

import { ProcessVideoUploadJobData, service } from './service'

jest.mock('../../../schema/mux/video/service', () => ({
  getVideo: jest.fn()
}))

jest.mock('../../processVideoDownloads/queue', () => ({
  queue: {
    add: jest.fn()
  }
}))

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as unknown as Logger

const mockJob = {
  data: {
    videoId: 'video-id',
    edition: 'standard',
    languageId: '529',
    version: 1,
    muxVideoId: 'mux-video-id',
    metadata: {
      durationMs: 120000,
      duration: 120,
      width: 1920,
      height: 1080
    },
    originalFilename: 'test.mp4'
  }
} as Job<ProcessVideoUploadJobData>

describe('processVideoUploads service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates or updates variant when mux video is ready', async () => {
    prismaMock.muxVideo.findUnique.mockResolvedValue({
      id: 'mux-video-id',
      assetId: 'asset-id'
    } as any)
    ;(getVideo as jest.Mock).mockResolvedValue({
      status: 'ready',
      duration: 120,
      playback_ids: [{ id: 'playback-id', policy: 'public' }]
    })

    prismaMock.muxVideo.update.mockResolvedValue({} as any)
    prismaMock.video.findUnique.mockResolvedValue({ slug: 'video-slug' } as any)
    prismaMock.videoVariant.findFirst.mockResolvedValue({
      id: 'variant-id',
      slug: 'variant-slug'
    } as any)
    prismaMock.videoVariant.update.mockResolvedValue({} as any)

    await service(mockJob, mockLogger)

    expect(getVideo).toHaveBeenCalledWith('asset-id', false)
    expect(prismaMock.muxVideo.update).toHaveBeenCalledWith({
      where: { id: 'mux-video-id' },
      data: {
        playbackId: 'playback-id',
        readyToStream: true,
        duration: 120,
        downloadable: true
      }
    })
    expect(processVideoDownloadsQueue.add).toHaveBeenCalledWith(
      processVideoDownloadsNowJobName,
      {
        videoId: 'mux-video-id',
        assetId: 'asset-id',
        isUserGenerated: false
      },
      {
        jobId: 'download:mux-video-id',
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: { age: 432000, count: 50 }
      }
    )
    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: 'variant-id' },
      data: expect.objectContaining({
        muxVideoId: 'mux-video-id',
        downloadable: true,
        published: true,
        version: 1
      })
    })
  })

  it('logs and stops when mux video processing errored', async () => {
    prismaMock.muxVideo.findUnique.mockResolvedValue({
      id: 'mux-video-id',
      assetId: 'asset-id'
    } as any)
    ;(getVideo as jest.Mock).mockResolvedValue({
      status: 'errored',
      playback_ids: []
    })

    await service(mockJob, mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      { muxVideoId: 'mux-video-id', assetId: 'asset-id', status: 'errored' },
      'Mux video processing errored'
    )
    expect(mockLogger.error).toHaveBeenCalledWith(
      {
        videoId: 'video-id',
        muxVideoId: 'mux-video-id',
        finalStatus: 'errored'
      },
      'Video upload processing failed due to Mux error'
    )
    expect(prismaMock.muxVideo.update).not.toHaveBeenCalled()
    expect(processVideoDownloadsQueue.add).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
  })
})
