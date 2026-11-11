import {
  campaignAbsoluteAddress,
  campaignBasePath,
  campaignDomainName,
  campaignLanguageAddress,
  campaignLinkPath,
  campaignPagePath,
  campaignPagePaths,
  languagePagePath,
  pageLanguageTag,
  plainPagePath,
  withPageLanguage
} from '.'

const ROOT_ORIGIN = 'https://your.nextstep.is'
const onRoot = { slug: 'outreach', domainName: null }
const onDomain = { slug: 'outreach', domainName: 'outreach.example.org' }

describe('campaignAddress', () => {
  describe('campaignDomainName', () => {
    it('is the first non-empty name', () => {
      expect(campaignDomainName(['', 'outreach.example.org'])).toBe(
        'outreach.example.org'
      )
    })

    it('is null when every name is empty or there is none', () => {
      expect(campaignDomainName([''])).toBeNull()
      expect(campaignDomainName([])).toBeNull()
    })
  })

  describe('campaignBasePath', () => {
    it('is /campaign/<slug> on the root domain and empty on a Campaign Domain', () => {
      expect(campaignBasePath(onRoot)).toBe('/campaign/outreach')
      expect(campaignBasePath(onDomain)).toBe('')
    })
  })

  describe('campaignPagePath', () => {
    it('builds the landing page in both forms', () => {
      expect(campaignPagePath(onRoot)).toBe('/campaign/outreach')
      expect(campaignPagePath(onDomain)).toBe('/')
    })

    it('builds a region page one segment deeper in both forms', () => {
      expect(campaignPagePath(onRoot, 'eur')).toBe('/campaign/outreach/eur')
      expect(campaignPagePath(onDomain, 'eur')).toBe('/eur')
    })
  })

  describe('campaignAbsoluteAddress', () => {
    it('puts the root form under the passed-in origin', () => {
      expect(campaignAbsoluteAddress(onRoot, { rootOrigin: ROOT_ORIGIN })).toBe(
        'https://your.nextstep.is/campaign/outreach'
      )
      expect(
        campaignAbsoluteAddress(onRoot, { rootOrigin: ROOT_ORIGIN }, 'eur')
      ).toBe('https://your.nextstep.is/campaign/outreach/eur')
    })

    it('puts the domain form on the Campaign Domain, whatever the origin', () => {
      expect(
        campaignAbsoluteAddress(onDomain, { rootOrigin: ROOT_ORIGIN })
      ).toBe('https://outreach.example.org/')
      expect(
        campaignAbsoluteAddress(onDomain, { rootOrigin: ROOT_ORIGIN }, 'eur')
      ).toBe('https://outreach.example.org/eur')
    })
  })

  describe('withPageLanguage', () => {
    it('adds ?lang= to the landing and region pages in both forms', () => {
      expect(withPageLanguage(campaignPagePath(onRoot), 'fr-CA')).toBe(
        '/campaign/outreach?lang=fr-CA'
      )
      expect(withPageLanguage(campaignPagePath(onRoot, 'eur'), 'fr-CA')).toBe(
        '/campaign/outreach/eur?lang=fr-CA'
      )
      expect(withPageLanguage(campaignPagePath(onDomain), 'fr-CA')).toBe(
        '/?lang=fr-CA'
      )
      expect(withPageLanguage(campaignPagePath(onDomain, 'eur'), 'fr-CA')).toBe(
        '/eur?lang=fr-CA'
      )
    })

    it('encodes the tag', () => {
      expect(withPageLanguage('/eur', 'a b')).toBe('/eur?lang=a%20b')
    })
  })

  describe('campaignLinkPath', () => {
    it('carries the language, the default included, when there are two or more', () => {
      expect(
        campaignLinkPath('/eur', {
          language: { bcp47: 'en' },
          languages: ['529', '496']
        })
      ).toBe('/eur?lang=en')
    })

    it('leaves the path bare for one language or a language with no tag', () => {
      expect(
        campaignLinkPath('/eur', { language: { bcp47: 'en' }, languages: [1] })
      ).toBe('/eur')
      expect(
        campaignLinkPath('/eur', {
          language: { bcp47: null },
          languages: ['529', '496']
        })
      ).toBe('/eur')
    })
  })

  describe('campaignLanguageAddress', () => {
    const address = 'https://outreach.example.org/eur'

    it('drops the language for the campaign default', () => {
      expect(
        campaignLanguageAddress(address, '529', {
          languageId: '529',
          bcp47: 'en'
        })
      ).toBe(address)
    })

    it('names any other language with ?lang=', () => {
      expect(
        campaignLanguageAddress(address, '529', {
          languageId: '496',
          bcp47: 'fr-CA'
        })
      ).toBe('https://outreach.example.org/eur?lang=fr-CA')
    })

    it('drops a language that has no tag', () => {
      expect(
        campaignLanguageAddress(address, '529', {
          languageId: '496',
          bcp47: null
        })
      ).toBe(address)
    })
  })

  describe('pageLanguageTag', () => {
    it('lowercases the bcp47 tag', () => {
      expect(pageLanguageTag('zh-Hans-CN')).toBe('zh-hans-cn')
      expect(pageLanguageTag('en')).toBe('en')
    })

    it.each([
      null,
      undefined,
      '',
      'english language',
      'e',
      'en-',
      'x'.repeat(4)
    ])('is null for %j, which fails the pattern', (bcp47) => {
      expect(pageLanguageTag(bcp47)).toBeNull()
    })
  })

  describe('languagePagePath', () => {
    it('puts _lang/<tag> between the prefix and the segments', () => {
      expect(languagePagePath('/home/campaign/outreach', ['eur'], 'en')).toBe(
        '/home/campaign/outreach/_lang/en/eur'
      )
      expect(languagePagePath('/outreach.example.org', [], 'en')).toBe(
        '/outreach.example.org/_lang/en'
      )
    })
  })

  describe('plainPagePath', () => {
    it('is the plain public path of the same page in both forms', () => {
      expect(plainPagePath(campaignBasePath(onRoot), [])).toBe(
        '/campaign/outreach'
      )
      expect(plainPagePath(campaignBasePath(onRoot), ['eur'])).toBe(
        '/campaign/outreach/eur'
      )
      expect(plainPagePath(campaignBasePath(onDomain), [])).toBe('/')
      expect(plainPagePath(campaignBasePath(onDomain), ['eur'])).toBe('/eur')
    })
  })

  describe('round trip', () => {
    // The proxy's rewrite of a public address in a Page Language: the root
    // domain's `/campaign/<slug>` prefix is served under `/home`, any other
    // host under `/<hostname>`.
    function pagePathOf(address: string): string | null {
      const url = new URL(address)
      const tag = pageLanguageTag(url.searchParams.get('lang'))
      if (tag == null) return null
      const segments = url.pathname
        .split('/')
        .filter((segment) => segment !== '')
      if (url.origin === ROOT_ORIGIN) {
        const [, slug, ...region] = segments
        return languagePagePath(`/home/campaign/${slug}`, region, tag)
      }
      return languagePagePath(`/${url.host}`, segments, tag)
    }

    it('lands every public address in a Page Language on a _lang page path campaignPagePaths lists', () => {
      const regionSlugs = ['eur', 'afr']
      const bcp47s = ['en', 'zh-Hans-CN']
      const addresses = [onRoot, onDomain].flatMap((input) =>
        [undefined, ...regionSlugs].flatMap((regionSlug) =>
          bcp47s.map((bcp47) =>
            withPageLanguage(
              campaignAbsoluteAddress(
                input,
                { rootOrigin: ROOT_ORIGIN },
                regionSlug
              ),
              bcp47
            )
          )
        )
      )

      const langPagePaths = campaignPagePaths({
        slug: onDomain.slug,
        regions: regionSlugs.map((slug) => ({ slug })),
        hostnames: [onDomain.domainName],
        languageTags: bcp47s.map((bcp47) => pageLanguageTag(bcp47) ?? '')
      }).filter((path) => path.includes('/_lang/'))

      expect(langPagePaths).toHaveLength(addresses.length)
      expect(addresses.map(pagePathOf).sort()).toEqual(
        [...langPagePaths].sort()
      )
    })
  })
})
