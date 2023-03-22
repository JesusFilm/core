import {
  GetVisitors_visitors_edges_node_events as Event,
  GetVisitors_visitors_edges_node_events_ChatOpenEvent as ChatOpenEvent,
  GetVisitors_visitors_edges_node_events_TextResponseSubmissionEvent as TextResponseEvent,
  GetVisitors_visitors_edges_node_events_RadioQuestionSubmissionEvent as RadioSubmissionEvent,
  GetVisitors_visitors_edges_node_events_ButtonClickEvent as ButtonClickEvent
} from '../../../../../__generated__/GetVisitors'

interface TableEvents {
  chatOpen: ChatOpenEvent | null
  textResponse: TextResponseEvent | null
  radioSubmission: RadioSubmissionEvent | null
  buttonClick: ButtonClickEvent | null
}

export function getEvents(events: Event[]): TableEvents {
  let chatOpen: ChatOpenEvent | null = null
  let textResponse: TextResponseEvent | null = null
  let radioSubmission: RadioSubmissionEvent | null = null
  let buttonClick: ButtonClickEvent | null = null

  events.forEach((event) => {
    switch (event.__typename) {
      case 'ChatOpenEvent':
        chatOpen = event
        break
      case 'TextResponseSubmissionEvent':
        textResponse = event
        break
      case 'RadioQuestionSubmissionEvent':
        radioSubmission = event
        break
      case 'ButtonClickEvent':
        buttonClick = event
        break
    }
  })

  return {
    chatOpen,
    textResponse,
    radioSubmission,
    buttonClick
  }
}
