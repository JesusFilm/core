import { MockedResponse } from '@apollo/client/testing'

import {
  GetJourneyPlausibleStatsBreakdown,
  GetJourneyPlausibleStatsBreakdownVariables
} from '../../../__generated__/GetJourneyPlausibleStatsBreakdown'
import { IdType } from '../../../__generated__/globalTypes'

import { GET_JOURNEY_PLAUSIBLE_STATS_BREAKDOWN } from './useJourneyPlausibleStatsBreakdownQuery'

export const getJourneyPlausibleStatsBreakdown: MockedResponse<
  GetJourneyPlausibleStatsBreakdown,
  GetJourneyPlausibleStatsBreakdownVariables
> = {
  request: {
    query: GET_JOURNEY_PLAUSIBLE_STATS_BREAKDOWN,
    variables: {
      id: 'journeyId',
      idType: IdType.databaseId,
      period: '30d',
      date: '2021-10-01',
      interval: 'day',
      limit: 10,
      page: 1
    }
  },
  result: {
    data: {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step1.id',
          visitors: 10,
          timeOnPage: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step2.id',
          visitors: 5,
          timeOnPage: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step3.id',
          visitors: 2,
          timeOnPage: 1
        }
      ],
      journeyStepsActions: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"pageview","blockId":"step1.id","target":""}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"navigateNextStep","blockId":"step1.id","target":"step2,id"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step2.id","event":"navigatePreviousStep","blockId":"step2.id","target":"step1.id"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button1.id","target":"step2.id"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"radioQuestionSubmit","blockId":"radioOption1.id","target":"link:https://google.com"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"signUpSubmit","blockId":"signUp1.id","target":"link:https://bible.com"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"chatButtonClick","blockId":"step1.id","target":"link:https://m.me/test"}',
          events: 5
        }
      ],
      journeyReferrer: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'Direct / None',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'facebook',
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'tiktok',
          visitors: 2
        }
      ],
      journeyVisitorsPageExits: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step1.id',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step2.id',
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step3.id',
          visitors: 2
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 10
        }
      }
    }
  }
}
