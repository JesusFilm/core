import { routingRecord } from '../test/fixtures'

import {
  buildRedirectEvent,
  firstLanguageTag,
  isRedirectEvent,
  referrerHostFrom
} from './event'

const now = new Date('2026-09-26T10:00:00.000Z')

function build(
  overrides: Partial<Parameters<typeof buildRedirectEvent>[0]> = {}
): ReturnType<typeof buildRedirectEvent> {
  return buildRedirectEvent({
    hostname: 'arc.gt',
    pathname: 'abc123',
    record: routingRecord({
      id: 'link-1',
      campaignIds: ['camp-1'],
      videoId: '1_jf-0-0',
      youtubeVideoId: 'yt',
      placement: 'card',
      global: true,
      hostname: 'nxstp.is'
    }),
    destination: 'https://example.com/?utm_source=yt',
    status: 302,
    resolvedFrom: 'kv',
    searchParams: new URLSearchParams(''),
    headers: new Headers({ 'user-agent': 'Mozilla/5.0' }),
    country: 'US',
    now,
    ...overrides
  })
}

describe('buildRedirectEvent', () => {
  it('produces the queue message shape', () => {
    expect(build()).toEqual({
      v: 1,
      ts: '2026-09-26T10:00:00.000Z',
      hostname: 'arc.gt',
      pathname: 'abc123',
      linkId: 'link-1',
      campaignIds: ['camp-1'],
      videoId: '1_jf-0-0',
      youtubeVideoId: 'yt',
      placement: 'card',
      destination: 'https://example.com/?utm_source=yt',
      status: 302,
      attribution: 'direct',
      country: 'US',
      userAgent: 'Mozilla/5.0',
      referrerHost: null,
      language: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      resolvedFrom: 'kv',
      global: true,
      ownerHostname: 'nxstp.is'
    })
  })

  it('carries the store tier and the owning domain', () => {
    const event = build({
      resolvedFrom: 'kv-global',
      record: routingRecord({ global: false, hostname: 'arc.gt' })
    })

    expect(event.resolvedFrom).toBe('kv-global')
    expect(event.global).toBe(false)
    expect(event.ownerHostname).toBe('arc.gt')
  })

  it('attributes qr when the qr parameter is present, whatever its value', () => {
    expect(
      build({ searchParams: new URLSearchParams('qr=1') }).attribution
    ).toBe('qr')
    expect(
      build({ searchParams: new URLSearchParams('qr=') }).attribution
    ).toBe('qr')
  })

  it('attributes qr even without a user agent', () => {
    expect(
      build({
        searchParams: new URLSearchParams('qr=1'),
        headers: new Headers()
      }).attribution
    ).toBe('qr')
  })

  it('attributes unknown when the user agent is empty', () => {
    expect(build({ headers: new Headers() }).attribution).toBe('unknown')
    expect(build({ headers: new Headers() }).userAgent).toBe('')
  })

  it('attributes direct when a referer exists', () => {
    const event = build({
      headers: new Headers({
        'user-agent': 'Mozilla/5.0',
        referer: 'https://youtube.com/watch?v=1'
      })
    })
    expect(event.attribution).toBe('direct')
    expect(event.referrerHost).toBe('youtube.com')
  })

  it('reads utm parameters and the first accept-language tag', () => {
    const event = build({
      searchParams: new URLSearchParams(
        'utm_source=yt&utm_medium=desc&utm_campaign=easter&other=1'
      ),
      headers: new Headers({
        'user-agent': 'Mozilla/5.0',
        'accept-language': 'en-GB,en;q=0.9'
      })
    })
    expect(event.utmSource).toBe('yt')
    expect(event.utmMedium).toBe('desc')
    expect(event.utmCampaign).toBe('easter')
    expect(event.language).toBe('en-GB')
  })

  it('nulls an empty or missing country', () => {
    expect(build({ country: '' }).country).toBeNull()
    expect(build({ country: undefined }).country).toBeNull()
  })
})

describe('referrerHostFrom', () => {
  it.each([
    [null, null],
    ['', null],
    ['not a url', null],
    ['https://www.youtube.com/watch?v=1', 'www.youtube.com'],
    ['android-app://com.google.android.youtube/', 'com.google.android.youtube']
  ])('%s -> %s', (referer, expected) => {
    expect(referrerHostFrom(referer)).toBe(expected)
  })
})

describe('firstLanguageTag', () => {
  it.each([
    [null, null],
    ['', null],
    ['*', null],
    ['en', 'en'],
    ['fr-CA,fr;q=0.9,en;q=0.8', 'fr-CA'],
    [' de-DE ; q=1 , en', 'de-DE']
  ])('%s -> %s', (acceptLanguage, expected) => {
    expect(firstLanguageTag(acceptLanguage)).toBe(expected)
  })
})

describe('isRedirectEvent', () => {
  it('accepts a built event', () => {
    expect(isRedirectEvent(build())).toBe(true)
  })

  it('rejects other versions and foreign shapes', () => {
    expect(isRedirectEvent({ ...build(), v: 2 })).toBe(false)
    expect(isRedirectEvent({ hello: 'world' })).toBe(false)
    expect(isRedirectEvent(null)).toBe(false)
    expect(isRedirectEvent('string')).toBe(false)
  })
})
