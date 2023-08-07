import { GetVisitorEvents_visitor_events as Event } from '../../../../../../__generated__/GetVisitorEvents'

import { transformToJourney } from '.'

describe('transformVisitorEvents', () => {
  const events: Event[] = [
    {
      __typename: 'TextResponseSubmissionEvent',
      id: 'eventId5',
      journeyId: 'journeyId1',
      label: 'How do you feel at the end of the journey?',
      value:
        "Don't adventures ever have an end? I suppose not. Someone else always has to carry on the story",
      createdAt: '2022-11-02T03:20:26.368Z'
    },
    {
      __typename: 'RadioQuestionSubmissionEvent',
      id: 'eventId4',
      journeyId: 'journeyId1',
      label: 'How do you feel about your journey?',
      value: '10/10 would do it again',
      createdAt: '2022-11-02T03:20:26.368Z'
    },
    {
      __typename: 'JourneyViewEvent',
      id: 'eventId3',
      journeyId: 'journeyId1',
      label: 'A Journey: There and Back Again',
      value: '19',
      createdAt: '2022-11-02T03:20:26.368Z',
      language: {
        __typename: 'Language',
        id: 'languageId',
        name: [
          {
            __typename: 'Translation',
            value: 'Hobbitish'
          }
        ]
      }
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
        __typename: 'Language',
        id: 'languageId',
        name: [
          {
            __typename: 'Translation',
            value: 'Hobbitish'
          }
        ]
      }
    }
  ]

  const journey1 = {
    events: [
      {
        __typename: 'TextResponseSubmissionEvent',
        id: 'eventId5',
        journeyId: 'journeyId1',
        label: 'How do you feel at the end of the journey?',
        value:
          "Don't adventures ever have an end? I suppose not. Someone else always has to carry on the story",
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'RadioQuestionSubmissionEvent',
        id: 'eventId4',
        journeyId: 'journeyId1',
        label: 'How do you feel about your journey?',
        value: '10/10 would do it again',
        createdAt: '2022-11-02T03:20:26.368Z'
      },
      {
        __typename: 'JourneyViewEvent',
        id: 'eventId3',
        journeyId: 'journeyId1',
        label: 'A Journey: There and Back Again',
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
    ],
    id: 'journeyId1',
    subtitle: 'Hobbitish',
    title: 'A Journey: There and Back Again',
    createdAt: '2022-11-02T03:20:26.368Z'
  }

  const journey2 = {
    events: [
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
    ],
    id: 'journeyId0',
    subtitle: 'Hobbitish',
    title: 'Lord of the Rings',
    createdAt: '2022-11-02T03:20:26.368Z'
  }

  it('transforms visitor events to journey format', () => {
    expect(transformToJourney(events)).toEqual([journey2, journey1])
  })
})
