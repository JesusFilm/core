import fetch from 'node-fetch'

import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'

import { sendWeeklyVideoSummary } from './videoSlack'

jest.mock('node-fetch')
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
    info: jest.fn(),
    child: jest.fn()
  }
}))

describe('videoSlack', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>
  const mockFindMany = jest.mocked(prisma.video.findMany)
  const mockLoggerWarn = jest.mocked(logger.warn)
  const mockLoggerInfo = jest.mocked(logger.info)
  const mockLoggerChild = jest.mocked(logger.child)
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    mockLoggerChild.mockReturnValue(logger as any)
    process.env = {
      ...originalEnv,
      VIDEO_SLACK_BOT_TOKEN: 'test-token',
      VIDEO_SLACK_CHANNEL_ID: 'test-channel'
    }
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ ok: true })
    } as any)
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should post a weekly video summary to Slack', async () => {
    mockFindMany
      .mockResolvedValueOnce([
        {
          id: 'created-video',
          label: 'featureFilm',
          slug: 'created-slug',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-01T00:00:00.000Z')
        } as any
      ])
      .mockResolvedValueOnce([
        {
          id: 'updated-video',
          label: 'segment',
          slug: 'updated-slug',
          createdAt: new Date('2026-03-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-04T00:00:00.000Z')
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
    expect(body.blocks[0].text.text).toBe('Weekly video summary')
    expect(body.blocks[1].text.text).toContain('*Created:* 1')
    expect(body.blocks[1].text.text).toContain('*Updated:* 1')
    expect(body.blocks[2].text.text).toContain('created-video')
    expect(body.blocks[2].text.text).toContain('created: 2026-04-01')
    expect(body.blocks[3].text.text).toContain('updated-video')
    expect(body.blocks[3].text.text).toContain('updated: 2026-04-04')
  })

  it('should warn and skip when Slack env vars are missing', async () => {
    delete process.env.VIDEO_SLACK_BOT_TOKEN

    mockFindMany
      .mockResolvedValueOnce([
        {
          id: 'created-video',
          label: 'featureFilm',
          slug: 'created-slug',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-01T00:00:00.000Z')
        } as any
      ])
      .mockResolvedValueOnce([])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Skipping video Slack notification because VIDEO_SLACK_BOT_TOKEN or VIDEO_SLACK_CHANNEL_ID is missing'
    )
  })

  it('should not post when there are no weekly changes', async () => {
    mockFindMany.mockResolvedValueOnce([]).mockResolvedValueOnce([])

    await sendWeeklyVideoSummary(new Date('2026-04-07T00:00:00.000Z'))

    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      'No videos were created or updated in the last week'
    )
  })

  it('should warn when Slack API returns an error response', async () => {
    mockFindMany
      .mockResolvedValueOnce([
        {
          id: 'created-video',
          label: 'featureFilm',
          slug: 'created-slug',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-01T00:00:00.000Z')
        } as any
      ])
      .mockResolvedValueOnce([])
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
