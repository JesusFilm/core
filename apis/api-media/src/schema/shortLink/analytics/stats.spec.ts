import { vi } from 'vitest'

import { buildWhere, emptyShortLinkStats, getShortLinkStats } from './stats'

const fetchMock = vi.fn()

function bodyText(init: RequestInit): string {
  return typeof init.body === 'string' ? init.body : ''
}

describe('short link stats', () => {
  const originalEnv = process.env
  const filter = {
    from: new Date('2026-09-01T00:00:00.000Z'),
    to: new Date('2026-10-01T00:00:00.000Z')
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    process.env = {
      ...originalEnv,
      SHORT_LINKS_CLICKHOUSE_URL: 'https://ch.example:8443/',
      SHORT_LINKS_CLICKHOUSE_USER: 'reader',
      SHORT_LINKS_CLICKHOUSE_PASSWORD: 'secret',
      SHORT_LINKS_CLICKHOUSE_DATABASE: 'redirects'
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env = originalEnv
  })

  describe('buildWhere', () => {
    it('only binds the range when no other filter is set', () => {
      expect(buildWhere(filter)).toEqual({
        sql: 'ts >= parseDateTime64BestEffort({from:String}, 3) AND ts < parseDateTime64BestEffort({to:String}, 3)',
        params: {
          from: '2026-09-01T00:00:00.000Z',
          to: '2026-10-01T00:00:00.000Z'
        }
      })
    })

    it('binds every filter through a named parameter, never the SQL', () => {
      const where = buildWhere({
        ...filter,
        linkId: "x' OR 1=1 --",
        campaignId: 'c1',
        hostname: 'ARC.gt',
        videoId: 'v1',
        youtubeVideoId: 'y1'
      })
      expect(where.sql).not.toContain('OR 1=1')
      expect(where.sql).toContain('link_id = {linkId:String}')
      expect(where.sql).toContain('has(campaign_ids, {campaignId:String})')
      expect(where.sql).toContain('hostname = {hostname:String}')
      expect(where.sql).toContain('video_id = {videoId:String}')
      expect(where.sql).toContain('youtube_video_id = {youtubeVideoId:String}')
      expect(where.params).toMatchObject({
        linkId: "x' OR 1=1 --",
        campaignId: 'c1',
        hostname: 'arc.gt',
        videoId: 'v1',
        youtubeVideoId: 'y1'
      })
    })
  })

  it('returns zeros and empty arrays when ClickHouse is not configured', async () => {
    delete process.env.SHORT_LINKS_CLICKHOUSE_URL
    expect(await getShortLinkStats(filter)).toEqual(emptyShortLinkStats())
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('queries every breakdown with FORMAT JSON, basic auth and param_ query strings', async () => {
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      const body = bodyText(init)
      const data = body.includes('AS total')
        ? [{ total: '120', qr: '45' }]
        : body.includes('arrayJoin(campaign_ids)')
          ? [{ key: 'c1', count: '100', qrCount: '40' }]
          : body.includes('toDate(ts)')
            ? [{ key: '2026-09-01', count: 120, qrCount: 45 }]
            : [{ key: `k:${url.length}`, count: '1', qrCount: '0' }]
      return {
        ok: true,
        status: 200,
        json: async () => ({ data }),
        text: async () => ''
      }
    })

    const stats = await getShortLinkStats({
      ...filter,
      linkId: 'l1',
      campaignId: 'c1'
    })

    expect(stats.total).toBe(120)
    expect(stats.qr).toBe(45)
    expect(stats.direct).toBe(75)
    expect(stats.byDay).toEqual([
      { key: '2026-09-01', count: 120, qrCount: 45 }
    ])
    expect(stats.byCampaign).toEqual([{ key: 'c1', count: 100, qrCount: 40 }])
    expect(stats.byLink).toHaveLength(1)
    expect(stats.byCountry).toHaveLength(1)
    expect(stats.byDeviceClass).toHaveLength(1)
    expect(stats.byPlacement).toHaveLength(1)
    expect(stats.byReferrerHost).toHaveLength(1)
    expect(stats.byAttribution).toHaveLength(1)

    // totals + 8 breakdowns
    expect(fetchMock).toHaveBeenCalledTimes(9)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const parsed = new URL(url)
    expect(parsed.origin).toBe('https://ch.example:8443')
    expect(parsed.searchParams.get('database')).toBe('redirects')
    expect(parsed.searchParams.get('param_from')).toBe(
      '2026-09-01T00:00:00.000Z'
    )
    expect(parsed.searchParams.get('param_linkId')).toBe('l1')
    expect(parsed.searchParams.get('param_campaignId')).toBe('c1')
    expect(init.method).toBe('POST')
    expect(bodyText(init)).toMatch(/ FORMAT JSON$/)
    expect(bodyText(init)).toContain('FROM redirect_events WHERE')
    expect((init.headers as Record<string, string>).Authorization).toBe(
      `Basic ${Buffer.from('reader:secret').toString('base64')}`
    )

    const breakdownBodies = fetchMock.mock.calls
      .map(([, callInit]) => bodyText(callInit as RequestInit))
      .filter((body) => body.includes('GROUP BY key'))
    expect(breakdownBodies).toHaveLength(8)
    expect(
      breakdownBodies.filter((body) => body.includes('LIMIT 50'))
    ).toHaveLength(7)
    expect(breakdownBodies.some((body) => body.includes('toDate(ts)'))).toBe(
      true
    )
  })

  it('throws when ClickHouse answers with an error status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
      text: async () => 'boom'
    })
    await expect(getShortLinkStats(filter)).rejects.toThrow(
      'ClickHouse query failed (500): boom'
    )
  })
})
