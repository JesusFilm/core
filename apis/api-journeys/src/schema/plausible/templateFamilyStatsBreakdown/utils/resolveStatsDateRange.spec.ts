import { resolveStatsDateRange } from './resolveStatsDateRange'

const createdAt = new Date('2023-05-31T14:00:00Z')
const now = new Date('2025-03-15T23:00:00Z')

describe('resolveStatsDateRange', () => {
  it('derives the all-time interval on the server without requiring a date', () => {
    expect(resolveStatsDateRange({ period: 'all' }, createdAt, now)).toEqual({
      date: '2023-05-31,2025-03-15'
    })
  })

  it.each([
    ['day', '2025-03-15,2025-03-15'],
    ['7d', '2025-03-09,2025-03-15'],
    ['30d', '2025-02-14,2025-03-15'],
    ['month', '2025-03-01,2025-03-31'],
    ['6mo', '2024-10-01,2025-03-31'],
    ['12mo', '2024-04-01,2025-03-31'],
    ['year', '2025-01-01,2025-12-31']
  ])(
    'uses the same explicit interval for Plausible and responses with %s',
    (period, date) => {
      expect(
        resolveStatsDateRange({ period, date: '2025-03-15' }, createdAt, now)
      ).toEqual({ date, responseDateRange: date })
    }
  )

  it('defaults to a bounded 30-day window when period and anchor are omitted', () => {
    expect(resolveStatsDateRange({}, createdAt, now).responseDateRange).toBe(
      '2025-02-14,2025-03-15'
    )
  })

  it('supports inclusive single-day custom ranges', () => {
    expect(
      resolveStatsDateRange(
        { period: 'custom', date: '2024-02-29,2024-02-29' },
        createdAt,
        now
      ).responseDateRange
    ).toBe('2024-02-29,2024-02-29')
  })

  it.each([
    { period: 'custom' },
    { period: 'custom', date: '2025-03-02,2025-03-01' },
    { period: 'custom', date: '2025-02-30,2025-03-01' },
    { period: '7d', date: 'invalid' },
    { period: 'unknown' }
  ])('rejects invalid intervals %j', (filter) => {
    expect(() => resolveStatsDateRange(filter, createdAt, now)).toThrow()
  })
})
