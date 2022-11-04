import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { GetVisitorEvents } from '../../../../__generated__/GetVisitorEvents'
import { GET_VISITOR_EVENTS } from './VisitorJourneyList'

const getVisitorEvents: GetVisitorEvents = {
  visitor: {
    __typename: 'Visitor',
    id: 'visitorId',
    events: [
      {
        __typename: 'ButtonClickEvent',
        id: 'eventId8',
        journeyId: 'journeyId1',
        label: 'How will you remember the journey?',
        value: 'Write a book',
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'eventId7',
        journeyId: 'journeyId1',
        label: 'How do you feel at the end of the journey?',
        value:
          "Don't adventures ever have an end? I suppose not. Someone else always has to carry on the story",
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'RadioQuestionSubmissionEvent',
        id: 'eventId6',
        journeyId: 'journeyId1',
        label: 'How do you feel about your journey?',
        value: '10/10 would do it again',
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'ButtonClickEvent',
        id: 'eventId5',
        journeyId: 'journeyId1',
        label: 'Are you fond of Orcs?',
        value: 'No',
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'SignUpSubmissionEvent',
        id: 'eventId4',
        journeyId: 'journeyId1',
        label: 'How do you feel at the end of the journey?',
        email: 'bilbo.baggins@example.com',
        value: 'Bilbo Baggins',
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'VideoCompleteEvent',
        id: 'VideoCompleteEventId',
        journeyId: 'journeyId1',
        label: 'The Hobbit',
        value: 'youTube',
        createdAt: '2022-11-02T03:20:26.368Z',
        source: VideoBlockSource.youTube
      },
      {
        __typename: 'VideoStartEvent',
        id: 'VideoStartEventId',
        journeyId: 'journeyId1',
        label: 'The Hobbit',
        value: 'youTube',
        createdAt: '2022-11-02T03:20:26.368Z',
        source: VideoBlockSource.youTube
      },
      {
        __typename: 'JourneyViewEvent',
        id: 'eventId3',
        journeyId: 'journeyId1',
        label: 'A Journey: There and Back Again',
        value: '19',
        language: {
          id: 'languageId',
          __typename: 'Language',
          name: [
            {
              value: 'Hobbitish',
              __typename: 'Translation'
            }
          ]
        },
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'eventId2',
        journeyId: 'journeyId0',
        label: 'How do you feel about your adventure?',
        value:
          'It was basically the worst. Stabbed, lost, hungry, betrayed, and I lost a finger.',
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'RadioQuestionSubmissionEvent',
        id: 'eventId1',
        journeyId: 'journeyId0',
        label: 'How do you feel about Sam?',
        value: 'Best friend ever!',
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'JourneyViewEvent',
        id: 'eventId0',
        journeyId: 'journeyId0',
        label: 'Lord of the Rings',
        value: '19',
        createdAt: '2022-11-02T03:20:26.368Z',
        language: {
          id: 'languageId',
          __typename: 'Language',
          name: [
            {
              value: 'Hobbitish',
              __typename: 'Translation'
            }
          ]
        }
      }
    ]
  }
}

export const getVisitorEventsMock = {
  request: {
    query: GET_VISITOR_EVENTS,
    variables: {
      id: 'visitorId'
    }
  },
  result: {
    data: getVisitorEvents
  }
}
