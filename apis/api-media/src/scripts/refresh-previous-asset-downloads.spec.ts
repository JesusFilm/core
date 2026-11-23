import { type Mock, vi } from 'vitest'

import { prismaMock } from '../../test/prismaMock'
import {
  createDownloadsFromMuxAsset,
  previewMuxDownloadsFromAsset
} from '../lib/downloads'
import { videoVariantCacheReset } from '../lib/videoCacheReset'
import { getVideo } from '../schema/mux/video/service'

import { refreshPreviousAssetDownloads } from './refresh-previous-asset-downloads'

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

const readyAsset = {
  status: 'ready',
  playback_ids: [{ id: 'current-playback-id' }],
  static_renditions: {
    files: [{ resolution: '720p', status: 'ready' }]
  }
}

describe('refreshPreviousAssetDownloads', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$queryRaw.mockResolvedValue([
      {
        variantId: 'variant-1',
        assetId: 'current-asset-id',
        playbackId: 'current-playback-id'
      }
    ])
    mockedGetVideo.mockResolvedValue(readyAsset)
    mockedPreviewMuxDownloadsFromAsset.mockReturnValue([])
  })

  it('changes nothing without --apply', async () => {
    const summary = await refreshPreviousAssetDownloads({
      apply: false,
      delayMs: 0
    })

    expect(summary).toEqual({ found: 1, refreshed: 0, skipped: 0 })
    expect(mockedGetVideo).toHaveBeenCalledWith('current-asset-id', false)
    expect(mockedPreviewMuxDownloadsFromAsset).toHaveBeenCalled()
    expect(mockedCreateDownloadsFromMuxAsset).not.toHaveBeenCalled()
    expect(mockedVideoVariantCacheReset).not.toHaveBeenCalled()
  })

  it('repoints downloads from the current asset and resets the cache with --apply', async () => {
    mockedCreateDownloadsFromMuxAsset.mockResolvedValue(2)

    const summary = await refreshPreviousAssetDownloads({
      apply: true,
      delayMs: 0
    })

    expect(summary).toEqual({ found: 1, refreshed: 1, skipped: 0 })
    expect(mockedCreateDownloadsFromMuxAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        variantId: 'variant-1',
        muxVideoAsset: readyAsset
      })
    )
    expect(mockedVideoVariantCacheReset).toHaveBeenCalledWith('variant-1')
  })

  it('skips a variant whose Mux asset no longer streams the recorded playback ID', async () => {
    mockedGetVideo.mockResolvedValue({
      ...readyAsset,
      playback_ids: [{ id: 'another-playback-id' }]
    })

    const summary = await refreshPreviousAssetDownloads({
      apply: true,
      delayMs: 0
    })

    expect(summary).toEqual({ found: 1, refreshed: 0, skipped: 1 })
    expect(mockedCreateDownloadsFromMuxAsset).not.toHaveBeenCalled()
  })
})
