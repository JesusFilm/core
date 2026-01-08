import { localizeAndRound } from './localizeAndRound'

describe('localizeAndRound', () => {
  describe('numbers less than 10,000', () => {
    it('should return locale-formatted number for values under 10,000', () => {
      expect(localizeAndRound(0, 'en')).toBe('0')
      expect(localizeAndRound(100, 'en')).toBe('100')
      expect(localizeAndRound(1000, 'en')).toBe('1,000')
      expect(localizeAndRound(9999, 'en')).toBe('9,999')
    })

    it('should respect locale formatting for small numbers', () => {
      expect(localizeAndRound(1000, 'de')).toContain('1')
      expect(localizeAndRound(1000, 'fr')).toContain('1')
    })
  })

  describe('Japanese and Chinese locales (万 format)', () => {
    const locales = ['ja', 'zh', 'zh-Hans-CN']

    locales.forEach((locale) => {
      describe(`locale: ${locale}`, () => {
        it('should format 1-9万 with 2 decimal places', () => {
          expect(localizeAndRound(10000, locale)).toBe('1万')
          expect(localizeAndRound(10200, locale)).toBe('1.02万')
          expect(localizeAndRound(50000, locale)).toBe('5万')
          expect(localizeAndRound(99900, locale)).toBe('9.99万')
        })

        it('should format 10-99万 with 1 decimal place', () => {
          expect(localizeAndRound(100000, locale)).toBe('10万')
          expect(localizeAndRound(811100, locale)).toBe('81.1万')
          expect(localizeAndRound(999900, locale)).toBe('99.99万')
        })

        it('should format 100万+ with no decimals', () => {
          expect(localizeAndRound(1000000, locale)).toBe('100万')
          expect(localizeAndRound(8792342, locale)).toBe('879万')
          expect(localizeAndRound(88867810, locale)).toBe('8887万')
        })
      })
    })
  })

  describe('Korean locale (만 format)', () => {
    it('should format 1-9만 with 2 decimal places', () => {
      expect(localizeAndRound(10000, 'ko')).toBe('1만')
      expect(localizeAndRound(10200, 'ko')).toBe('1.02만')
      expect(localizeAndRound(50000, 'ko')).toBe('5만')
      expect(localizeAndRound(99900, 'ko')).toBe('9.99만')
    })

    it('should format 10-99만 with 1 decimal place', () => {
      expect(localizeAndRound(100000, 'ko')).toBe('10만')
      expect(localizeAndRound(811100, 'ko')).toBe('81.1만')
      expect(localizeAndRound(999900, 'ko')).toBe('99.99만')
    })

    it('should format 100만+ with no decimals', () => {
      expect(localizeAndRound(1000000, 'ko')).toBe('100만')
      expect(localizeAndRound(8792342, 'ko')).toBe('879만')
      expect(localizeAndRound(88867810, 'ko')).toBe('8887만')
    })
  })

  describe('default/English locale (k and M format)', () => {
    it('should format 10k-99.9k with 1 decimal place', () => {
      expect(localizeAndRound(10000, 'en')).toBe('10k')
      expect(localizeAndRound(10100, 'en')).toBe('10.1k')
      expect(localizeAndRound(12300, 'en')).toBe('12.3k')
      expect(localizeAndRound(99900, 'en')).toBe('99.9k')
    })

    it('should format 100k-999k with no decimals (truncated)', () => {
      expect(localizeAndRound(100000, 'en')).toBe('100k')
      expect(localizeAndRound(152610, 'en')).toBe('152k')
      expect(localizeAndRound(999999, 'en')).toBe('999k')
    })

    it('should format 1M-9.9M with 1 decimal place', () => {
      expect(localizeAndRound(1000000, 'en')).toBe('1M')
      expect(localizeAndRound(1500000, 'en')).toBe('1.5M')
      expect(localizeAndRound(9900000, 'en')).toBe('9.9M')
    })

    it('should format 10M-999M with no decimals', () => {
      expect(localizeAndRound(10000000, 'en')).toBe('10M')
      expect(localizeAndRound(100000000, 'en')).toBe('100M')
      expect(localizeAndRound(999000000, 'en')).toBe('999M')
    })

    it('should use k format for other locales by default', () => {
      expect(localizeAndRound(10000, 'es')).toBe('10k')
      expect(localizeAndRound(10000, 'fr')).toBe('10k')
      expect(localizeAndRound(100000, 'de')).toBe('100k')
      expect(localizeAndRound(1000000, 'pt')).toBe('1M')
    })
  })

  describe('edge cases and boundaries', () => {
    it('should handle exact boundary values', () => {
      expect(localizeAndRound(10000, 'en')).toBe('10k')
      expect(localizeAndRound(100000, 'en')).toBe('100k')
      expect(localizeAndRound(1000000, 'en')).toBe('1M')
    })

    it('should handle rounding correctly', () => {
      expect(localizeAndRound(10150, 'en')).toBe('10.2k')
      expect(localizeAndRound(10250, 'en')).toBe('10.3k')
      expect(localizeAndRound(152610, 'en')).toBe('152k')
    })

    it('should remove trailing zeros', () => {
      expect(localizeAndRound(10000, 'en')).toBe('10k')
      expect(localizeAndRound(50000, 'en')).toBe('50k')
      expect(localizeAndRound(1000000, 'en')).toBe('1M')
    })

    it('should handle very large numbers', () => {
      expect(localizeAndRound(999000000, 'en')).toBe('999M')
      expect(localizeAndRound(999000000, 'zh')).toBe('99900万')
    })
  })
})
