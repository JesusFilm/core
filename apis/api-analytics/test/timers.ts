import { afterAll, beforeAll, vi } from 'vitest'

export function fixedDate(date?: Date): Date {
  const fixedDate = date ?? new Date('2021-01-01T00:00:00Z')
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate.getTime())
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  return fixedDate
}
