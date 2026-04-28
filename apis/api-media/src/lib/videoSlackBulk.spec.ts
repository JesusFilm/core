import fetch from 'node-fetch'

import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'

import { postBulkVideoSlackMessages } from './videoSlackBulkRenderer'
import { loadBulkVideoReport } from './videoSlackBulkReport'
import type { BulkVideoReportRow } from './videoSlackBulkReport'

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
    }
  }
}))
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn()
  }
}))

describe('videoSlackBulk', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>
  const mockVideoFindMany = jest.mocked(prisma.video.findMany)
  const mockLanguageFindMany = jest.mocked(languagesPrisma.language.findMany)
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
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
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('loads one bulk row per video with vertical language data', async () => {
    mockVideoFindMany.mockResolvedValue([
      {
        id: 'new-video',
        slug: 'new-video-slug',
        primaryLanguageId: '529',
        createdAt: new Date('2026-02-04T00:00:00.000Z'),
        updatedAt: new Date('2026-02-04T00:00:00.000Z'),
        title: [{ value: 'New Video' }],
        variants: [
          {
            languageId: '529',
            createdAt: new Date('2026-02-04T00:00:00.000Z'),
            updatedAt: new Date('2026-02-04T00:00:00.000Z')
          },
          {
            languageId: '496',
            createdAt: new Date('2026-02-04T00:00:00.000Z'),
            updatedAt: new Date('2026-02-04T00:00:00.000Z')
          }
        ]
      },
      {
        id: 'variant-video',
        slug: 'variant-video-slug',
        primaryLanguageId: '529',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-05T00:00:00.000Z'),
        title: [{ value: 'Variant Updated' }],
        variants: [
          {
            languageId: '529',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-02-05T00:00:00.000Z')
          }
        ]
      }
    ] as any)
    mockLanguageFindMany.mockResolvedValue([
      { id: '529', name: [{ value: 'English' }] },
      { id: '496', name: [{ value: 'Spanish' }] }
    ] as any)

    const rows = await loadBulkVideoReport({
      startDate: new Date('2026-02-01T00:00:00.000Z'),
      endDate: new Date('2026-02-28T00:00:00.000Z')
    })

    expect(mockVideoFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            expect.objectContaining({ createdAt: expect.any(Object) }),
            expect.objectContaining({ variants: expect.any(Object) })
          ]
        })
      })
    )
    expect(rows).toEqual([
      expect.objectContaining({
        mediaComponentId: 'new-video',
        isNew: true,
        languageIds: ['529', '496'],
        languageNames: ['English', 'Spanish']
      }),
      expect.objectContaining({
        mediaComponentId: 'variant-video',
        isNew: false,
        languageIds: ['529'],
        languageNames: ['English']
      })
    ])
  })

  it('posts a compact bulk table with language names and IDs', async () => {
    const rows: BulkVideoReportRow[] = [
      {
        production: 'New Video',
        mediaComponentId: 'new-video',
        isNew: true,
        createdDate: new Date('2026-02-04T00:00:00.000Z'),
        changeDate: new Date('2026-02-04T00:00:00.000Z'),
        languageNames: ['English', 'Spanish'],
        languageIds: ['529', '496']
      }
    ]

    await postBulkVideoSlackMessages({
      rows,
      startDate: new Date('2026-02-01T00:00:00.000Z'),
      endDate: new Date('2026-02-28T00:00:00.000Z'),
      childLogger: logger as any
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://slack.com/api/chat.postMessage',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    )
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
    const blocksText = JSON.stringify(body.blocks)

    expect(body.channel).toBe('test-channel')
    expect(body.text).toContain('Bulk weekly production report')
    expect(blocksText).toContain('Video')
    expect(blocksText).toContain('Is New?')
    expect(blocksText).toContain('Language Names')
    expect(blocksText).toContain('Language IDs')
    expect(blocksText).toContain('New Video')
    expect(blocksText).toContain('English, Spanish')
    expect(blocksText).toContain('529, 496')
  })

  it('summarizes massive language lists per video', async () => {
    await postBulkVideoSlackMessages({
      rows: [
        {
          production: 'Many Languages',
          mediaComponentId: 'many-languages',
          isNew: true,
          createdDate: new Date('2026-02-04T00:00:00.000Z'),
          changeDate: new Date('2026-02-04T00:00:00.000Z'),
          languageNames: Array.from(
            { length: 20 },
            (_unused, index) => `Language ${index}`
          ),
          languageIds: Array.from(
            { length: 20 },
            (_unused, index) => `${index}`
          )
        }
      ],
      startDate: new Date('2026-02-01T00:00:00.000Z'),
      endDate: new Date('2026-02-28T00:00:00.000Z'),
      childLogger: logger as any
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
    const blocksText = JSON.stringify(body.blocks)

    expect(blocksText).toContain('Language 0, +19 more')
    expect(blocksText).not.toContain('Language 1')
    expect(blocksText).toContain('0, +19 more')
  })
})
