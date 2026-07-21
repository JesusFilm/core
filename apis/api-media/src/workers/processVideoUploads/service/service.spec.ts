import { Job } from 'bullmq'
import { Logger } from 'pino'
import { type Mock, vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'
import { getVideo } from '../../../schema/mux/video/service'
import { jobName as processVideoDownloadsNowJobName } from '../../processVideoDownloads/config'
import { queue as processVideoDownloadsQueue } from '../../processVideoDownloads/queue'

import { ProcessVideoUploadJobData, service } from './service'

vi.mock('../../../schema/mux/video/service', () => ({
  getVideo: vi.fn()
}))

vi.mock('../../processVideoDownloads/queue', () => ({
  queue: {
    add: vi.fn()
  }
}))

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
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
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(async (transaction) => {
      return await transaction(prismaMock)
    })
  })

  it('creates or updates variant when mux video is ready', async () => {
    prismaMock.muxVideo.findUnique.mockResolvedValue({
      id: 'mux-video-id',
      assetId: 'asset-id'
    } as any)
    ;(getVideo as Mock).mockResolvedValue({
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
    prismaMock.videoVariant.update.mockResolvedValue({
      id: 'variant-id'
    } as any)

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
        published: false,
        version: 1
      })
    })
    expect(prismaMock.videoVariantUpload.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        source: 'process-video-upload',
        canonical: true,
        published: true,
        videoVariantId: 'variant-id',
        status: 'processing'
      })
    })
  })

  it('updates an existing variant idempotently and marks the durable upload complete', async () => {
    const uploadJob = {
      data: {
        ...mockJob.data,
        uploadId: 'upload-id'
      }
    } as Job<ProcessVideoUploadJobData>

    prismaMock.muxVideo.findUnique.mockResolvedValue({
      id: 'mux-video-id',
      assetId: 'asset-id'
    } as any)
    ;(getVideo as Mock).mockResolvedValue({
      status: 'ready',
      duration: 120,
      playback_ids: [{ id: 'playback-id', policy: 'public' }]
    })

    prismaMock.muxVideo.update.mockResolvedValue({} as any)
    prismaMock.videoVariantUpload.update.mockResolvedValue({} as any)
    prismaMock.video.findUnique.mockResolvedValue({ slug: 'video-slug' } as any)
    prismaMock.videoVariant.findFirst.mockResolvedValue({
      id: 'variant-id',
      slug: 'variant-slug'
    } as any)
    prismaMock.videoVariant.update.mockResolvedValue({
      id: 'variant-id'
    } as any)

    await service(uploadJob, mockLogger)

    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: 'variant-id' },
      data: expect.objectContaining({
        muxVideoId: 'mux-video-id',
        downloadable: true,
        published: false,
        version: 1
      })
    })
    expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledWith({
      where: { id: 'upload-id' },
      data: { status: 'muxReady', errorMessage: null }
    })
    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledWith({
      where: { id: 'upload-id' },
      data: {
        status: 'variantCreated',
        videoVariantId: 'variant-id',
        errorMessage: null
      }
    })
  })

  it('marks the durable upload failed when final variant creation fails', async () => {
    const uploadJob = {
      data: {
        ...mockJob.data,
        uploadId: 'upload-id'
      }
    } as Job<ProcessVideoUploadJobData>
    const variantError = new Error('variant update failed')

    prismaMock.muxVideo.findUnique.mockResolvedValue({
      id: 'mux-video-id',
      assetId: 'asset-id'
    } as any)
    ;(getVideo as Mock).mockResolvedValue({
      status: 'ready',
      duration: 120,
      playback_ids: [{ id: 'playback-id', policy: 'public' }]
    })

    prismaMock.muxVideo.update.mockResolvedValue({} as any)
    prismaMock.videoVariantUpload.update.mockResolvedValue({} as any)
    prismaMock.video.findUnique.mockResolvedValue({ slug: 'video-slug' } as any)
    prismaMock.videoVariant.findFirst.mockResolvedValue({
      id: 'variant-id',
      slug: 'variant-slug'
    } as any)
    prismaMock.videoVariant.update.mockRejectedValue(variantError)

    await expect(service(uploadJob, mockLogger)).rejects.toThrow(
      'variant update failed'
    )

    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledWith({
      where: { id: 'upload-id' },
      data: {
        status: 'failed',
        errorMessage: 'variant update failed'
      }
    })
  })

  it('logs and stops when mux video processing errored', async () => {
    prismaMock.muxVideo.findUnique.mockResolvedValue({
      id: 'mux-video-id',
      assetId: 'asset-id'
    } as any)
    ;(getVideo as Mock).mockResolvedValue({
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
        finalStatus: 'errored',
        uploadId: undefined
      },
      'Video upload processing failed due to Mux error'
    )
    expect(prismaMock.muxVideo.update).not.toHaveBeenCalled()
    expect(processVideoDownloadsQueue.add).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
  })

  it('marks the durable upload failed when Mux rejects the asset id', async () => {
    const uploadJob = {
      data: {
        ...mockJob.data,
        uploadId: 'upload-id'
      }
    } as Job<ProcessVideoUploadJobData>

    prismaMock.muxVideo.findUnique.mockResolvedValue({
      id: 'mux-video-id',
      assetId: 'invalid-asset-id'
    } as any)
    prismaMock.videoVariantUpload.findUnique.mockResolvedValue({
      id: 'upload-id',
      muxNonStandardInputDetectedAt: null
    } as any)
    ;(getVideo as Mock).mockRejectedValue(
      new Error(
        '400 {"error":{"type":"invalid_parameters","messages":["Failed to parse ID"]}}'
      )
    )
    prismaMock.videoVariantUpload.update.mockResolvedValue({} as any)

    await service(uploadJob, mockLogger)

    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledWith({
      where: { id: 'upload-id' },
      data: {
        status: 'failed',
        errorMessage: 'Mux video processing errored'
      }
    })
    expect(processVideoDownloadsQueue.add).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
  })

  it('marks the upload when Mux reports non-standard input reasons', async () => {
    const uploadJob = {
      data: {
        ...mockJob.data,
        uploadId: 'upload-id'
      }
    } as Job<ProcessVideoUploadJobData>

    prismaMock.muxVideo.findUnique.mockResolvedValue({
      id: 'mux-video-id',
      assetId: 'asset-id'
    } as any)
    prismaMock.videoVariantUpload.findUnique.mockResolvedValue({
      id: 'upload-id',
      muxNonStandardInputDetectedAt: null
    } as any)
    ;(getVideo as Mock).mockResolvedValue({
      status: 'errored',
      playback_ids: [],
      non_standard_input_reasons: { video_codec: 'hevc' }
    })
    prismaMock.videoVariantUpload.update.mockResolvedValue({} as any)

    await service(uploadJob, mockLogger)

    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledWith({
      where: { id: 'upload-id' },
      data: { muxNonStandardInputDetectedAt: expect.any(Date) }
    })
    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledWith({
      where: { id: 'upload-id' },
      data: {
        status: 'failed',
        errorMessage: 'Mux video processing errored'
      }
    })
  })

  it('does not mark the upload when Mux reports standard input', async () => {
    const uploadJob = {
      data: {
        ...mockJob.data,
        uploadId: 'upload-id'
      }
    } as Job<ProcessVideoUploadJobData>

    prismaMock.muxVideo.findUnique.mockResolvedValue({
      id: 'mux-video-id',
      assetId: 'asset-id'
    } as any)
    prismaMock.videoVariantUpload.findUnique.mockResolvedValue({
      id: 'upload-id',
      muxNonStandardInputDetectedAt: null
    } as any)
    ;(getVideo as Mock).mockResolvedValue({
      status: 'errored',
      playback_ids: []
    })
    prismaMock.videoVariantUpload.update.mockResolvedValue({} as any)

    await service(uploadJob, mockLogger)

    const nonStandardUpdateCalls =
      prismaMock.videoVariantUpload.update.mock.calls.filter(([call]) =>
        Object.prototype.hasOwnProperty.call(
          call.data,
          'muxNonStandardInputDetectedAt'
        )
      )
    expect(nonStandardUpdateCalls).toHaveLength(0)
  })

  it('does not rewrite an upload already marked as Mux non-standard input', async () => {
    const uploadJob = {
      data: {
        ...mockJob.data,
        uploadId: 'upload-id'
      }
    } as Job<ProcessVideoUploadJobData>

    prismaMock.muxVideo.findUnique.mockResolvedValue({
      id: 'mux-video-id',
      assetId: 'asset-id'
    } as any)
    prismaMock.videoVariantUpload.findUnique.mockResolvedValue({
      id: 'upload-id',
      muxNonStandardInputDetectedAt: new Date('2026-06-18T00:00:00.000Z')
    } as any)
    ;(getVideo as Mock).mockResolvedValue({
      status: 'errored',
      playback_ids: [],
      non_standard_input_reasons: { video_codec: 'hevc' }
    })
    prismaMock.videoVariantUpload.update.mockResolvedValue({} as any)

    await service(uploadJob, mockLogger)

    const nonStandardUpdateCalls =
      prismaMock.videoVariantUpload.update.mock.calls.filter(([call]) =>
        Object.prototype.hasOwnProperty.call(
          call.data,
          'muxNonStandardInputDetectedAt'
        )
      )
    expect(nonStandardUpdateCalls).toHaveLength(0)
  })
})
