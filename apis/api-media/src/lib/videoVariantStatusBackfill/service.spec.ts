import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Prisma } from '@core/prisma/media/client'

import { prismaMock } from '../../../test/prismaMock'

import { runVideoVariantStatusBackfill } from './service'

type VariantRow = {
  id: string
  videoId: string
  languageId: string
  edition: string
  version: number
  published: boolean
  hls: string | null
  dash: string | null
  share: string | null
  masterUrl: string | null
  duration: number | null
  muxVideoId: string | null
  assetId: string | null
  brightcoveId: string | null
  downloadable: boolean
  downloads: Array<{ id: string }>
  muxVideo: { readyToStream: boolean } | null
  video: { id: string; childIds: string[]; availableLanguages: string[] } | null
}

function variantRow(overrides: Partial<VariantRow> = {}): VariantRow {
  return {
    id: 'variant-1',
    videoId: 'video-1',
    languageId: 'lang-1',
    edition: 'base',
    version: 1,
    published: true,
    hls: 'https://stream.example/a.m3u8',
    dash: null,
    share: null,
    masterUrl: null,
    duration: 120,
    muxVideoId: 'mux-1',
    assetId: null,
    brightcoveId: null,
    downloadable: false,
    downloads: [],
    muxVideo: { readyToStream: true },
    video: { id: 'video-1', childIds: [], availableLanguages: [] },
    ...overrides
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.videoVariantUpload.findMany.mockResolvedValue([])
  prismaMock.video.findMany.mockResolvedValue([])
})

describe('runVideoVariantStatusBackfill', () => {
  it('skips a Variant that already has a canonical record, without writing', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([variantRow()] as never)
    // Call order inside the service is fixed: the canonical-rows lookup
    // fires before the successful-uploads lookup (both start inside the same
    // Promise.all before either resolves).
    prismaMock.videoVariantUpload.findMany
      .mockResolvedValueOnce([
        { canonicalVideoVariantId: 'variant-1' }
      ] as never)
      .mockResolvedValueOnce([] as never)

    const result = await runVideoVariantStatusBackfill({ apply: true })

    expect(result.records).toEqual([
      {
        videoVariantId: 'variant-1',
        action: 'skipAlreadyCanonical',
        applied: false,
        processingStatus: null,
        canonicalSource: null,
        uploadId: null
      }
    ])
    expect(prismaMock.videoVariantUpload.create).not.toHaveBeenCalled()
    expect(prismaMock.videoVariantUpload.update).not.toHaveBeenCalled()
  })

  it('promotes the one unambiguous successful Upload attempt to canonical, leaving its other fields untouched', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([variantRow()] as never)
    prismaMock.videoVariantUpload.findMany
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([
        { id: 'upload-1', videoVariantId: 'variant-1' }
      ] as never)

    const result = await runVideoVariantStatusBackfill({ apply: true })

    expect(result.records).toHaveLength(1)
    expect(result.records[0]).toMatchObject({
      videoVariantId: 'variant-1',
      action: 'promoteExistingUpload',
      applied: true,
      canonicalSource: 'upload',
      uploadId: 'upload-1'
    })
    expect(prismaMock.videoVariantUpload.create).not.toHaveBeenCalled()
    expect(prismaMock.videoVariantUpload.update).toHaveBeenCalledTimes(1)
    const [updateCall] = prismaMock.videoVariantUpload.update.mock.calls
    expect(updateCall[0]).toMatchObject({
      where: { id: 'upload-1' },
      data: {
        canonicalVideoVariantId: 'variant-1',
        canonicalSource: 'upload'
      }
    })
    // Only the canonical/processing fields are set -- no attempt-history
    // field (status, source, errorMessage, etc.) is touched.
    expect(Object.keys(updateCall[0].data)).toEqual([
      'canonicalVideoVariantId',
      'canonicalSource',
      'processingStatus',
      'processingStages'
    ])
  })

  it('creates a synthetic backfill canonical record when no Upload attempt exists', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([
      variantRow({ id: 'variant-2', videoId: 'video-2' })
    ] as never)
    prismaMock.videoVariantUpload.create.mockResolvedValue({
      id: 'synthetic-1'
    } as never)

    const result = await runVideoVariantStatusBackfill({ apply: true })

    expect(result.records[0]).toMatchObject({
      videoVariantId: 'variant-2',
      action: 'createSyntheticCanonical',
      applied: true,
      canonicalSource: 'backfill',
      uploadId: 'synthetic-1'
    })
    expect(prismaMock.videoVariantUpload.update).not.toHaveBeenCalled()
    expect(prismaMock.videoVariantUpload.create).toHaveBeenCalledTimes(1)
    const [createCall] = prismaMock.videoVariantUpload.create.mock.calls
    expect(createCall[0].data).toMatchObject({
      source: 'backfill',
      status: 'variantCreated',
      videoId: 'video-2',
      videoVariantId: 'variant-2',
      canonicalVideoVariantId: 'variant-2',
      canonicalSource: 'backfill'
    })
  })

  it('marks the synthetic record failed (not variantCreated) when the Variant has no usable media', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([
      variantRow({
        id: 'variant-3',
        hls: null,
        duration: null,
        muxVideoId: null,
        muxVideo: null
      })
    ] as never)
    prismaMock.videoVariantUpload.create.mockResolvedValue({
      id: 'synthetic-2'
    } as never)

    await runVideoVariantStatusBackfill({ apply: true })

    const [createCall] = prismaMock.videoVariantUpload.create.mock.calls
    expect(createCall[0].data).toMatchObject({ status: 'failed' })
  })

  it('sets notApplicable media stages for a generated parent Variant', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([
      variantRow({
        id: 'parent-variant-1',
        videoId: 'series-1',
        languageId: '20770',
        hls: null,
        duration: null,
        muxVideoId: null,
        muxVideo: null,
        video: {
          id: 'series-1',
          childIds: ['episode-1'],
          availableLanguages: ['20770']
        }
      })
    ] as never)
    prismaMock.videoVariantUpload.create.mockResolvedValue({
      id: 'synthetic-3'
    } as never)

    await runVideoVariantStatusBackfill({ apply: true })

    const [createCall] = prismaMock.videoVariantUpload.create.mock.calls
    const stages = createCall[0].data.processingStages as Record<
      string,
      { state: string }
    >
    expect(stages.mux.state).toBe('notApplicable')
    expect(stages.downloads.state).toBe('notApplicable')
    expect(stages.parentSync.state).toBe('complete')
    expect(stages.algoliaVideo.state).toBe('unknown')
    expect(stages.algoliaVariant.state).toBe('unknown')
  })

  it('does not write anything in dry-run mode', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([variantRow()] as never)

    const result = await runVideoVariantStatusBackfill({ apply: false })

    expect(result.records[0]).toMatchObject({
      action: 'createSyntheticCanonical',
      applied: false
    })
    expect(prismaMock.videoVariantUpload.create).not.toHaveBeenCalled()
    expect(prismaMock.videoVariantUpload.update).not.toHaveBeenCalled()
  })

  it('treats a concurrent canonical-assignment race as already done, not a failure', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([variantRow()] as never)
    prismaMock.videoVariantUpload.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['canonicalVideoVariantId'] }
      })
    )

    const result = await runVideoVariantStatusBackfill({ apply: true })

    expect(result.records[0]).toMatchObject({
      action: 'skipAlreadyCanonical',
      applied: false
    })
    expect(result.summary.failed).toBe(0)
  })

  it('reports pagination via lastProcessedId and hasMore', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([variantRow()] as never)

    const result = await runVideoVariantStatusBackfill({
      apply: false,
      batchSize: 1
    })

    expect(result.lastProcessedId).toBe('variant-1')
    expect(result.hasMore).toBe(true)
  })

  it('rejects an invalid batch size before querying', async () => {
    await expect(
      runVideoVariantStatusBackfill({ apply: false, batchSize: 0 })
    ).rejects.toThrow(/Invalid batchSize/)
    expect(prismaMock.videoVariant.findMany).not.toHaveBeenCalled()
  })
})
