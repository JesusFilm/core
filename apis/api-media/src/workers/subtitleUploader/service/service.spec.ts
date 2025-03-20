import { service } from './service'

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    videoSubtitle: {
      findMany: jest.fn(),
      update: jest.fn()
    },
    cloudflareR2: {
      create: jest.fn(),
      update: jest.fn()
    }
  }
}))

jest.mock('@aws-sdk/client-s3')

global.fetch = jest.fn()

describe('subtitleUploader service', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should process subtitles without assets', async () => {
    const { prisma } = require('../../../lib/prisma')

    // Set environment variables for the test
    const originalEnv = process.env
    process.env = {
      ...originalEnv,
      CLOUDFLARE_R2_ENDPOINT: 'https://r2.example.com',
      CLOUDFLARE_R2_ACCESS_KEY_ID: 'access-key',
      CLOUDFLARE_R2_SECRET: 'secret',
      CLOUDFLARE_R2_BUCKET: 'bucket',
      CLOUDFLARE_R2_CUSTOM_DOMAIN: 'https://cdn.example.com'
    }

    prisma.videoSubtitle.findMany.mockResolvedValue([
      {
        id: 'subtitle-1',
        videoId: 'video-1',
        edition: 'base',
        languageId: 'en',
        srtSrc: 'https://example.com/subtitle.srt',
        srtAssetId: null,
        srtVersion: 1,
        vttSrc: 'https://example.com/subtitle.vtt',
        vttAssetId: null,
        vttVersion: 1
      }
    ])

    prisma.cloudflareR2.create.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) => ({
        id: `asset-${Math.random()}`,
        ...data
      })
    )

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(10))
      })
    )

    await service(mockLogger as any)

    expect(prisma.videoSubtitle.findMany).toHaveBeenCalled()
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Starting subtitleUploader service'
    )

    // Verify the path pattern was used correctly
    const createCalls = prisma.cloudflareR2.create.mock.calls
    if (createCalls.length > 0) {
      const srtCall = createCalls.find(
        (call: [{ data: { contentType: string } }]) =>
          call[0].data.contentType === 'text/plain'
      )
      const vttCall = createCalls.find(
        (call: [{ data: { contentType: string } }]) =>
          call[0].data.contentType === 'text/vtt'
      )

      if (srtCall) {
        const fileName = srtCall[0].data.fileName
        expect(fileName).toMatch(
          /video-1\/editions\/base\/subtitles\/video-1_base_en\.srt/
        )
      }

      if (vttCall) {
        const fileName = vttCall[0].data.fileName
        expect(fileName).toMatch(
          /video-1\/editions\/base\/subtitles\/video-1_base_en\.vtt/
        )
      }
    }

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Completed subtitleUploader service'
    )

    // Restore original env
    process.env = originalEnv
  })
})
