import { GetTemplateFamilyStatsBreakdown } from '../../../../../__generated__/GetTemplateFamilyStatsBreakdown'
import { PlausibleEvent } from '../../../../../__generated__/globalTypes'

import { UNKNOWN_JOURNEYS_AGGREGATE_ID } from './constants'

const createStatsForAllEvents = (
  baseVisitors: number
): Array<{
  __typename: 'TemplateFamilyStatsEventResponse'
  event: PlausibleEvent
  visitors: number
}> => [
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.journeyVisitors,
    visitors: baseVisitors
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.journeyResponses,
    visitors: Math.floor(baseVisitors * 0.6)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.prayerRequestCapture,
    visitors: Math.floor(baseVisitors * 0.3)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.christDecisionCapture,
    visitors: Math.floor(baseVisitors * 0.2)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.gospelStartCapture,
    visitors: Math.floor(baseVisitors * 0.4)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.gospelCompleteCapture,
    visitors: Math.floor(baseVisitors * 0.35)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.rsvpCapture,
    visitors: Math.floor(baseVisitors * 0.15)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.specialVideoStartCapture,
    visitors: Math.floor(baseVisitors * 0.25)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.specialVideoCompleteCapture,
    visitors: Math.floor(baseVisitors * 0.2)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.custom1Capture,
    visitors: Math.floor(baseVisitors * 0.1)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.custom2Capture,
    visitors: Math.floor(baseVisitors * 0.08)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.custom3Capture,
    visitors: Math.floor(baseVisitors * 0.05)
  }
]

export const fakeDataFull: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: [
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-1',
      journeyName: 'Easter Outreach Campaign 2024',
      teamName: 'Global Missions',
      status: null,
      stats: createStatsForAllEvents(1250)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-2',
      journeyName: 'Summer Youth Conference',
      teamName: 'Youth Ministry',
      status: null,
      stats: createStatsForAllEvents(980)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-3',
      journeyName: 'Christmas Celebration Journey',
      teamName: 'Worship Team',
      status: null,
      stats: createStatsForAllEvents(2100)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-4',
      journeyName: 'New Believer Follow-up',
      teamName: 'Discipleship',
      status: null,
      stats: createStatsForAllEvents(750)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-5',
      journeyName: 'Prayer Request Collection',
      teamName: 'Prayer Ministry',
      status: null,
      stats: createStatsForAllEvents(1650)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-6',
      journeyName: 'Bible Study Introduction',
      teamName: 'Education',
      status: null,
      stats: createStatsForAllEvents(890)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-7',
      journeyName: 'Community Service Sign-up',
      teamName: 'Outreach',
      status: null,
      stats: createStatsForAllEvents(1120)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-8',
      journeyName: 'Gospel Presentation Series',
      teamName: 'Evangelism',
      status: null,
      stats: createStatsForAllEvents(1850)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-9',
      journeyName: 'Video Testimony Collection',
      teamName: 'Media Team',
      status: null,
      stats: createStatsForAllEvents(640)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-10',
      journeyName: 'Event RSVP Management',
      teamName: 'Events',
      status: null,
      stats: createStatsForAllEvents(1450)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: UNKNOWN_JOURNEYS_AGGREGATE_ID,
      journeyName: 'Restricted',
      teamName: 'Restricted Team',
      status: null,
      stats: createStatsForAllEvents(320)
    }
  ]
}

const createStatsForPartialColumns = (
  baseVisitors: number
): Array<{
  __typename: 'TemplateFamilyStatsEventResponse'
  event: PlausibleEvent
  visitors: number
}> => [
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.journeyVisitors,
    visitors: baseVisitors
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.journeyResponses,
    visitors: Math.floor(baseVisitors * 0.6)
  },
  {
    __typename: 'TemplateFamilyStatsEventResponse',
    event: PlausibleEvent.rsvpCapture,
    visitors: Math.floor(baseVisitors * 0.15)
  }
]

export const partialColumns: GetTemplateFamilyStatsBreakdown = {
  templateFamilyStatsBreakdown: [
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-1',
      journeyName: 'Easter Outreach Campaign 2024',
      teamName: 'Global Missions',
      status: null,
      stats: createStatsForPartialColumns(1250)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-2',
      journeyName: 'Summer Youth Conference',
      teamName: 'Youth Ministry',
      status: null,
      stats: createStatsForPartialColumns(980)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-3',
      journeyName: 'Christmas Celebration Journey',
      teamName: 'Worship Team',
      status: null,
      stats: createStatsForPartialColumns(2100)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-4',
      journeyName: 'New Believer Follow-up',
      teamName: 'Discipleship',
      status: null,
      stats: createStatsForPartialColumns(750)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-5',
      journeyName: 'Prayer Request Collection',
      teamName: 'Prayer Ministry',
      status: null,
      stats: createStatsForPartialColumns(1650)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-6',
      journeyName: 'Bible Study Introduction',
      teamName: 'Education',
      status: null,
      stats: createStatsForPartialColumns(890)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-7',
      journeyName: 'Community Service Sign-up',
      teamName: 'Outreach',
      status: null,
      stats: createStatsForPartialColumns(1120)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-8',
      journeyName: 'Gospel Presentation Series',
      teamName: 'Evangelism',
      status: null,
      stats: createStatsForPartialColumns(1850)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-9',
      journeyName: 'Video Testimony Collection',
      teamName: 'Media Team',
      status: null,
      stats: createStatsForPartialColumns(640)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: 'journey-10',
      journeyName: 'Event RSVP Management',
      teamName: 'Events',
      status: null,
      stats: createStatsForPartialColumns(1450)
    },
    {
      __typename: 'TemplateFamilyStatsBreakdownResponse',
      journeyId: UNKNOWN_JOURNEYS_AGGREGATE_ID,
      journeyName: 'Restricted',
      teamName: 'Restricted Team',
      status: null,
      stats: createStatsForPartialColumns(320)
    }
  ]
}
