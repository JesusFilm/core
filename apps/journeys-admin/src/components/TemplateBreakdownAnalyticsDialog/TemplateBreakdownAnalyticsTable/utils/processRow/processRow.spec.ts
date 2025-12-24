import { PlausibleEvent } from '../../../../../../__generated__/globalTypes'
import { BreakdownRow } from '../types'
import { processRow } from './processRow'

describe('processRow', () => {
  const createMockRow = (stats: Array<{ event: string; visitors: number }>): BreakdownRow => ({
    __typename: 'TemplateFamilyStatsBreakdownResponse',
    journeyId: 'journey-1',
    journeyName: 'Test Journey',
    teamName: 'Test Team',
    status: null,
    stats: stats.map((stat) => ({
      __typename: 'TemplateFamilyStatsEventResponse',
      event: stat.event,
      visitors: stat.visitors
    }))
  })

  it('should process a row with all event values', () => {
    const row = createMockRow([
      { event: PlausibleEvent.journeyVisitors, visitors: 100 },
      { event: PlausibleEvent.journeyResponses, visitors: 50 },
      { event: PlausibleEvent.christDecisionCapture, visitors: 25 },
      { event: PlausibleEvent.prayerRequestCapture, visitors: 10 },
      { event: PlausibleEvent.specialVideoStartCapture, visitors: 5 },
      { event: PlausibleEvent.specialVideoCompleteCapture, visitors: 3 },
      { event: PlausibleEvent.gospelStartCapture, visitors: 8 },
      { event: PlausibleEvent.gospelCompleteCapture, visitors: 4 },
      { event: PlausibleEvent.rsvpCapture, visitors: 2 },
      { event: PlausibleEvent.custom1Capture, visitors: 1 },
      { event: PlausibleEvent.custom2Capture, visitors: 0 },
      { event: PlausibleEvent.custom3Capture, visitors: 0 }
    ])

    const processed = processRow(row)

    expect(processed.views).toBe(100)
    expect(processed.responses).toBe(50)
    expect(processed.christDecisionCapture).toBe(25)
    expect(processed.prayerRequestCapture).toBe(10)
    expect(processed.specialVideoStartCapture).toBe(5)
    expect(processed.specialVideoCompleteCapture).toBe(3)
    expect(processed.gospelStartCapture).toBe(8)
    expect(processed.gospelCompleteCapture).toBe(4)
    expect(processed.rsvpCapture).toBe(2)
    expect(processed.custom1Capture).toBe(1)
    expect(processed.custom2Capture).toBe(0)
    expect(processed.custom3Capture).toBe(0)
  })

  it('should preserve original row properties', () => {
    const row = createMockRow([
      { event: PlausibleEvent.journeyVisitors, visitors: 100 }
    ])

    const processed = processRow(row)

    expect(processed.journeyId).toBe('journey-1')
    expect(processed.journeyName).toBe('Test Journey')
    expect(processed.teamName).toBe('Test Team')
    expect(processed.status).toBeNull()
    expect(processed.stats).toEqual(row.stats)
  })

  it('should set all numeric fields to 0 when events are missing', () => {
    const row = createMockRow([])

    const processed = processRow(row)

    expect(processed.views).toBe(0)
    expect(processed.responses).toBe(0)
    expect(processed.christDecisionCapture).toBe(0)
    expect(processed.prayerRequestCapture).toBe(0)
    expect(processed.specialVideoStartCapture).toBe(0)
    expect(processed.specialVideoCompleteCapture).toBe(0)
    expect(processed.gospelStartCapture).toBe(0)
    expect(processed.gospelCompleteCapture).toBe(0)
    expect(processed.rsvpCapture).toBe(0)
    expect(processed.custom1Capture).toBe(0)
    expect(processed.custom2Capture).toBe(0)
    expect(processed.custom3Capture).toBe(0)
  })

  it('should handle partial event data', () => {
    const row = createMockRow([
      { event: PlausibleEvent.journeyVisitors, visitors: 100 },
      { event: PlausibleEvent.journeyResponses, visitors: 50 }
    ])

    const processed = processRow(row)

    expect(processed.views).toBe(100)
    expect(processed.responses).toBe(50)
    expect(processed.christDecisionCapture).toBe(0)
    expect(processed.prayerRequestCapture).toBe(0)
  })
})

