import {
  buildShortLink,
  buildShortLinkDomain
} from '../../../../test/shortLinkFixtures'

import {
  buildDomainRecord,
  buildRoutingRecord,
  domainKey,
  domainLinkKey,
  effectiveDestination,
  effectiveRedirectStatus,
  globalLinkKey,
  globalRecordKeyForLink,
  isLiveLink,
  recordKeyForLink
} from './records'

describe('edge records', () => {
  describe('keys', () => {
    it('lower-cases the hostname of the domain key', () => {
      expect(domainKey('Arc.GT')).toBe('domain:arc.gt')
    })

    it('uses the bare slug in the domain namespace, as minted on a case-sensitive domain', () => {
      expect(
        domainLinkKey({ pathname: 'AbC' }, { slugCaseSensitive: true })
      ).toBe('AbC')
      expect(
        recordKeyForLink(
          { pathname: 'AbC' },
          { hostname: 'NXSTP.is', slugCaseSensitive: true }
        )
      ).toBe('link:nxstp.is/AbC')
    })

    it('lower-cases the slug on a case-insensitive domain', () => {
      expect(
        domainLinkKey({ pathname: 'AbC' }, { slugCaseSensitive: false })
      ).toBe('abc')
      expect(
        recordKeyForLink(
          { pathname: 'AbC' },
          { hostname: 'yt.example', slugCaseSensitive: false }
        )
      ).toBe('link:yt.example/abc')
    })

    it('prefixes global keys', () => {
      expect(globalLinkKey({ pathname: 'promo' })).toBe('link:promo')
      expect(globalRecordKeyForLink({ pathname: 'promo' })).toBe('global:promo')
    })
  })

  describe('buildDomainRecord', () => {
    it('builds the versioned domain record with the Worker binding', () => {
      const domain = buildShortLinkDomain({
        id: 'd1',
        hostname: 'Arc.gt',
        redirectStatus: 302,
        notFound: 'passthrough',
        passthroughOrigin: 'https://api.arclight.org',
        reservedPaths: ['s', 'hls'],
        slugCaseSensitive: true,
        kvNamespaceId: 'ns-1',
        kvBinding: 'KV_ARC_GT'
      })
      expect(buildDomainRecord(domain)).toEqual({
        v: 1,
        id: 'd1',
        hostname: 'arc.gt',
        pathPrefix: '',
        redirectStatus: 302,
        fallbackTo: null,
        notFound: 'passthrough',
        passthroughOrigin: 'https://api.arclight.org',
        reservedPaths: ['s', 'hls'],
        slugCaseSensitive: true,
        kvBinding: 'KV_ARC_GT'
      })
    })

    it('carries a null binding for a domain without a namespace', () => {
      expect(buildDomainRecord(buildShortLinkDomain()).kvBinding).toBeNull()
    })

    it('carries the path prefix and leaves link keys bare', () => {
      const domain = buildShortLinkDomain({
        hostname: 'jesus.film',
        pathPrefix: 's',
        slugCaseSensitive: false
      })
      expect(buildDomainRecord(domain).pathPrefix).toBe('s')
      expect(domainLinkKey({ pathname: 'Easter' }, domain)).toBe('easter')
      expect(recordKeyForLink({ pathname: 'Easter' }, domain)).toBe(
        'link:jesus.film/easter'
      )
    })
  })

  describe('buildRoutingRecord', () => {
    const domain = buildShortLinkDomain({
      hostname: 'Example.com',
      redirectStatus: 307,
      fallbackTo: 'https://domain-fallback.example'
    })

    it('builds the versioned routing record with the link overrides only', () => {
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
        status: null,
        fallbackTo: null,
        paused: false,
        global: false,
        hostname: 'example.com',
        assetClass: 'videoEmbedded',
        placement: 'inVideoQr',
        campaignIds: ['c1', 'c2'],
        videoId: '1_jf-0-0',
        youtubeVideoId: 'dQw4w9WgXcQ',
        language: 'en'
      })
    })

    it('carries the link redirect status and fallback, the paused and global flags', () => {
      const link = {
        ...buildShortLink({
          status: 'paused',
          global: true,
          redirectStatus: 301,
          fallbackTo: 'https://fallback.example'
        }),
        campaigns: []
      }
      const record = buildRoutingRecord(link, domain)
      expect(record.status).toBe(301)
      expect(record.paused).toBe(true)
      expect(record.global).toBe(true)
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
    })

    it('keeps the Brightcove destination free of the path prefix', () => {
      const prefixed = buildShortLinkDomain({
        pathPrefix: 's',
        passthroughOrigin: 'https://api.arclight.org'
      })
      const link = buildShortLink({
        pathname: 'abc123',
        brightcoveId: '1',
        redirectType: 'hls'
      })
      expect(effectiveDestination(link, prefixed)).toBe(
        'https://api.arclight.org/abc123'
      )
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

  describe('effectiveRedirectStatus', () => {
    it('prefers the link override over the serving domain default', () => {
      const domain = buildShortLinkDomain({ redirectStatus: 302 })
      expect(effectiveRedirectStatus(buildShortLink(), domain)).toBe(302)
      expect(
        effectiveRedirectStatus(buildShortLink({ redirectStatus: 308 }), domain)
      ).toBe(308)
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
