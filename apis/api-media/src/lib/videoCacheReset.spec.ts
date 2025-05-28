import fetch from 'node-fetch'

import { cache } from '../yoga'

import { prisma } from './prisma'
import { videoCacheReset, videoVariantCacheReset } from './videoCacheReset'

// Mock dependencies
jest.mock('node-fetch')
jest.mock('../yoga', () => ({
  cache: {
    invalidate: jest.fn()
  }
}))
jest.mock('./prisma', () => ({
  prisma: {
    video: {
      findUnique: jest.fn()
    },
    videoVariant: {
      findUnique: jest.fn()
    }
  }
}))

describe('videoCacheReset', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.WATCH_URL = 'https://watch.example.com'
    process.env.WATCH_REVALIDATE_SECRET = 'test-secret'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should call fetch and invalidate cache for valid video id', async () => {
    const videoId = 'test-video-id'
    const slug = 'test-video-slug'

    // Since we're only using select: { slug: true } in the function,
    // we can use a type assertion to simplify
    jest.mocked(prisma.video.findUnique).mockResolvedValueOnce({ slug } as any)

    await videoCacheReset(videoId)

    expect(prisma.video.findUnique).toHaveBeenCalledWith({
      where: { id: videoId },
      select: { slug: true }
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://watch.example.com/api/revalidate?secret=test-secret',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `/watch/${encodeURIComponent(slug)}.html/english.html`
        })
      }
    )

    expect(cache.invalidate).toHaveBeenCalledWith([
      { typename: 'Video', id: videoId }
    ])
  })

  it('should not call fetch or invalidate cache if video not found', async () => {
    const videoId = 'non-existent-video-id'

    jest.mocked(prisma.video.findUnique).mockResolvedValueOnce(null)

    await videoCacheReset(videoId)

    expect(prisma.video.findUnique).toHaveBeenCalledWith({
      where: { id: videoId },
      select: { slug: true }
    })

    expect(mockFetch).not.toHaveBeenCalled()
    expect(cache.invalidate).not.toHaveBeenCalled()
  })

  it('should not call fetch if env vars are not set', async () => {
    const videoId = 'test-video-id'
    const slug = 'test-video-slug'

    process.env.WATCH_URL = undefined
    process.env.WATCH_REVALIDATE_SECRET = undefined

    jest.mocked(prisma.video.findUnique).mockResolvedValueOnce({ slug } as any)

    await videoCacheReset(videoId)

    expect(prisma.video.findUnique).toHaveBeenCalledWith({
      where: { id: videoId },
      select: { slug: true }
    })

    expect(mockFetch).not.toHaveBeenCalled()
    expect(cache.invalidate).toHaveBeenCalledWith([
      { typename: 'Video', id: videoId }
    ])
  })

  it('should continue if fetch fails', async () => {
    const videoId = 'test-video-id'
    const slug = 'test-video-slug'

    jest.mocked(prisma.video.findUnique).mockResolvedValueOnce({ slug } as any)

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await videoCacheReset(videoId)

    expect(mockFetch).toHaveBeenCalled()
    expect(cache.invalidate).toHaveBeenCalledWith([
      { typename: 'Video', id: videoId }
    ])
  })

  it('should handle invalidate failure gracefully', async () => {
    const videoId = 'test-video-id'
    const slug = 'test-video-slug'

    jest.mocked(prisma.video.findUnique).mockResolvedValueOnce({ slug } as any)

    jest
      .mocked(cache.invalidate)
      .mockRejectedValueOnce(new Error('Cache error'))

    await expect(videoCacheReset(videoId)).resolves.not.toThrow()

    expect(mockFetch).toHaveBeenCalled()
    expect(cache.invalidate).toHaveBeenCalled()
  })
})

describe('videoVariantCacheReset', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.WATCH_URL = 'https://watch.example.com'
    process.env.WATCH_REVALIDATE_SECRET = 'test-secret'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should call fetch and invalidate cache for valid variant id', async () => {
    const variantId = 'test-variant-id'
    const slug = 'test-variant-slug/english'

    // Since we're only using select: { slug: true } in the function,
    // we can use a type assertion to simplify
    jest
      .mocked(prisma.videoVariant.findUnique)
      .mockResolvedValueOnce({ slug } as any)

    await videoVariantCacheReset(variantId)

    expect(prisma.videoVariant.findUnique).toHaveBeenCalledWith({
      where: { id: variantId },
      select: { slug: true }
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://watch.example.com/api/revalidate?secret=test-secret',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `/watch/test-variant-slug.html/english.html`
        })
      }
    )

    expect(cache.invalidate).toHaveBeenCalledWith([
      { typename: 'VideoVariant', id: variantId }
    ])
  })

  it('should not call fetch or invalidate cache if variant not found', async () => {
    const variantId = 'non-existent-variant-id'

    jest.mocked(prisma.videoVariant.findUnique).mockResolvedValueOnce(null)

    await videoVariantCacheReset(variantId)

    expect(prisma.videoVariant.findUnique).toHaveBeenCalledWith({
      where: { id: variantId },
      select: { slug: true }
    })

    expect(mockFetch).not.toHaveBeenCalled()
    expect(cache.invalidate).not.toHaveBeenCalled()
  })

  it('should not call fetch if env vars are not set', async () => {
    const variantId = 'test-variant-id'
    const slug = 'test-variant-slug'

    process.env.WATCH_URL = undefined
    process.env.WATCH_REVALIDATE_SECRET = undefined

    jest
      .mocked(prisma.videoVariant.findUnique)
      .mockResolvedValueOnce({ slug } as any)

    await videoVariantCacheReset(variantId)

    expect(prisma.videoVariant.findUnique).toHaveBeenCalledWith({
      where: { id: variantId },
      select: { slug: true }
    })

    expect(mockFetch).not.toHaveBeenCalled()
    expect(cache.invalidate).toHaveBeenCalledWith([
      { typename: 'VideoVariant', id: variantId }
    ])
  })

  it('should continue if fetch fails', async () => {
    const variantId = 'test-variant-id'
    const slug = 'test-variant-slug'

    jest
      .mocked(prisma.videoVariant.findUnique)
      .mockResolvedValueOnce({ slug } as any)

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await videoVariantCacheReset(variantId)

    expect(mockFetch).toHaveBeenCalled()
    expect(cache.invalidate).toHaveBeenCalledWith([
      { typename: 'VideoVariant', id: variantId }
    ])
  })

  it('should handle invalidate failure gracefully', async () => {
    const variantId = 'test-variant-id'
    const slug = 'test-variant-slug'

    jest
      .mocked(prisma.videoVariant.findUnique)
      .mockResolvedValueOnce({ slug } as any)

    jest
      .mocked(cache.invalidate)
      .mockRejectedValueOnce(new Error('Cache error'))

    await expect(videoVariantCacheReset(variantId)).resolves.not.toThrow()

    expect(mockFetch).toHaveBeenCalled()
    expect(cache.invalidate).toHaveBeenCalled()
  })
})
