import {
  GetVisitors_visitors_edges_node_events as Event,
  GetVisitors_visitors_edges_node_events_ChatOpenEvent as ChatOpenEvent,
  GetVisitors_visitors_edges_node_events_TextResponseSubmissionEvent as TextResponseEvent,
  GetVisitors_visitors_edges_node_events_RadioQuestionSubmissionEvent as RadioSubmissionEvent,
  GetVisitors_visitors_edges_node_events_ButtonClickEvent as ButtonClickEvent
} from '../../../../../__generated__/GetVisitors'
import { getEvents } from './getEvents'

describe('getEvents', () => {
  const chatOpen = {
    __typename: 'ChatOpenEvent',
    value: 'chat'
  } as unknown as ChatOpenEvent
  const textResponse = {
    __typename: 'TextResponseSubmissionEvent',
    value: 'text'
  } as unknown as TextResponseEvent
  const radioResponse = {
    __typename: 'RadioQuestionSubmissionEvent',
    value: 'option1'
  } as unknown as RadioSubmissionEvent
  const buttonClick = {
    __typename: 'ButtonClickEvent',
    value: 'click'
  } as unknown as ButtonClickEvent

  const ignoredEvents: Event[] = [
    {
      ...chatOpen,
      value: 'ingored chat'
    },
    {
      ...textResponse,
      value: 'ingored text response'
    },
    {
      ...radioResponse,
      value: 'ingored radio response'
    },
    {
      ...buttonClick,
      value: 'ingored click'
    }
  ]

  const events: Event[] = [
    ...ignoredEvents,
    chatOpen,
    textResponse,
    radioResponse,
    buttonClick
  ]
  it('should return events for table', () => {
    const result = getEvents(events)
    expect(result).toEqual({
      buttonClick,
      chatOpen,
      radioSubmission: { ...radioResponse },
      textResponse
    })
  })

  it('should return null if there are no match events', () => {
    const events: Event[] = [
      {
        __typename: 'JourneyViewEvent'
      }
    ]

    const result = getEvents(events)
    expect(result).toEqual({
      buttonClick: null,
      chatOpen: null,
      radioSubmission: null,
      textResponse: null
    })
  })
})
