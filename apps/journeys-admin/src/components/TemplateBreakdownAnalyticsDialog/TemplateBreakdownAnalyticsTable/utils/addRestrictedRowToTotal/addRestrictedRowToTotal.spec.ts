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

    addRestrictedRowToTotal(totalRow, restrictedRow)

    expect(totalRow.views).toBe(110)
    expect(totalRow.responses).toBe(55)
    expect(totalRow.christDecisionCapture).toBe(27)
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

    addRestrictedRowToTotal(totalRow, restrictedRow)

    expect(totalRow.views).toBe(1)
    expect(totalRow.responses).toBe(2)
    expect(totalRow.christDecisionCapture).toBe(3)
    expect(totalRow.prayerRequestCapture).toBe(4)
    expect(totalRow.specialVideoStartCapture).toBe(5)
    expect(totalRow.specialVideoCompleteCapture).toBe(6)
    expect(totalRow.gospelStartCapture).toBe(7)
    expect(totalRow.gospelCompleteCapture).toBe(8)
    expect(totalRow.rsvpCapture).toBe(9)
    expect(totalRow.custom1Capture).toBe(10)
    expect(totalRow.custom2Capture).toBe(11)
    expect(totalRow.custom3Capture).toBe(12)
  })

  it('should mutate the total row in place', () => {
    const totalRow = createMockProcessedRow({ views: 100 })
    const restrictedRow = createMockProcessedRow({ views: 10 })

    addRestrictedRowToTotal(totalRow, restrictedRow)

    expect(totalRow.views).toBe(110)
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

    addRestrictedRowToTotal(totalRow, restrictedRow)

    expect(totalRow.views).toBe(100)
    expect(totalRow.responses).toBe(50)
  })

  it('should handle negative values correctly', () => {
    const totalRow = createMockProcessedRow({
      views: 100
    })
    const restrictedRow = createMockProcessedRow({
      views: -10
    })

    addRestrictedRowToTotal(totalRow, restrictedRow)

    expect(totalRow.views).toBe(90)
  })
})
