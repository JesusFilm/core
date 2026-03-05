import {
  parseISO,
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

    expect(buildPresetDateRange('today', null)).toEqual({
      startDate: today,
      endDate: today
    })
  })

  it('returns yesterday range for "yesterday" preset', () => {
    const today = startOfToday()
    const expected = subDays(today, 1)

    expect(buildPresetDateRange('yesterday', null)).toEqual({
      startDate: expected,
      endDate: expected
    })
  })

  it('returns last 7 days range for "last7Days" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('last7Days', null)).toEqual({
      startDate: subDays(today, 6),
      endDate: today
    })
  })

  it('returns last 30 days range for "last30Days" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('last30Days', null)).toEqual({
      startDate: subDays(today, 29),
      endDate: today
    })
  })

  it('returns month to date range for "monthToDate" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('monthToDate', null)).toEqual({
      startDate: startOfMonth(today),
      endDate: today
    })
  })

  it('returns previous full month for "lastMonth" preset', () => {
    const today = startOfToday()
    const endOfPreviousMonth = subDays(startOfMonth(today), 1)

    expect(buildPresetDateRange('lastMonth', null)).toEqual({
      startDate: startOfMonth(endOfPreviousMonth),
      endDate: endOfPreviousMonth
    })
  })

  it('returns year to date range for "yearToDate" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('yearToDate', null)).toEqual({
      startDate: startOfYear(today),
      endDate: today
    })
  })

  it('returns last 12 months range for "last12Months" preset', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('last12Months', null)).toEqual({
      startDate: subMonths(today, 12),
      endDate: today
    })
  })

  it('uses earliest stats date for "allTime" preset when minDate is null', () => {
    const today = startOfToday()

    expect(buildPresetDateRange('allTime', null)).toEqual({
      startDate: parseISO(earliestStatsCollected),
      endDate: today
    })
  })

  it('uses minDate as start for "allTime" preset when minDate is provided', () => {
    const today = startOfToday()
    const journeyStart = new Date('2024-06-10T00:00:00.000Z')

    expect(buildPresetDateRange('allTime', journeyStart)).toEqual({
      startDate: journeyStart,
      endDate: today
    })
  })

  it('uses minDate for "allTime" when journey started after earliest stats', () => {
    const today = startOfToday()
    const journeyStart = new Date('2025-01-15T00:00:00.000Z')

    expect(buildPresetDateRange('allTime', journeyStart)).toEqual({
      startDate: journeyStart,
      endDate: today
    })
  })

  it('returns null dates for "customRange" preset', () => {
    expect(buildPresetDateRange('customRange', null)).toEqual({
      startDate: null,
      endDate: null
    })
  })

  it('ignores minDate for presets other than "allTime"', () => {
    const minDate = new Date('2024-06-10T00:00:00.000Z')

    expect(buildPresetDateRange('today', minDate)).toEqual(
      buildPresetDateRange('today', null)
    )
    expect(buildPresetDateRange('last7Days', minDate)).toEqual(
      buildPresetDateRange('last7Days', null)
    )
  })
})
