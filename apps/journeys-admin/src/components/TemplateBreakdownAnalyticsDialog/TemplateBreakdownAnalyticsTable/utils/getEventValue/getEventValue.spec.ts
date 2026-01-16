import { PlausibleEvent } from '../../../../../../__generated__/globalTypes'
import { BreakdownRow } from '../types'

import { getEventValue } from './getEventValue'

describe('getEventValue', () => {
  const createMockRow = (
    stats: Array<{ event: string; visitors: number }>
  ): BreakdownRow => ({
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

  it('should return the visitor count for an existing event', () => {
    const row = createMockRow([
      { event: PlausibleEvent.journeyVisitors, visitors: 100 },
      { event: PlausibleEvent.journeyResponses, visitors: 50 }
    ])

    expect(getEventValue(row, PlausibleEvent.journeyVisitors)).toBe(100)
    expect(getEventValue(row, PlausibleEvent.journeyResponses)).toBe(50)
  })

  it('should return 0 when event is not found', () => {
    const row = createMockRow([
      { event: PlausibleEvent.journeyVisitors, visitors: 100 }
    ])

    expect(getEventValue(row, PlausibleEvent.journeyResponses)).toBe(0)
  })

  it('should return 0 when stats array is empty', () => {
    const row = createMockRow([])

    expect(getEventValue(row, PlausibleEvent.journeyVisitors)).toBe(0)
  })

  it('should return 0 when event exists but visitors is undefined', () => {
    const row: BreakdownRow = {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-1',
      journeyName: 'Test Journey',
      teamName: 'Test Team',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: undefined as unknown as number
        }
      ]
    }

    expect(getEventValue(row, PlausibleEvent.journeyVisitors)).toBe(0)
  })

  it('should handle multiple events correctly', () => {
    const row = createMockRow([
      { event: PlausibleEvent.journeyVisitors, visitors: 200 },
      { event: PlausibleEvent.journeyResponses, visitors: 150 },
      { event: PlausibleEvent.christDecisionCapture, visitors: 75 },
      { event: PlausibleEvent.prayerRequestCapture, visitors: 30 }
    ])

    expect(getEventValue(row, PlausibleEvent.journeyVisitors)).toBe(200)
    expect(getEventValue(row, PlausibleEvent.journeyResponses)).toBe(150)
    expect(getEventValue(row, PlausibleEvent.christDecisionCapture)).toBe(75)
    expect(getEventValue(row, PlausibleEvent.prayerRequestCapture)).toBe(30)
  })
})
