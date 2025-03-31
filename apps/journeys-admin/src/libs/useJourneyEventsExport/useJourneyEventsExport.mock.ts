import { MockedResponse } from '@apollo/client/testing'

import {
  GetJourneyEvents,
  GetJourneyEventsVariables
} from '../../../__generated__/GetJourneyEvents'

import {
  FILTERED_EVENTS,
  GET_JOURNEY_EVENTS_EXPORT
} from './useJourneyEventsExport'

export const mockJourneyEventsQuery: MockedResponse<
  GetJourneyEvents,
  GetJourneyEventsVariables
> = {
  request: {
    query: GET_JOURNEY_EVENTS_EXPORT,
    variables: {
      journeyId: 'journey1',
      filter: {
        typenames: FILTERED_EVENTS
      },
      first: 50,
      after: null
    }
  },
  result: {
    data: {
      journeyEventsConnection: {
        __typename: 'JourneyEventsConnection',
        edges: [
          {
            __typename: 'JourneyEventEdge',
            cursor: 'cursor1',
            node: {
              __typename: 'JourneyEvent',
              journeyId: 'journey1',
              visitorId: 'visitor1',
              label: 'Test Label',
              value: 'Test Value',
              typename: 'ButtonClickEvent',
              progress: null,
              messagePlatform: null,
              journey: {
                __typename: 'Journey',
                slug: 'test-journey'
              },
              visitor: {
                __typename: 'Visitor',
                email: 'test@example.com',
                name: 'Test User'
              }
            }
          }
        ],
        pageInfo: {
          __typename: 'PageInfo',
          endCursor: 'cursor1',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'cursor1'
        }
      }
    }
  }
}
