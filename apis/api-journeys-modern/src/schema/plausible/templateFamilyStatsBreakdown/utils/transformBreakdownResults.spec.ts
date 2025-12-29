import { PlausibleStatsResponse } from '../../plausible'

import { transformBreakdownResults } from './transformBreakdownResults'

describe('transformBreakdownResults', () => {
  it('should group all events by journeyId', () => {
    const breakdownResults: PlausibleStatsResponse[] = [
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'footerThumbsUpButtonClick',
          target: null
        }),
        visitors: 1
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'footerThumbsDownButtonClick',
          target: null
        }),
        visitors: 2
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'shareButtonClick',
          target: null
        }),
        visitors: 3
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'pageview',
          target: null
        }),
        visitors: 4
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'navigatePreviousStep',
          target: null
        }),
        visitors: 5
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'navigateNextStep',
          target: null
        }),
        visitors: 6
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'buttonClick',
          target: 'link'
        }),
        visitors: 7
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'chatButtonClick',
          target: 'chat'
        }),
        visitors: 8
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-2',
          event: 'footerChatButtonClick',
          target: 'chat:whatsapp'
        }),
        visitors: 9
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-2',
          event: 'radioQuestionSubmit',
          target: null
        }),
        visitors: 10
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-2',
          event: 'signUpSubmit',
          target: null
        }),
        visitors: 11
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-2',
          event: 'textResponseSubmit',
          target: null
        }),
        visitors: 12
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-2',
          event: 'videoPlay',
          target: null
        }),
        visitors: 13
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-2',
          event: 'videoPause',
          target: null
        }),
        visitors: 14
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-2',
          event: 'videoExpand',
          target: null
        }),
        visitors: 15
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-2',
          event: 'videoCollapse',
          target: null
        }),
        visitors: 16
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-3',
          event: 'videoStart',
          target: null
        }),
        visitors: 17
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-3',
          event: 'videoProgress25',
          target: null
        }),
        visitors: 18
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-3',
          event: 'videoProgress50',
          target: null
        }),
        visitors: 19
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-3',
          event: 'videoProgress75',
          target: null
        }),
        visitors: 20
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-3',
          event: 'videoComplete',
          target: null
        }),
        visitors: 21
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-3',
          event: 'videoTrigger',
          target: null
        }),
        visitors: 22
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-3',
          event: 'buttonClick',
          target: 'link:external'
        }),
        visitors: 23
      }
    ]

    const result = transformBreakdownResults(breakdownResults)

    expect(result).toEqual([
      {
        journeyId: 'journey-1',
        stats: [
          { event: 'footerThumbsUpButtonClick', visitors: 1 },
          { event: 'footerThumbsDownButtonClick', visitors: 2 },
          { event: 'shareButtonClick', visitors: 3 },
          { event: 'pageview', visitors: 4 },
          { event: 'navigatePreviousStep', visitors: 5 },
          { event: 'navigateNextStep', visitors: 6 },
          { event: 'buttonClick', visitors: 7 },
          { event: 'linksClicked', visitors: 7 },
          { event: 'chatButtonClick', visitors: 8 },
          { event: 'chatsClicked', visitors: 8 }
        ]
      },
      {
        journeyId: 'journey-2',
        stats: [
          { event: 'footerChatButtonClick', visitors: 9 },
          { event: 'chatsClicked', visitors: 9 },
          { event: 'radioQuestionSubmit', visitors: 10 },
          { event: 'signUpSubmit', visitors: 11 },
          { event: 'textResponseSubmit', visitors: 12 },
          { event: 'videoPlay', visitors: 13 },
          { event: 'videoPause', visitors: 14 },
          { event: 'videoExpand', visitors: 15 },
          { event: 'videoCollapse', visitors: 16 }
        ]
      },
      {
        journeyId: 'journey-3',
        stats: [
          { event: 'videoStart', visitors: 17 },
          { event: 'videoProgress25', visitors: 18 },
          { event: 'videoProgress50', visitors: 19 },
          { event: 'videoProgress75', visitors: 20 },
          { event: 'videoComplete', visitors: 21 },
          { event: 'videoTrigger', visitors: 22 },
          { event: 'buttonClick', visitors: 23 },
          { event: 'linksClicked', visitors: 23 }
        ]
      }
    ])
  })

  it('should filter by allowed events', () => {
    const breakdownResults: PlausibleStatsResponse[] = [
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'buttonClick',
          target: null
        }),
        visitors: 5
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'pageview',
          target: null
        }),
        visitors: 10
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'videoPlay',
          target: null
        }),
        visitors: 7
      }
    ]

    const result = transformBreakdownResults(breakdownResults, [
      'buttonClick',
      'pageview'
    ])

    expect(result).toEqual([
      {
        journeyId: 'journey-1',
        stats: [
          { event: 'buttonClick', visitors: 5 },
          { event: 'pageview', visitors: 10 }
        ]
      }
    ])
  })

  it('should merge event values with the same event type', () => {
    const breakdownResults: PlausibleStatsResponse[] = [
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'buttonClick',
          target: 'link'
        }),
        visitors: 5
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'buttonClick',
          target: 'chat'
        }),
        visitors: 3
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'buttonClick',
          target: null
        }),
        visitors: 2
      }
    ]

    const result = transformBreakdownResults(breakdownResults, ['buttonClick'])

    expect(result).toEqual([
      {
        journeyId: 'journey-1',
        stats: [{ event: 'buttonClick', visitors: 10 }]
      }
    ])
  })

  it('should calculate chatsClicked and linksClicked', () => {
    const breakdownResults: PlausibleStatsResponse[] = [
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'buttonClick',
          target: 'chat'
        }),
        visitors: 5
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'buttonClick',
          target: 'chat:whatsapp'
        }),
        visitors: 3
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'buttonClick',
          target: 'link'
        }),
        visitors: 7
      },
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'buttonClick',
          target: 'link:external'
        }),
        visitors: 2
      }
    ]

    const result = transformBreakdownResults(breakdownResults)

    expect(result).toEqual([
      {
        journeyId: 'journey-1',
        stats: [
          { event: 'buttonClick', visitors: 17 },
          { event: 'chatsClicked', visitors: 8 },
          { event: 'linksClicked', visitors: 9 }
        ]
      }
    ])
  })

  it('should return 0 for events in filter but not in results', () => {
    const breakdownResults: PlausibleStatsResponse[] = [
      {
        property: JSON.stringify({
          journeyId: 'journey-1',
          event: 'buttonClick',
          target: null
        }),
        visitors: 5
      }
    ]

    const result = transformBreakdownResults(breakdownResults, [
      'buttonClick',
      'pageview',
      'videoPlay'
    ])

    expect(result).toEqual([
      {
        journeyId: 'journey-1',
        stats: [
          { event: 'buttonClick', visitors: 5 },
          { event: 'pageview', visitors: 0 },
          { event: 'videoPlay', visitors: 0 }
        ]
      }
    ])
  })
})
