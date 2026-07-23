import {
  buildNormalizedBlockHeadersFromEvents,
  formatGoogleSheetsDateFromIso
} from './googleSheetsSyncShared'

describe('googleSheetsSyncShared', () => {
  describe('buildNormalizedBlockHeadersFromEvents', () => {
    it('keeps the first non-empty label encountered for each blockId', () => {
      const result = buildNormalizedBlockHeadersFromEvents([
        { blockId: 'b1', label: null },
        { blockId: 'b1', label: '   ' },
        { blockId: 'b1', label: 'First' },
        { blockId: 'b1', label: 'Second' },
        { blockId: 'b2', label: '  Two  ' }
      ])

      expect(result).toEqual([
        { blockId: 'b1', label: 'First' },
        { blockId: 'b2', label: 'Two' }
      ])
    })
  })

  describe('formatGoogleSheetsDateFromIso', () => {
    it('formats a UTC timestamp into YYYY-MM-DD in the provided timezone', () => {
      // 2026-01-27T01:30:00Z is still 2026-01-26 in America/Chicago (UTC-6)
      expect(
        formatGoogleSheetsDateFromIso(
          '2026-01-27T01:30:00.000Z',
          'America/Chicago'
        )
      ).toBe('2026-01-26')

      // Same instant is 2026-01-27 in UTC
      expect(
        formatGoogleSheetsDateFromIso('2026-01-27T01:30:00.000Z', 'UTC')
      ).toBe('2026-01-27')
    })

    it('handles day-boundary changes correctly (timezone ahead of UTC)', () => {
      // 2026-01-27T23:30:00Z becomes next day in Asia/Tokyo (UTC+9)
      expect(
        formatGoogleSheetsDateFromIso('2026-01-27T23:30:00.000Z', 'Asia/Tokyo')
      ).toBe('2026-01-28')
    })

    it('returns the input when the ISO string cannot be parsed', () => {
      expect(formatGoogleSheetsDateFromIso('not-a-date', 'UTC')).toBe(
        'not-a-date'
      )
    })
  })
})
