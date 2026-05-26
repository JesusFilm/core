import {
  TEMPLATE_GALLERY_SLUG_RE,
  isValidTemplateGallerySlug
} from './templateGallerySlug'

describe('templateGallerySlug', () => {
  describe('TEMPLATE_GALLERY_SLUG_RE', () => {
    it.each([
      ['simple lowercase', 'collection'],
      ['lowercase with hyphens', 'my-collection'],
      ['digits', 'collection-2026'],
      ['multi-segment hyphenated', 'a-b-c-d'],
      ['single character', 'a'],
      ['single digit', '1']
    ])('accepts %s: %j', (_, value) => {
      expect(TEMPLATE_GALLERY_SLUG_RE.test(value)).toBe(true)
    })

    it.each([
      ['empty string', ''],
      ['uppercase letters', 'Collection'],
      ['mixed case', 'myCollection'],
      ['leading hyphen', '-collection'],
      ['trailing hyphen', 'collection-'],
      ['consecutive hyphens', 'my--collection'],
      ['underscore', 'my_collection'],
      ['whitespace', 'my collection'],
      ['path traversal segment', '../privacy-policy'],
      ['forward slash', 'foo/bar'],
      ['query separator', 'foo?bar'],
      ['fragment', 'foo#bar'],
      // Use \uXXXX escape sequences (not literal bytes) for non-printable
      // / non-ASCII test fixtures so the file stays ASCII-clean. A
      // literal NUL byte in source classified the whole spec as binary
      // in git diffs (Mike review, NES-1644); CI still ran the file,
      // but PR review tooling couldn't render the diff.
      ['unicode', 'caf\u00e9'],
      ['null byte', 'foo\u0000bar']
    ])('rejects %s: %j', (_, value) => {
      expect(TEMPLATE_GALLERY_SLUG_RE.test(value)).toBe(false)
    })
  })

  describe('isValidTemplateGallerySlug', () => {
    it('narrows to string on valid input', () => {
      const value: unknown = 'my-collection'
      if (isValidTemplateGallerySlug(value)) {
        // Type narrowing - `value` is `string` inside the branch.
        expect(value.length).toBeGreaterThan(0)
      } else {
        throw new Error('expected narrowing branch')
      }
    })

    it.each([
      [null],
      [undefined],
      [42],
      [[] as unknown],
      [{} as unknown],
      [true]
    ])('rejects non-string %j', (value) => {
      expect(isValidTemplateGallerySlug(value)).toBe(false)
    })

    it('rejects an array of two valid slugs (Next-style multi-value query)', () => {
      // `req.query.slug` can be `string | string[] | undefined`. The
      // function must reject the array even though each element parses.
      expect(isValidTemplateGallerySlug(['a', 'b'])).toBe(false)
    })
  })
})
