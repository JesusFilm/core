import fetch from 'node-fetch'

import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'

import { sendWeeklyVideoSummary } from './videoSlack'

jest.mock('node-fetch')
jest.mock('@core/prisma/languages/client', () => ({
  prisma: {
    language: {
      findMany: jest.fn()
    }
  }
}))
jest.mock('@core/prisma/media/client', () => ({
  prisma: {
    video: {
      findMany: jest.fn()
    },
    videoVariant: {
      findMany: jest.fn()
    }
  }
}))
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    child: jest.fn()
  }
}))

describe('videoSlack', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>
  const mockVideoFindMany = jest.mocked(prisma.video.findMany)
  const mockVariantFindMany = jest.mocked(prisma.videoVariant.findMany)
  const mockLanguageFindMany = jest.mocked(languagesPrisma.language.findMany)
  const mockLoggerWarn = jest.mocked(logger.warn)
  const mockLoggerInfo = jest.mocked(logger.info)
  const mockLoggerChild = jest.mocked(logger.child)
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    mockLoggerChild.mockReturnValue(logger as any)
    process.env = {
      ...originalEnv,
      SLACK_VIDEO_ADMIN_BOT_TOKEN: 'test-token',
      SLACK_DATA_LANGS_CHANNEL_ID: 'test-channel'
    }
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ ok: true, ts: '1111.1111' })
    } as any)
    mockLanguageFindMany.mockResolvedValue([
      {
        id: '529',
        name: [{ value: 'English' }]
      }
    ] as any)
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should post a production-style weekly report to Slack', async () => {
    mockVideoFindMany
      .mockResolvedValueOnce([
        {
          id: 'created-video',
          slug: 'created-slug',
          primaryLanguageId: '529',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          title: [{ value: 'Created Production' }],
          _count: { variants: 3 }
        } as any
      ])
      .mockResolvedValueOnce([])
    mockVariantFindMany.mockResolvedValueOnce([
      {
        videoId: 'updated-video',
        languageId: '529',
        updatedAt: new Date('2026-04-04T00:00:00.000Z'),
        video: {
          id: 'updated-video',
          slug: 'updated-slug',
          title: [{ value: 'Updated Production' }],
          _count: { variants: 5 }
        }
      } as any
    ])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockFetch).toHaveBeenCalledWith(
      'https://slack.com/api/chat.postMessage',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json; charset=utf-8'
        })
      })
    )

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options?.body as string)

    expect(body).toMatchObject({
      channel: 'test-channel'
    })
    expect(body.text).toContain('Weekly production report')
    expect(body.text).toContain('2 row')

    const blocksText = JSON.stringify(body.blocks)
    expect(blocksText).toContain('Media Component ID')
    expect(blocksText).toContain('created-video')
    expect(blocksText).toContain('updated-video')
    expect(blocksText).toContain('New Upload')
    expect(blocksText).toContain('Update')
    expect(blocksText).toContain('English')
  })

  it('should post when only Video.updatedAt moved (no variant rows)', async () => {
    mockVideoFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'meta-only',
          slug: 'meta-slug',
          primaryLanguageId: '529',
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-05T00:00:00.000Z'),
          title: [{ value: 'Metadata Only Production' }],
          _count: { variants: 2 }
        } as any
      ])
    mockVariantFindMany.mockResolvedValueOnce([])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockFetch).toHaveBeenCalled()
    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options?.body as string)
    expect(body.text).toContain('1 row')
    expect(JSON.stringify(body.blocks)).toContain('meta-only')
    expect(JSON.stringify(body.blocks)).toContain('Update')
  })

  it('should use language package totals for feature films with translated clips', async () => {
    mockVideoFindMany
      .mockResolvedValueOnce([
        {
          id: 'jf-parent',
          label: 'featureFilm',
          slug: 'jesus-film',
          primaryLanguageId: '529',
          createdAt: new Date('2026-04-08T00:00:00.000Z'),
          title: [{ value: 'JESUS' }],
          _count: { variants: 99 }
        } as any
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'jf-parent',
          children: [
            { id: 'jf-segment-1', label: 'segment' },
            { id: 'jf-segment-2', label: 'segment' },
            { id: 'jf-segment-3', label: 'segment' }
          ]
        } as any
      ])
    mockVariantFindMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { languageId: '529', videoId: 'jf-parent' } as any,
        { languageId: '529', videoId: 'jf-segment-1' } as any,
        { languageId: '529', videoId: 'jf-segment-3' } as any
      ])

    await sendWeeklyVideoSummary(new Date('2026-04-10T00:00:00.000Z'))

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options?.body as string)
    const sectionTexts = (body.blocks as { text?: { text: string } }[])
      .map((block) => block.text?.text)
      .filter((text): text is string => text != null)
      .join('\n')
    const jesusLine = sectionTexts
      .split('\n')
      .find((line) => line.includes('jf-parent'))

    expect(jesusLine).toBeDefined()
    expect(jesusLine).toContain(' | 3')
  })

  it('should warn and skip when Slack env vars are missing', async () => {
    delete process.env.SLACK_VIDEO_ADMIN_BOT_TOKEN

    mockVideoFindMany
      .mockResolvedValueOnce([
        {
          id: 'created-video',
          slug: 'x',
          primaryLanguageId: '529',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          title: [{ value: 'P' }],
          _count: { variants: 1 }
        } as any
      ])
      .mockResolvedValueOnce([])
    mockVariantFindMany.mockResolvedValueOnce([])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Skipping video Slack notification because SLACK_VIDEO_ADMIN_BOT_TOKEN or SLACK_DATA_LANGS_CHANNEL_ID is missing'
    )
  })

  it('should not post when there are no weekly changes', async () => {
    mockVideoFindMany.mockResolvedValueOnce([]).mockResolvedValueOnce([])
    mockVariantFindMany.mockResolvedValueOnce([])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        newVideos: 0,
        variantUpdateRows: 0,
        videoMetadataOnlyRows: 0
      }),
      'Weekly video Slack summary skipped: no new videos, no variant updates, and no metadata-only video updates in the window'
    )
  })

  it('should warn when Slack API returns an error response', async () => {
    mockVideoFindMany
      .mockResolvedValueOnce([
        {
          id: 'created-video',
          slug: 'x',
          primaryLanguageId: '529',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          title: [{ value: 'P' }],
          _count: { variants: 1 }
        } as any
      ])
      .mockResolvedValueOnce([])
    mockVariantFindMany.mockResolvedValueOnce([])
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ ok: false, error: 'channel_not_found' })
    } as any)

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockLoggerWarn).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'channel_not_found',
        status: 200
      }),
      'Weekly video Slack summary failed'
    )
  })
})
