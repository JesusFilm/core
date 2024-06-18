import {
  GetVisitorEvents_visitor_events_ButtonClickEvent as ButtonClickEvent,
  GetVisitorEvents_visitor_events_TextResponseSubmissionEvent as TextResponseEvent
} from '../../../__generated__/GetVisitorEvents'
import { ButtonAction } from '../../../__generated__/globalTypes'
import { filterRecentTextResponseEvents } from './filterRecentTextResponseEvents'

const textResponseEvent: TextResponseEvent = {
  __typename: 'TextResponseSubmissionEvent',
  id: 'textResponseSubmissionEvent1.id',
  journeyId: 'journey1.id',
  label: 'Text response label - journey 1',
  value: 'Text response submission - journey 1',
  createdAt: '2022-11-02T03:30:16.368Z',
  blockId: 'blockId'
}

const textResponseEvent2: TextResponseEvent = {
  __typename: 'TextResponseSubmissionEvent',
  id: 'textResponseSubmissionEvent1.id',
  journeyId: 'journey1.id',
  label: 'Text response label - journey 1',
  value: 'Text response submission two - journey 1',
  createdAt: '2022-11-02T03:31:16.368Z',
  blockId: 'blockId'
}

const textResponseEvent3: TextResponseEvent = {
  __typename: 'TextResponseSubmissionEvent',
  id: 'textResponseSubmissionEvent1.id',
  journeyId: 'journey1.id',
  label: 'Text response label - journey 1',
  value: 'Text response submission three most recent text response - journey 1',
  createdAt: '2022-11-02T03:32:16.368Z',
  blockId: 'blockId'
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

describe('filterRecentTextResponseEvents', () => {
  it('should filter for the most recent text response event', () => {
    const eventArray = [
      textResponseEvent,
      textResponseEvent2,
      textResponseEvent3,
      buttonClickEvent
    ]
    const res = filterRecentTextResponseEvents(eventArray)
    expect(res).toHaveLength(2)
    expect(res[0].value).toEqual(
      'Text response submission three most recent text response - journey 1'
    )
  })

  it('should filter for the most recent text response event by block id', () => {
    const eventArray = [
      { ...textResponseEvent, blockId: 'blockId2' },
      textResponseEvent2,
      textResponseEvent3,
      buttonClickEvent
    ]
    const res = filterRecentTextResponseEvents(eventArray)
    expect(res).toHaveLength(3)
    expect(res[0].value).toEqual('Text response submission - journey 1')
    expect((res[0] as TextResponseEvent).blockId).toEqual('blockId2')
    expect(res[1].value).toEqual(
      'Text response submission three most recent text response - journey 1'
    )
    expect((res[1] as TextResponseEvent).blockId).toEqual('blockId')
  })
})
