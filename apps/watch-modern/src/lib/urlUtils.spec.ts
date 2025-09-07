/**
 * @jest-environment jsdom
 */

import { buildWatchNowUrl, sanitizeSlug, isSafeUrl } from './urlUtils'

describe('URL Utilities', () => {
  describe('sanitizeSlug', () => {
    it('should remove protocol and host from URLs', () => {
      expect(sanitizeSlug('https://example.com/watch/video-slug')).toBe('watch/video-slug')
      expect(sanitizeSlug('http://www.jesusfilm.org/watch/test')).toBe('watch/test')
    })

    it('should remove query parameters', () => {
      expect(sanitizeSlug('video-slug?param=value&another=test')).toBe('video-slug')
      expect(sanitizeSlug('path/to/video?tracking=123')).toBe('path/to/video')
    })

    it('should remove fragments', () => {
      expect(sanitizeSlug('video-slug#section')).toBe('video-slug')
      expect(sanitizeSlug('path/video#anchor')).toBe('path/video')
    })

    it('should remove both query and fragment', () => {
      expect(sanitizeSlug('video-slug?param=value#section')).toBe('video-slug')
    })

    it('should remove leading and trailing slashes', () => {
      expect(sanitizeSlug('/video-slug/')).toBe('video-slug')
      expect(sanitizeSlug('/path/to/video/')).toBe('path/to/video')
    })

    it('should handle clean slugs without modification', () => {
      expect(sanitizeSlug('clean-video-slug')).toBe('clean-video-slug')
      expect(sanitizeSlug('path/to/clean/slug')).toBe('path/to/clean/slug')
    })

    it('should handle empty and undefined inputs', () => {
      expect(sanitizeSlug('')).toBe('')
      expect(sanitizeSlug(undefined as any)).toBe('')
      expect(sanitizeSlug(null as any)).toBe('')
    })

    it('should handle complex URLs with all components', () => {
      expect(sanitizeSlug('https://example.com/watch/path/video.html?tracking=123&source=test#section'))
        .toBe('watch/path/video.html')
    })

    it('should preserve .html extensions in slugs', () => {
      expect(sanitizeSlug('video-slug.html')).toBe('video-slug.html')
      expect(sanitizeSlug('path/to/video.html')).toBe('path/to/video.html')
    })
  })

  describe('buildWatchNowUrl', () => {
    const baseUrl = 'https://www.jesusfilm.org/watch'

    it('should build correct URL with clean slug', () => {
      expect(buildWatchNowUrl(baseUrl, 'test-video')).toBe('https://www.jesusfilm.org/watch/test-video')
    })

    it('should build correct URL with path slug', () => {
      expect(buildWatchNowUrl(baseUrl, 'path/to/video')).toBe('https://www.jesusfilm.org/watch/path/to/video')
    })

    it('should sanitize slug before building URL', () => {
      expect(buildWatchNowUrl(baseUrl, 'https://example.com/watch/video-slug?param=value'))
        .toBe('https://www.jesusfilm.org/watch/watch/video-slug')
    })

    it('should handle languageSlugOverride when provided', () => {
      expect(buildWatchNowUrl(baseUrl, 'original-slug', 'override-slug'))
        .toBe('https://www.jesusfilm.org/watch/override-slug')
    })

    it('should use original slug when languageSlugOverride is null', () => {
      expect(buildWatchNowUrl(baseUrl, 'original-slug', null))
        .toBe('https://www.jesusfilm.org/watch/original-slug')
    })

    it('should use original slug when languageSlugOverride is undefined', () => {
      expect(buildWatchNowUrl(baseUrl, 'original-slug', undefined))
        .toBe('https://www.jesusfilm.org/watch/original-slug')
    })

    it('should sanitize both original slug and languageSlugOverride', () => {
      expect(buildWatchNowUrl(baseUrl, 'https://example.com/watch/original?param=1', 'https://example.com/watch/override?param=2'))
        .toBe('https://www.jesusfilm.org/watch/watch/override')
    })

    it('should handle empty slugs', () => {
      expect(buildWatchNowUrl(baseUrl, '', null)).toBe('https://www.jesusfilm.org/watch/')
      expect(buildWatchNowUrl(baseUrl, '', '')).toBe('https://www.jesusfilm.org/watch/')
    })

    it('should work with different base URLs', () => {
      const devUrl = 'https://dev.jesusfilm.org/watch'
      expect(buildWatchNowUrl(devUrl, 'test-video')).toBe('https://dev.jesusfilm.org/watch/test-video')

      const localUrl = 'http://localhost:3000/watch'
      expect(buildWatchNowUrl(localUrl, 'local-video')).toBe('http://localhost:3000/watch/local-video')
    })
  })

  describe('isSafeUrl', () => {
    it('should allow http and https URLs', () => {
      expect(isSafeUrl('https://www.jesusfilm.org/watch/video')).toBe(true)
      expect(isSafeUrl('http://example.com/video')).toBe(true)
    })

    it('should reject non-http protocols', () => {
      expect(isSafeUrl('ftp://example.com/file')).toBe(false)
      expect(isSafeUrl('javascript:alert("xss")')).toBe(false)
      expect(isSafeUrl('data:text/html,<script>alert("xss")</script>')).toBe(false)
    })

    it('should validate allowed hosts when provided', () => {
      const allowedHosts = ['jesusfilm.org', 'example.com']

      expect(isSafeUrl('https://www.jesusfilm.org/watch/video', allowedHosts)).toBe(true)
      expect(isSafeUrl('https://example.com/video', allowedHosts)).toBe(true)
      expect(isSafeUrl('https://sub.jesusfilm.org/video', allowedHosts)).toBe(true)
      expect(isSafeUrl('https://unauthorized.com/video', allowedHosts)).toBe(false)
    })

    it('should allow all hosts when no allowedHosts provided', () => {
      expect(isSafeUrl('https://any-domain.com/video')).toBe(true)
      expect(isSafeUrl('https://malicious-site.com/video')).toBe(true)
    })

    it('should handle invalid URLs gracefully', () => {
      expect(isSafeUrl('not-a-url')).toBe(false)
      expect(isSafeUrl('')).toBe(false)
      expect(isSafeUrl(null as any)).toBe(false)
      expect(isSafeUrl(undefined as any)).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isSafeUrl('https://example.com')).toBe(true)
      expect(isSafeUrl('https://example.com/')).toBe(true)
      expect(isSafeUrl('https://example.com/path?query=value#fragment')).toBe(true)
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete URL building workflow', () => {
      // Simulate real-world usage
      const baseUrl = 'https://www.jesusfilm.org/watch'
      const rawSlug = 'https://api.jesusfilm.org/watch/video-slug.html?tracking=123&source=campaign'
      const languageOverride = 'es/video-slug' // Spanish version

      const finalUrl = buildWatchNowUrl(baseUrl, rawSlug, languageOverride)

      expect(finalUrl).toBe('https://www.jesusfilm.org/watch/es/video-slug')
      expect(isSafeUrl(finalUrl)).toBe(true)
    })

    it('should handle various slug formats from different sources', () => {
      const baseUrl = 'https://www.jesusfilm.org/watch'
      const testCases = [
        { input: 'simple-slug', expected: 'https://www.jesusfilm.org/watch/simple-slug' },
        { input: 'path/to/slug', expected: 'https://www.jesusfilm.org/watch/path/to/slug' },
        { input: 'slug.html', expected: 'https://www.jesusfilm.org/watch/slug.html' },
        { input: 'https://source.com/watch/slug?param=1', expected: 'https://www.jesusfilm.org/watch/watch/slug' },
        { input: '/slug/', expected: 'https://www.jesusfilm.org/watch/slug' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(buildWatchNowUrl(baseUrl, input)).toBe(expected)
      })
    })

    it('should maintain security by rejecting unsafe URLs', () => {
      const safeUrl = buildWatchNowUrl('https://www.jesusfilm.org/watch', 'safe-slug')
      const unsafeBaseUrl = 'javascript:alert("xss")'

      expect(isSafeUrl(safeUrl)).toBe(true)
      expect(isSafeUrl(unsafeBaseUrl)).toBe(false)

      // Should not be able to inject unsafe base URLs
      expect(() => buildWatchNowUrl(unsafeBaseUrl, 'slug')).toThrow()
    })
  })
})
