import { ProcessedRow } from '../types'

import { addRestrictedRowToTotal } from './addRestrictedRowToTotal'

describe('addRestrictedRowToTotal', () => {
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

  it('should add all numeric values from restricted row to total row', () => {
    const totalRow = createMockProcessedRow({
      views: 100,
      responses: 50,
      christDecisionCapture: 25
    })
    const restrictedRow = createMockProcessedRow({
      views: 10,
      responses: 5,
      christDecisionCapture: 2
    })

    const result = addRestrictedRowToTotal(totalRow, restrictedRow)

    expect(result.views).toBe(110)
    expect(result.responses).toBe(55)
    expect(result.christDecisionCapture).toBe(27)
    expect(result).not.toBe(totalRow)
  })

  it('should handle all numeric columns', () => {
    const totalRow = createMockProcessedRow()
    const restrictedRow = createMockProcessedRow({
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

    const result = addRestrictedRowToTotal(totalRow, restrictedRow)

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
    expect(result).not.toBe(totalRow)
  })

  it('should return a new object without mutating the original', () => {
    const totalRow = createMockProcessedRow({ views: 100 })
    const restrictedRow = createMockProcessedRow({ views: 10 })

    const result = addRestrictedRowToTotal(totalRow, restrictedRow)

    expect(result.views).toBe(110)
    expect(result).not.toBe(totalRow)
    expect(totalRow.views).toBe(100)
  })

  it('should handle zero values correctly', () => {
    const totalRow = createMockProcessedRow({
      views: 100,
      responses: 50
    })
    const restrictedRow = createMockProcessedRow({
      views: 0,
      responses: 0
    })

    const result = addRestrictedRowToTotal(totalRow, restrictedRow)

    expect(result.views).toBe(100)
    expect(result.responses).toBe(50)
    expect(result).not.toBe(totalRow)
  })

  it('should handle negative values correctly', () => {
    const totalRow = createMockProcessedRow({
      views: 100
    })
    const restrictedRow = createMockProcessedRow({
      views: -10
    })

    const result = addRestrictedRowToTotal(totalRow, restrictedRow)

    expect(result.views).toBe(90)
    expect(result).not.toBe(totalRow)
  })
})
