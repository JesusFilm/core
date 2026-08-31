import { type Mock, vi } from 'vitest'

import { VideoVariantDownloadQuality } from '@core/prisma/media/client'

import { prismaMock } from '../../test/prismaMock'
import {
  createDownloadsFromMuxAsset,
  previewMuxDownloadsFromAsset
} from '../lib/downloads'
import { videoVariantCacheReset } from '../lib/videoCacheReset'
import { getVideo } from '../schema/mux/video/service'

import { processDownloads } from './mux-videos'

vi.mock('../schema/mux/video/service', () => ({
  getVideo: vi.fn()
}))

vi.mock('../lib/downloads', async () => {
  const actual =
    await vi.importActual<typeof import('../lib/downloads')>('../lib/downloads')
  return {
    ...actual,
    createDownloadsFromMuxAsset: vi.fn(),
    previewMuxDownloadsFromAsset: vi.fn()
  }
})

vi.mock('../lib/videoCacheReset', () => ({
  videoVariantCacheReset: vi.fn()
}))

const mockedGetVideo = getVideo as unknown as Mock
const mockedCreateDownloadsFromMuxAsset =
  createDownloadsFromMuxAsset as unknown as Mock
const mockedPreviewMuxDownloadsFromAsset =
  previewMuxDownloadsFromAsset as unknown as Mock
const mockedVideoVariantCacheReset = videoVariantCacheReset as unknown as Mock

function download(
  overrides: Partial<{
    id: string
    videoVariantId: string
    quality: VideoVariantDownloadQuality
    size: number | null
    bitrate: number | null
    muxVideoAssetId: string | null
  }> = {}
): any {
  const videoVariantId = overrides.videoVariantId ?? 'variant-1'
  return {
    id: overrides.id ?? `download-${videoVariantId}`,
    videoVariantId,
    quality: overrides.quality ?? VideoVariantDownloadQuality.high,
    size: overrides.size ?? 0,
    bitrate: overrides.bitrate ?? 0,
    url: 'https://stream.mux.com/playbackId/720p.mp4',
    videoVariant: {
      id: videoVariantId,
      muxVideo:
        overrides.muxVideoAssetId === null
          ? null
          : {
              id: `mux-${videoVariantId}`,
              assetId: overrides.muxVideoAssetId ?? `asset-${videoVariantId}`
            }
    }
  }
}

const readyMuxVideoAsset = {
  status: 'ready',
  playback_ids: [{ id: 'playbackId' }],
  static_renditions: {
    files: [{ resolution: '720p', status: 'ready' }]
  }
}

// processVariant() waits 1.5s between Mux calls to avoid rate limiting;
// fake timers keep tests fast without weakening what's under test.
async function runProcessDownloads(): Promise<void> {
  const result = processDownloads()
  await vi.runAllTimersAsync()
  await result
}

describe('processDownloads', () => {
  const originalApply = process.env.MUX_DOWNLOAD_BACKFILL_APPLY
  const originalSampleSize = process.env.MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE
  const originalMaxQualityCount =
    process.env.MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT
  const originalVideoIdPrefixes =
    process.env.MUX_DOWNLOAD_BACKFILL_VIDEO_ID_PREFIXES

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    delete process.env.MUX_DOWNLOAD_BACKFILL_APPLY
    delete process.env.MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE
    delete process.env.MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT
    delete process.env.MUX_DOWNLOAD_BACKFILL_VIDEO_ID_PREFIXES
    ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValue([])
    ;(prismaMock.$queryRaw as unknown as Mock).mockResolvedValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  afterAll(() => {
    if (originalApply == null) delete process.env.MUX_DOWNLOAD_BACKFILL_APPLY
    else process.env.MUX_DOWNLOAD_BACKFILL_APPLY = originalApply
    if (originalSampleSize == null)
      delete process.env.MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE
    else process.env.MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE = originalSampleSize
    if (originalMaxQualityCount == null)
      delete process.env.MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT
    else
      process.env.MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT =
        originalMaxQualityCount
    if (originalVideoIdPrefixes == null)
      delete process.env.MUX_DOWNLOAD_BACKFILL_VIDEO_ID_PREFIXES
    else
      process.env.MUX_DOWNLOAD_BACKFILL_VIDEO_ID_PREFIXES =
        originalVideoIdPrefixes
  })

  it('throws for a non-positive sample size', async () => {
    process.env.MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE = '0'

    await expect(processDownloads()).rejects.toThrow(
      'MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE must be a positive integer'
    )
    expect(prismaMock.videoVariantDownload.findMany).not.toHaveBeenCalled()
  })

  it('throws for a non-positive max quality count', async () => {
    process.env.MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT = '0'

    await expect(processDownloads()).rejects.toThrow(
      'MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT must be a positive integer'
    )
    expect(prismaMock.videoVariantDownload.findMany).not.toHaveBeenCalled()
  })

  it('queries only non-distro Mux downloads with null/zero size or bitrate', async () => {
    await runProcessDownloads()

    expect(prismaMock.videoVariantDownload.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          quality: {
            notIn: [
              VideoVariantDownloadQuality.distroLow,
              VideoVariantDownloadQuality.distroSd,
              VideoVariantDownloadQuality.distroHigh
            ]
          },
          videoVariantId: { not: null },
          url: { startsWith: 'https://stream.mux.com' },
          OR: [{ size: null }, { size: 0 }, { bitrate: null }, { bitrate: 0 }]
        }
      })
    )
  })

  it('groups multiple bad download rows for the same variant into a single getVideo call', async () => {
    ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValueOnce([
      download({
        id: 'd1',
        quality: VideoVariantDownloadQuality.low
      }),
      download({
        id: 'd2',
        quality: VideoVariantDownloadQuality.high
      })
    ])
    mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
    mockedPreviewMuxDownloadsFromAsset.mockReturnValue([])

    await runProcessDownloads()

    expect(mockedGetVideo).toHaveBeenCalledTimes(1)
    expect(mockedGetVideo).toHaveBeenCalledWith('asset-variant-1', false)
  })

  it('skips a variant whose Mux video has no assetId, without calling Mux', async () => {
    ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValueOnce([
      download({ muxVideoAssetId: null })
    ])

    await runProcessDownloads()

    expect(mockedGetVideo).not.toHaveBeenCalled()
    expect(mockedCreateDownloadsFromMuxAsset).not.toHaveBeenCalled()
  })

  it('does not persist anything in preview mode, only previews replacements', async () => {
    ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValueOnce([
      download()
    ])
    mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
    mockedPreviewMuxDownloadsFromAsset.mockReturnValue([
      {
        quality: VideoVariantDownloadQuality.high,
        size: 12345,
        bitrate: 6789
      }
    ])

    await runProcessDownloads()

    expect(mockedPreviewMuxDownloadsFromAsset).toHaveBeenCalledWith({
      variantId: 'variant-1',
      muxVideoAsset: readyMuxVideoAsset
    })
    expect(mockedCreateDownloadsFromMuxAsset).not.toHaveBeenCalled()
  })

  it('persists refreshed metadata when apply mode is enabled', async () => {
    process.env.MUX_DOWNLOAD_BACKFILL_APPLY = 'true'
    ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValueOnce([
      download()
    ])
    mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
    mockedCreateDownloadsFromMuxAsset.mockResolvedValue(1)

    await runProcessDownloads()

    expect(mockedCreateDownloadsFromMuxAsset).toHaveBeenCalledWith({
      variantId: 'variant-1',
      muxVideoAsset: readyMuxVideoAsset
    })
    expect(mockedPreviewMuxDownloadsFromAsset).not.toHaveBeenCalled()
    expect(mockedVideoVariantCacheReset).toHaveBeenCalledWith('variant-1')
  })

  it('does not reset the cache when apply mode writes no download rows', async () => {
    process.env.MUX_DOWNLOAD_BACKFILL_APPLY = 'true'
    ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValueOnce([
      download()
    ])
    mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
    mockedCreateDownloadsFromMuxAsset.mockResolvedValue(0)

    await runProcessDownloads()

    expect(mockedVideoVariantCacheReset).not.toHaveBeenCalled()
  })

  it('does not reset the cache in preview mode', async () => {
    ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValueOnce([
      download()
    ])
    mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
    mockedPreviewMuxDownloadsFromAsset.mockReturnValue([])

    await runProcessDownloads()

    expect(mockedVideoVariantCacheReset).not.toHaveBeenCalled()
  })

  it('skips a variant whose Mux asset is not ready to store downloads', async () => {
    ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValueOnce([
      download()
    ])
    mockedGetVideo.mockResolvedValue({
      status: 'preparing',
      playback_ids: [{ id: 'playbackId' }],
      static_renditions: { files: [{ resolution: '720p', status: 'ready' }] }
    })

    await runProcessDownloads()

    expect(mockedCreateDownloadsFromMuxAsset).not.toHaveBeenCalled()
    expect(mockedPreviewMuxDownloadsFromAsset).not.toHaveBeenCalled()
  })

  it('isolates a Mux API failure for one variant so other variants still get processed', async () => {
    ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValueOnce([
      download({ videoVariantId: 'variant-1' }),
      download({ videoVariantId: 'variant-2' })
    ])
    mockedGetVideo.mockImplementation(async (assetId: string) => {
      if (assetId === 'asset-variant-1') throw new Error('Mux API error')
      return readyMuxVideoAsset
    })
    mockedPreviewMuxDownloadsFromAsset.mockReturnValue([])

    await runProcessDownloads()

    expect(mockedGetVideo).toHaveBeenCalledTimes(2)
    expect(mockedGetVideo).toHaveBeenCalledWith('asset-variant-2', false)
  })

  it('stops once the sample size is reached without processing further variants', async () => {
    process.env.MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE = '1'
    ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValueOnce([
      download({ videoVariantId: 'variant-1' }),
      download({ videoVariantId: 'variant-2' })
    ])
    mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
    mockedPreviewMuxDownloadsFromAsset.mockReturnValue([])

    await runProcessDownloads()

    expect(mockedGetVideo).toHaveBeenCalledTimes(1)
    expect(mockedGetVideo).toHaveBeenCalledWith('asset-variant-1', false)
  })

  it('carries a variant split across a full page into the next page instead of processing it incomplete', async () => {
    process.env.MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE = '10'
    // take = max(100, sampleSize*5) = 100 for a sample size of 10.
    // A full page ending mid-variant: rows 0-49 belong to variant-1,
    // rows 50-99 belong to variant-2. Since the page is full
    // (length === take), the trailing variant-2 rows must be deferred to
    // the next page rather than processed against a possibly-incomplete
    // set of that variant's bad downloads.
    const page1 = [
      ...Array.from({ length: 50 }, (_, i) =>
        download({ id: `v1-${i}`, videoVariantId: 'variant-1' })
      ),
      ...Array.from({ length: 50 }, (_, i) =>
        download({ id: `v2-${i}`, videoVariantId: 'variant-2' })
      )
    ]
    ;(prismaMock.videoVariantDownload.findMany as Mock)
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce([])
    mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
    mockedPreviewMuxDownloadsFromAsset.mockReturnValue([])

    await runProcessDownloads()

    expect(prismaMock.videoVariantDownload.findMany).toHaveBeenCalledTimes(2)
    const secondCallArgs = (prismaMock.videoVariantDownload.findMany as Mock)
      .mock.calls[1][0]
    expect(secondCallArgs.cursor).toEqual({ id: 'v2-49' })
    expect(secondCallArgs.skip).toBe(1)

    // Both variants are still processed exactly once each, despite the split.
    expect(mockedGetVideo).toHaveBeenCalledTimes(2)
    expect(mockedGetVideo).toHaveBeenCalledWith('asset-variant-1', false)
    expect(mockedGetVideo).toHaveBeenCalledWith('asset-variant-2', false)
  })

  describe('missing download rows pass', () => {
    function variant(id: string): any {
      return { id, muxVideo: { id: `mux-${id}`, assetId: `asset-${id}` } }
    }

    it('processes variants with a muxVideoId but no matching download rows, which the zero-metadata query cannot see', async () => {
      ;(prismaMock.$queryRaw as unknown as Mock)
        .mockResolvedValueOnce([{ id: 'variant-missing' }])
        .mockResolvedValueOnce([])
      ;(prismaMock.videoVariant.findMany as Mock).mockResolvedValueOnce([
        variant('variant-missing')
      ])
      mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
      mockedPreviewMuxDownloadsFromAsset.mockReturnValue([])

      await runProcessDownloads()

      expect(mockedGetVideo).toHaveBeenCalledWith(
        'asset-variant-missing',
        false
      )
    })

    it('persists newly created rows in apply mode for a variant discovered only by the missing-rows pass', async () => {
      process.env.MUX_DOWNLOAD_BACKFILL_APPLY = 'true'
      ;(prismaMock.$queryRaw as unknown as Mock)
        .mockResolvedValueOnce([{ id: 'variant-missing' }])
        .mockResolvedValueOnce([])
      ;(prismaMock.videoVariant.findMany as Mock).mockResolvedValueOnce([
        variant('variant-missing')
      ])
      mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
      mockedCreateDownloadsFromMuxAsset.mockResolvedValue(1)

      await runProcessDownloads()

      expect(mockedCreateDownloadsFromMuxAsset).toHaveBeenCalledWith({
        variantId: 'variant-missing',
        muxVideoAsset: readyMuxVideoAsset
      })
    })

    it('stops issuing missing-rows queries once the sample size is exhausted by the zero-metadata pass', async () => {
      process.env.MUX_DOWNLOAD_BACKFILL_SAMPLE_SIZE = '1'
      ;(prismaMock.videoVariantDownload.findMany as Mock).mockResolvedValueOnce(
        [download({ videoVariantId: 'variant-1' })]
      )
      mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
      mockedPreviewMuxDownloadsFromAsset.mockReturnValue([])

      await runProcessDownloads()

      expect(prismaMock.$queryRaw).not.toHaveBeenCalled()
    })

    it('paginates through multiple batches using the last id as the next cursor', async () => {
      // A full page (length === take, default take = 200) signals there may
      // be more, so the next query must use the last id from this page as
      // its cursor.
      const fullPage = Array.from({ length: 200 }, (_, i) => ({
        id: `variant-${String(i).padStart(3, '0')}`
      }))
      ;(prismaMock.$queryRaw as unknown as Mock)
        .mockResolvedValueOnce(fullPage)
        .mockResolvedValueOnce([])
      ;(prismaMock.videoVariant.findMany as Mock).mockResolvedValue(
        fullPage.map((candidate) => variant(candidate.id))
      )
      mockedGetVideo.mockResolvedValue(readyMuxVideoAsset)
      mockedPreviewMuxDownloadsFromAsset.mockReturnValue([])

      await runProcessDownloads()

      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(2)
      const secondCallValues = (prismaMock.$queryRaw as unknown as Mock).mock
        .calls[1]
      expect(secondCallValues).toContain('variant-199')
    })

    it('uses MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT as the discovery query threshold when set', async () => {
      process.env.MUX_DOWNLOAD_BACKFILL_MAX_QUALITY_COUNT = '5'
      ;(prismaMock.$queryRaw as unknown as Mock).mockResolvedValueOnce([])

      await runProcessDownloads()

      const call = (prismaMock.$queryRaw as unknown as Mock).mock.calls[0]
      expect(call).toContain(5)
      expect(call).not.toContain(7)
    })

    it('scopes the discovery query by MUX_DOWNLOAD_BACKFILL_VIDEO_ID_PREFIXES when set', async () => {
      process.env.MUX_DOWNLOAD_BACKFILL_VIDEO_ID_PREFIXES = '1_,MAG'
      ;(prismaMock.$queryRaw as unknown as Mock).mockResolvedValueOnce([])

      await runProcessDownloads()

      const call = (prismaMock.$queryRaw as unknown as Mock).mock.calls[0]
      expect(JSON.stringify(call)).toContain('1_')
      expect(JSON.stringify(call)).toContain('MAG')
    })

    it('omits the prefix filter entirely when MUX_DOWNLOAD_BACKFILL_VIDEO_ID_PREFIXES is unset', async () => {
      ;(prismaMock.$queryRaw as unknown as Mock).mockResolvedValueOnce([])

      await runProcessDownloads()

      const call = (prismaMock.$queryRaw as unknown as Mock).mock.calls[0]
      expect(JSON.stringify(call)).not.toContain('LEFT(v."videoId"')
    })
  })
})
