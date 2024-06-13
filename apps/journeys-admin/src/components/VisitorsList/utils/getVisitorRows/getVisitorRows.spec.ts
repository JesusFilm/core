import { GetVisitors_visitors_edges as Visitor } from '../../../../../__generated__/GetVisitors'

import { getVisitorRows } from '.'

describe('getVisitorRows', () => {
  it('should only show visitors with a lastStepViewedAt', () => {
    const visitors: Visitor[] = [
      {
        __typename: 'VisitorEdge',
        node: {
          __typename: 'Visitor',
          id: 'visitor1.id',
          lastChatPlatform: null,
          lastStepViewedAt: null,
          lastLinkAction: null,
          lastTextResponse: null,
          lastRadioQuestion: null,
          lastRadioOptionSubmission: null
        },
        cursor: 'date string'
      },
      {
        __typename: 'VisitorEdge',
        node: {
          __typename: 'Visitor',
          id: 'visitor2.id',
          lastChatPlatform: null,
          lastStepViewedAt: null,
          lastLinkAction: null,
          lastTextResponse: null,
          lastRadioQuestion: null,
          lastRadioOptionSubmission: null
        },
        cursor: 'date string'
      },
      {
        __typename: 'VisitorEdge',
        node: {
          __typename: 'Visitor',
          id: 'visitor3.id',
          lastChatPlatform: null,
          lastStepViewedAt: '2023-04-05T20:00:05.725Z',
          lastLinkAction: null,
          lastTextResponse: null,
          lastRadioQuestion: null,
          lastRadioOptionSubmission: null
        },
        cursor: 'date string'
      }
    ]
    expect(getVisitorRows(visitors)).toEqual([
      {
        id: 'visitor3.id',
        lastChatPlatform: null,
        lastStepViewedAt: 'Apr 5, 2023, 8:00 PM',
        lastLinkAction: null,
        lastTextResponse: '',
        lastRadioQuestion: ''
      }
    ])
  })
})
