import { VideoVariantDownloadQuality } from '.prisma/api-media-client'

import { prismaMock } from '../../test/prismaMock'

import { copyToDistroDownloads } from './copy-distro-downloads'

describe('copyToDistroDownloads', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should copy low quality downloads to distroLow', async () => {
    // Mock count query
    prismaMock.videoVariantDownload.count.mockResolvedValue(1)

    // Mock findMany query
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      {
        id: 'download1',
        quality: VideoVariantDownloadQuality.low,
        size: 1000,
        height: 720,
        width: 1280,
        bitrate: 2500,
        version: 1,
        url: 'https://example.com/video.mp4',
        assetId: 'asset1',
        videoVariantId: 'variant1'
      }
    ])

    // Mock createMany
    prismaMock.videoVariantDownload.createMany.mockResolvedValue({ count: 1 })

    await copyToDistroDownloads()

    // Verify count was called
    expect(prismaMock.videoVariantDownload.count).toHaveBeenCalledWith({
      where: {
        quality: {
          in: [
            VideoVariantDownloadQuality.low,
            VideoVariantDownloadQuality.sd,
            VideoVariantDownloadQuality.high
          ]
        }
      }
    })

    // Verify findMany was called
    expect(prismaMock.videoVariantDownload.findMany).toHaveBeenCalledWith({
      where: {
        quality: {
          in: [
            VideoVariantDownloadQuality.low,
            VideoVariantDownloadQuality.sd,
            VideoVariantDownloadQuality.high
          ]
        }
      },
      take: 1000,
      skip: 0,
      orderBy: {
        id: 'asc'
      }
    })

    // Verify createMany was called with correct data
    expect(prismaMock.videoVariantDownload.createMany).toHaveBeenCalledWith({
      data: [
        {
          quality: VideoVariantDownloadQuality.distroLow,
          size: 1000,
          height: 720,
          width: 1280,
          bitrate: 2500,
          version: 1,
          url: 'https://example.com/video.mp4',
          assetId: 'asset1',
          videoVariantId: 'variant1'
        }
      ],
      skipDuplicates: true
    })
  })

  it('should copy sd quality downloads to distroSd', async () => {
    // Mock count query
    prismaMock.videoVariantDownload.count.mockResolvedValue(1)

    // Mock findMany query
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      {
        id: 'download2',
        quality: VideoVariantDownloadQuality.sd,
        size: 500,
        height: 360,
        width: 640,
        bitrate: 1000,
        version: 1,
        url: 'https://example.com/video-sd.mp4',
        assetId: 'asset2',
        videoVariantId: 'variant2'
      }
    ])

    // Mock createMany
    prismaMock.videoVariantDownload.createMany.mockResolvedValue({ count: 1 })

    await copyToDistroDownloads()

    // Verify createMany was called with correct distroSd data
    expect(prismaMock.videoVariantDownload.createMany).toHaveBeenCalledWith({
      data: [
        {
          quality: VideoVariantDownloadQuality.distroSd,
          size: 500,
          height: 360,
          width: 640,
          bitrate: 1000,
          version: 1,
          url: 'https://example.com/video-sd.mp4',
          assetId: 'asset2',
          videoVariantId: 'variant2'
        }
      ],
      skipDuplicates: true
    })
  })

  it('should copy high quality downloads to both distroHigh and highest', async () => {
    // Mock count query
    prismaMock.videoVariantDownload.count.mockResolvedValue(1)

    // Mock findMany query
    prismaMock.videoVariantDownload.findMany.mockResolvedValue([
      {
        id: 'download3',
        quality: VideoVariantDownloadQuality.high,
        size: 2000,
        height: 1080,
        width: 1920,
        bitrate: 5000,
        version: 1,
        url: 'https://example.com/video-hd.mp4',
        assetId: 'asset3',
        videoVariantId: 'variant3'
      }
    ])

    // Mock createMany
    prismaMock.videoVariantDownload.createMany.mockResolvedValue({ count: 1 })

    await copyToDistroDownloads()

    // Verify createMany was called with both distroHigh and highest data
    expect(prismaMock.videoVariantDownload.createMany).toHaveBeenCalledWith({
      data: [
        {
          quality: VideoVariantDownloadQuality.distroHigh,
          size: 2000,
          height: 1080,
          width: 1920,
          bitrate: 5000,
          version: 1,
          url: 'https://example.com/video-hd.mp4',
          assetId: 'asset3',
          videoVariantId: 'variant3'
        },
        {
          quality: VideoVariantDownloadQuality.highest,
          size: 2000,
          height: 1080,
          width: 1920,
          bitrate: 5000,
          version: 1,
          url: 'https://example.com/video-hd.mp4',
          assetId: 'asset3',
          videoVariantId: 'variant3'
        }
      ],
      skipDuplicates: true
    })
  })

  it('should handle empty result set', async () => {
    // Mock count query to return 0
    prismaMock.videoVariantDownload.count.mockResolvedValue(0)

    await copyToDistroDownloads()

    // Verify that only count was called, not findMany
    expect(prismaMock.videoVariantDownload.count).toHaveBeenCalled()
    expect(prismaMock.videoVariantDownload.findMany).not.toHaveBeenCalled()
    expect(prismaMock.videoVariantDownload.createMany).not.toHaveBeenCalled()
  })

  it('should process multiple batches correctly', async () => {
    // Mock count query to return 2500 (more than batch size of 1000)
    prismaMock.videoVariantDownload.count.mockResolvedValue(2500)

    // Mock findMany to return different batches
    prismaMock.videoVariantDownload.findMany
      .mockResolvedValueOnce([
        {
          id: 'download1',
          quality: VideoVariantDownloadQuality.low,
          size: 1000,
          height: 720,
          width: 1280,
          bitrate: 2500,
          version: 1,
          url: 'https://example.com/video1.mp4',
          assetId: 'asset1',
          videoVariantId: 'variant1'
        }
      ])
      .mockResolvedValueOnce([
        {
          id: 'download2',
          quality: VideoVariantDownloadQuality.sd,
          size: 500,
          height: 360,
          width: 640,
          bitrate: 1000,
          version: 1,
          url: 'https://example.com/video2.mp4',
          assetId: 'asset2',
          videoVariantId: 'variant2'
        }
      ])
      .mockResolvedValueOnce([])

    // Mock createMany
    prismaMock.videoVariantDownload.createMany.mockResolvedValue({ count: 1 })

    await copyToDistroDownloads()

    // Verify findMany was called multiple times with correct skip values
    expect(prismaMock.videoVariantDownload.findMany).toHaveBeenCalledTimes(3)
    expect(prismaMock.videoVariantDownload.findMany).toHaveBeenNthCalledWith(
      1,
      {
        where: {
          quality: {
            in: [
              VideoVariantDownloadQuality.low,
              VideoVariantDownloadQuality.sd,
              VideoVariantDownloadQuality.high
            ]
          }
        },
        take: 1000,
        skip: 0,
        orderBy: {
          id: 'asc'
        }
      }
    )
    expect(prismaMock.videoVariantDownload.findMany).toHaveBeenNthCalledWith(
      2,
      {
        where: {
          quality: {
            in: [
              VideoVariantDownloadQuality.low,
              VideoVariantDownloadQuality.sd,
              VideoVariantDownloadQuality.high
            ]
          }
        },
        take: 1000,
        skip: 1,
        orderBy: {
          id: 'asc'
        }
      }
    )

    // Verify createMany was called twice (once per batch)
    expect(prismaMock.videoVariantDownload.createMany).toHaveBeenCalledTimes(2)
  })
})
