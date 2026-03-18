import { createInitialTotalRow } from './createInitialTotalRow'

describe('createInitialTotalRow', () => {
  it('should create a total row with all numeric fields set to 0', () => {
    const totalRow = createInitialTotalRow()

    expect(totalRow.views).toBe(0)
    expect(totalRow.responses).toBe(0)
    expect(totalRow.christDecisionCapture).toBe(0)
    expect(totalRow.prayerRequestCapture).toBe(0)
    expect(totalRow.specialVideoStartCapture).toBe(0)
    expect(totalRow.specialVideoCompleteCapture).toBe(0)
    expect(totalRow.gospelStartCapture).toBe(0)
    expect(totalRow.gospelCompleteCapture).toBe(0)
    expect(totalRow.rsvpCapture).toBe(0)
    expect(totalRow.custom1Capture).toBe(0)
    expect(totalRow.custom2Capture).toBe(0)
    expect(totalRow.custom3Capture).toBe(0)
  })

  it('should have the correct base row properties', () => {
    const totalRow = createInitialTotalRow()

    expect(totalRow.journeyId).toBe('total')
    expect(totalRow.journeyName).toBe('TOTAL')
    expect(totalRow.teamName).toBe('')
    expect(totalRow.status).toBeNull()
    expect(totalRow.stats).toEqual([])
    expect(totalRow.__typename).toBe('TemplateFamilyStatsBreakdownResponse')
  })

  it('should return a new object each time', () => {
    const totalRow1 = createInitialTotalRow()
    const totalRow2 = createInitialTotalRow()

    expect(totalRow1).not.toBe(totalRow2)
    expect(totalRow1).toEqual(totalRow2)
  })
})
