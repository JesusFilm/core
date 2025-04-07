import { MockedResponse } from '@apollo/client/testing'

import {
  CreateEventsExportLog,
  CreateEventsExportLogVariables
} from '../../../__generated__/CreateEventsExportLog'
import {
  GetJourneyEvents,
  GetJourneyEventsVariables
} from '../../../__generated__/GetJourneyEvents'

import {
  CREATE_EVENTS_EXPORT_LOG,
  FILTERED_EVENTS,
  GET_JOURNEY_EVENTS_EXPORT
} from './useJourneyEventsExport'

export const mockGetJourneyEventsQuery: MockedResponse<
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
      first: 20000,
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

export const mockCreateEventsExportLogMutation: MockedResponse<
  CreateEventsExportLog,
  CreateEventsExportLogVariables
> = {
  request: {
    query: CREATE_EVENTS_EXPORT_LOG,
    variables: {
      input: {
        journeyId: 'journey1',
        eventsFilter: []
      }
    }
  },
  result: {
    data: {
      createJourneyEventsExportLog: {
        __typename: 'JourneyEventsExportLog',
        id: '123'
      }
    }
  }
}
