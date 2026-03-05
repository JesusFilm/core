import { parseISO, startOfDay } from 'date-fns'

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

  it('returns start of day when createdAt is an ISO date string', () => {
    const result = getJourneyStartDate('2024-06-15T14:30:00.000Z')
    expect(result).toEqual(startOfDay(new Date('2024-06-15T14:30:00.000Z')))
  })

  it('returns start of day when createdAt is date-only string', () => {
    const result = getJourneyStartDate('2024-06-15')
    expect(result).toEqual(startOfDay(new Date('2024-06-15')))
  })

  it('returns start of day when createdAt is a Date object', () => {
    const date = new Date('2024-06-15T18:45:00.000Z')
    expect(getJourneyStartDate(date)).toEqual(startOfDay(date))
  })

  it('strips time component to midnight local', () => {
    const result = getJourneyStartDate('2024-06-15T23:59:59.999Z')
    const start = startOfDay(new Date('2024-06-15T23:59:59.999Z'))
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
    expect(result).toEqual(start)
  })
})
