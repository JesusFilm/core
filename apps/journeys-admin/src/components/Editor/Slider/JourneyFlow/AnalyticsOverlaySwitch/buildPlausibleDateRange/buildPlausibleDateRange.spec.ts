// Ensure we use the real formatISO implementation, not a mock from other tests
import { formatISO } from 'date-fns'

import { buildPlausibleDateRange } from './buildPlausibleDateRange'

describe('buildPlausibleDateRange', () => {
  const fallbackStart = '2024-06-01'
  const fallbackEnd = new Date('2024-06-10')

  it('returns formatted range when start and end dates are valid', () => {
    const startDate = new Date('2024-06-02')
    const endDate = new Date('2024-06-05')

    const result = buildPlausibleDateRange(
      startDate,
      endDate,
      fallbackStart,
      fallbackEnd
    )

    expect(result).toBe(
      `${formatISO(startDate, { representation: 'date' })},${formatISO(endDate, { representation: 'date' })}`
    )
  })

  it('falls back when dates are null', () => {
    const result = buildPlausibleDateRange(
      null,
      null,
      fallbackStart,
      fallbackEnd
    )

    expect(result).toBe(
      `${fallbackStart},${formatISO(fallbackEnd, { representation: 'date' })}`
    )
  })

  it('falls back when start date is after end date', () => {
    const startDate = new Date('2024-06-06')
    const endDate = new Date('2024-06-05')

    const result = buildPlausibleDateRange(
      startDate,
      endDate,
      fallbackStart,
      fallbackEnd
    )

    expect(result).toBe(
      `${formatISO(fallbackStart, { representation: 'date' })},${formatISO(fallbackEnd, { representation: 'date' })}`
    )
  })
})
