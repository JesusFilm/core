import {
  GetVisitorEvents,
  GetVisitorEvents_visitor_events_JourneyViewEvent as JourneyViewEvent
} from '../../../../../__generated__/GetVisitorEvents'
import {
  ButtonAction,
  MessagePlatform,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import { GET_VISITOR_EVENTS } from '../VisitorJourneysList'

import { JourneyWithEvents, TimelineItem } from '.'

const journeyView: JourneyViewEvent = {
  __typename: 'JourneyViewEvent',
  id: 'journeyViewEventId',
  journeyId: 'journeyId',
  createdAt: '2022-11-02T03:20:26.368Z',
  label: 'Lord of the Rings',
  language: {
    __typename: 'Language',
    id: 'languageId',
    name: [
      {
        __typename: 'Translation',
        value: 'Hobbitish'
      }
    ]
  },
  value: '529'
}
export const journeyViewEvent: TimelineItem = {
  event: journeyView,
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

export const buttonClickNavigateEvent: TimelineItem = {
  event: {
    __typename: 'ButtonClickEvent',
    id: 'ButtonClickEventId',
    journeyId: 'journeyId',
    label: 'Navigate Action',
    value: 'Write a book',
    createdAt: '2022-11-02T03:20:26.368Z',
    action: ButtonAction.NavigateAction,
    actionValue: null
  },
  duration: '0.01'
}

export const buttonClickNavigateToBlockEvent: TimelineItem = {
  event: {
    __typename: 'ButtonClickEvent',
    id: 'ButtonClickEventId',
    journeyId: 'journeyId',
    label: 'Navigate To Block Action',
    value: 'Write a book',
    createdAt: '2022-11-02T03:20:26.368Z',
    action: ButtonAction.NavigateToBlockAction,
    actionValue: 'Step name'
  },
  duration: '0.01'
}

export const buttonClickNavigateToJourneyEvent: TimelineItem = {
  event: {
    __typename: 'ButtonClickEvent',
    id: 'ButtonClickEventId',
    journeyId: 'journeyId',
    label: 'Navigate To Journey Action',
    value: 'Write a book',
    createdAt: '2022-11-02T03:20:26.368Z',
    action: ButtonAction.NavigateToJourneyAction,
    actionValue: 'Another jourey name'
  },
  duration: '0.01'
}

export const buttonClickLinkEvent: TimelineItem = {
  event: {
    __typename: 'ButtonClickEvent',
    id: 'ButtonClickEventId',
    journeyId: 'journeyId',
    label: 'Link Action',
    value: 'Write a book',
    createdAt: '2022-11-02T03:20:26.368Z',
    action: ButtonAction.LinkAction,
    actionValue: 'https://google.com'
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

export const stepNextEvent: TimelineItem = {
  event: {
    __typename: 'StepNextEvent',
    id: 'StepNextEventId',
    journeyId: 'journeyId',
    label: 'Current step block name',
    value: 'Next StepBlock Name',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  duration: '0.01'
}

export const stepViewEvent: TimelineItem = {
  event: {
    __typename: 'StepViewEvent',
    id: 'StepViewEventId',
    journeyId: 'journeyId',
    label: null,
    value: 'Current StepBlock Name',
    createdAt: '2022-11-02T03:20:26.368Z'
  },
  duration: '0.01'
}

export const videoStartEvent: TimelineItem = {
  event: {
    __typename: 'VideoStartEvent',
    id: 'VideoStartEventId',
    journeyId: 'journeyId',
    label: 'JESUS internal',
    value: 'internal',
    createdAt: '2022-11-02T03:20:26.368Z',
    source: VideoBlockSource.internal,
    position: 0
  },
  duration: '0.01'
}

export const videoPlayEvent: TimelineItem = {
  event: {
    __typename: 'VideoPlayEvent',
    id: 'VideoPlayEventId',
    journeyId: 'journeyId',
    label: 'JESUS internal',
    value: 'internal',
    createdAt: '2022-11-02T03:20:26.368Z',
    source: VideoBlockSource.internal,
    position: 2.01
  },
  duration: '0.01'
}

export const videoPauseEvent: TimelineItem = {
  event: {
    __typename: 'VideoPauseEvent',
    id: 'VideoPauseEventId',
    journeyId: 'journeyId',
    label: 'JESUS internal',
    value: 'internal',
    createdAt: '2022-11-02T03:20:26.368Z',
    source: VideoBlockSource.internal,
    position: 2.6
  },
  duration: '0.01'
}

export const videoProgressEvent: TimelineItem = {
  event: {
    __typename: 'VideoProgressEvent',
    id: 'VideoProgressEventId',
    journeyId: 'journeyId',
    label: 'JESUS youtube',
    value: 'youtube',
    createdAt: '2022-11-02T03:20:26.368Z',
    source: VideoBlockSource.youTube,
    position: 6.11,
    progress: 50
  },
  duration: '0.01'
}

export const videoExpandEvent: TimelineItem = {
  event: {
    __typename: 'VideoExpandEvent',
    id: 'VideoExpandEventId',
    journeyId: 'journeyId',
    label: 'JESUS youtube',
    value: 'youtube',
    createdAt: '2022-11-02T03:20:26.368Z',
    source: VideoBlockSource.youTube,
    position: 4.77
  },
  duration: '0.01'
}

export const videoCompleteEvent: TimelineItem = {
  event: {
    __typename: 'VideoCompleteEvent',
    id: 'VideoCompleteEventId',
    journeyId: 'journeyId',
    label: 'JESUS youtube',
    value: 'youTube',
    createdAt: '2022-11-02T03:20:26.368Z',
    source: VideoBlockSource.youTube
  },
  duration: '0.01'
}

const textResponse2Event = {
  __typename: 'TextResponseSubmissionEvent',
  id: 'eventId3',
  journeyId: 'journey2.id',
  label: 'How do you feel at the end of the journey?',
  value:
    "Don't adventures ever have an end? I suppose not. Someone else always has to carry on the story",
  createdAt: '2022-11-02T03:20:26.368Z'
}

const buttonClick2Event = {
  __typename: 'ButtonClickEvent',
  id: 'eventId2',
  journeyId: 'journey2.id',
  label: 'Lets recap your journey!',
  value: 'Get started',
  createdAt: '2022-11-02T03:20:26.368Z'
}

const radioSubmission2Event = {
  __typename: 'RadioQuestionSubmissionEvent',
  id: 'eventId1',
  journeyId: 'journey2.id',
  label: 'How do you feel about Sam?',
  value: 'Best friend ever!',
  createdAt: '2022-11-02T03:20:26.368Z'
}

const journey2ViewEvent: JourneyViewEvent = {
  __typename: 'JourneyViewEvent',
  id: 'eventId0',
  journeyId: 'journey2.id',
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

const events = [
  journeyViewEvent.event,
  chatOpenedEvent.event,
  textResponseSubmissionEvent.event,
  buttonClickNavigateEvent.event,
  radioQuestionSubmissionEvent.event,
  signUpSubmissionEvent.event,
  stepNextEvent.event,
  stepViewEvent.event,
  videoStartEvent.event,
  videoPlayEvent.event,
  videoPauseEvent.event,
  videoProgressEvent.event,
  videoExpandEvent.event,
  videoCompleteEvent.event
]

export const getVisitorEvents: GetVisitorEvents = {
  visitor: {
    __typename: 'Visitor',
    id: 'visitorId',
    events
  }
}

export const getJourneysMock = {
  request: {
    query: GET_VISITOR_EVENTS,
    variables: {
      id: 'visitorId'
    }
  },
  result: {
    data: {
      visitor: {
        __typename: 'Visitor',
        id: 'visitorId',
        events: [
          ...events,
          journey2ViewEvent,
          radioSubmission2Event,
          textResponse2Event,
          buttonClick2Event
        ]
      }
    }
  }
}

export const journey: JourneyWithEvents = {
  id: journeyView.journeyId,
  subtitle: journeyView.language?.name[0].value,
  title: journeyView.label,
  createdAt: journeyView.createdAt,
  events
}
