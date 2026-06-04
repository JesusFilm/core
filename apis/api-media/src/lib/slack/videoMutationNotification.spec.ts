import fetch from 'node-fetch'

import { logger } from '../../logger'

import { notifyVideoSlackOfMutation } from './videoMutationNotification'

jest.mock('node-fetch')
jest.mock('../../logger', () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
    child: jest.fn()
  }
}))

describe('notifyVideoSlackOfMutation', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>
  const mockLoggerWarn = jest.mocked(logger.warn)
  const mockLoggerChild = jest.mocked(logger.child)
  const originalEnv = process.env

  const flushAsync = async (): Promise<void> => {
    await new Promise((resolve) => setImmediate(resolve))
    await new Promise((resolve) => setImmediate(resolve))
  }

  beforeEach(() => {
    jest.clearAllMocks()
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
      json: jest.fn().mockResolvedValue({ ok: true, ts: '1111.1111' })
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
    expect(body.text).toBe('Video created: featureFilm (video-1)')

    const sectionText = body.blocks[0].text.text as string
    expect(sectionText).toContain('*Video created*')
    expect(sectionText).toContain('*Label:* featureFilm')
    expect(sectionText).toContain(
      '<https://nexus.jesusfilm.org/videos/video-1|`video-1`>'
    )
    expect(sectionText).toContain('*By:* editor@example.com')
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
    expect(body.text).toBe('Video updated: segment (video-2)')
    const sectionText = body.blocks[0].text.text as string
    expect(sectionText).toContain('*Video updated*')
    expect(sectionText).toContain(
      '<https://nexus-stage.jesusfilm.org/videos/video-2|`video-2`>'
    )
    expect(sectionText).toContain('*By:* Ada Lovelace')
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
    const sectionText = body.blocks[0].text.text as string
    expect(sectionText).toContain(
      '<https://nexus-stage.jesusfilm.org/videos/video-3|`video-3`>'
    )
    expect(sectionText).toContain('*Label:* —')
    expect(sectionText).toContain('*By:* _unknown_')
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
      json: jest.fn().mockResolvedValue({ ok: false, error: 'server_error' })
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
