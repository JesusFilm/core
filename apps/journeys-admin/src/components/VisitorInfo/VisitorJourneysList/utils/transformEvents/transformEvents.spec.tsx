import {
  GetVisitorEvents_visitor_events_ButtonClickEvent as ButtonClickEvent,
  GetVisitorEvents_visitor_events_ChatOpenEvent as ChatOpenEvent,
  GetVisitorEvents_visitor_events_JourneyEvent as Event,
  GetVisitorEvents_visitor_events_JourneyViewEvent as JourneyViewEvent,
  GetVisitorEvents_visitor_events_SignUpSubmissionEvent as SignUpEvent,
  GetVisitorEvents_visitor_events_VideoCollapseEvent as VideoCollapseEvent,
  GetVisitorEvents_visitor_events_VideoCompleteEvent as VideoCompleteEvent,
  GetVisitorEvents_visitor_events_VideoExpandEvent as VideoExpandEvent,
  GetVisitorEvents_visitor_events_VideoPauseEvent as VideoPauseEvent,
  GetVisitorEvents_visitor_events_VideoPlayEvent as VideoPlayEvent,
  GetVisitorEvents_visitor_events_VideoProgressEvent as VideoProgressEvent,
  GetVisitorEvents_visitor_events_VideoStartEvent as VideoStartEvent
} from '../../../../../../__generated__/GetVisitorEvents'
import {
  ButtonAction,
  MessagePlatform,
  VideoBlockSource
} from '../../../../../../__generated__/globalTypes'

import { getDuration } from './transformEvents'

import { TimelineItem, transformEvents } from '.'

const journeyViewEvent: JourneyViewEvent = {
  __typename: 'JourneyViewEvent',
  id: 'journeyView1.id',
  journeyId: 'journey1.id',
  createdAt: '2022-11-02T03:20:06.368Z',
  label: 'Journey 1',
  language: {
    __typename: 'Language',
    id: 'languageId',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English'
      }
    ]
  },
  value: '529'
}
const chatOpenEvent: ChatOpenEvent = {
  __typename: 'ChatOpenEvent',
  id: 'chatOpenEvent1.id',
  journeyId: 'journey1.id',
  label: null,
  value: 'button label - journey 1',
  messagePlatform: MessagePlatform.facebook,
  createdAt: '2022-11-02T03:20:16.368Z'
}
const textResponseEvent: Event = {
  __typename: 'TextResponseSubmissionEvent',
  id: 'textResponseSubmissionEvent1.id',
  journeyId: 'journey1.id',
  label: 'Text response label - journey 1',
  value: 'Text response submission - journey 1',
  createdAt: '2022-11-02T03:30:16.368Z'
}
const buttonClickEvent: ButtonClickEvent = {
  __typename: 'ButtonClickEvent',
  id: 'buttonClickEvent1.id',
  journeyId: 'journey1.id',
  label: 'Button label - journey 1',
  value: 'Button  value - journey 1',
  createdAt: '2022-11-02T03:33:16.368Z',
  action: ButtonAction.NavigateToBlockAction,
  actionValue: null
}
const radioQuestionResponseEvent: Event = {
  __typename: 'RadioQuestionSubmissionEvent',
  id: 'radioQuestionSubmissionEvent1.id',
  journeyId: 'journey1.id',
  label: 'Radio question - journey 1',
  value: 'Radio option - journey 1',
  createdAt: '2022-11-02T03:33:26.368Z'
}
const signUpSubmissionEvent: SignUpEvent = {
  __typename: 'SignUpSubmissionEvent',
  id: 'signUpSubmissionEvent1.id',
  journeyId: 'journey1.id',
  label: 'Sign Up submission label - journey 1',
  email: 'signUpJourney1@email.com',
  value: 'Sign up name - journey 1',
  createdAt: '2022-11-02T03:33:27.368Z'
}
const stepNextEvent: Event = {
  __typename: 'StepNextEvent',
  id: 'stepNextEvent1.id',
  journeyId: 'journey1.id',
  label: 'Current step block name',
  value: 'Next StepBlock Name',
  createdAt: '2022-11-02T03:34:27.368Z'
}
const stepViewEvent: Event = {
  __typename: 'StepViewEvent',
  id: 'stepViewEvent1.id',
  journeyId: 'journey1.id',
  label: null,
  value: 'Step title',
  createdAt: '2022-11-02T03:34:37.368Z'
}
const videoStartEvent: VideoStartEvent = {
  __typename: 'VideoStartEvent',
  id: 'videoStartEvent1.id',
  journeyId: 'journey1.id',
  label: 'JESUS - journey 1 - internal',
  value: 'video description - journey 1 - internal',
  source: VideoBlockSource.internal,
  createdAt: '2022-11-02T03:44:37.368Z',
  position: 0
}
const videoPlayEvent: VideoPlayEvent = {
  __typename: 'VideoPlayEvent',
  id: 'videoPlayEvent1.id',
  journeyId: 'journey1.id',
  label: 'JESUS - journey 1 - internal',
  value: 'video description - journey 1 - internal',
  source: VideoBlockSource.internal,
  createdAt: '2022-11-02T03:44:47.368Z',
  position: 0
}
const videoPauseEvent: VideoPauseEvent = {
  __typename: 'VideoPauseEvent',
  id: 'videoPauseEvent1.id',
  journeyId: 'journey1.id',
  label: 'JESUS - journey 1 - internal',
  value: 'video description - journey 1 - internal',
  source: VideoBlockSource.internal,
  createdAt: '2022-11-02T03:45:47.368Z',
  position: 0
}
const videoProgressEvent: VideoProgressEvent = {
  __typename: 'VideoProgressEvent',
  id: 'videoProgressEvent1.id',
  journeyId: 'journey1.id',
  label: 'JESUS - journey 1 - internal',
  value: 'video description - journey 1 - internal',
  source: VideoBlockSource.internal,
  createdAt: '2022-11-02T03:47:47.368Z',
  position: 0,
  progress: 25
}
const videoExpandEvent: VideoExpandEvent = {
  __typename: 'VideoExpandEvent',
  id: 'videoExpandEvent1.id',
  journeyId: 'journey1.id',
  label: 'JESUS - journey 1 - internal',
  value: 'video description - journey 1 - internal',
  source: VideoBlockSource.internal,
  createdAt: '2022-11-02T03:47:48.368Z',
  position: 0
}
const videoCollapseEvent: VideoCollapseEvent = {
  __typename: 'VideoCollapseEvent',
  id: 'videoCollapseEvent1.id',
  journeyId: 'journey1.id',
  label: 'JESUS - journey 1 - internal',
  value: 'video description - journey 1 - internal',
  source: VideoBlockSource.internal,
  createdAt: '2022-11-02T03:47:58.368Z',
  position: 0
}
const videoCompleteEvent: VideoCompleteEvent = {
  __typename: 'VideoCompleteEvent',
  id: 'videoCompleteEvent1.id',
  journeyId: 'journey1.id',
  label: 'JESUS journey 1 - youtube',
  value: 'video description - journey 1 - youTube',
  source: VideoBlockSource.youTube,
  createdAt: '2022-11-02T03:47:58.468Z'
}

describe('transformEvents', () => {
  describe('events', () => {
    it('should filter events', () => {
      const result = transformEvents([
        journeyViewEvent,
        buttonClickEvent,
        videoCollapseEvent
      ])
      const expected = {
        timelineItems: [
          { event: buttonClickEvent },
          { event: journeyViewEvent, duration: '13:10' }
        ],
        totalDuration: '13:10'
      }

      expect(result).toEqual(expected)
    })

    it('should nest non featured events', () => {
      const result = transformEvents([
        chatOpenEvent,
        journeyViewEvent,
        textResponseEvent,
        buttonClickEvent,
        radioQuestionResponseEvent,
        signUpSubmissionEvent,
        stepNextEvent,
        stepViewEvent,
        videoStartEvent,
        videoPlayEvent,
        videoPauseEvent,
        videoProgressEvent,
        videoExpandEvent,
        videoCollapseEvent,
        videoCompleteEvent
      ])
      const expected = {
        timelineItems: [
          [
            { event: videoCompleteEvent },
            { event: videoExpandEvent, duration: '0:10' },
            { event: videoProgressEvent, duration: '0:01' },
            { event: videoPauseEvent, duration: '2:00' },
            { event: videoPlayEvent, duration: '1:00' },
            { event: videoStartEvent, duration: '0:10' },
            { event: stepViewEvent, duration: '10:00' },
            { event: stepNextEvent, duration: '0:10' }
          ],
          { event: signUpSubmissionEvent, duration: '1:00' },
          { event: radioQuestionResponseEvent, duration: '0:01' },
          { event: buttonClickEvent, duration: '0:10' },
          { event: textResponseEvent, duration: '3:00' },
          { event: chatOpenEvent, duration: '10:00' },
          { event: journeyViewEvent, duration: '0:10' }
        ],
        totalDuration: '27:52'
      }

      expect(result).toEqual(expected)
    })

    it('should leave duration blank if last event', () => {
      const events = transformEvents([
        journeyViewEvent,
        radioQuestionResponseEvent
      ])
      const result = events.timelineItems[0] as unknown as TimelineItem
      expect(result.duration).toBeUndefined()
    })

    it('should calculate total duration', () => {
      const result = transformEvents([journeyViewEvent, videoCompleteEvent])
      expect(result.totalDuration).toBe('27:52')
    })
  })

  describe('getDuration', () => {
    it('should return duration', () => {
      const result = getDuration(
        String(journeyViewEvent.createdAt),
        String(chatOpenEvent.createdAt)
      )
      expect(result).toBe('0:10')
    })

    it('should return duration with 2 digit seconds if singular', () => {
      const result = getDuration(
        String(radioQuestionResponseEvent.createdAt),
        String(signUpSubmissionEvent.createdAt)
      )
      expect(result).toBe('0:01')
    })

    it('should return < 0.01 if if duration is less than a second', () => {
      const result = getDuration(
        String(videoCollapseEvent.createdAt),
        String(videoCompleteEvent.createdAt)
      )
      expect(result).toBe('< 0:01')
    })
  })
})
