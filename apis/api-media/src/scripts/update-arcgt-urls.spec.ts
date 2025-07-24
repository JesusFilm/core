import { VideoVariantDownloadQuality } from '.prisma/api-media-client'

const mockPrisma = {
  videoVariantDownload: {
    count: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn()
  },
  $disconnect: jest.fn()
}

jest.mock('../lib/prisma', () => ({
  prisma: mockPrisma
}))

describe('updateArcGtUrls', () => {
  let updateArcGtUrls: any

  beforeAll(async () => {
    const module = await import(
      /* webpackChunkName: "update-arcgt-urls" */ './update-arcgt-urls'
    )
    updateArcGtUrls = module.updateArcGtUrls
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.$disconnect.mockResolvedValue(undefined)
  })

  it('should update URLs from arc.gt to api-v1.arclight.org for distro qualities', async () => {
    // Mock count query
    mockPrisma.videoVariantDownload.count.mockResolvedValue(2)

    // Mock findMany query - this is called in a loop until no more records
    mockPrisma.videoVariantDownload.findMany
      .mockResolvedValueOnce([
        {
          id: 'download1',
          quality: VideoVariantDownloadQuality.distroLow,
          url: 'https://arc.gt/video1.mp4',
          size: 1000,
          height: 720,
          width: 1280,
          bitrate: 2500,
          version: 1,
          assetId: 'asset1',
          videoVariantId: 'variant1'
        },
        {
          id: 'download2',
          quality: VideoVariantDownloadQuality.distroSd,
          url: 'https://arc.gt/video2.mp4',
          size: 500,
          height: 360,
          width: 640,
          bitrate: 1000,
          version: 1,
          assetId: 'asset2',
          videoVariantId: 'variant2'
        }
      ])
      .mockResolvedValueOnce([]) // Empty array to end the loop

    // Mock update
    mockPrisma.videoVariantDownload.update.mockResolvedValue({})

    await updateArcGtUrls()

    // Verify count was called with correct filter
    expect(mockPrisma.videoVariantDownload.count).toHaveBeenCalledWith({
      where: {
        quality: {
          in: [
            VideoVariantDownloadQuality.distroLow,
            VideoVariantDownloadQuality.distroSd,
            VideoVariantDownloadQuality.distroHigh
          ]
        },
        url: {
          startsWith: 'https://arc.gt'
        }
      }
    })

    // Verify findMany was called with correct filter
    expect(mockPrisma.videoVariantDownload.findMany).toHaveBeenCalledWith({
      where: {
        quality: {
          in: [
            VideoVariantDownloadQuality.distroLow,
            VideoVariantDownloadQuality.distroSd,
            VideoVariantDownloadQuality.distroHigh
          ]
        },
        url: {
          startsWith: 'https://arc.gt'
        }
      },
      take: 1000,
      skip: 0,
      orderBy: {
        id: 'asc'
      }
    })

    // Verify update was called for each download with correct URL transformation
    expect(mockPrisma.videoVariantDownload.update).toHaveBeenCalledWith({
      where: { id: 'download1' },
      data: { url: 'https://api-v1.arclight.org/video1.mp4' }
    })

    expect(mockPrisma.videoVariantDownload.update).toHaveBeenCalledWith({
      where: { id: 'download2' },
      data: { url: 'https://api-v1.arclight.org/video2.mp4' }
    })

    expect(mockPrisma.videoVariantDownload.update).toHaveBeenCalledTimes(2)
  })

  it('should handle case when no downloads need updating', async () => {
    // Mock count query to return 0
    mockPrisma.videoVariantDownload.count.mockResolvedValue(0)

    await updateArcGtUrls()

    // Verify count was called
    expect(mockPrisma.videoVariantDownload.count).toHaveBeenCalled()

    // Verify findMany was not called since count is 0
    expect(mockPrisma.videoVariantDownload.findMany).not.toHaveBeenCalled()

    // Verify update was not called
    expect(mockPrisma.videoVariantDownload.update).not.toHaveBeenCalled()
  })

  it('should only target specific qualities', async () => {
    // Mock count query
    mockPrisma.videoVariantDownload.count.mockResolvedValue(1)

    // Mock findMany query with distroHigh quality
    mockPrisma.videoVariantDownload.findMany
      .mockResolvedValueOnce([
        {
          id: 'download3',
          quality: VideoVariantDownloadQuality.distroHigh,
          url: 'https://arc.gt/video3.mp4',
          size: 2000,
          height: 720,
          width: 1280,
          bitrate: 3000,
          version: 1,
          assetId: 'asset3',
          videoVariantId: 'variant3'
        }
      ])
      .mockResolvedValueOnce([]) // Empty array to end the loop

    // Mock update
    mockPrisma.videoVariantDownload.update.mockResolvedValue({})

    await updateArcGtUrls()

    // Verify the quality filter includes only the target qualities
    expect(mockPrisma.videoVariantDownload.count).toHaveBeenCalledWith({
      where: {
        quality: {
          in: [
            VideoVariantDownloadQuality.distroLow,
            VideoVariantDownloadQuality.distroSd,
            VideoVariantDownloadQuality.distroHigh
          ]
        },
        url: {
          startsWith: 'https://arc.gt'
        }
      }
    })
  })

  it('should preserve the path after the domain', async () => {
    // Mock count query
    mockPrisma.videoVariantDownload.count.mockResolvedValue(1)

    // Mock findMany query with complex URL path
    mockPrisma.videoVariantDownload.findMany
      .mockResolvedValueOnce([
        {
          id: 'download4',
          quality: VideoVariantDownloadQuality.distroLow,
          url: 'https://arc.gt/path/to/video/file.mp4?param=value',
          size: 1000,
          height: 240,
          width: 426,
          bitrate: 500,
          version: 1,
          assetId: 'asset4',
          videoVariantId: 'variant4'
        }
      ])
      .mockResolvedValueOnce([]) // Empty array to end the loop

    // Mock update
    mockPrisma.videoVariantDownload.update.mockResolvedValue({})

    await updateArcGtUrls()

    // Verify the URL transformation preserves the path and query parameters
    expect(mockPrisma.videoVariantDownload.update).toHaveBeenCalledWith({
      where: { id: 'download4' },
      data: {
        url: 'https://api-v1.arclight.org/path/to/video/file.mp4?param=value'
      }
    })
  })
})
