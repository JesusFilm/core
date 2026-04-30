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
    label: 'shortFilm',
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

function videoVariantRow(overrides: Partial<VideoVariantRow>): VideoVariantRow {
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
      version: 1,
      production: 'Production',
      mediaComponentId: 'media-id',
      languageId: '529',
      languageName: 'English',
      changeType: 'New',
      changeDate: new Date('2026-01-01T00:00:00.000Z'),
      total: 1,
      packageSize: 1,
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
    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([
      videoVariantRow({
        videoId: 'created-video',
        languageId: '529',
        createdAt: new Date('2026-04-02T00:00:00.000Z'),
        video: videoRow({
          id: 'created-video',
          slug: 'created-slug',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          title: [{ value: 'Created Production' }]
        })
      }),
      videoVariantRow({
        videoId: 'updated-video',
        languageId: '529',
        createdAt: new Date('2026-04-04T00:00:00.000Z'),
        video: videoRow({
          id: 'updated-video',
          slug: 'updated-slug',
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
          title: [{ value: 'Updated Production' }]
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
    expect(body.text).toContain('Weekly Video Report')
    expect(body.text).toContain('2 videos updated')

    const blocksText = JSON.stringify(body.blocks)
    expect(blocksText).toContain('Media Component ID')
    expect(blocksText).toContain('created-video')
    expect(blocksText).toContain('updated-video')
    expect(blocksText).toContain('New')
    expect(blocksText).toContain('Update')
    expect(blocksText).toContain('English')
  })

  it('should post a single message regardless of date range spanning months', async () => {
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

    expect(mockFetch).toHaveBeenCalledTimes(1)

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
    expect(body.thread_ts).toBeUndefined()
    expect(body.text).toContain('Weekly Video Report')
    expect(body.text).toContain('2 videos updated')
    const blocksText = JSON.stringify(body.blocks)
    expect(blocksText).toContain('january-video')
    expect(blocksText).toContain('february-video')
  })

  it('should split a very large report into part messages without thread replies', async () => {
    await postWeeklyVideoSlackMessages({
      rows: Array.from({ length: 800 }, (_, index) =>
        reportRow({
          production: `Production ${index} with a deliberately long title`,
          mediaComponentId: `video-${index}`,
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

    expect(bodies[0].text).toContain('Weekly Video Report part 1')
    expect(bodies[1].text).toContain('Weekly Video Report part 2')
    expect(
      bodies[0].blocks.filter(
        (block: { type: string }) => block.type === 'section'
      ).length
    ).toBeGreaterThan(2)
    expect(bodies.every((body) => body.thread_ts == null)).toBe(true)
  })

  it('should group feature film + segments into a single row and flag incomplete packages', async () => {
    const jfParentVideo = videoRow({
      id: 'jf-parent',
      label: 'featureFilm',
      slug: 'jesus-film',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      title: [{ value: 'JESUS' }]
    })
    const jfSegment1Video = videoRow({
      id: 'jf-segment-1',
      label: 'segment',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      title: [{ value: 'JESUS Segment 1' }]
    })
    const jfSegment3Video = videoRow({
      id: 'jf-segment-3',
      label: 'segment',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      title: [{ value: 'JESUS Segment 3' }]
    })

    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([
      videoVariantRow({
        videoId: 'jf-parent',
        languageId: '529',
        createdAt: new Date('2026-04-09T00:00:00.000Z'),
        video: jfParentVideo
      }),
      videoVariantRow({
        videoId: 'jf-segment-1',
        languageId: '529',
        createdAt: new Date('2026-04-09T00:00:00.000Z'),
        video: jfSegment1Video
      }),
      videoVariantRow({
        videoId: 'jf-segment-3',
        languageId: '529',
        createdAt: new Date('2026-04-09T00:00:00.000Z'),
        video: jfSegment3Video
      })
    ])
    mockMediaPrisma.video.findMany.mockResolvedValueOnce([
      videoRow({
        id: 'jf-parent',
        label: 'featureFilm',
        slug: 'jesus-film',
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        title: [{ value: 'JESUS' }],
        children: [
          { id: 'jf-segment-1', label: 'segment' },
          { id: 'jf-segment-2', label: 'segment' },
          { id: 'jf-segment-3', label: 'segment' }
        ]
      })
    ])

    await sendWeeklyVideoSummary(new Date('2026-04-10T00:00:00.000Z'))

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options?.body as string)
    const sectionTexts = (body.blocks as { text?: { text: string } }[])
      .map((block) => block.text?.text)
      .filter((text): text is string => text != null)
      .join('\n')
    const jesusLines = sectionTexts
      .split('\n')
      .filter((line) => line.includes('jf-parent'))
    const segmentLines = sectionTexts
      .split('\n')
      .filter((line) => line.includes('jf-segment'))

    expect(jesusLines).toHaveLength(1)
    expect(segmentLines).toHaveLength(0)
    expect(jesusLines[0]).toContain('3 / 4 ⚠')
  })

  it('should only query published variants of published videos', async () => {
    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    const variantQueries = mockMediaPrisma.videoVariant.findMany.mock.calls
    expect(variantQueries.length).toBeGreaterThan(0)
    expect(variantQueries[0][0]).toMatchObject({
      where: {
        published: true,
        video: expect.objectContaining({ published: true })
      }
    })
  })

  it('should warn and skip when Slack env vars are missing', async () => {
    delete process.env.SLACK_VIDEO_ADMIN_BOT_TOKEN

    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([
      videoVariantRow({
        videoId: 'created-video',
        languageId: '529',
        createdAt: new Date('2026-04-02T00:00:00.000Z'),
        video: videoRow({
          id: 'created-video',
          slug: 'x',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          title: [{ value: 'P' }]
        })
      })
    ])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Skipping video Slack notification because SLACK_VIDEO_ADMIN_BOT_TOKEN or SLACK_DATA_LANGS_CHANNEL_ID is missing'
    )
  })

  it('should post a simple empty-week message when there are no new variants', async () => {
    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options?.body as string)
    expect(body.channel).toBe('test-channel')
    expect(body.text).toContain('no new videos')
    expect(JSON.stringify(body.blocks)).toContain('No new videos this week')
    expect(JSON.stringify(body.blocks)).toContain('March 31st, 2026')
    expect(JSON.stringify(body.blocks)).toContain('April 7th, 2026')
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        newVariants: 0
      }),
      'Weekly video Slack summary: posting empty-week message — no new variants in the window'
    )
  })

  it('should warn when Slack API returns an error response', async () => {
    mockMediaPrisma.videoVariant.findMany.mockResolvedValueOnce([
      videoVariantRow({
        videoId: 'created-video',
        languageId: '529',
        createdAt: new Date('2026-04-02T00:00:00.000Z'),
        video: videoRow({
          id: 'created-video',
          slug: 'x',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          title: [{ value: 'P' }]
        })
      })
    ])
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest
        .fn()
        .mockResolvedValue({ ok: false, error: 'channel_not_found' })
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
