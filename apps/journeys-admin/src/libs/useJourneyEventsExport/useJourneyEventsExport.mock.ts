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
  GetJourneyEventsCount,
  GetJourneyEventsCountVariables
} from '../../../__generated__/GetJourneyEventsCount'

import {
  CREATE_EVENTS_EXPORT_LOG,
  GET_JOURNEY_EVENTS_COUNT,
  GET_JOURNEY_EVENTS_EXPORT
} from './useJourneyEventsExport'
import { FILTERED_EVENTS } from './utils/constants'

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
              journeySlug: 'test-journey',
              visitorName: 'Test User',
              visitorEmail: 'test@example.com',
              visitorPhone: '1234567890',
              createdAt: '2024-01-01T12:00:00Z'
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

export const getMockGetJourneyEventsCountQuery = (
  variables?: GetJourneyEventsCountVariables
): MockedResponse<GetJourneyEventsCount, GetJourneyEventsCountVariables> => ({
  request: {
    query: GET_JOURNEY_EVENTS_COUNT,
    variables: {
      journeyId: 'journey1',
      filter: {
        typenames: FILTERED_EVENTS
      },
      ...variables
    }
  },
  result: jest.fn(() => ({
    data: {
      journeyEventsCount: 2
    }
  }))
})
