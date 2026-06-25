import fetch from 'node-fetch'
import { type MockedFunction, vi } from 'vitest'

import { logger } from '../../logger'

import { notifyMediaSlackOfOperationFailure } from './mediaOperationFailureNotification'

vi.mock('node-fetch')
vi.mock('../../logger', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    child: vi.fn(),
    error: vi.fn()
  }
}))

describe('notifyMediaSlackOfOperationFailure', () => {
  const mockFetch = fetch as MockedFunction<typeof fetch>
  const mockLoggerWarn = vi.mocked(logger.warn)
  const mockLoggerChild = vi.mocked(logger.child)
  const mockLoggerError = vi.mocked(logger.error)
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

  it('posts an operation failure message with context and environment', async () => {
    notifyMediaSlackOfOperationFailure({
      operation: 'Mux video create failed',
      error: new Error('Mux credentials are missing'),
      context: {
        videoId: 'video-1',
        languageId: '529',
        version: 2
      }
    })

    await flushAsync()

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)

    expect(body.channel).toBe('test-channel')
    expect(body.text).toBe(
      'Media operation failed: Mux video create failed - Mux credentials are missing'
    )
    expect(body.blocks[0]).toMatchObject({
      type: 'header',
      text: { text: 'Media operation failed' }
    })
    expect(body.blocks[1].fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          text: '*Operation*\nMux video create failed'
        }),
        expect.objectContaining({ text: '*Environment*\nProduction' }),
        expect.objectContaining({ text: '*Video Id*\n`video-1`' }),
        expect.objectContaining({ text: '*Language Id*\n`529`' }),
        expect.objectContaining({ text: '*Version*\n`2`' })
      ])
    )
    expect(body.blocks[2]).toMatchObject({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Error*\n```Mux credentials are missing```'
      }
    })
    expect(body.blocks[3]).toMatchObject({
      type: 'actions',
      elements: [
        expect.objectContaining({
          type: 'button',
          text: { type: 'plain_text', text: 'Open in Nexus', emoji: true },
          url: 'https://nexus.jesusfilm.org/videos/video-1'
        })
      ]
    })
  })

  it('links to nexus-stage for non-production failures', async () => {
    process.env.SERVICE_ENV = 'stage'

    notifyMediaSlackOfOperationFailure({
      operation: 'Video variant create failed',
      error: new Error('Variant create failed'),
      context: {
        videoId: 'video-2'
      }
    })

    await flushAsync()

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
    expect(body.blocks[3]).toMatchObject({
      type: 'actions',
      elements: [
        expect.objectContaining({
          url: 'https://nexus-stage.jesusfilm.org/videos/video-2'
        })
      ]
    })
  })

  it('omits the nexus action when videoId is missing', async () => {
    notifyMediaSlackOfOperationFailure({
      operation: 'R2 multipart complete failed',
      error: new Error('complete failed'),
      context: {
        assetId: 'asset-1'
      }
    })

    await flushAsync()

    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
    expect(body.blocks).toHaveLength(3)
  })

  it('logs and swallows notifier errors', async () => {
    const formattingError = new Error('context formatting failed')

    notifyMediaSlackOfOperationFailure({
      operation: 'Mux video create failed',
      error: new Error('Mux credentials are missing'),
      context: {
        badField: {
          toString() {
            throw formattingError
          }
        } as any
      }
    })

    await flushAsync()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockLoggerError).toHaveBeenCalledWith(
      { error: formattingError },
      'Media operation failure notifier error'
    )
  })

  it('skips and warns when Slack env vars are missing', async () => {
    delete process.env.SLACK_DATA_LANGS_CHANNEL_ID

    notifyMediaSlackOfOperationFailure({
      operation: 'R2 asset create failed',
      error: 'missing bucket'
    })

    await flushAsync()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Skipping video Slack notification because SLACK_VIDEO_ADMIN_BOT_TOKEN or SLACK_DATA_LANGS_CHANNEL_ID is missing'
    )
  })
})
