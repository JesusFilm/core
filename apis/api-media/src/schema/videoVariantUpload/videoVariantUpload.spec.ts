import { type Mock, vi } from 'vitest'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { queue as processVideoUploadsQueue } from '../../workers/processVideoUploads/queue'
import { createVideoFromUrl } from '../mux/video/service'

vi.mock('../mux/video/service', async () => ({
  ...(await vi.importActual('../mux/video/service')),
  createVideoFromUrl: vi.fn().mockResolvedValue({ id: 'mux-asset-id' }),
  getMaxResolutionValue: vi.fn().mockReturnValue('2160p')
}))

vi.mock('../../workers/processVideoUploads/queue', () => ({
  queue: {
    add: vi.fn().mockResolvedValue({ id: 'job-id' })
  }
}))

vi.mock('../../lib/algolia/algoliaVideoUpdate', () => ({
  updateVideoInAlgolia: vi.fn()
}))

vi.mock('../../lib/algolia/algoliaVideoVariantUpdate', () => ({
  updateVideoVariantInAlgolia: vi.fn()
}))

vi.mock('../../lib/videoCacheReset', () => ({
  videoCacheReset: vi.fn(),
  videoVariantCacheReset: vi.fn()
}))

vi.mock('../../lib/slack', () => ({
  notifyMediaSlackOfOperationFailure: vi.fn()
}))

describe('videoVariantUpload lifecycle API', () => {
  const publisherClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentRoles: ['publisher'],
      currentUser: {
        id: 'user-id'
      }
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createVideoFromUrl as Mock).mockResolvedValue({ id: 'mux-asset-id' })
    ;(prismaMock.userMediaRole.findUnique as Mock).mockResolvedValue({
      id: 'role-id',
      userId: 'testUserId',
      roles: ['publisher']
    })
    ;(processVideoUploadsQueue.add as Mock).mockResolvedValue({ id: 'job-id' })
  })

  it('starts and records a durable upload row', async () => {
    const START_UPLOAD = graphql(`
      mutation StartVideoVariantUpload($input: VideoVariantUploadStartInput!) {
        videoVariantUploadStart(input: $input) {
          id
          source
          sourceKey
          status
          videoId
          edition
          languageId
          version
          published
          originalFilename
          contentType
          contentLength
          duration
          durationMs
          width
          height
          r2AssetId
        }
      }
    `)

    prismaMock.videoVariantUpload.create.mockResolvedValue({
      id: 'upload-id',
      source: 'videos-admin',
      sourceKey: 'trace-id',
      status: 'created',
      videoId: 'video-id',
      edition: 'base',
      languageId: '529',
      version: 1,
      published: false,
      originalFilename: 'video.mp4',
      contentType: 'video/mp4',
      contentLength: BigInt(123),
      duration: 10,
      durationMs: 10000,
      width: 1920,
      height: 1080,
      r2AssetId: null,
      muxVideoId: null,
      videoVariantId: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any)

    const result = await publisherClient({
      document: START_UPLOAD,
      variables: {
        input: {
          source: 'videos-admin',
          sourceKey: 'trace-id',
          videoId: 'video-id',
          edition: 'base',
          languageId: '529',
          version: 1,
          published: false,
          originalFilename: 'video.mp4',
          contentType: 'video/mp4',
          contentLength: 123,
          duration: 10,
          durationMs: 10000,
          width: 1920,
          height: 1080
        }
      } as any
    })

    expect(result).toHaveProperty('data.videoVariantUploadStart', {
      id: 'upload-id',
      source: 'videos-admin',
      sourceKey: 'trace-id',
      status: 'created',
      videoId: 'video-id',
      edition: 'base',
      languageId: '529',
      version: 1,
      published: false,
      originalFilename: 'video.mp4',
      contentType: 'video/mp4',
      contentLength: 123,
      duration: 10,
      durationMs: 10000,
      width: 1920,
      height: 1080,
      r2AssetId: null
    })
    expect(prismaMock.videoVariantUpload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          source: 'videos-admin',
          sourceKey: 'trace-id',
          status: 'created',
          published: false
        })
      })
    )
  })

  it('marks an upload as R2 uploaded only when a linked R2 public URL exists', async () => {
    const MARK_R2_COMPLETE = graphql(`
      mutation MarkVideoVariantUploadR2Complete($id: ID!) {
        videoVariantUploadMarkR2Complete(id: $id) {
          id
          status
          errorMessage
        }
      }
    `)

    prismaMock.videoVariantUpload.findUnique.mockResolvedValue({
      id: 'upload-id',
      r2AssetId: 'r2-id',
      r2Asset: { id: 'r2-id', publicUrl: 'https://cdn.example.com/video.mp4' }
    } as any)
    prismaMock.videoVariantUpload.update.mockResolvedValue({
      id: 'upload-id',
      status: 'r2Uploaded',
      errorMessage: null,
      source: 'videos-admin',
      sourceKey: null,
      videoId: 'video-id',
      edition: 'base',
      languageId: '529',
      version: 1,
      published: true,
      originalFilename: null,
      contentType: null,
      contentLength: null,
      duration: null,
      durationMs: null,
      width: null,
      height: null,
      r2AssetId: 'r2-id',
      muxVideoId: null,
      videoVariantId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any)

    const result = await publisherClient({
      document: MARK_R2_COMPLETE,
      variables: { id: 'upload-id' }
    })

    expect(result).toHaveProperty('data.videoVariantUploadMarkR2Complete', {
      id: 'upload-id',
      status: 'r2Uploaded',
      errorMessage: null
    })
    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'upload-id' },
        data: { status: 'r2Uploaded', errorMessage: null }
      })
    )
  })

  it('queries uploads by video, language, edition, and status for admin', async () => {
    const UPLOADS_QUERY = graphql(`
      query VideoVariantUploads($input: VideoVariantUploadsFilter) {
        videoVariantUploads(input: $input) {
          id
          status
          videoId
          languageId
          edition
        }
      }
    `)

    prismaMock.videoVariantUpload.findMany.mockResolvedValue([
      {
        id: 'upload-id',
        status: 'failed',
        videoId: 'video-id',
        languageId: '529',
        edition: 'base'
      }
    ] as any)

    const result = await publisherClient({
      document: UPLOADS_QUERY,
      variables: {
        input: {
          status: 'failed',
          videoId: 'video-id',
          languageId: '529',
          edition: 'base'
        }
      } as any
    })

    expect(result).toHaveProperty('data.videoVariantUploads', [
      {
        id: 'upload-id',
        status: 'failed',
        videoId: 'video-id',
        languageId: '529',
        edition: 'base'
      }
    ])
    expect(prismaMock.videoVariantUpload.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'failed',
          videoId: 'video-id',
          languageId: '529',
          edition: 'base'
        })
      })
    )
  })

  it('queries uploads by multiple statuses for admin recovery views', async () => {
    const UPLOADS_QUERY = graphql(`
      query VideoVariantUploads($input: VideoVariantUploadsFilter) {
        videoVariantUploads(input: $input) {
          id
          status
        }
      }
    `)

    prismaMock.videoVariantUpload.findMany.mockResolvedValue([
      { id: 'upload-id', status: 'failed' }
    ] as any)

    await publisherClient({
      document: UPLOADS_QUERY,
      variables: {
        input: {
          videoId: 'video-id',
          statuses: ['r2Uploaded', 'muxCreated', 'failed']
        }
      } as any
    })

    expect(prismaMock.videoVariantUpload.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['r2Uploaded', 'muxCreated', 'failed'] },
          videoId: 'video-id'
        })
      })
    )
  })

  it('creates Mux from a completed R2 asset and queues worker processing', async () => {
    const CREATE_MUX = graphql(`
      mutation CreateVideoVariantUploadMux($id: ID!) {
        videoVariantUploadCreateMux(id: $id) {
          id
          status
          muxVideoId
        }
      }
    `)

    prismaMock.videoVariantUpload.findUnique.mockResolvedValueOnce({
      id: 'upload-id',
      videoId: 'video-id',
      edition: 'base',
      languageId: '529',
      version: 1,
      originalFilename: 'video.mp4',
      durationMs: 10000,
      duration: 10,
      width: 1920,
      height: 1080,
      muxVideoId: null,
      r2AssetId: 'r2-id',
      r2Asset: {
        id: 'r2-id',
        publicUrl: 'https://cdn.example.com/video.mp4'
      }
    } as any)
    prismaMock.muxVideo.create.mockResolvedValue({
      id: 'mux-id',
      assetId: 'mux-asset-id'
    } as any)
    prismaMock.videoVariantUpload.update.mockResolvedValue({
      id: 'upload-id',
      videoId: 'video-id',
      edition: 'base',
      languageId: '529',
      version: 1,
      originalFilename: 'video.mp4',
      durationMs: 10000,
      duration: 10,
      width: 1920,
      height: 1080,
      muxVideoId: 'mux-id',
      status: 'muxCreated'
    } as any)
    prismaMock.videoVariantUpload.findUniqueOrThrow.mockResolvedValue({
      id: 'upload-id',
      status: 'muxCreated',
      muxVideoId: 'mux-id'
    } as any)

    const result = await publisherClient({
      document: CREATE_MUX,
      variables: { id: 'upload-id' }
    })

    expect(result).toHaveProperty('data.videoVariantUploadCreateMux', {
      id: 'upload-id',
      status: 'muxCreated',
      muxVideoId: 'mux-id'
    })
    expect(createVideoFromUrl).toHaveBeenCalledWith(
      'https://cdn.example.com/video.mp4',
      false,
      '2160p',
      true
    )
    expect(prismaMock.muxVideo.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        assetId: 'mux-asset-id',
        userId: 'testUserId',
        uploadUrl: 'https://cdn.example.com/video.mp4',
        uploadId: 'r2-id',
        downloadable: true
      })
    })
    expect(processVideoUploadsQueue.add).toHaveBeenCalledWith(
      'api-media-process-video-uploads-job',
      expect.objectContaining({
        uploadId: 'upload-id',
        muxVideoId: 'mux-id',
        videoId: 'video-id',
        languageId: '529'
      }),
      expect.objectContaining({ jobId: 'mux:mux-id' })
    )
  })

  it('resumes an R2-uploaded upload by creating Mux and queueing processing', async () => {
    const RESUME_UPLOAD = graphql(`
      mutation ResumeVideoVariantUpload($id: ID!) {
        videoVariantUploadResume(id: $id) {
          id
          status
          muxVideoId
        }
      }
    `)

    prismaMock.videoVariantUpload.findUnique
      .mockResolvedValueOnce({
        id: 'upload-id',
        status: 'r2Uploaded',
        videoId: 'video-id',
        edition: 'base',
        languageId: '529',
        version: 1,
        originalFilename: 'video.mp4',
        durationMs: 10000,
        duration: 10,
        width: 1920,
        height: 1080,
        muxVideoId: null,
        muxVideo: null,
        r2AssetId: 'r2-id'
      } as any)
      .mockResolvedValueOnce({
        id: 'upload-id',
        status: 'r2Uploaded',
        videoId: 'video-id',
        edition: 'base',
        languageId: '529',
        version: 1,
        originalFilename: 'video.mp4',
        durationMs: 10000,
        duration: 10,
        width: 1920,
        height: 1080,
        muxVideoId: null,
        muxVideo: null,
        r2AssetId: 'r2-id',
        r2Asset: {
          id: 'r2-id',
          publicUrl: 'https://cdn.example.com/video.mp4'
        }
      } as any)
    prismaMock.muxVideo.create.mockResolvedValue({
      id: 'mux-id',
      assetId: 'mux-asset-id'
    } as any)
    prismaMock.videoVariantUpload.update.mockResolvedValue({
      id: 'upload-id',
      videoId: 'video-id',
      edition: 'base',
      languageId: '529',
      version: 1,
      originalFilename: 'video.mp4',
      durationMs: 10000,
      duration: 10,
      width: 1920,
      height: 1080,
      muxVideoId: 'mux-id',
      status: 'muxCreated'
    } as any)
    prismaMock.videoVariantUpload.findUniqueOrThrow.mockResolvedValue({
      id: 'upload-id',
      status: 'muxCreated',
      muxVideoId: 'mux-id'
    } as any)

    const result = await publisherClient({
      document: RESUME_UPLOAD,
      variables: { id: 'upload-id' }
    })

    expect(result).toHaveProperty('data.videoVariantUploadResume', {
      id: 'upload-id',
      status: 'muxCreated',
      muxVideoId: 'mux-id'
    })
    expect(createVideoFromUrl).toHaveBeenCalledWith(
      'https://cdn.example.com/video.mp4',
      false,
      '2160p',
      true
    )
    expect(processVideoUploadsQueue.add).toHaveBeenCalledWith(
      'api-media-process-video-uploads-job',
      expect.objectContaining({ uploadId: 'upload-id', muxVideoId: 'mux-id' }),
      expect.objectContaining({ jobId: 'mux:mux-id' })
    )
  })

  it('resumes a failed upload without Mux by recreating Mux from linked R2', async () => {
    const RESUME_UPLOAD = graphql(`
      mutation ResumeVideoVariantUpload($id: ID!) {
        videoVariantUploadResume(id: $id) {
          id
          status
          muxVideoId
        }
      }
    `)

    prismaMock.videoVariantUpload.findUnique
      .mockResolvedValueOnce({
        id: 'upload-id',
        status: 'failed',
        videoId: 'video-id',
        edition: 'base',
        languageId: '529',
        version: 1,
        originalFilename: 'video.mp4',
        durationMs: 10000,
        duration: 10,
        width: 1920,
        height: 1080,
        muxVideoId: null,
        muxVideo: null,
        r2AssetId: 'r2-id'
      } as any)
      .mockResolvedValueOnce({
        id: 'upload-id',
        status: 'failed',
        videoId: 'video-id',
        edition: 'base',
        languageId: '529',
        version: 1,
        originalFilename: 'video.mp4',
        durationMs: 10000,
        duration: 10,
        width: 1920,
        height: 1080,
        muxVideoId: null,
        muxVideo: null,
        r2AssetId: 'r2-id',
        r2Asset: {
          id: 'r2-id',
          publicUrl: 'https://cdn.example.com/video.mp4'
        }
      } as any)
    prismaMock.muxVideo.create.mockResolvedValue({ id: 'mux-id' } as any)
    prismaMock.videoVariantUpload.update.mockResolvedValue({
      id: 'upload-id',
      status: 'muxCreated',
      muxVideoId: 'mux-id',
      videoId: 'video-id',
      edition: 'base',
      languageId: '529',
      version: 1,
      originalFilename: 'video.mp4',
      durationMs: 10000,
      duration: 10,
      width: 1920,
      height: 1080
    } as any)
    prismaMock.videoVariantUpload.findUniqueOrThrow.mockResolvedValue({
      id: 'upload-id',
      status: 'muxCreated',
      muxVideoId: 'mux-id'
    } as any)

    await publisherClient({
      document: RESUME_UPLOAD,
      variables: { id: 'upload-id' }
    })

    expect(prismaMock.muxVideo.create).toHaveBeenCalled()
    expect(processVideoUploadsQueue.add).toHaveBeenCalled()
  })

  it('marks upload failed when re-queueing an existing Mux upload fails', async () => {
    const CREATE_MUX = graphql(`
      mutation CreateVideoVariantUploadMux($id: ID!) {
        videoVariantUploadCreateMux(id: $id) {
          id
          status
        }
      }
    `)

    prismaMock.videoVariantUpload.findUnique.mockResolvedValue({
      id: 'upload-id',
      status: 'muxCreated',
      videoId: 'video-id',
      edition: 'base',
      languageId: '529',
      version: 1,
      originalFilename: 'video.mp4',
      durationMs: null,
      duration: null,
      width: null,
      height: null,
      muxVideoId: 'mux-id',
      r2AssetId: 'r2-id',
      r2Asset: {
        id: 'r2-id',
        publicUrl: 'https://cdn.example.com/video.mp4'
      }
    } as any)
    prismaMock.videoVariantUpload.update.mockResolvedValue({} as any)

    const result = await publisherClient({
      document: CREATE_MUX,
      variables: { id: 'upload-id' }
    })

    expect(result).toHaveProperty('errors')
    expect(processVideoUploadsQueue.add).not.toHaveBeenCalled()
    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledWith({
      where: { id: 'upload-id' },
      data: {
        status: 'failed',
        errorMessage: 'Upload is missing required metadata'
      }
    })
  })

  it('marks upload failed when resume re-queue fails after muxCreated reset', async () => {
    const RESUME_UPLOAD = graphql(`
      mutation ResumeVideoVariantUpload($id: ID!) {
        videoVariantUploadResume(id: $id) {
          id
          status
        }
      }
    `)

    prismaMock.videoVariantUpload.findUnique.mockResolvedValue({
      id: 'upload-id',
      status: 'failed',
      videoId: 'video-id',
      edition: 'base',
      languageId: '529',
      version: 1,
      published: true,
      originalFilename: 'video.mp4',
      durationMs: null,
      duration: null,
      width: null,
      height: null,
      muxVideoId: 'mux-id',
      muxVideo: {
        id: 'mux-id',
        readyToStream: false,
        playbackId: null
      }
    } as any)
    prismaMock.videoVariantUpload.update.mockResolvedValue({} as any)

    const result = await publisherClient({
      document: RESUME_UPLOAD,
      variables: { id: 'upload-id' }
    })

    expect(result).toHaveProperty('errors')
    expect(processVideoUploadsQueue.add).not.toHaveBeenCalled()
    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledWith({
      where: { id: 'upload-id' },
      data: { status: 'muxCreated', errorMessage: null }
    })
    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledWith({
      where: { id: 'upload-id' },
      data: {
        status: 'failed',
        errorMessage: 'Upload is missing required metadata'
      }
    })
  })

  it('resumes a ready Mux upload by creating the final video variant', async () => {
    const RESUME_UPLOAD = graphql(`
      mutation ResumeVideoVariantUpload($id: ID!) {
        videoVariantUploadResume(id: $id) {
          id
          status
          videoVariantId
        }
      }
    `)

    prismaMock.videoVariantUpload.findUnique.mockResolvedValueOnce({
      id: 'upload-id',
      status: 'muxCreated',
      videoId: 'video-id',
      edition: 'base',
      languageId: '529',
      version: 1,
      published: true,
      durationMs: 10000,
      duration: 10,
      width: 1920,
      height: 1080,
      muxVideoId: 'mux-id',
      muxVideo: {
        id: 'mux-id',
        readyToStream: true,
        playbackId: 'playback-id'
      }
    } as any)
    prismaMock.video.findUnique
      .mockResolvedValueOnce({ slug: 'video-slug' } as any)
      .mockResolvedValueOnce({ availableLanguages: [] } as any)
    prismaMock.video.findMany.mockResolvedValue([] as any)
    prismaMock.videoVariant.findFirst.mockResolvedValue({
      id: 'variant-id',
      slug: 'video-slug/en'
    } as any)
    prismaMock.videoVariant.update.mockResolvedValue({
      id: 'variant-id'
    } as any)
    prismaMock.videoVariantUpload.update.mockResolvedValue({} as any)
    prismaMock.videoVariantUpload.findUniqueOrThrow.mockResolvedValue({
      id: 'upload-id',
      status: 'variantCreated',
      videoVariantId: 'variant-id'
    } as any)

    const result = await publisherClient({
      document: RESUME_UPLOAD,
      variables: { id: 'upload-id' }
    })

    expect(result).toHaveProperty('data.videoVariantUploadResume', {
      id: 'upload-id',
      status: 'variantCreated',
      videoVariantId: 'variant-id'
    })
    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: 'variant-id' },
      data: expect.objectContaining({ muxVideoId: 'mux-id' })
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'video-id' },
      data: { availableLanguages: { set: ['529'] } }
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

  it('rejects resume for uploads where the browser file upload did not complete', async () => {
    const RESUME_UPLOAD = graphql(`
      mutation ResumeVideoVariantUpload($id: ID!) {
        videoVariantUploadResume(id: $id) {
          id
          status
        }
      }
    `)

    prismaMock.videoVariantUpload.findUnique.mockResolvedValue({
      id: 'upload-id',
      status: 'r2Prepared',
      muxVideo: null
    } as any)

    const result = await publisherClient({
      document: RESUME_UPLOAD,
      variables: { id: 'upload-id' }
    })

    expect(result).toHaveProperty('data', null)
    expect((result as any).errors?.[0].message).toContain(
      'This upload cannot be resumed because the browser file upload did not complete'
    )
    expect(createVideoFromUrl).not.toHaveBeenCalled()
  })
})
