import { domainRecord, routingRecord } from '../test/fixtures'

import { isDomainRecord, isRoutingRecord, parseRecord } from './records'

describe('isDomainRecord', () => {
  it('accepts the documented shape', () => {
    expect(
      isDomainRecord({
        v: 1,
        id: 'uuid',
        hostname: 'arc.gt',
        redirectStatus: 302,
        fallbackTo: null,
        notFound: 'passthrough',
        passthroughOrigin: 'https://api.arclight.org',
        reservedPaths: ['s', 'hls', 'dl', 'dh', 'v2', 'api'],
        slugCaseSensitive: true
      })
    ).toBe(true)
  })

  it.each([
    ['v mismatch', { v: 2 }],
    ['missing hostname', { hostname: '' }],
    ['bad status', { redirectStatus: 200 }],
    ['unknown notFound', { notFound: 'explode' }],
    ['reservedPaths not strings', { reservedPaths: [1] }],
    ['slugCaseSensitive not boolean', { slugCaseSensitive: 'yes' }]
  ])('rejects %s', (_label, overrides) => {
    expect(
      isDomainRecord({
        ...domainRecord({ hostname: 'x.example' }),
        ...overrides
      })
    ).toBe(false)
  })

  it('normalises a missing or empty kvBinding to null and keeps a string', () => {
    const missing: Record<string, unknown> = {
      ...domainRecord({ hostname: 'x.example' })
    }
    delete missing.kvBinding
    expect(isDomainRecord(missing)).toBe(true)
    expect(missing.kvBinding).toBeNull()

    const empty = { ...domainRecord({ hostname: 'x.example' }), kvBinding: '' }
    expect(isDomainRecord(empty)).toBe(true)
    expect(empty.kvBinding).toBeNull()

    const named = {
      ...domainRecord({ hostname: 'x.example' }),
      kvBinding: 'KV_JESUS_FILM'
    }
    expect(isDomainRecord(named)).toBe(true)
    expect(named.kvBinding).toBe('KV_JESUS_FILM')
  })

  it.each([[1], [true], [['KV']]])('rejects kvBinding %j', (kvBinding) => {
    expect(
      isDomainRecord({ ...domainRecord({ hostname: 'x.example' }), kvBinding })
    ).toBe(false)
  })

  it('rejects non-objects', () => {
    expect(isDomainRecord(null)).toBe(false)
    expect(isDomainRecord('{}')).toBe(false)
    expect(isDomainRecord([])).toBe(false)
  })
})

describe('isRoutingRecord', () => {
  it('accepts the documented shape', () => {
    expect(
      isRoutingRecord({
        v: 1,
        id: 'uuid',
        to: 'https://www.jesusfilm.org/watch/jesus.html',
        status: 307,
        fallbackTo: null,
        paused: false,
        assetClass: 'videoEmbedded',
        placement: 'inVideoQr',
        campaignIds: ['uuid'],
        videoId: '1_jf-0-0',
        youtubeVideoId: 'dQw4w9WgXcQ',
        language: 'en'
      })
    ).toBe(true)
  })

  it('normalises a missing status, global and hostname', () => {
    const record: Record<string, unknown> = { ...routingRecord() }
    delete record.status
    delete record.global
    delete record.hostname

    expect(isRoutingRecord(record)).toBe(true)
    expect(record).toMatchObject({ status: null, global: false, hostname: '' })
  })

  it.each([301, 302, 307, 308, null])('accepts status %s', (status) => {
    expect(isRoutingRecord({ ...routingRecord(), status })).toBe(true)
  })

  it.each([
    ['v mismatch', { v: 0 }],
    ['missing to', { to: '' }],
    ['bad status', { status: 404 }],
    ['status 303', { status: 303 }],
    ['status as string', { status: '307' }],
    ['global not boolean', { global: 'yes' }],
    ['hostname not string', { hostname: 1 }],
    ['paused not boolean', { paused: 'true' }],
    ['unknown assetClass', { assetClass: 'gold' }],
    ['campaignIds not array', { campaignIds: 'camp' }]
  ])('rejects %s', (_label, overrides) => {
    expect(isRoutingRecord({ ...routingRecord(), ...overrides })).toBe(false)
  })
})

describe('parseRecord', () => {
  it('parses a JSON string and validates it', () => {
    expect(
      parseRecord(JSON.stringify(routingRecord()), isRoutingRecord)
    ).toEqual(routingRecord())
  })

  it('returns null for invalid JSON, null and wrong shapes', () => {
    expect(parseRecord('{not json', isRoutingRecord)).toBeNull()
    expect(parseRecord(null, isRoutingRecord)).toBeNull()
    expect(parseRecord({ v: 1 }, isRoutingRecord)).toBeNull()
  })
})
