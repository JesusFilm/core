import { ProcessedRow } from '../types'

import { addRowToTotal } from './addRowToTotal'

describe('addRowToTotal', () => {
  const createMockProcessedRow = (
    overrides: Partial<ProcessedRow> = {}
  ): ProcessedRow => ({
    __typename: 'TemplateFamilyStatsBreakdownResponse',
    journeyId: 'journey-1',
    journeyName: 'Test Journey',
    teamName: 'Test Team',
    status: null,
    stats: [],
    views: 0,
    responses: 0,
    christDecisionCapture: 0,
    prayerRequestCapture: 0,
    specialVideoStartCapture: 0,
    specialVideoCompleteCapture: 0,
    gospelStartCapture: 0,
    gospelCompleteCapture: 0,
    rsvpCapture: 0,
    custom1Capture: 0,
    custom2Capture: 0,
    custom3Capture: 0,
    ...overrides
  })

  it('should add all numeric values from row to accumulator', () => {
    const acc = createMockProcessedRow({
      views: 100,
      responses: 50,
      christDecisionCapture: 25
    })
    const row = createMockProcessedRow({
      views: 10,
      responses: 5,
      christDecisionCapture: 2
    })

    const result = addRowToTotal(acc, row)

    expect(result.views).toBe(110)
    expect(result.responses).toBe(55)
    expect(result.christDecisionCapture).toBe(27)
  })

  it('should handle all numeric columns', () => {
    const acc = createMockProcessedRow()
    const row = createMockProcessedRow({
      views: 1,
      responses: 2,
      christDecisionCapture: 3,
      prayerRequestCapture: 4,
      specialVideoStartCapture: 5,
      specialVideoCompleteCapture: 6,
      gospelStartCapture: 7,
      gospelCompleteCapture: 8,
      rsvpCapture: 9,
      custom1Capture: 10,
      custom2Capture: 11,
      custom3Capture: 12
    })

    const result = addRowToTotal(acc, row)

    expect(result.views).toBe(1)
    expect(result.responses).toBe(2)
    expect(result.christDecisionCapture).toBe(3)
    expect(result.prayerRequestCapture).toBe(4)
    expect(result.specialVideoStartCapture).toBe(5)
    expect(result.specialVideoCompleteCapture).toBe(6)
    expect(result.gospelStartCapture).toBe(7)
    expect(result.gospelCompleteCapture).toBe(8)
    expect(result.rsvpCapture).toBe(9)
    expect(result.custom1Capture).toBe(10)
    expect(result.custom2Capture).toBe(11)
    expect(result.custom3Capture).toBe(12)
  })

  it('should preserve accumulator base properties', () => {
    const acc = createMockProcessedRow({
      journeyId: 'total',
      journeyName: 'TOTAL',
      views: 100
    })
    const row = createMockProcessedRow({
      views: 10
    })

    const result = addRowToTotal(acc, row)

    expect(result.journeyId).toBe('total')
    expect(result.journeyName).toBe('TOTAL')
    expect(result.views).toBe(110)
  })

  it('should handle zero values correctly', () => {
    const acc = createMockProcessedRow({
      views: 100,
      responses: 50
    })
    const row = createMockProcessedRow({
      views: 0,
      responses: 0
    })

    const result = addRowToTotal(acc, row)

    expect(result.views).toBe(100)
    expect(result.responses).toBe(50)
  })

  it('should return a new object without mutating the accumulator', () => {
    const acc = createMockProcessedRow({ views: 100 })
    const row = createMockProcessedRow({ views: 10 })

    const result = addRowToTotal(acc, row)

    expect(result).not.toBe(acc)
    expect(acc.views).toBe(100)
    expect(result.views).toBe(110)
  })
})
