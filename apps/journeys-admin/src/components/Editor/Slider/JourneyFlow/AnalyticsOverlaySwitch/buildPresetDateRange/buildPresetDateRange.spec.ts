import {
  startOfMonth,
  startOfToday,
  startOfYear,
  subDays,
  subMonths
} from 'date-fns'

import {
  buildPresetDateRange,
  earliestStatsCollected
} from './buildPresetDateRange'

describe('buildPresetDateRange', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-15T12:00:00.000Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('returns today range for "today" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('today')).toEqual({
      startDate: today,
      endDate: today
    })
  })

  it('returns yesterday range for "yesterday" preset', () => {
    const today = startOfToday()
    const expected = subDays(today, 1)

    expect(buildPresetDateRange('yesterday')).toEqual({
      startDate: expected,
      endDate: expected
    })
  })

  it('returns last 7 days range for "last7Days" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('last7Days')).toEqual({
      startDate: subDays(today, 6),
      endDate: today
    })
  })

  it('returns last 30 days range for "last30Days" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('last30Days')).toEqual({
      startDate: subDays(today, 29),
      endDate: today
    })
  })

  it('returns month to date range for "monthToDate" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('monthToDate')).toEqual({
      startDate: startOfMonth(today),
      endDate: today
    })
  })

  it('returns previous full month for "lastMonth" preset', () => {
    const today = startOfToday()
    const endOfPreviousMonth = subDays(startOfMonth(today), 1)

    expect(buildPresetDateRange('lastMonth')).toEqual({
      startDate: startOfMonth(endOfPreviousMonth),
      endDate: endOfPreviousMonth
    })
  })

  it('returns year to date range for "yearToDate" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('yearToDate')).toEqual({
      startDate: startOfYear(today),
      endDate: today
    })
  })

  it('returns last 12 months range for "last12Months" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('last12Months')).toEqual({
      startDate: subMonths(today, 12),
      endDate: today
    })
  })

  it('uses earliest stats date for "allTime" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('allTime')).toEqual({
      startDate: new Date(earliestStatsCollected),
      endDate: today
    })
  })

  it('returns null dates for "customRange" preset', () => {
    expect(buildPresetDateRange('customRange')).toEqual({
      startDate: null,
      endDate: null
    })
  })
})
