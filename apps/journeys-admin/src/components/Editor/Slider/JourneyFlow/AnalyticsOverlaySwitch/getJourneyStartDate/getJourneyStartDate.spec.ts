import { parseISO } from 'date-fns'

import { earliestStatsCollected } from '../buildPresetDateRange'

import { getJourneyStartDate } from './getJourneyStartDate'

describe('getJourneyStartDate', () => {
  it('returns earliest stats date when createdAt is null', () => {
    expect(getJourneyStartDate(null)).toEqual(parseISO(earliestStatsCollected))
  })

  it('returns earliest stats date when createdAt is undefined', () => {
    expect(getJourneyStartDate(undefined)).toEqual(
      parseISO(earliestStatsCollected)
    )
  })

  it('returns start of day in UTC when createdAt is an ISO date string', () => {
    const result = getJourneyStartDate('2024-06-15T14:30:00.000Z')
    expect(result).toEqual(new Date('2024-06-15T00:00:00.000Z'))
  })

  it('returns start of day in UTC when createdAt is date-only string', () => {
    const result = getJourneyStartDate('2024-06-15')
    expect(result).toEqual(new Date('2024-06-15T00:00:00.000Z'))
  })

  it('returns start of day in UTC when createdAt is a Date object', () => {
    const date = new Date('2024-06-15T18:45:00.000Z')
    expect(getJourneyStartDate(date)).toEqual(
      new Date('2024-06-15T00:00:00.000Z')
    )
  })

  it('strips time component to midnight UTC', () => {
    const result = getJourneyStartDate('2024-06-15T23:59:59.999Z')
    expect(result.getUTCHours()).toBe(0)
    expect(result.getUTCMinutes()).toBe(0)
    expect(result.getUTCSeconds()).toBe(0)
    expect(result.getUTCMilliseconds()).toBe(0)
    expect(result).toEqual(new Date('2024-06-15T00:00:00.000Z'))
  })
})
