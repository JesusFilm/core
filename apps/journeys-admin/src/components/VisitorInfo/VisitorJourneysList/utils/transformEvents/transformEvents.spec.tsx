import {
  MessagePlatform,
  VideoBlockSource
} from '../../../../../../__generated__/globalTypes'
import {
  GetVisitorEvents_visitor_events_ButtonClickEvent as Event,
  GetVisitorEvents_visitor_events_JourneyViewEvent as JourneyViewEvent,
  GetVisitorEvents_visitor_events_SignUpSubmissionEvent as SignUpEvent,
  GetVisitorEvents_visitor_events_VideoStartEvent as VideoStartEvent,
  GetVisitorEvents_visitor_events_VideoCompleteEvent as VideoCompleteEvent,
  GetVisitorEvents_visitor_events_ChatOpenEvent as ChatOpenEvent
} from '../../../../../../__generated__/GetVisitorEvents'
import { getDuration } from './transformEvents'
import { TimelineItem, transformEvents } from '.'

const journeyViewEvent: JourneyViewEvent = {
  __typename: 'JourneyViewEvent',
  id: 'journeyView1.id',
  journeyId: 'journey1.id',
  createdAt: '2022-11-02T03:20:26.368Z',
  label: 'Journey 1',
  language: {
    __typename: 'Language',
    id: 'languageId',
    name: [
      {
        __typename: 'Translation',
        value: 'English'
      }
    ]
  },
  value: '529'
}
const stepViewEvent: Event = {
  __typename: 'StepViewEvent',
  id: 'stepViewEvent1.id',
  journeyId: 'journey1.id',
  label: null,
  value: 'Step title',
  createdAt: '2022-11-02T03:20:27.368Z'
}
const buttonClickEvent: Event = {
  __typename: 'ButtonClickEvent',
  id: 'buttonClickEvent1.id',
  journeyId: 'journey1.id',
  label: 'Button label - journey 1',
  value: 'Button  value - journey 1',
  createdAt: '2022-11-02T03:20:28.368Z'
}
const radioQuestionResponseEvent: Event = {
  __typename: 'RadioQuestionSubmissionEvent',
  id: 'radioQuestionSubmissionEvent1.id',
  journeyId: 'journey1.id',
  label: 'Radio question - journey 1',
  value: 'Radio option - journey 1',
  createdAt: '2022-11-02T03:20:30.368Z'
}
const videoStartEvent: VideoStartEvent = {
  __typename: 'VideoStartEvent',
  id: 'videoStartEvent1.id',
  journeyId: 'journey1.id',
  label: 'JESUS - journey 1 - internal',
  value: 'video description - journey 1 - internal',
  source: VideoBlockSource.internal,
  createdAt: '2022-11-02T03:20:30.868Z'
}
const videoCompleteEvent: VideoCompleteEvent = {
  __typename: 'VideoCompleteEvent',
  id: 'videoCompleteEvent1.id',
  journeyId: 'journey1.id',
  label: 'JESUS journey 1 - youtube',
  value: 'video description - journey 1 - youTube',
  source: VideoBlockSource.youTube,
  createdAt: '2022-11-02T03:34:26.368Z'
}
const textResponseEvent: Event = {
  __typename: 'TextResponseSubmissionEvent',
  id: 'textResponseSubmissionEvent1.id',
  journeyId: 'journey1.id',
  label: 'Text response label - journey 1',
  value: 'Text response submission - journey 1',
  createdAt: '2022-11-02T03:34:36.368Z'
}
const signUpSubmissionEvent: SignUpEvent = {
  __typename: 'SignUpSubmissionEvent',
  id: 'signUpSubmissionEvent1.id',
  journeyId: 'journey1.id',
  label: 'Sign Up submission label - journey 1',
  email: 'signUpJourney1@email.com',
  value: 'Sign up name - journey 1',
  createdAt: '2022-11-02T03:35:26.368Z'
}
const chatOpenEvent: ChatOpenEvent = {
  __typename: 'ChatOpenEvent',
  id: 'chatOpenEvent1.id',
  journeyId: 'journey1.id',
  label: null,
  value: 'button label - journey 1',
  messagePlatform: MessagePlatform.facebook,
  createdAt: '2022-11-02T03:35:39.368Z'
}

describe('transformEvents', () => {
  describe('events', () => {
    it('should filter events', () => {
      const result = transformEvents([
        journeyViewEvent,
        stepViewEvent,
        buttonClickEvent
      ])
      const expected = {
        timelineItems: [
          [{ event: buttonClickEvent }],
          { event: journeyViewEvent, duration: '0:02' }
        ],
        totalDuration: '0:02'
      }

      expect(result).toEqual(expected)
    })

    it('should nest non featured events', () => {
      const result = transformEvents([
        journeyViewEvent,
        buttonClickEvent,
        radioQuestionResponseEvent,
        videoStartEvent,
        videoCompleteEvent,
        textResponseEvent,
        signUpSubmissionEvent,
        chatOpenEvent
      ])
      const expected = {
        timelineItems: [
          { event: chatOpenEvent },
          [{ event: signUpSubmissionEvent, duration: '0:13' }],
          { event: textResponseEvent, duration: '0:50' },
          [
            { event: videoCompleteEvent, duration: '0:10' },
            { event: videoStartEvent, duration: '13:55' }
          ],
          { event: radioQuestionResponseEvent, duration: '< 0:01' },
          [{ event: buttonClickEvent, duration: '0:02' }],
          { event: journeyViewEvent, duration: '0:02' }
        ],
        totalDuration: '15:13'
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
      const result = transformEvents([journeyViewEvent, chatOpenEvent])
      expect(result.totalDuration).toEqual('15:13')
    })
  })

  describe('getDuration', () => {
    it('should return duration', () => {
      const result = getDuration(
        journeyViewEvent.createdAt,
        chatOpenEvent.createdAt
      )
      expect(result).toEqual('15:13')
    })

    it('should return duration with 2 digit seconds if singular', () => {
      const result = getDuration(
        journeyViewEvent.createdAt,
        buttonClickEvent.createdAt
      )
      expect(result).toEqual('0:02')
    })

    it('should return < 0.01 if if duration is less than a second', () => {
      const result = getDuration(
        radioQuestionResponseEvent.createdAt,
        videoStartEvent.createdAt
      )
      expect(result).toEqual('< 0:01')
    })
  })
})
