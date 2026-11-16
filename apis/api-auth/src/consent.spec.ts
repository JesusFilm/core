import { calculateExpiry } from './consent'

describe('consent duration', () => {
  it.each([
    ['day', '2028-01-31T12:30:00.000Z', '2028-02-01T12:30:00.000Z'],
    ['week', '2028-01-31T12:30:00.000Z', '2028-02-07T12:30:00.000Z'],
    ['month', '2028-01-31T12:30:00.000Z', '2028-02-29T12:30:00.000Z'],
    ['year', '2028-02-29T12:30:00.000Z', '2029-02-28T12:30:00.000Z'],
    ['month', '2027-12-31T12:30:00.000Z', '2028-01-31T12:30:00.000Z']
  ])(
    'calculates %s with UTC calendar clamping',
    (duration, start, expected) => {
      expect(calculateExpiry(new Date(start), duration).toISOString()).toBe(
        expected
      )
    }
  )

  it('rejects a duration outside the offered choices', () => {
    expect(() => calculateExpiry(new Date(), 'forever')).toThrow()
  })
})
