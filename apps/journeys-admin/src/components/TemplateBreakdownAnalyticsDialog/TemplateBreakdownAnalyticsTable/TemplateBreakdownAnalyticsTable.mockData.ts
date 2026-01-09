import { GetTemplateFamilyStatsBreakdown } from '../../../../__generated__/GetTemplateFamilyStatsBreakdown'
import {
  JourneyStatus,
  PlausibleEvent
} from '../../../../__generated__/globalTypes'

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

const realisticTeamNames = [
  'Grace Community Church',
  'Hope Fellowship',
  'City Light Church',
  'Riverside Ministries',
  'Mountain View Church',
  'New Life Church',
  'Faith Community',
  'Grace Community Church',
  'Hope Fellowship',
  'Crossroads Church',
  'City Light Church',
  'Riverside Ministries',
  'Harvest Church',
  'Living Water Church',
  'Grace Community Church',
  'Hope Fellowship',
  'Victory Church',
  'Riverside Ministries',
  'City Light Church',
  'New Life Church'
]

const realisticJourneyNames = [
  'Easter Outreach 2024',
  'Christmas Campaign',
  'New Believer Journey',
  'Prayer Request Form',
  'Easter Outreach 2024',
  'Summer Youth Camp',
  'Christmas Campaign',
  'Baptism Registration',
  'New Believer Journey',
  'Prayer Request Form',
  'Easter Outreach 2024',
  'Small Group Sign-up',
  'Christmas Campaign',
  'Volunteer Application',
  'New Believer Journey',
  'Easter Outreach 2024',
  'Christmas Campaign',
  'Prayer Request Form',
  'New Believer Journey',
  'Easter Outreach 2024'
]

export const mockDataWithAllColumns20Rows: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: [
    ...Array.from({ length: 20 }, (_, i) => ({
      __typename: 'TemplateFamilyStatsBreakdownResponse' as const,
      journeyId: `journey-all-${i + 1}`,
      journeyName: realisticJourneyNames[i],
      teamName: realisticTeamNames[i],
      status:
        i % 3 === 0
          ? JourneyStatus.published
          : i % 3 === 1
            ? JourneyStatus.draft
            : JourneyStatus.archived,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.journeyVisitors,
          visitors: 1000 + i * 50
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.journeyResponses,
          visitors: 500 + i * 25
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.christDecisionCapture,
          visitors: 100 + i * 5
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.prayerRequestCapture,
          visitors: 80 + i * 4
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.specialVideoStartCapture,
          visitors: 200 + i * 10
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.specialVideoCompleteCapture,
          visitors: 150 + i * 8
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.gospelStartCapture,
          visitors: 120 + i * 6
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.gospelCompleteCapture,
          visitors: 90 + i * 5
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.rsvpCapture,
          visitors: 60 + i * 3
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.custom1Capture,
          visitors: 40 + i * 2
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.custom2Capture,
          visitors: 30 + i * 2
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.custom3Capture,
          visitors: 20 + i
        }
      ]
    })),
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse' as const,
      journeyId: UNKNOWN_JOURNEYS_AGGREGATE_ID,
      journeyName: 'Restricted',
      teamName: 'Restricted Team',
      status: null,
      stats: [
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.journeyVisitors,
          visitors: 5000
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.journeyResponses,
          visitors: 2500
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.christDecisionCapture,
          visitors: 500
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.prayerRequestCapture,
          visitors: 400
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.specialVideoStartCapture,
          visitors: 1000
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.specialVideoCompleteCapture,
          visitors: 750
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.gospelStartCapture,
          visitors: 600
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.gospelCompleteCapture,
          visitors: 450
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.rsvpCapture,
          visitors: 300
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.custom1Capture,
          visitors: 200
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.custom2Capture,
          visitors: 150
        },
        {
          __typename: 'TemplateFamilyStatsEventResponse' as const,
          event: PlausibleEvent.custom3Capture,
          visitors: 100
        }
      ]
    }
  ]
}

const simpleTeamNames = [
  'Grace Community Church',
  'Hope Fellowship',
  'Grace Community Church',
  'City Light Church',
  'Hope Fellowship'
]

const simpleJourneyNames = [
  'Easter Outreach 2024',
  'Prayer Request Form',
  'Christmas Campaign',
  'New Believer Journey',
  'Prayer Request Form'
]

export const mockDataWithViewsAndResponses5Rows: GetTemplateFamilyStatsBreakdown =
  {
    templateFamilyStatsBreakdown: [
      ...Array.from({ length: 5 }, (_, i) => ({
        __typename: 'TemplateFamilyStatsBreakdownResponse' as const,
        journeyId: `journey-simple-${i + 1}`,
        journeyName: simpleJourneyNames[i],
        teamName: simpleTeamNames[i],
        status: i % 2 === 0 ? JourneyStatus.published : JourneyStatus.draft,
        stats: [
          {
            __typename: 'TemplateFamilyStatsEventResponse' as const,
            event: PlausibleEvent.journeyVisitors,
            visitors: 500 + i * 100
          },
          {
            __typename: 'TemplateFamilyStatsEventResponse' as const,
            event: PlausibleEvent.journeyResponses,
            visitors: 250 + i * 50
          }
        ]
      })),
      {
        __typename: 'TemplateFamilyStatsBreakdownResponse' as const,
        journeyId: UNKNOWN_JOURNEYS_AGGREGATE_ID,
        journeyName: 'Restricted',
        teamName: 'Restricted Team',
        status: null,
        stats: [
          {
            __typename: 'TemplateFamilyStatsEventResponse' as const,
            event: PlausibleEvent.journeyVisitors,
            visitors: 2000
          },
          {
            __typename: 'TemplateFamilyStatsEventResponse' as const,
            event: PlausibleEvent.journeyResponses,
            visitors: 1000
          }
        ]
      }
    ]
  }
