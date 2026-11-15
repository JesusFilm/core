export const durations = ['day', 'week', 'month', 'year'] as const
export type Duration = (typeof durations)[number]
export type AccessMode = 'view' | 'edit'

export function calculateExpiry(start: Date, duration: string): Date {
  if (!durations.includes(duration as Duration)) {
    throw new Error('Unsupported duration')
  }
  const expiry = new Date(start)
  if (duration === 'day' || duration === 'week') {
    expiry.setUTCDate(expiry.getUTCDate() + (duration === 'day' ? 1 : 7))
    return expiry
  }
  const day = expiry.getUTCDate()
  expiry.setUTCDate(1)
  if (duration === 'month') expiry.setUTCMonth(expiry.getUTCMonth() + 1)
  else expiry.setUTCFullYear(expiry.getUTCFullYear() + 1)
  const lastDay = new Date(expiry)
  lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0)
  expiry.setUTCDate(Math.min(day, lastDay.getUTCDate()))
  return expiry
}
