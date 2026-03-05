import {
  parseISO,
  startOfMonth,
  startOfToday,
  startOfYear,
  subDays,
  subMonths
} from 'date-fns'

// Used to filter all time stats
export const earliestStatsCollected = '2024-06-01'

export type DateRangePresetId =
  | 'today'
  | 'yesterday'
  | 'last7Days'
  | 'last30Days'
  | 'monthToDate'
  | 'lastMonth'
  | 'yearToDate'
  | 'last12Months'
  | 'allTime'
  | 'customRange'

export const dateRangePresetLabels: Record<DateRangePresetId, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7Days: 'Last 7 Days',
  last30Days: 'Last 30 Days',
  monthToDate: 'Month to Date',
  lastMonth: 'Last Month',
  yearToDate: 'Year to Date',
  last12Months: 'Last 12 months',
  allTime: 'All time',
  customRange: 'Custom Range'
}

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

export function buildPresetDateRange(
  preset: DateRangePresetId,
  minDate: Date | null
): DateRange {
  const today = startOfToday()

  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today }
    case 'yesterday': {
      const yesterday = subDays(today, 1)
      return { startDate: yesterday, endDate: yesterday }
    }
    case 'last7Days':
      return {
        startDate: subDays(today, 6),
        endDate: today
      }
    case 'last30Days':
      return {
        startDate: subDays(today, 29),
        endDate: today
      }
    case 'monthToDate':
      return {
        startDate: startOfMonth(today),
        endDate: today
      }
    case 'lastMonth': {
      const endOfPreviousMonth = subDays(startOfMonth(today), 1)
      return {
        startDate: startOfMonth(endOfPreviousMonth),
        endDate: endOfPreviousMonth
      }
    }
    case 'yearToDate':
      return {
        startDate: startOfYear(today),
        endDate: today
      }
    case 'last12Months':
      return {
        startDate: subMonths(today, 12),
        endDate: today
      }
    case 'allTime':
      return {
        startDate: minDate ?? parseISO(earliestStatsCollected),
        endDate: today
      }
    case 'customRange':
      return {
        startDate: null,
        endDate: null
      }
  }
}
