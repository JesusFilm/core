export function fixedDate(date?: Date): Date {
  const fixedDate = date ?? new Date('2021-01-01T00:00:00Z')
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(fixedDate.getTime())
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  return fixedDate
}
