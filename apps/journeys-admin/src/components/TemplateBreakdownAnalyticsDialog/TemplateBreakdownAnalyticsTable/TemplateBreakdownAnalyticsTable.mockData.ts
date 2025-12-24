import { GetTemplateFamilyStatsBreakdown } from '../../../../__generated__/GetTemplateFamilyStatsBreakdown'
import { PlausibleEvent } from '../../../../__generated__/globalTypes'

import { UNKNOWN_JOURNEYS_AGGREGATE_ID } from './utils/constants'

export const mockSingleRowData: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: [
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-1',
      journeyName: 'Journey 1',
      teamName: 'Team A',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 100
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyResponses,
          visitors: 50
        }
      ]
    }
  ]
}

export const mockMultipleRowsData: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: [
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-1',
      journeyName: 'Journey 1',
      teamName: 'Team A',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 100
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyResponses,
          visitors: 50
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.christDecisionCapture,
          visitors: 25
        }
      ]
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-2',
      journeyName: 'Journey 2',
      teamName: 'Team B',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 200
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyResponses,
          visitors: 75
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.christDecisionCapture,
          visitors: 30
        }
      ]
    }
  ]
}

export const mockDataWithRestrictedRow: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: [
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-1',
      journeyName: 'Journey 1',
      teamName: 'Team A',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 100
        }
      ]
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: UNKNOWN_JOURNEYS_AGGREGATE_ID,
      journeyName: 'Restricted',
      teamName: 'Restricted Team',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 50
        }
      ]
    }
  ]
}

export const mockDataWithOnlyViews: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: [
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-1',
      journeyName: 'Journey 1',
      teamName: 'Team A',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 100
        }
      ]
    }
  ]
}

export const mockDataForSorting: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: [
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-1',
      journeyName: 'Journey A',
      teamName: 'Team A',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 100
        }
      ]
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-2',
      journeyName: 'Journey B',
      teamName: 'Team B',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 200
        }
      ]
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-3',
      journeyName: 'Journey C',
      teamName: 'Team C',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 50
        }
      ]
    }
  ]
}

export const mockDataWithViewsAndResponses: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: [
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-1',
      journeyName: 'Journey 1',
      teamName: 'Team A',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 100
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyResponses,
          visitors: 50
        }
      ]
    }
  ]
}

export const mockEmptyData: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: []
}

export const mockDataWithTeamAlpha: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: [
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-1',
      journeyName: 'Journey 1',
      teamName: 'Team Alpha',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse',
          event: PlausibleEvent.journeyVisitors,
          visitors: 100
        }
      ]
    }
  ]
}

export const mockDataWithManyRows: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: Array.from({ length: 15 }, (_, i) => ({
    __typename: 'TemplateFamilyStatsBreakdownResponse' as const,
    journeyId: `journey-${i}`,
    journeyName: `Journey ${i}`,
    teamName: `Team ${i}`,
    status: null,
    stats: [
      {
        __typename: 'TemplateFamilyStatsEventResponse' as const,
        event: PlausibleEvent.journeyVisitors,
        visitors: 100 + i
      }
    ]
  }))
}
