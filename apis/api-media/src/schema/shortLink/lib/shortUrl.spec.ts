import {
  buildQrUrl,
  buildShortUrl,
  isValidPathPrefix,
  normalizePathPrefix
} from './shortUrl'

describe('short url', () => {
  describe('normalizePathPrefix', () => {
    it('trims leading and trailing slashes', () => {
      expect(normalizePathPrefix('/s/')).toBe('s')
      expect(normalizePathPrefix('s')).toBe('s')
      expect(normalizePathPrefix('//a/b//')).toBe('a/b')
      expect(normalizePathPrefix(' /s ')).toBe('s')
      expect(normalizePathPrefix('/')).toBe('')
      expect(normalizePathPrefix('')).toBe('')
    })
  })

  describe('isValidPathPrefix', () => {
    it('accepts empty and slash separated segments', () => {
      expect(isValidPathPrefix('')).toBe(true)
      expect(isValidPathPrefix('s')).toBe(true)
      expect(isValidPathPrefix('go/to_it-1')).toBe(true)
    })

    it('rejects anything else', () => {
      expect(isValidPathPrefix('/s')).toBe(false)
      expect(isValidPathPrefix('s/')).toBe(false)
      expect(isValidPathPrefix('a//b')).toBe(false)
      expect(isValidPathPrefix('a b')).toBe(false)
      expect(isValidPathPrefix('a.b')).toBe(false)
      expect(isValidPathPrefix('a?b')).toBe(false)
    })
  })

  describe('buildShortUrl / buildQrUrl', () => {
    it('serves links at the root without a prefix', () => {
      const domain = { hostname: 'nxstp.is', pathPrefix: '' }
      expect(buildShortUrl(domain, 'abc')).toBe('https://nxstp.is/abc')
      expect(buildQrUrl(domain, 'abc')).toBe('https://nxstp.is/abc?qr=1')
      expect(buildShortUrl({ hostname: 'nxstp.is' }, 'abc')).toBe(
        'https://nxstp.is/abc'
      )
    })

    it('inserts the prefix when set', () => {
      const domain = { hostname: 'jesus.film', pathPrefix: 's' }
      expect(buildShortUrl(domain, 'easter')).toBe(
        'https://jesus.film/s/easter'
      )
      expect(buildQrUrl(domain, 'easter')).toBe(
        'https://jesus.film/s/easter?qr=1'
      )
    })
  })
})
