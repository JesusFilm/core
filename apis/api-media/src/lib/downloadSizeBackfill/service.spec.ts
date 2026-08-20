import { prismaMock } from '../../../test/prismaMock'

import { runDownloadSizeBackfill } from './service'
import type {
  DownloadCandidate,
  HttpHeadersResult,
  HttpSizeClient,
  MuxAssetFetcher
} from './types'

function makeHeaders(
  overrides: Partial<HttpHeadersResult> = {}
): HttpHeadersResult {
  return {
    ok: true,
    status: 200,
    contentLength: null,
    contentRangeTotal: null,
    ...overrides
  }
}

function unreachableHttpClient(): HttpSizeClient {
  return {
    head: vi.fn().mockRejectedValue(new Error('network error')),
    rangeGet: vi.fn().mockRejectedValue(new Error('network error'))
  }
}

function candidate(overrides: Partial<DownloadCandidate>): DownloadCandidate {
  return {
    id: 'download-1',
    size: null,
    url: 'https://legacy.example.com/file.mp4',
    assetId: null,
    videoVariantId: 'variant-1',
    asset: null,
    videoVariant: { muxVideoId: null, muxVideo: null },
    ...overrides
  }
}

describe('runDownloadSizeBackfill', () => {
  it('selects Downloads with null, zero, or negative size', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([])

    await runDownloadSizeBackfill({ apply: false })

    expect(prismaMock.videoVariantDownload.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ size: null }, { size: { lte: 0 } }]
        })
      })
    )
  })

  it('reports a dry-run candidate as repairable without writing', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      candidate({ id: 'd1', url: 'https://legacy.example.com/a.mp4' })
    ] as any)

    const httpClient = unreachableHttpClient()
    httpClient.head = vi
      .fn()
      .mockResolvedValue(makeHeaders({ contentLength: '243808898' }))

    const result = await runDownloadSizeBackfill({ apply: false, httpClient })

    expect(result.records).toEqual([
      {
        downloadId: 'd1',
        videoVariantId: 'variant-1',
        provider: 'legacy',
        priorSize: null,
        verifiedSize: 243808898,
        outcome: 'repairable',
        errorCode: null
      }
    ])
    expect(result.summary.repairable).toBe(1)
    expect(result.summary.applied).toBe(0)
    expect(prismaMock.videoVariantDownload.updateMany).not.toHaveBeenCalled()
  })

  it('applies a conditional size-only write when a size is resolved', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      candidate({ id: 'd1' })
    ] as any)
    prismaMock.videoVariantDownload.updateMany.mockResolvedValue({
      count: 1
    } as any)

    const httpClient = unreachableHttpClient()
    httpClient.head = vi
      .fn()
      .mockResolvedValue(makeHeaders({ contentLength: '500' }))

    const result = await runDownloadSizeBackfill({ apply: true, httpClient })

    expect(prismaMock.videoVariantDownload.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'd1',
        OR: [{ size: null }, { size: { lte: 0 } }]
      },
      data: { size: 500 }
    })
    expect(result.records[0]).toMatchObject({
      outcome: 'applied',
      verifiedSize: 500
    })
    expect(result.summary.applied).toBe(1)
  })

  it('performs no additional writes when apply runs a second time against the same row', async () => {
    // Models the row's real size in a mutable fixture rather than
    // pre-scripting mock return values, so findMany and updateMany stay
    // consistent with each other the way the actual conditional
    // `OR: [{ size: null }, { size: { lte: 0 } }]` selection would: once
    // the row is fixed, findMany stops returning it as a candidate at all.
    // A selection query that failed to re-exclude a corrected row, or an
    // update that failed to gate on the condition, would make this test
    // fail — a scripted mock-return-value sequence would not catch either.
    const row = { size: null as number | null }

    ;(prismaMock.videoVariantDownload.findMany as any).mockImplementation(
      async () =>
        row.size == null || row.size <= 0
          ? [candidate({ id: 'd1', size: row.size })]
          : []
    )
    ;(prismaMock.videoVariantDownload.updateMany as any).mockImplementation(
      async (args: any) => {
        if (row.size != null && row.size > 0) return { count: 0 }
        row.size = args.data.size
        return { count: 1 }
      }
    )

    const httpClient = unreachableHttpClient()
    httpClient.head = vi
      .fn()
      .mockResolvedValue(makeHeaders({ contentLength: '500' }))

    const first = await runDownloadSizeBackfill({ apply: true, httpClient })
    expect(first.records[0]).toMatchObject({
      outcome: 'applied',
      verifiedSize: 500
    })
    expect(first.summary.applied).toBe(1)
    expect(row.size).toBe(500)

    const second = await runDownloadSizeBackfill({ apply: true, httpClient })

    expect(prismaMock.videoVariantDownload.updateMany).toHaveBeenCalledTimes(1)
    expect(second.records).toEqual([])
    expect(second.summary.totalCandidates).toBe(0)
    expect(second.summary.applied).toBe(0)
  })

  it('records alreadyCorrected without overwriting when the row was corrected concurrently', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      candidate({ id: 'd1' })
    ] as any)
    prismaMock.videoVariantDownload.updateMany.mockResolvedValue({
      count: 0
    } as any)

    const httpClient = unreachableHttpClient()
    httpClient.head = vi
      .fn()
      .mockResolvedValue(makeHeaders({ contentLength: '500' }))

    const result = await runDownloadSizeBackfill({ apply: true, httpClient })

    expect(result.records[0]).toMatchObject({
      outcome: 'alreadyCorrected',
      verifiedSize: 500
    })
    expect(result.summary.alreadyCorrected).toBe(1)
    expect(result.summary.applied).toBe(0)
  })

  it('skips and reports an unreachable legacy URL rather than guessing', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      candidate({ id: 'd1' })
    ] as any)

    const result = await runDownloadSizeBackfill({
      apply: true,
      httpClient: unreachableHttpClient()
    })

    expect(result.records[0]).toEqual({
      downloadId: 'd1',
      videoVariantId: 'variant-1',
      provider: 'legacy',
      priorSize: null,
      verifiedSize: null,
      outcome: 'skipped',
      errorCode: 'httpUnreachable'
    })
    expect(prismaMock.videoVariantDownload.updateMany).not.toHaveBeenCalled()
    expect(result.summary.skipped).toBe(1)
  })

  it('resolves an R2-backed Download from its linked asset content length', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      candidate({
        id: 'd1',
        url: 'https://legacy.example.com/backup.mp4',
        assetId: 'asset-1',
        asset: { contentLength: BigInt(1296505318) }
      })
    ] as any)

    const result = await runDownloadSizeBackfill({
      apply: false,
      httpClient: unreachableHttpClient()
    })

    expect(result.records[0]).toMatchObject({
      provider: 'r2',
      verifiedSize: 1296505318,
      outcome: 'repairable'
    })
  })

  it('resolves a Mux-backed Download from static rendition metadata via the injected fetcher', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      candidate({
        id: 'd1',
        url: 'https://stream.mux.com/playback1/720p.mp4',
        videoVariant: {
          muxVideoId: 'mux-video-1',
          muxVideo: { assetId: 'mux-asset-1' }
        }
      })
    ] as any)

    const muxAssetFetcher: MuxAssetFetcher = {
      getAsset: vi.fn().mockResolvedValue({
        static_renditions: {
          files: [
            { resolution: '720p', filesize: '1296505318', status: 'ready' }
          ]
        }
      })
    }

    const result = await runDownloadSizeBackfill({
      apply: false,
      httpClient: unreachableHttpClient(),
      muxAssetFetcher
    })

    expect(result.records[0]).toMatchObject({
      provider: 'mux',
      verifiedSize: 1296505318,
      outcome: 'repairable'
    })
    expect(muxAssetFetcher.getAsset).toHaveBeenCalledWith('mux-asset-1')
  })

  it('isolates a single row failure without aborting the rest of the batch', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      candidate({
        id: 'failing',
        url: 'https://stream.mux.com/playback1/720p.mp4',
        videoVariant: { muxVideoId: 'mv1', muxVideo: { assetId: 'asset-fail' } }
      }),
      candidate({ id: 'ok', url: 'https://legacy.example.com/ok.mp4' })
    ] as any)

    const httpClient = unreachableHttpClient()
    httpClient.head = vi
      .fn()
      .mockResolvedValue(makeHeaders({ contentLength: '42' }))

    const muxAssetFetcher: MuxAssetFetcher = {
      getAsset: vi.fn().mockRejectedValue(new Error('Mux API unavailable'))
    }

    const result = await runDownloadSizeBackfill({
      apply: false,
      httpClient,
      muxAssetFetcher
    })

    const failing = result.records.find((r) => r.downloadId === 'failing')
    const ok = result.records.find((r) => r.downloadId === 'ok')

    expect(failing).toMatchObject({ outcome: 'failed', errorCode: 'unknown' })
    expect(ok).toMatchObject({ outcome: 'repairable', verifiedSize: 42 })
    expect(result.summary.failed).toBe(1)
    expect(result.summary.repairable).toBe(1)
  })

  it('emits a redacted audit record with no raw URL or credentials', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      candidate({
        id: 'd1',
        url: 'https://legacy.example.com/secret?token=abc'
      })
    ] as any)

    const httpClient = unreachableHttpClient()
    httpClient.head = vi
      .fn()
      .mockResolvedValue(makeHeaders({ contentLength: '10' }))

    const result = await runDownloadSizeBackfill({ apply: false, httpClient })

    expect(Object.keys(result.records[0]).sort()).toEqual(
      [
        'downloadId',
        'videoVariantId',
        'provider',
        'priorSize',
        'verifiedSize',
        'outcome',
        'errorCode'
      ].sort()
    )
    expect(JSON.stringify(result.records[0])).not.toContain('token=abc')
  })

  it('paginates with a stable ID-based cursor and reports resumable progress', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      candidate({ id: 'd5' })
    ] as any)

    const result = await runDownloadSizeBackfill({
      apply: false,
      batchSize: 2,
      startAfterId: 'd4',
      httpClient: unreachableHttpClient()
    })

    expect(prismaMock.videoVariantDownload.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: 'd4' },
        skip: 1,
        take: 2,
        orderBy: { id: 'asc' }
      })
    )
    expect(result.lastProcessedId).toBe('d5')
    // Fewer rows than the batch size means this was the final page.
    expect(result.hasMore).toBe(false)
  })

  it('reports hasMore when a full batch is returned', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      candidate({ id: 'd1' }),
      candidate({ id: 'd2' })
    ] as any)

    const result = await runDownloadSizeBackfill({
      apply: false,
      batchSize: 2,
      httpClient: unreachableHttpClient()
    })

    expect(result.hasMore).toBe(true)
    expect(result.lastProcessedId).toBe('d2')
  })

  it.each([0, -1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects an invalid batch size before querying (%p)',
    async (batchSize) => {
      await expect(
        runDownloadSizeBackfill({ apply: false, batchSize })
      ).rejects.toThrow('Invalid batchSize')

      expect(prismaMock.videoVariantDownload.findMany).not.toHaveBeenCalled()
    }
  )

  it('applies optional filters for focused validation', async () => {
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([])

    await runDownloadSizeBackfill({
      apply: false,
      filters: {
        downloadId: 'd1',
        videoVariantId: 'v1',
        provider: 'mux'
      }
    })

    expect(prismaMock.videoVariantDownload.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'd1',
          videoVariantId: 'v1',
          url: { startsWith: 'https://stream.mux.com/' }
        })
      })
    )
  })
})
