import {
  MessagePlatform,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import { TimelineItem } from '.'

export const buttonClickEvent: TimelineItem = {
  event: {
    __typename: 'ButtonClickEvent',
    id: 'ButtonClickEventId',
    journeyId: 'journeyId',
    label: 'How will you remember the journey?',
    value: 'Write a book',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  duration: '0.01'
}
export const chatOpenedEvent: TimelineItem = {
  event: {
    __typename: 'ChatOpenEvent',
    id: 'ChatOpenEventId',
    journeyId: 'journeyId',
    label: null,
    value: 'facebook',
    createdAt: '2022-11-02T03:20:26.368Z',
    messagePlatform: MessagePlatform.facebook
  },
  duration: '0.01'
}
export const radioQuestionSubmissionEvent: TimelineItem = {
  event: {
    __typename: 'RadioQuestionSubmissionEvent',
    id: 'RadioQuestionSubmissionEventId',
    journeyId: 'journeyId',
    label: 'How do you feel about your journey?',
    value: '10/10 would do it again',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  duration: '0.01'
}
export const textResponseSubmissionEvent: TimelineItem = {
  event: {
    __typename: 'TextResponseSubmissionEvent',
    id: 'TextResponseSubmissionEventId',
    journeyId: 'journeyId',
    label: 'How do you feel about your adventure?',
    value:
      'It was basically the worst. Stabbed, lost, hungry, betrayed, and I lost a finger.',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  duration: '0.01'
}
export const videoCompleteEvent: TimelineItem = {
  event: {
    __typename: 'VideoCompleteEvent',
    id: 'VideoCompleteEventId',
    journeyId: 'journeyId',
    label: 'JESUS',
    value: 'youTube',
    createdAt: '2022-11-02T03:20:26.368Z',
    source: VideoBlockSource.youTube
  },
  duration: '0.01'
}
export const videoStartEvent: TimelineItem = {
  event: {
    __typename: 'VideoStartEvent',
    id: 'VideoStartEventId',
    journeyId: 'journeyId',
    label: 'JESUS',
    value: 'internal',
    createdAt: '2022-11-02T03:20:26.368Z',
    source: VideoBlockSource.internal
  },
  duration: '0.01'
}
export const signUpSubmissionEvent: TimelineItem = {
  event: {
    __typename: 'SignUpSubmissionEvent',
    id: 'SignUpSubmissionEventId',
    journeyId: 'journeyId',
    label: 'How do you feel at the end of the journey?',
    email: 'bilbo.baggins@example.com',
    value: 'Bilbo Baggins',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  duration: '0.01'
}
export const journeyViewEvent: TimelineItem = {
  event: {
    __typename: 'JourneyViewEvent',
    id: 'journeyViewEventId',
    journeyId: 'journeyId',
    createdAt: '2022-11-02T03:20:26.368Z',
    label: 'There and back again',
    language: {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'Translation',
          value: 'English'
        }
      ]
    },
    value: '529'
  },
  duration: '0.01'
}
