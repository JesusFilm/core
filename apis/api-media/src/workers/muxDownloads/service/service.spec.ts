import { Logger } from 'pino'

import { prismaMock } from '../../../../test/prismaMock'
import { getStaticRenditions } from '../../../schema/mux/video/service'

import { service } from './service'

// Mock the getStaticRenditions function
jest.mock('../../../schema/mux/video/service', () => ({
  getStaticRenditions: jest.fn()
}))

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
} as unknown as Logger

describe('muxDownloads service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock setTimeout to avoid delays in tests
    jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback()
      return {} as NodeJS.Timeout
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should update download sizes from Mux static renditions', async () => {
    // Mock video variants with missing download sizes
    prismaMock.videoVariant.findMany.mockResolvedValue([
      {
        id: 'variant-1',
        muxVideo: {
          assetId: 'mux-asset-1'
        },
        downloads: [
          {
            id: 'download-1',
            quality: 'high',
            size: 0
          },
          {
            id: 'download-2',
            quality: 'sd',
            size: 0
          }
        ]
      }
    ] as any)

    // Mock Mux static renditions response
    ;(getStaticRenditions as jest.Mock).mockResolvedValue({
      files: [
        {
          resolution: '720p',
          filesize: '157286400',
          status: 'ready'
        },
        {
          resolution: '360p',
          filesize: '52428800',
          status: 'ready'
        }
      ]
    })

    // Mock the update calls
    prismaMock.videoVariantDownload.update.mockResolvedValue({} as any)

    await service(mockLogger)

    // Verify the correct calls were made
    expect(getStaticRenditions).toHaveBeenCalledWith('mux-asset-1', false)
    expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledWith({
      where: { id: 'download-1' },
      data: { size: 157286400 }
    })
    expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledWith({
      where: { id: 'download-2' },
      data: { size: 52428800 }
    })

    expect(mockLogger.info).toHaveBeenCalledWith(
      'mux downloads size update started'
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      'found 1 video variants with missing download sizes'
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      'mux downloads size update finished - processed 1 video variants, updated 2 downloads'
    )
  })

  it('should skip downloads that already have sizes', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([
      {
        id: 'variant-1',
        muxVideo: {
          assetId: 'mux-asset-1'
        },
        downloads: [
          {
            id: 'download-1',
            quality: 'high',
            size: 157286400 // Already has size
          }
        ]
      }
    ] as any)
    ;(getStaticRenditions as jest.Mock).mockResolvedValue({
      files: [
        {
          resolution: '720p',
          filesize: '157286400',
          status: 'ready'
        }
      ]
    })

    await service(mockLogger)

    // Should not update since size is already set
    expect(prismaMock.videoVariantDownload.update).not.toHaveBeenCalled()
  })

  it('should skip files that are not ready', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([
      {
        id: 'variant-1',
        muxVideo: {
          assetId: 'mux-asset-1'
        },
        downloads: [
          {
            id: 'download-1',
            quality: 'high',
            size: 0
          }
        ]
      }
    ] as any)
    ;(getStaticRenditions as jest.Mock).mockResolvedValue({
      files: [
        {
          resolution: '720p',
          filesize: '157286400',
          status: 'preparing' // Not ready
        }
      ]
    })

    await service(mockLogger)

    // Should not update since status is not 'ready'
    expect(prismaMock.videoVariantDownload.update).not.toHaveBeenCalled()
  })

  it('should handle cases with no video variants', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([])

    await service(mockLogger)

    expect(mockLogger.info).toHaveBeenCalledWith(
      'no video variants with missing download sizes found'
    )
    expect(getStaticRenditions).not.toHaveBeenCalled()
  })

  it('should handle errors gracefully', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValue([
      {
        id: 'variant-1',
        muxVideo: {
          assetId: 'mux-asset-1'
        },
        downloads: [
          {
            id: 'download-1',
            quality: 'high',
            size: 0
          }
        ]
      }
    ] as any)
    ;(getStaticRenditions as jest.Mock).mockRejectedValue(
      new Error('Mux API error')
    )

    await service(mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      {
        error: expect.any(Error),
        videoVariantId: 'variant-1'
      },
      'failed to update video variant download sizes'
    )
  })

  it('should rate limit Mux API calls with 2 second delays', async () => {
    // Mock multiple video variants to test rate limiting
    prismaMock.videoVariant.findMany.mockResolvedValue([
      {
        id: 'variant-1',
        muxVideo: { assetId: 'mux-asset-1' },
        downloads: [{ id: 'download-1', quality: 'high', size: 0 }]
      },
      {
        id: 'variant-2',
        muxVideo: { assetId: 'mux-asset-2' },
        downloads: [{ id: 'download-2', quality: 'high', size: 0 }]
      }
    ] as any)
    ;(getStaticRenditions as jest.Mock).mockResolvedValue({
      files: [{ resolution: '720p', filesize: '157286400', status: 'ready' }]
    })
    prismaMock.videoVariantDownload.update.mockResolvedValue({} as any)

    // Restore the real setTimeout for this test and spy on it
    jest.restoreAllMocks()
    const setTimeoutSpy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((callback: any) => {
        callback()
        return {} as NodeJS.Timeout
      })

    await service(mockLogger)

    // Should call setTimeout once (for the second API call)
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1)
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000)
    expect(getStaticRenditions).toHaveBeenCalledTimes(2)
  })
})
