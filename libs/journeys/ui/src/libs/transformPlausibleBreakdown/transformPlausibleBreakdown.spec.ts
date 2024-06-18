import { TreeBlock } from '../block'
import { BlockFields_VideoBlock } from '../block/__generated__/BlockFields'
import {
  JourneyStatsBreakdown,
  StatsBreakdown,
  getBlockEventKey,
  getStepAnalytics,
  transformPlausibleBreakdown
} from './transformPlausibleBreakdown'

describe('transformPlausibleBreakdown', () => {
  it('should return journey stats breakdown', () => {
    const data: StatsBreakdown = {
      journeySteps: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step1.id',
          visitors: 10,
          timeOnPage: 10
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step2.id',
          visitors: 5,
          timeOnPage: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step3.id',
          visitors: 2,
          timeOnPage: 1
        }
      ],
      journeyStepsActions: [
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"pageview","blockId":"step1.id","target":""}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"navigateNextStep","blockId":"step1.id","target":"step2,id"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step2.id","event":"navigatePreviousStep","blockId":"step2.id","target":"step1.id"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"buttonClick","blockId":"button1.id","target":"step2.id"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"radioQuestionSubmit","blockId":"radioOption1.id","target":"link:https://google.com"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"signUpSubmit","blockId":"signUp1.id","target":"link:https://bible.com"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"chatButtonClick","blockId":"step1.id","target":"link:https://m.me/test"}',
          events: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property:
            '{"stepId":"step1.id","event":"videoComplete","blockId":"step1.id","target":"step2.id"}',
          events: 2
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
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'tiktok',
          visitors: 2
        }
      ],
      journeyVisitorsPageExits: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step1.id',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step2.id',
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'journeyId/step3.id',
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

    const result: JourneyStatsBreakdown = {
      totalVisitors: 10,
      chatsStarted: 5,
      linksVisited: 0,
      referrers: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'Direct / None',
          visitors: 5
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'facebook',
          visitors: 3
        },
        {
          __typename: 'PlausibleStatsResponse',
          property: 'tiktok',
          visitors: 2
        }
      ],
      stepsStats: [
        {
          stepId: 'step1.id',
          visitors: 10,
          timeOnPage: 10,
          visitorsExitAtStep: 5,
          stepEvents: [
            {
              stepId: 'step1.id',
              event: 'pageview',
              blockId: 'step1.id',
              target: '',
              events: 5
            },
            {
              stepId: 'step1.id',
              event: 'navigateNextStep',
              blockId: 'step1.id',
              target: 'step2,id',
              events: 5
            },
            {
              stepId: 'step1.id',
              event: 'buttonClick',
              blockId: 'button1.id',
              target: 'step2.id',
              events: 5
            },
            {
              stepId: 'step1.id',
              event: 'radioQuestionSubmit',
              blockId: 'radioOption1.id',
              target: 'link:https://google.com',
              events: 5
            },
            {
              stepId: 'step1.id',
              event: 'signUpSubmit',
              blockId: 'signUp1.id',
              target: 'link:https://bible.com',
              events: 5
            },
            {
              stepId: 'step1.id',
              event: 'chatButtonClick',
              blockId: 'step1.id',
              target: 'link:https://m.me/test',
              events: 5
            },
            {
              stepId: 'step1.id',
              event: 'videoComplete',
              blockId: 'step1.id',
              target: 'step2.id',
              events: 2
            }
          ]
        },
        {
          stepId: 'step2.id',
          visitors: 5,
          timeOnPage: 3,
          visitorsExitAtStep: 3,
          stepEvents: [
            {
              stepId: 'step2.id',
              event: 'navigatePreviousStep',
              blockId: 'step2.id',
              target: 'step1.id',
              events: 5
            }
          ]
        },
        {
          stepId: 'step3.id',
          visitors: 2,
          timeOnPage: 1,
          visitorsExitAtStep: 2,
          stepEvents: []
        }
      ],
      actionEventMap: {
        'button1.id->step2.id': {
          blockId: 'button1.id',
          event: 'buttonClick',
          events: 5,
          stepId: 'step1.id',
          target: 'step2.id'
        },
        'radioOption1.id->link:https://google.com': {
          blockId: 'radioOption1.id',
          event: 'radioQuestionSubmit',
          events: 5,
          stepId: 'step1.id',
          target: 'link:https://google.com'
        },
        'signUp1.id->link:https://bible.com': {
          blockId: 'signUp1.id',
          event: 'signUpSubmit',
          events: 5,
          stepId: 'step1.id',
          target: 'link:https://bible.com'
        },
        'step1.id->link:https://m.me/test': {
          blockId: 'step1.id',
          event: 'chatButtonClick',
          events: 5,
          stepId: 'step1.id',
          target: 'link:https://m.me/test'
        },
        'step1.id->step2,id': {
          blockId: 'step1.id',
          event: 'navigateNextStep',
          events: 5,
          stepId: 'step1.id',
          target: 'step2,id'
        },
        'step1.id->step2.id': {
          blockId: 'step1.id',
          event: 'videoComplete',
          events: 2,
          stepId: 'step1.id',
          target: 'step2.id'
        }
      }
    }

    expect(
      transformPlausibleBreakdown({ journeyId: 'journeyId', data })
    ).toEqual(result)
  })

  it('should return key for step block', () => {
    const stepBlock = {
      id: 'step1.id',
      locked: false,
      nextBlockId: 'step2.id',
      parentBlockId: null,
      parentOrder: 0,
      __typename: 'StepBlock' as const,
      children: []
    }

    expect(getBlockEventKey(stepBlock)).toEqual('step1.id->step2.id')
  })

  it('should return key for action block', () => {
    const actionBlock = {
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'video1.id',
        gtmEventName: null,
        blockId: 'step2.id'
      },
      id: 'video1.id',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      __typename: 'VideoBlock',
      children: []
    } as unknown as TreeBlock<BlockFields_VideoBlock>

    expect(getBlockEventKey(actionBlock)).toEqual('video1.id->step2.id')
  })

  it('should get block analytics', () => {
    const blocks = [
      {
        id: 'step1.id',
        locked: false,
        nextBlockId: 'step2.id',
        parentBlockId: null,
        parentOrder: 0,
        __typename: 'StepBlock' as const,
        children: []
      },
      {
        action: {
          __typename: 'NavigateToBlockAction',
          parentBlockId: 'video1.id',
          gtmEventName: null,
          blockId: 'step2.id'
        },
        id: 'video1.id',
        parentBlockId: 'step1.id',
        parentOrder: 0,
        __typename: 'VideoBlock',
        children: []
      } as unknown as TreeBlock<BlockFields_VideoBlock>
    ]

    const eventMap = {
      'step1.id->step2.id': {
        blockId: 'step1.id',
        event: 'navigateNextStep',
        events: 5,
        stepId: 'step1.id',
        target: 'step2,id'
      },
      'video1.id->step2.id': {
        blockId: 'step1.id',
        event: 'videoComplete',
        events: 2,
        stepId: 'step1.id',
        target: 'step2.id'
      },
      'step2.id->step3.id': {
        blockId: 'step2.id',
        event: 'navigateNextStep',
        events: 5,
        stepId: 'step2.id',
        target: 'step3.id'
      }
    }

    const { blockAnalyticsMap, totalActiveEvents } = getStepAnalytics(
      blocks,
      eventMap
    )

    expect(totalActiveEvents).toEqual(7)
    expect(blockAnalyticsMap).toEqual({
      'step1.id': {
        event: {
          blockId: 'step1.id',
          event: 'navigateNextStep',
          events: 5,
          stepId: 'step1.id',
          target: 'step2,id'
        },
        percentOfStepEvents: 0.71
      },
      'video1.id': {
        event: {
          blockId: 'step1.id',
          event: 'videoComplete',
          events: 2,
          stepId: 'step1.id',
          target: 'step2.id'
        },
        percentOfStepEvents: 0.29
      }
    })
  })
})
