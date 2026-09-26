import {
  buildShortLink,
  buildShortLinkDomain
} from '../../../../test/shortLinkFixtures'

import {
  buildDomainRecord,
  buildRoutingRecord,
  domainKey,
  effectiveDestination,
  isLiveLink,
  recordKeyForLink
} from './records'

describe('edge records', () => {
  describe('domainKey', () => {
    it('lower-cases the hostname', () => {
      expect(domainKey('Arc.GT')).toBe('domain:arc.gt')
    })
  })

  describe('recordKeyForLink', () => {
    it('keeps the pathname as minted on a case-sensitive domain', () => {
      expect(
        recordKeyForLink(
          { pathname: 'AbC' },
          { hostname: 'NXSTP.is', slugCaseSensitive: true }
        )
      ).toBe('link:nxstp.is/AbC')
    })

    it('lower-cases the pathname on a case-insensitive domain', () => {
      expect(
        recordKeyForLink(
          { pathname: 'AbC' },
          { hostname: 'yt.example', slugCaseSensitive: false }
        )
      ).toBe('link:yt.example/abc')
    })
  })

  describe('buildDomainRecord', () => {
    it('builds the versioned domain record', () => {
      const domain = buildShortLinkDomain({
        id: 'd1',
        hostname: 'Arc.gt',
        redirectStatus: 302,
        notFound: 'passthrough',
        passthroughOrigin: 'https://api.arclight.org',
        reservedPaths: ['s', 'hls'],
        slugCaseSensitive: true
      })
      expect(buildDomainRecord(domain)).toEqual({
        v: 1,
        id: 'd1',
        hostname: 'arc.gt',
        redirectStatus: 302,
        fallbackTo: null,
        notFound: 'passthrough',
        passthroughOrigin: 'https://api.arclight.org',
        reservedPaths: ['s', 'hls'],
        slugCaseSensitive: true
      })
    })
  })

  describe('buildRoutingRecord', () => {
    const domain = buildShortLinkDomain({ redirectStatus: 307 })

    it('builds the versioned routing record with the domain status', () => {
      const link = {
        ...buildShortLink({
          id: 'l1',
          to: 'https://www.jesusfilm.org/watch/jesus.html',
          assetClass: 'videoEmbedded',
          placement: 'inVideoQr',
          videoId: '1_jf-0-0',
          youtubeVideoId: 'dQw4w9WgXcQ',
          language: 'en'
        }),
        campaigns: [{ id: 'c1' }, { id: 'c2' }]
      }
      expect(buildRoutingRecord(link, domain)).toEqual({
        v: 1,
        id: 'l1',
        to: 'https://www.jesusfilm.org/watch/jesus.html',
        status: 307,
        fallbackTo: null,
        paused: false,
        assetClass: 'videoEmbedded',
        placement: 'inVideoQr',
        campaignIds: ['c1', 'c2'],
        videoId: '1_jf-0-0',
        youtubeVideoId: 'dQw4w9WgXcQ',
        language: 'en'
      })
    })

    it('prefers the link redirect status and fallback and marks paused links', () => {
      const link = {
        ...buildShortLink({
          status: 'paused',
          redirectStatus: 301,
          fallbackTo: 'https://fallback.example'
        }),
        campaigns: []
      }
      const record = buildRoutingRecord(link, domain)
      expect(record.status).toBe(301)
      expect(record.paused).toBe(true)
      expect(record.fallbackTo).toBe('https://fallback.example')
      expect(record.campaignIds).toEqual([])
    })

    it('routes arc.gt Brightcove links through the passthrough origin', () => {
      const arcDomain = buildShortLinkDomain({
        hostname: 'arc.gt',
        redirectStatus: 302,
        notFound: 'passthrough',
        passthroughOrigin: 'https://api.arclight.org/'
      })
      const link = {
        ...buildShortLink({
          pathname: 'abc123',
          to: 'https://legacy.example/ignored',
          brightcoveId: '123',
          redirectType: 'hls'
        }),
        campaigns: []
      }
      expect(buildRoutingRecord(link, arcDomain).to).toBe(
        'https://api.arclight.org/abc123'
      )
      expect(buildRoutingRecord(link, arcDomain).status).toBe(302)
    })

    it('keeps `to` for Brightcove links on domains without a passthrough origin', () => {
      const link = buildShortLink({
        to: 'https://example.com/video',
        brightcoveId: '123',
        redirectType: 'dl'
      })
      expect(effectiveDestination(link, domain)).toBe(
        'https://example.com/video'
      )
    })
  })

  describe('isLiveLink', () => {
    it('is false for deleted or retired links', () => {
      expect(isLiveLink(buildShortLink())).toBe(true)
      expect(isLiveLink(buildShortLink({ status: 'paused' }))).toBe(true)
      expect(isLiveLink(buildShortLink({ status: 'retired' }))).toBe(false)
      expect(isLiveLink(buildShortLink({ deletedAt: new Date() }))).toBe(false)
    })
  })
})
