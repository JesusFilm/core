import { GetJourneyEvents_journeyEventsConnection_edges as EventEdge } from '../../../../../__generated__/GetJourneyEvents'

import { transformEvents } from './transformEvents'

describe('transformEvents', () => {
  it('should transform events', () => {
    const events: EventEdge[] = [
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor1',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Click Me',
          value: 'Button Value',
          typename: 'ButtonClickEvent',
          progress: null,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:00:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor2',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: null,
          value: 'facebook',
          typename: 'ChatOpenEvent',
          progress: null,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:01:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor3',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Journey Title',
          value: null,
          typename: 'JourneyViewEvent',
          progress: null,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:02:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor4',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Question',
          value: 'Answer',
          typename: 'RadioQuestionSubmissionEvent',
          progress: null,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:03:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor5',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: null,
          value: 'John Doe',
          typename: 'SignUpSubmissionEvent',
          progress: null,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: 'john@example.com',
          visitorPhone: null,
          createdAt: '2024-03-20T10:04:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor6',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Text Question',
          value: 'User Response',
          typename: 'TextResponseSubmissionEvent',
          progress: null,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:05:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor7',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Video Title',
          value: 'youtube',
          typename: 'VideoStartEvent',
          progress: null,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:06:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor8',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Video Title',
          value: 'youtube',
          typename: 'VideoPlayEvent',
          progress: null,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:07:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor9',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Video Title',
          value: 'youtube',
          typename: 'VideoPauseEvent',
          progress: null,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:08:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor10',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Video Title',
          value: 'youtube',
          typename: 'VideoCompleteEvent',
          progress: null,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:09:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor11',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Video Title',
          value: 'youtube',
          typename: 'VideoProgressEvent',
          progress: 25,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:10:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor11',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Video Title',
          value: 'youtube',
          typename: 'VideoProgressEvent',
          progress: 50,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:10:00Z'
        }
      },
      {
        __typename: 'JourneyEventEdge',
        cursor: 'cursor11',
        node: {
          __typename: 'JourneyEvent',
          journeyId: 'journey1',
          visitorId: 'visitor1',
          label: 'Video Title',
          value: 'youtube',
          typename: 'VideoProgressEvent',
          progress: 75,
          journeySlug: 'test-journey',
          visitorName: null,
          visitorEmail: null,
          visitorPhone: null,
          createdAt: '2024-03-20T10:10:00Z'
        }
      }
    ]

    const transformedEvents = transformEvents(events)
    expect(transformedEvents).toEqual([
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Click Me',
        value: 'Button Value',
        typename: 'ButtonClickEvent',
        progress: null,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:00:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: null,
        value: 'facebook',
        typename: 'ChatOpenEvent',
        progress: null,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:01:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Journey Title',
        value: null,
        typename: 'JourneyViewEvent',
        progress: null,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:02:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Question',
        value: 'Answer',
        typename: 'RadioQuestionSubmissionEvent',
        progress: null,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:03:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: null,
        value: 'John Doe',
        typename: 'SignUpSubmissionEvent',
        progress: null,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: 'john@example.com',
        visitorPhone: null,
        createdAt: '2024-03-20T10:04:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Text Question',
        value: 'User Response',
        typename: 'TextResponseSubmissionEvent',
        progress: null,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:05:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Video Title',
        value: '0',
        typename: 'VideoStartEvent',
        progress: null,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:06:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Video Title',
        value: 'youtube',
        typename: 'VideoPlayEvent',
        progress: null,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:07:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Video Title',
        value: 'youtube',
        typename: 'VideoPauseEvent',
        progress: null,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:08:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Video Title',
        value: '100',
        typename: 'VideoCompleteEvent',
        progress: null,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:09:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Video Title',
        value: '25',
        typename: 'VideoProgressEvent',
        progress: 25,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:10:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Video Title',
        value: '50',
        typename: 'VideoProgressEvent',
        progress: 50,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:10:00Z'
      },
      {
        __typename: 'JourneyEvent',
        journeyId: 'journey1',
        visitorId: 'visitor1',
        label: 'Video Title',
        value: '75',
        typename: 'VideoProgressEvent',
        progress: 75,
        journeySlug: 'test-journey',
        visitorName: null,
        visitorEmail: null,
        visitorPhone: null,
        createdAt: '2024-03-20T10:10:00Z'
      }
    ])
  })
})
