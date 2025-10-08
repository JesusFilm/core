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
      chatsStarted: 5,
      linksVisited: 10,
      referrers: {
        edges: [
          {
            id: 'Direct / None->SocialPreview',
            source: 'Direct / None',
            target: 'SocialPreview',
            type: 'Referrer',
            updatable: false
          },
          {
            id: 'tiktok->SocialPreview',
            source: 'tiktok',
            target: 'SocialPreview',
            type: 'Referrer',
            updatable: false
          },
          {
            id: 'facebook->SocialPreview',
            source: 'facebook',
            target: 'SocialPreview',
            type: 'Referrer',
            updatable: false
          }
        ],
        nodes: [
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
              y: -46
            },
            type: 'Referrer'
          },
          {
            data: {
              __typename: 'PlausibleStatsResponse',
              property: 'tiktok',
              visitors: 3
            },
            draggable: false,
            id: 'tiktok',
            position: {
              x: -600,
              y: 19
            },
            type: 'Referrer'
          },
          {
            data: {
              __typename: 'PlausibleStatsResponse',
              property: 'facebook',
              visitors: 2
            },
            draggable: false,
            id: 'facebook',
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
          visitors: 10,
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
              ['buttonClick', 5],
              ['radioQuestionSubmit', 5],
              ['signupSubmit', 5],
              ['chatButtonClick', 5]
            ]),
            total: 25
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
        ['radioOption1.id', 5],
        ['signUp1.id', 5]
      ]),
      targetMap: new Map([
        ['step1.id->step2,id', 5],
        ['button1.id->step2.id', 5],
        ['radioOption1.id->link:https://google.com', 5],
        ['signUp1.id->link:https://bible.com', 5],
        ['step1.id->link:https://m.me/test', 5]
      ])
    }

    expect(transformJourneyAnalytics('journeyId', data)).toEqual(result)
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
            '{"stepId":"step1.id","event":"videoComplete","blockId":"video1.id","target":"phone:+1234567890"}',
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
            '{"stepId":"step1.id","event":"videoComplete","blockId":"video1.id","target":""}',
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
            '{"stepId":"step1.id","event":"videoComplete","blockId":"video1.id","target":"phone:+9876543210"}',
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
            '{"stepId":"step1.id","event":"videoComplete","blockId":"video1.id","target":""}',
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
})
