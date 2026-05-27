import fetch from 'node-fetch'
import { type MockedFunction, vi } from 'vitest'

import { logger } from '../../logger'

import { notifyVideoSlackOfMutation } from './videoMutationNotification'

vi.mock('node-fetch')
vi.mock('../../logger', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    child: vi.fn()
  }
}))

describe('notifyVideoSlackOfMutation', () => {
  const mockFetch = fetch as MockedFunction<typeof fetch>
  const mockLoggerWarn = vi.mocked(logger.warn)
  const mockLoggerChild = vi.mocked(logger.child)
  const originalEnv = process.env

  const flushAsync = async (): Promise<void> => {
    await new Promise((resolve) => setImmediate(resolve))
    await new Promise((resolve) => setImmediate(resolve))
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLoggerChild.mockReturnValue(logger as any)
    process.env = {
      ...originalEnv,
      SLACK_VIDEO_ADMIN_BOT_TOKEN: 'test-token',
      SLACK_DATA_LANGS_CHANNEL_ID: 'test-channel',
      SERVICE_ENV: 'prod'
    }
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ ok: true, ts: '1111.1111' })
    } as any)
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('posts a create message with the prod nexus link when SERVICE_ENV=prod', async () => {
    notifyVideoSlackOfMutation({
      kind: 'create',
      video: { id: 'video-1', label: 'featureFilm' },
      user: { id: 'user-1', email: 'editor@example.com' }
    })

    await flushAsync()

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('https://slack.com/api/chat.postMessage')
    expect(init).toMatchObject({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: 'Bearer test-token'
      })
    })

    const body = JSON.parse(init?.body as string)
    expect(body.channel).toBe('test-channel')
    expect(body.text).toBe(
      'Video created: featureFilm (video-1) by editor@example.com'
    )

    expect(body.blocks[0]).toMatchObject({
      type: 'header',
      text: { text: 'Video created' }
    })
    expect(body.blocks[1]).toMatchObject({
      type: 'section',
      fields: expect.arrayContaining([
        expect.objectContaining({ text: '*Label*\nfeatureFilm' }),
        expect.objectContaining({ text: '*Video ID*\n`video-1`' }),
        expect.objectContaining({ text: '*By*\neditor@example.com' }),
        expect.objectContaining({ text: '*Environment*\nProduction' })
      ])
    })
    expect(body.blocks[2]).toMatchObject({ type: 'actions' })
    expect(body.blocks[2].elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'button',
          url: 'https://nexus.jesusfilm.org/videos/video-1'
        })
      ])
    )
    expect(body.blocks[2].elements[0].text).toMatchObject({
      text: 'Open in Nexus'
    })
  })

  it('posts an update message with the nexus-stage link for non-prod', async () => {
    process.env.SERVICE_ENV = 'stage'

    notifyVideoSlackOfMutation({
      kind: 'update',
      video: { id: 'video-2', label: 'segment' },
      user: { id: 'user-2', firstName: 'Ada', lastName: 'Lovelace' }
    })

    await flushAsync()

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
    expect(body.text).toBe('Video updated: segment (video-2) by Ada Lovelace')
    expect(body.blocks[0]).toMatchObject({
      type: 'header',
      text: { text: 'Video updated' }
    })
    expect(body.blocks[1].fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: '*By*\nAda Lovelace' }),
        expect.objectContaining({ text: '*Environment*\nNon-production' })
      ])
    )
    expect(body.blocks[2].elements[0]).toMatchObject({
      type: 'button',
      text: { text: 'Open in Nexus' },
      url: 'https://nexus-stage.jesusfilm.org/videos/video-2'
    })
  })

  it('falls back to nexus-stage and unknown user when label and user are missing', async () => {
    delete process.env.SERVICE_ENV

    notifyVideoSlackOfMutation({
      kind: 'create',
      video: { id: 'video-3', label: null },
      user: null
    })

    await flushAsync()

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
    expect(body.blocks[1].fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: '*Label*\n—' }),
        expect.objectContaining({ text: '*By*\n_unknown_' })
      ])
    )
    expect(body.blocks[2].elements[0]).toMatchObject({
      url: 'https://nexus-stage.jesusfilm.org/videos/video-3'
    })
  })

  it('skips and warns when Slack env vars are missing', async () => {
    delete process.env.SLACK_VIDEO_ADMIN_BOT_TOKEN

    notifyVideoSlackOfMutation({
      kind: 'update',
      video: { id: 'video-4', label: 'episode' },
      user: { id: 'user-4', email: 'editor@example.com' }
    })

    await flushAsync()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Skipping video Slack notification because SLACK_VIDEO_ADMIN_BOT_TOKEN or SLACK_DATA_LANGS_CHANNEL_ID is missing'
    )
  })

  it('logs a warn when Slack API returns an error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ ok: false, error: 'server_error' })
    } as any)

    notifyVideoSlackOfMutation({
      kind: 'create',
      video: { id: 'video-5', label: 'segment' },
      user: { id: 'user-5', email: 'editor@example.com' }
    })

    await flushAsync()

    expect(mockLoggerWarn).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'server_error', status: 500 }),
      'Video mutation Slack notification failed'
    )
  })
})
