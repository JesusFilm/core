import { GraphQLError } from 'graphql'
import { z } from 'zod'

interface StatsDateFilter {
  period?: string | null
  date?: string | null
}

interface StatsDateRange {
  date: string
  responseDateRange?: string
}

const dateSchema = z.iso.date()
const rangeSchema = z
  .tuple([dateSchema, dateSchema])
  .refine(([start, end]) => start <= end)
const isoDate = (date: Date): string => date.toISOString().slice(0, 10)

/** Resolves supported periods to one inclusive UTC range before any analytics calls. */
export function resolveStatsDateRange(
  filter: StatsDateFilter,
  templateCreatedAt: Date,
  now = new Date()
): StatsDateRange {
  const period = filter.period ?? '30d'
  if (period === 'all') {
    return { date: `${isoDate(templateCreatedAt)},${isoDate(now)}` }
  }
  if (period === 'custom') {
    const parsed = rangeSchema.safeParse(filter.date?.split(','))
    if (!parsed.success) throw invalidDateRange()
    const date = parsed.data.join(',')
    return { date, responseDateRange: date }
  }
  const anchor = dateSchema.safeParse(
    filter.date == null || filter.date === 'today' ? isoDate(now) : filter.date
  )
  if (!anchor.success) throw invalidDateRange()
  const end = new Date(`${anchor.data}T00:00:00.000Z`)
  const start = new Date(end)
  switch (period) {
    case 'day':
      break
    case '7d':
    case '30d':
      start.setUTCDate(start.getUTCDate() - (period === '7d' ? 6 : 29))
      break
    case 'month':
    case '6mo':
    case '12mo': {
      const months = period === 'month' ? 1 : period === '6mo' ? 6 : 12
      start.setUTCDate(1)
      start.setUTCMonth(start.getUTCMonth() - months + 1)
      end.setUTCMonth(end.getUTCMonth() + 1, 0)
      break
    }
    case 'year':
      start.setUTCMonth(0, 1)
      end.setUTCMonth(11, 31)
      break
    default:
      throw new GraphQLError('Unsupported analytics period', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
  }
  const date = `${isoDate(start)},${isoDate(end)}`
  return { date, responseDateRange: date }
}

function invalidDateRange(): GraphQLError {
  return new GraphQLError('Invalid analytics date range', {
    extensions: { code: 'BAD_USER_INPUT' }
  })
}
