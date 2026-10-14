import {
  EDGE_PATH_PATTERN,
  compileSlugPattern,
  isReservedPath,
  isValidSlugAllowedChars,
  normalizePathname,
  validatePathname
} from './slug'

const grammar = {
  slugAllowedChars: 'A-Za-z0-9_-',
  slugMinLength: 3,
  slugMaxLength: 32,
  slugCaseSensitive: true,
  reservedPaths: ['s', 'hls', '.well-known']
}

describe('slug grammar', () => {
  describe('compileSlugPattern', () => {
    it('compiles a character-class body', () => {
      expect(compileSlugPattern('a-z0-9-')?.test('abc-1')).toBe(true)
      expect(compileSlugPattern('a-z0-9-')?.test('ABC')).toBe(false)
    })

    it('returns null for an invalid class body', () => {
      expect(compileSlugPattern('')).toBeNull()
      expect(compileSlugPattern('a-z]')).toBeNull()
      expect(compileSlugPattern('z-a')).toBeNull()
      expect(isValidSlugAllowedChars('A-Za-z0-9_-')).toBe(true)
      expect(isValidSlugAllowedChars('z-a')).toBe(false)
    })
  })

  describe('normalizePathname', () => {
    it('lower-cases only on case-insensitive domains', () => {
      expect(normalizePathname('AbC', { slugCaseSensitive: true })).toBe('AbC')
      expect(normalizePathname('AbC', { slugCaseSensitive: false })).toBe('abc')
    })
  })

  describe('isReservedPath', () => {
    it('matches the first segment case-insensitively', () => {
      expect(isReservedPath('s', grammar.reservedPaths)).toBe(true)
      expect(isReservedPath('HLS', grammar.reservedPaths)).toBe(true)
      expect(isReservedPath('hls/abc', grammar.reservedPaths)).toBe(true)
      expect(isReservedPath('.well-known', grammar.reservedPaths)).toBe(true)
      expect(isReservedPath('shls', grammar.reservedPaths)).toBe(false)
    })
  })

  describe('validatePathname', () => {
    it('accepts a pathname within the grammar', () => {
      expect(validatePathname('abc_D-9', grammar)).toBeNull()
    })

    it('rejects pathnames outside the grammar', () => {
      expect(validatePathname('ab', grammar)?.code).toBe('tooShort')
      expect(validatePathname('a'.repeat(33), grammar)?.code).toBe('tooLong')
      expect(validatePathname('ab.c', grammar)?.code).toBe('invalidCharacters')
      expect(validatePathname('ab/c', grammar)?.code).toBe('invalidCharacters')
      expect(validatePathname('hls', grammar)?.code).toBe('reserved')
      expect(
        validatePathname('abc', { ...grammar, slugAllowedChars: 'z-a' })?.code
      ).toBe('invalidGrammar')
    })
  })

  describe('EDGE_PATH_PATTERN', () => {
    it('matches the Worker grammar', () => {
      expect(EDGE_PATH_PATTERN.test('abc-123_.~')).toBe(true)
      expect(EDGE_PATH_PATTERN.test('')).toBe(false)
      expect(EDGE_PATH_PATTERN.test('a/b')).toBe(false)
      expect(EDGE_PATH_PATTERN.test('a'.repeat(65))).toBe(false)
    })
  })
})
