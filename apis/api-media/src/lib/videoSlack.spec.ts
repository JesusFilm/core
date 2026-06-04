import { type DeepMockProxy, mockReset } from 'jest-mock-extended'
import fetch from 'node-fetch'

import type {
  Language,
  PrismaClient as LanguagesPrismaClient
} from '@core/prisma/languages/client'
import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import type {
  PrismaClient as MediaPrismaClient,
  Video,
  VideoVariant
} from '@core/prisma/media/client'
import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'

import { sendWeeklyVideoSummary } from './videoSlack'
import { postWeeklyVideoSlackMessages } from './videoSlackRenderer'
import type { ReportRow } from './videoSlackReport'

type LanguageRow = Language & { name: Array<{ value: string }> }
type VideoRow = Video & {
  title: Array<{ value: string }>
  _count: { variants: number }
  children: Array<{ id: string; label: string }>
}
type VideoVariantRow = VideoVariant & { video: VideoRow | null }

const testDate = new Date('2026-01-01T00:00:00.000Z')

function languageRow(overrides: Partial<LanguageRow>): LanguageRow {
  return {
    id: '529',
    createdAt: testDate,
    updatedAt: testDate,
    bcp47: null,
    iso3: null,
    hasVideos: true,
    slug: null,
    name: [],
    ...overrides
  }
}

function videoRow(overrides: Partial<VideoRow>): VideoRow {
  return {
    id: 'video',
    label: 'featureFilm',
    primaryLanguageId: '529',
    published: true,
    slug: null,
    noIndex: null,
    childIds: [],
    locked: false,
    availableLanguages: [],
    originId: null,
    restrictDownloadPlatforms: [],
    restrictViewPlatforms: [],
    publishedAt: null,
    createdAt: testDate,
    updatedAt: testDate,
    title: [],
    _count: { variants: 1 },
    children: [],
    ...overrides
  }
}

function videoVariantRow(
  overrides: Partial<VideoVariantRow>
): VideoVariantRow {
  return {
    id: 'variant',
    hls: null,
    dash: null,
    share: null,
    downloadable: true,
    duration: null,
    lengthInMilliseconds: null,
    languageId: '529',
    masterUrl: null,
    masterWidth: null,
    masterHeight: null,
    published: true,
    version: 1,
    edition: 'base',
    slug: 'variant-slug',
    videoId: 'video',
    assetId: null,
    muxVideoId: null,
    brightcoveId: null,
    createdAt: testDate,
    updatedAt: testDate,
    video: null,
    ...overrides
  }
}

jest.mock('node-fetch')
jest.mock('@core/prisma/languages/client', () => {
  const { mockDeep } =
    jest.requireActual<typeof import('jest-mock-extended')>(
      'jest-mock-extended'
    )
  return { prisma: mockDeep<LanguagesPrismaClient>() }
})
jest.mock('@core/prisma/media/client', () => {
  const { mockDeep } =
    jest.requireActual<typeof import('jest-mock-extended')>(
      'jest-mock-extended'
    )
  return { prisma: mockDeep<MediaPrismaClient>() }
})
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    child: jest.fn()
  }
}))

describe('videoSlack', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>
  const mockLanguagesPrisma =
    languagesPrisma as DeepMockProxy<LanguagesPrismaClient>
  const mockMediaPrisma = prisma as DeepMockProxy<MediaPrismaClient>
  const mockLoggerWarn = jest.mocked(logger.warn)
  const mockLoggerInfo = jest.mocked(logger.info)
  const mockLoggerChild = jest.mocked(logger.child)
  const originalEnv = process.env

  function reportRow(overrides: Partial<ReportRow>): ReportRow {
    return {
      production: 'Production',
      mediaComponentId: 'media-id',
      languageName: 'English',
      changeType: 'New Upload',
      updateSource: 'New Video',
      changeDate: new Date('2026-01-01T00:00:00.000Z'),
      total: 1,
      ...overrides
    }
  }

  beforeEach(() => {
    mockReset(mockLanguagesPrisma)
    mockReset(mockMediaPrisma)
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
    mockMediaPrisma.video.findMany.mockResolvedValue([])
    mockMediaPrisma.videoVariant.findMany.mockResolvedValue([])
    mockLanguagesPrisma.language.findMany.mockResolvedValue([
      languageRow({
        id: '529',
        name: [{ value: 'English' }]
      })
    ])
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should post a production-style weekly report to Slack', async () => {
    mockMediaPrisma.video.findMany
      .mockResolvedValueOnce([
        videoRow({
          id: 'created-video',
          slug: 'created-slug',
          primaryLanguageId: '529',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          title: [{ value: 'Created Production' }],
          _count: { variants: 3 }
        })
      ])
      .mockResolvedValueOnce([])
    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([
      videoVariantRow({
        videoId: 'updated-video',
        languageId: '529',
        updatedAt: new Date('2026-04-04T00:00:00.000Z'),
        video: videoRow({
          id: 'updated-video',
          slug: 'updated-slug',
          title: [{ value: 'Updated Production' }],
          _count: { variants: 5 }
        })
      })
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
    mockMediaPrisma.video.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        videoRow({
          id: 'meta-only',
          slug: 'meta-slug',
          primaryLanguageId: '529',
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-05T00:00:00.000Z'),
          title: [{ value: 'Metadata Only Production' }],
          _count: { variants: 2 }
        })
      ])
    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockFetch).toHaveBeenCalled()
    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options?.body as string)
    expect(body.text).toContain('1 row')
    expect(JSON.stringify(body.blocks)).toContain('meta-only')
    expect(JSON.stringify(body.blocks)).toContain('Update')
  })

  it('should post separate root messages grouped by month', async () => {
    await postWeeklyVideoSlackMessages({
      rows: [
        reportRow({
          mediaComponentId: 'january-video',
          changeDate: new Date('2026-01-15T00:00:00.000Z')
        }),
        reportRow({
          mediaComponentId: 'february-video',
          changeDate: new Date('2026-02-15T00:00:00.000Z')
        })
      ],
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-02-28T00:00:00.000Z'),
      childLogger: logger as any
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)

    const januaryBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
    const februaryBody = JSON.parse(mockFetch.mock.calls[1][1]?.body as string)

    expect(januaryBody.thread_ts).toBeUndefined()
    expect(februaryBody.thread_ts).toBeUndefined()
    expect(januaryBody.text).toContain('January 2026 (UTC)')
    expect(februaryBody.text).toContain('February 2026 (UTC)')
    expect(JSON.stringify(januaryBody.blocks)).toContain('january-video')
    expect(JSON.stringify(februaryBody.blocks)).toContain('february-video')
  })

  it('should split a large month into part messages without thread replies', async () => {
    await postWeeklyVideoSlackMessages({
      rows: Array.from({ length: 800 }, (_, index) =>
        reportRow({
          production: `November Production ${index} with a deliberately long title`,
          mediaComponentId: `november-video-${index}`,
          changeDate: new Date('2026-11-15T00:00:00.000Z')
        })
      ),
      startDate: new Date('2026-11-01T00:00:00.000Z'),
      endDate: new Date('2026-11-30T00:00:00.000Z'),
      childLogger: logger as any
    })

    expect(mockFetch.mock.calls.length).toBeGreaterThan(1)

    const bodies = mockFetch.mock.calls.map(([, options]) =>
      JSON.parse(options?.body as string)
    )

    expect(bodies[0].text).toContain('November 2026 (UTC) part 1')
    expect(bodies[1].text).toContain('November 2026 (UTC) part 2')
    expect(
      bodies[0].blocks.filter((block: { type: string }) => block.type === 'section')
        .length
    ).toBeGreaterThan(2)
    expect(bodies.every((body) => body.thread_ts == null)).toBe(true)
  })

  it('should use language package totals for feature films with translated clips', async () => {
    mockMediaPrisma.video.findMany
      .mockResolvedValueOnce([
        videoRow({
          id: 'jf-parent',
          label: 'featureFilm',
          slug: 'jesus-film',
          primaryLanguageId: '529',
          createdAt: new Date('2026-04-08T00:00:00.000Z'),
          title: [{ value: 'JESUS' }],
          _count: { variants: 99 }
        })
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        videoRow({
          id: 'jf-parent',
          children: [
            { id: 'jf-segment-1', label: 'segment' },
            { id: 'jf-segment-2', label: 'segment' },
            { id: 'jf-segment-3', label: 'segment' }
          ]
        })
      ])
    mockMediaPrisma.videoVariant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        videoVariantRow({ languageId: '529', videoId: 'jf-parent' }),
        videoVariantRow({ languageId: '529', videoId: 'jf-segment-1' }),
        videoVariantRow({ languageId: '529', videoId: 'jf-segment-3' })
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

    mockMediaPrisma.video.findMany
      .mockResolvedValueOnce([
        videoRow({
          id: 'created-video',
          slug: 'x',
          primaryLanguageId: '529',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          title: [{ value: 'P' }],
          _count: { variants: 1 }
        })
      ])
      .mockResolvedValueOnce([])
    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Skipping video Slack notification because SLACK_VIDEO_ADMIN_BOT_TOKEN or SLACK_DATA_LANGS_CHANNEL_ID is missing'
    )
  })

  it('should not post when there are no weekly changes', async () => {
    mockMediaPrisma.video.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([])
    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([])

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
    mockMediaPrisma.video.findMany
      .mockResolvedValueOnce([
        videoRow({
          id: 'created-video',
          slug: 'x',
          primaryLanguageId: '529',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          title: [{ value: 'P' }],
          _count: { variants: 1 }
        })
      ])
      .mockResolvedValueOnce([])
    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([])
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
