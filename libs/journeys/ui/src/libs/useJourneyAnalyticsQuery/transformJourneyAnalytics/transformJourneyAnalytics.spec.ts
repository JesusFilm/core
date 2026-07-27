import { GetJourneyAnalytics } from '../__generated__/GetJourneyAnalytics'

import { transformJourneyAnalytics } from './transformJourneyAnalytics'

describe('transformJourneyAnalytics', () => {
  it('should return journey analytics', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 10,
          timeOnPage: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step2.id',
          visitors: 5,
          timeOnPage: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step3.id',
          visitors: 2,
          timeOnPage: 1
        }
      ],
      journeyStepsActions: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"pageview","blockId":"step1.id","target":""}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"navigateNextStep","blockId":"step1.id","target":"step2,id"}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step2.id","event":"navigatePreviousStep","blockId":"step2.id","target":"step1.id"}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button1.id","target":"step2.id"}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"radioQuestionSubmit","blockId":"radioOption1.id","target":"link:https://google.com"}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"signupSubmit","blockId":"signUp1.id","target":"link:https://bible.com"}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"chatButtonClick","blockId":"step1.id","target":"link:https://m.me/test"}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button2.id","target":"chat:https://chat.example.com"}',
          visitors: 3
        }
      ],
      journeyReferrer: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'Direct / None',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'facebook',
          visitors: 2
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'tiktok',
          visitors: 3
        }
      ],
      journeyUtmCampaign: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'shortLink1',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'shortLink2',
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'shortLink3',
          visitors: 2
        }
      ],
      journeyVisitorsPageExits: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step2.id',
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step3.id',
          visitors: 2
        }
      ],
      journeyActionsSums: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"pageview","blockId":"step1.id","target":""}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"navigateNextStep","blockId":"step1.id","target":""}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step2.id","event":"navigatePreviousStep","blockId":"step2.id","target":""}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button1.id","target":"s"}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"radioQuestionSubmit","blockId":"radioOption1.id","target":""}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"signupSubmit","blockId":"signUp1.id","target":""}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"chatButtonClick","blockId":"step1.id","target":""}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button2.id","target":""}',
          visitors: 3
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 10
        }
      }
    }

    const result = {
      totalVisitors: 10,
      chatsStarted: 8,
      linksVisited: 10,
      referrers: {
        edges: [
          {
            id: 'QR Code->SocialPreview',
            source: 'QR Code',
            target: 'SocialPreview',
            type: 'Referrer',
            reconnectable: false
          },
          {
            id: 'Direct / None->SocialPreview',
            source: 'Direct / None',
            target: 'SocialPreview',
            type: 'Referrer',
            reconnectable: false
          },
          {
            id: 'other sources->SocialPreview',
            source: 'other sources',
            target: 'SocialPreview',
            type: 'Referrer',
            reconnectable: false
          }
        ],
        nodes: [
          {
            data: {
              __typename: 'PlausibleStatsResponse',
              property: 'QR Code',
              visitors: 10
            },
            draggable: false,
            id: 'QR Code',
            position: {
              x: -600,
              y: -46
            },
            type: 'Referrer'
          },
          {
            data: {
              __typename: 'PlausibleStatsResponse',
              property: 'Direct / None',
              visitors: 5
            },
            draggable: false,
            id: 'Direct / None',
            position: {
              x: -600,
              y: 19
            },
            type: 'Referrer'
          },
          {
            data: {
              property: 'other sources',
              referrers: [
                {
                  __typename: 'PlausibleStatsResponse',
                  property: 'tiktok',
                  visitors: 3
                },
                {
                  __typename: 'PlausibleStatsResponse',
                  property: 'facebook',
                  visitors: 2
                }
              ]
            },
            draggable: false,
            id: 'other sources',
            position: {
              x: -600,
              y: 84
            },
            type: 'Referrer'
          }
        ]
      },
      stepsStats: [
        {
          stepId: 'step1.id',
          // From the pageview simpleKey row (5), not the event:page row (10):
          // keyed pageview uniques win over page-path visitors when present
          visitors: 5,
          timeOnPage: 10,
          visitorsExitAtStep: 5
        },
        {
          stepId: 'step2.id',
          visitors: 5,
          timeOnPage: 3,
          visitorsExitAtStep: 3
        },
        {
          stepId: 'step3.id',
          visitors: 2,
          timeOnPage: 1,
          visitorsExitAtStep: 2
        }
      ],
      stepMap: new Map([
        [
          'step1.id',
          {
            eventMap: new Map([
              ['pageview', 5],
              ['navigateNextStep', 5],
              ['buttonClick', 8],
              ['radioQuestionSubmit', 5],
              ['signupSubmit', 5],
              ['chatButtonClick', 5]
            ]),
            total: 28
          }
        ],
        [
          'step2.id',
          {
            eventMap: new Map([['navigatePreviousStep', 5]]),
            total: 0
          }
        ]
      ]),
      blockMap: new Map([
        ['step1.id', 10],
        ['button1.id', 5],
        ['button2.id', 3],
        ['radioOption1.id', 5],
        ['signUp1.id', 5]
      ]),
      targetMap: new Map([
        ['step1.id->step2,id', 5],
        ['button1.id->step2.id', 5],
        ['radioOption1.id->link:https://google.com', 5],
        ['signUp1.id->link:https://bible.com', 5],
        ['step1.id->link:https://m.me/test', 5],
        ['button2.id->chat:https://chat.example.com', 3]
      ])
    }

    expect(transformJourneyAnalytics('journeyId', data)).toEqual(result)
  })

  it('should count ChatAction targets as chats started', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [],
      journeyStepsActions: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button1.id","target":"chat:https://chat.example.com"}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button2.id","target":"link:https://example.com"}',
          visitors: 3
        }
      ],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 8
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.chatsStarted).toBe(5)
    expect(result?.linksVisited).toBe(3)
  })

  it('should filter out videoComplete events to avoid doubling up with videoTrigger', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [],
      journeyStepsActions: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoTrigger","blockId":"video1.id","target":""}',
          visitors: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoComplete","blockId":"video1.id","target":""}',
          visitors: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step2.id","event":"videoTrigger","blockId":"video2.id","target":""}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step2.id","event":"videoComplete","blockId":"video2.id","target":""}',
          visitors: 5
        }
      ],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoTrigger","blockId":"video1.id","target":""}',
          visitors: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoComplete","blockId":"video1.id","target":""}',
          visitors: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step2.id","event":"videoTrigger","blockId":"video2.id","target":""}',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step2.id","event":"videoComplete","blockId":"video2.id","target":""}',
          visitors: 5
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 15
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    // videoTrigger events should be included in stepMap and blockMap
    expect(result?.stepMap.get('step1.id')?.eventMap.get('videoTrigger')).toBe(
      10
    )
    expect(result?.stepMap.get('step2.id')?.eventMap.get('videoTrigger')).toBe(
      5
    )

    // videoComplete events should NOT be included in stepMap
    expect(
      result?.stepMap.get('step1.id')?.eventMap.get('videoComplete')
    ).toBeUndefined()
    expect(
      result?.stepMap.get('step2.id')?.eventMap.get('videoComplete')
    ).toBeUndefined()

    // videoTrigger events should be included in blockMap (since videoTrigger is in ACTION_EVENTS)
    expect(result?.blockMap.get('video1.id')).toBe(10)
    expect(result?.blockMap.get('video2.id')).toBe(5)

    // Total should only count videoTrigger events, not videoComplete
    expect(result?.stepMap.get('step1.id')?.total).toBe(10)
    expect(result?.stepMap.get('step2.id')?.total).toBe(5)
  })

  it('should count phone action button clicks as chats started', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 10,
          timeOnPage: 10
        }
      ],
      journeyStepsActions: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"chatButtonClick","blockId":"button1.id","target":"phone:+1234567890"}',
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"chatButtonClick","blockId":"button2.id","target":"link:https://m.me/test"}',
          visitors: 2
        }
      ],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"chatButtonClick","blockId":"button1.id","target":""}',
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"chatButtonClick","blockId":"button2.id","target":""}',
          visitors: 2
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 10
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    // Should count both phone action and chat link clicks as chats started
    expect(result?.chatsStarted).toBe(5) // 3 phone actions + 2 chat links
    expect(result?.linksVisited).toBe(0)
  })

  it('should count video complete events with phone actions as chats started', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 10,
          timeOnPage: 10
        }
      ],
      journeyStepsActions: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoTrigger","blockId":"video1.id","target":"phone:+1234567890"}',
          visitors: 4
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoComplete","blockId":"video2.id","target":"step2.id"}',
          visitors: 2
        }
      ],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoTrigger","blockId":"video1.id","target":""}',
          visitors: 4
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoComplete","blockId":"video2.id","target":""}',
          visitors: 2
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 10
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    // Should count video complete with phone action as chats started
    expect(result?.chatsStarted).toBe(4) // Only the phone action video
    expect(result?.linksVisited).toBe(0)
  })

  it('should count mixed phone action events as chats started', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 10,
          timeOnPage: 10
        }
      ],
      journeyStepsActions: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"chatButtonClick","blockId":"button1.id","target":"phone:+1234567890"}',
          visitors: 2
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoTrigger","blockId":"video1.id","target":"phone:+9876543210"}',
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"footerChatButtonClick","blockId":"footer1.id","target":"link:https://m.me/test"}',
          visitors: 1
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button2.id","target":"link:https://google.com"}',
          visitors: 2
        }
      ],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"chatButtonClick","blockId":"button1.id","target":""}',
          visitors: 2
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoTrigger","blockId":"video1.id","target":""}',
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"footerChatButtonClick","blockId":"footer1.id","target":""}',
          visitors: 1
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button2.id","target":""}',
          visitors: 2
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 10
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    // Should count all phone actions and chat buttons as chats started
    expect(result?.chatsStarted).toBe(6) // 2 phone button + 3 phone video + 1 footer chat
    expect(result?.linksVisited).toBe(2) // Only the regular link
  })

  it('should not add QR Code referrer when UTM campaign visitors sum to zero', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [],
      journeyStepsActions: [],
      journeyReferrer: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'Direct / None',
          visitors: 5
        }
      ],
      journeyUtmCampaign: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'shortLink1',
          visitors: 0
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'shortLink2',
          visitors: null
        }
      ],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 5
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.referrers.nodes).toHaveLength(1)
    expect(result?.referrers.nodes[0].id).toBe('Direct / None')
  })

  it('should merge trailing-slash and non-trailing-slash pages for the same step', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 7,
          timeOnPage: 10
        },
        {
          // Same step, recorded under a trailing slash for query-string traffic
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 93,
          timeOnPage: 20
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 2
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 40
        }
      ],
      journeyActionsSums: [],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 100
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    // Both pages collapse into a single step whose visitors and exits are summed
    expect(result?.stepsStats).toHaveLength(1)
    expect(result?.stepsStats[0]).toEqual({
      stepId: 'step1.id',
      visitors: 100,
      // visitor-weighted mean: (10*7 + 20*93) / 100 = 19.3
      timeOnPage: 19.3,
      visitorsExitAtStep: 42
    })
  })

  it('merges the same regardless of which slash variant appears first', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          // Trailing-slash variant listed BEFORE the slash-free one
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 93,
          timeOnPage: 20
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 7,
          timeOnPage: 10
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 100
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.stepsStats).toHaveLength(1)
    expect(result?.stepsStats[0]).toEqual({
      stepId: 'step1.id',
      visitors: 100,
      // Same visitor-weighted mean as the reverse order: (20*93 + 10*7) / 100
      timeOnPage: 19.3,
      visitorsExitAtStep: 0
    })
  })

  it('ignores a zero-visitor variant when weighting timeOnPage', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 5,
          timeOnPage: 10
        },
        {
          // Zero visitors must not drag the weighted average toward its timeOnPage
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 0,
          timeOnPage: 999
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 5
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.stepsStats).toHaveLength(1)
    expect(result?.stepsStats[0]).toEqual({
      stepId: 'step1.id',
      visitors: 5,
      timeOnPage: 10,
      visitorsExitAtStep: 0
    })
  })

  it('returns 0 timeOnPage when both merged variants have no visitors', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 0,
          timeOnPage: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 0,
          timeOnPage: 20
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 0
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    // Divide-by-zero guard: no visitors on either variant -> 0, never NaN
    expect(result?.stepsStats[0]).toEqual({
      stepId: 'step1.id',
      visitors: 0,
      timeOnPage: 0,
      visitorsExitAtStep: 0
    })
  })

  it('uses pathname-independent pageview uniques instead of the summed slash variants', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 30,
          timeOnPage: 10
        },
        {
          // Historical trailing-slash variant: visitors present on both
          // variants are double-counted by the sum (30 + 70 = 100)
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 70,
          timeOnPage: 20
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [
        {
          // Keyed pageview uniques are deduplicated across both page variants
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"pageview","blockId":"step1.id","target":""}',
          visitors: 90
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 90
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.stepsStats).toHaveLength(1)
    expect(result?.stepsStats[0]).toEqual({
      stepId: 'step1.id',
      // The keyed pageview count (90), not the double-counting sum (100)
      visitors: 90,
      // timeOnPage still comes from event:page: (10*30 + 20*70) / 100 = 17
      timeOnPage: 17,
      visitorsExitAtStep: 0
    })
  })

  it('caps visitorsExitAtStep at the deduplicated visitor count', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 30,
          timeOnPage: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 70,
          timeOnPage: 20
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [
        {
          // Exits are summed across both slash variants (20 + 40 = 60), which
          // can exceed the deduplicated visitor count for the same step
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 20
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 40
        }
      ],
      journeyActionsSums: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"pageview","blockId":"step1.id","target":""}',
          visitors: 50
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 50
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.stepsStats[0]).toEqual({
      stepId: 'step1.id',
      visitors: 50,
      timeOnPage: 17,
      // Summed exits (60) exceed deduplicated visitors (50): capped so the
      // exit rate cannot render above 100%
      visitorsExitAtStep: 50
    })
  })

  it('treats an explicit zero-visitor pageview key as authoritative rather than falling back', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 100,
          timeOnPage: 10
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [],
      journeyActionsSums: [
        {
          // The keyed row exists but recorded no visitors: presence wins, so
          // the step reports 0 instead of the (potentially inflated) page sum
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"pageview","blockId":"step1.id","target":""}',
          visitors: 0
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 100
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.stepsStats[0]).toEqual({
      stepId: 'step1.id',
      visitors: 0,
      timeOnPage: 10,
      visitorsExitAtStep: 0
    })
  })

  it('applies the override and the fallback independently across steps in one call', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 30,
          timeOnPage: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 70,
          timeOnPage: 20
        },
        {
          // step2 has no keyed pageview row and keeps the summed count
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step2.id',
          visitors: 40,
          timeOnPage: 5
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [
        {
          // Below the overridden visitor count (90): the cap is a no-op and
          // the exit count passes through unchanged
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 10
        }
      ],
      journeyActionsSums: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"pageview","blockId":"step1.id","target":""}',
          visitors: 90
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 130
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.stepsStats).toEqual([
      {
        stepId: 'step1.id',
        visitors: 90,
        timeOnPage: 17,
        visitorsExitAtStep: 10
      },
      {
        stepId: 'step2.id',
        visitors: 40,
        timeOnPage: 5,
        visitorsExitAtStep: 0
      }
    ])
  })

  it('caps exits at the summed visitor count on the fallback path too', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 30,
          timeOnPage: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 20,
          timeOnPage: 10
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [
        {
          // Summed exits (35 + 25 = 60) exceed even the summed visitors (50):
          // capped on the fallback path as well, so the exit rate stays <=100%
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 35
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 25
        }
      ],
      journeyActionsSums: [],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 50
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.stepsStats[0]).toEqual({
      stepId: 'step1.id',
      visitors: 50,
      timeOnPage: 10,
      visitorsExitAtStep: 50
    })
  })

  it('falls back to summed event:page visitors when no pageview key data exists', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 30,
          timeOnPage: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 70,
          timeOnPage: 20
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [
        {
          // Below the summed visitor count (100): the cap is a no-op on the
          // fallback path and the exit count passes through unchanged
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 40
        }
      ],
      journeyActionsSums: [
        {
          // Action rows without a pageview row must not trigger the override
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button1.id","target":""}',
          visitors: 40
        }
      ],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 100
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.stepsStats[0]).toEqual({
      stepId: 'step1.id',
      visitors: 100,
      timeOnPage: 17,
      visitorsExitAtStep: 40
    })
  })

  it('matches exits to a step even when the exit page uses the other slash variant', () => {
    const data: GetJourneyAnalytics = {
      journeySteps: [
        {
          // Step recorded without a trailing slash
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id',
          visitors: 8,
          timeOnPage: 5
        }
      ],
      journeyStepsActions: [],
      journeyReferrer: [],
      journeyUtmCampaign: [],
      journeyVisitorsPageExits: [
        {
          // Exit recorded WITH a trailing slash — must still resolve to step1.id
          __typename: 'PlausibleStatsResponse',
          property: '/journeyId/step1.id/',
          visitors: 3
        }
      ],
      journeyActionsSums: [],
      journeyAggregateVisitors: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 8
        }
      }
    }

    const result = transformJourneyAnalytics('journeyId', data)

    expect(result?.stepsStats[0]).toEqual({
      stepId: 'step1.id',
      visitors: 8,
      timeOnPage: 5,
      visitorsExitAtStep: 3
    })
  })
})
