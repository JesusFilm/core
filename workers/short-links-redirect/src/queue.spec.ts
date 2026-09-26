import {
  createExecutionContext,
  createMessageBatch,
  env,
  getQueueResult
} from 'cloudflare:test'

import { fetchMock } from '../test/fetchMock'

import type { Env } from './env'
import type { RedirectEvent } from './event'
import {
  handleQueueBatch,
  insertUrl,
  toClickHouseTimestamp,
  toRedirectEventRow
} from './queue'

import worker from '.'

const clickhouseUrl = 'https://clickhouse.example.com:8443'

const bindings = env as unknown as Env

function event(overrides: Partial<RedirectEvent> = {}): RedirectEvent {
  return {
    v: 1,
    ts: '2026-09-26T10:00:00.000Z',
    hostname: 'arc.gt',
    pathname: 'abc123',
    linkId: 'link-1',
    campaignIds: ['camp-1'],
    videoId: '1_jf-0-0',
    youtubeVideoId: null,
    placement: 'inVideoQr',
    destination: 'https://example.com/',
    status: 302,
    attribution: 'qr',
    country: 'US',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    referrerHost: 'youtube.com',
    language: 'en',
    utmSource: null,
    utmMedium: null,
    utmCampaign: 'easter',
    resolvedFrom: 'kv',
    ...overrides
  }
}

function clickhouseEnv(overrides: Partial<Env> = {}): Env {
  return {
    ...bindings,
    CLICKHOUSE_URL: clickhouseUrl,
    CLICKHOUSE_DATABASE: 'redirects',
    CLICKHOUSE_USER: 'writer',
    CLICKHOUSE_PASSWORD: 's3cret',
    ...overrides
  }
}

interface RecordingBatch {
  batch: MessageBatch<unknown>
  acked: () => boolean
  retried: () => boolean
}

function recordingBatch(bodies: unknown[]): RecordingBatch {
  let acked = false
  let retried = false
  const batch: MessageBatch<unknown> = {
    queue: 'short-links-events-dev',
    messages: bodies.map((body, index) => ({
      id: `msg-${index}`,
      timestamp: new Date(),
      body,
      attempts: 1,
      retry: () => undefined,
      ack: () => undefined
    })),
    ackAll: () => {
      acked = true
    },
    retryAll: () => {
      retried = true
    }
  }
  return { batch, acked: () => acked, retried: () => retried }
}

const insertPath = `/?query=${encodeURIComponent(
  'INSERT INTO redirects.redirect_events FORMAT JSONEachRow'
)}`

describe('toRedirectEventRow', () => {
  it('maps the message to snake_case columns, parses the user agent and drops it', () => {
    const row = toRedirectEventRow(event())

    expect(row).toEqual({
      ts: '2026-09-26 10:00:00.000',
      hostname: 'arc.gt',
      pathname: 'abc123',
      link_id: 'link-1',
      campaign_ids: ['camp-1'],
      video_id: '1_jf-0-0',
      youtube_video_id: null,
      placement: 'inVideoQr',
      destination: 'https://example.com/',
      status: 302,
      attribution: 'qr',
      country: 'US',
      device_class: 'mobile',
      os: 'iOS',
      browser: 'Safari',
      referrer_host: 'youtube.com',
      language: 'en',
      utm_source: null,
      utm_medium: null,
      utm_campaign: 'easter',
      resolved_from: 'kv'
    })
    expect(row).not.toHaveProperty('userAgent')
    expect(row).not.toHaveProperty('user_agent')
  })
})

describe('toClickHouseTimestamp', () => {
  it('formats as YYYY-MM-DD HH:MM:SS.mmm', () => {
    expect(toClickHouseTimestamp('2026-09-26T10:00:00.123Z')).toBe(
      '2026-09-26 10:00:00.123'
    )
  })

  it('falls back for an unparseable timestamp', () => {
    expect(
      toClickHouseTimestamp('garbage', new Date('2026-01-01T00:00:00.000Z'))
    ).toBe('2026-01-01 00:00:00.000')
  })
})

describe('insertUrl', () => {
  it('puts the INSERT in the query string and tolerates a trailing slash', () => {
    expect(insertUrl('https://ch.example.com:8443/', 'redirects')).toBe(
      `https://ch.example.com:8443${insertPath}`
    )
  })
})

describe('handleQueueBatch', () => {
  beforeAll(() => fetchMock.activate())

  afterAll(() => fetchMock.deactivate())

  afterEach(() => fetchMock.assertNoPendingInterceptors())

  it('inserts JSON lines with basic auth and acks on 2xx', async () => {
    let captured: { headers: Headers; body: string | undefined } | undefined
    fetchMock
      .get(clickhouseUrl)
      .intercept({ path: insertPath, method: 'POST' })
      .reply((request) => {
        captured = request
        return { statusCode: 200, data: '' }
      })

    const { batch, acked, retried } = recordingBatch([
      event(),
      event({ linkId: 'link-2', userAgent: '' })
    ])
    await handleQueueBatch(batch, clickhouseEnv())

    expect(acked()).toBe(true)
    expect(retried()).toBe(false)
    expect(captured?.headers.get('authorization')).toBe(
      `Basic ${btoa('writer:s3cret')}`
    )
    const lines = (captured?.body ?? '').trimEnd().split('\n')
    expect(lines).toHaveLength(2)
    expect(JSON.parse(lines[0]) as unknown).toMatchObject({
      link_id: 'link-1',
      device_class: 'mobile'
    })
    expect(JSON.parse(lines[1]) as unknown).toMatchObject({
      link_id: 'link-2',
      device_class: 'unknown'
    })
  })

  it('retries the batch when ClickHouse answers 500', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    fetchMock
      .get(clickhouseUrl)
      .intercept({ path: insertPath, method: 'POST' })
      .reply(500, 'Code: 999. DB::Exception')

    const { batch, acked, retried } = recordingBatch([event()])
    await handleQueueBatch(batch, clickhouseEnv())

    expect(acked()).toBe(false)
    expect(retried()).toBe(true)
    error.mockRestore()
  })

  it('retries the batch when the request throws', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    fetchMock
      .get(clickhouseUrl)
      .intercept({ path: insertPath, method: 'POST' })
      .replyWithError(new Error('connection reset'))

    const { batch, retried } = recordingBatch([event()])
    await handleQueueBatch(batch, clickhouseEnv())

    expect(retried()).toBe(true)
    error.mockRestore()
  })

  it('acks and drops the batch when ClickHouse is not configured', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const { batch, acked, retried } = recordingBatch([event(), event()])
    await handleQueueBatch(batch, clickhouseEnv({ CLICKHOUSE_URL: '' }))

    expect(acked()).toBe(true)
    expect(retried()).toBe(false)
    expect(log).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      JSON.stringify({ event: 'clickhouse_unconfigured', dropped: 2 })
    )
    log.mockRestore()
  })

  it('skips malformed messages and acks when nothing is left to insert', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { batch, acked } = recordingBatch([{ hello: 'world' }, null])
    await handleQueueBatch(batch, clickhouseEnv())

    expect(acked()).toBe(true)
    error.mockRestore()
  })

  it('is wired as the default export’s queue handler', async () => {
    fetchMock
      .get(clickhouseUrl)
      .intercept({ path: insertPath, method: 'POST' })
      .reply(200, '')

    const batch = createMessageBatch('short-links-events-dev', [
      { id: 'msg-1', timestamp: new Date(), body: event(), attempts: 1 }
    ])
    const ctx = createExecutionContext()
    await worker.queue(batch, clickhouseEnv())
    const result = await getQueueResult(batch, ctx)

    expect(result.ackAll).toBe(true)
  })
})
