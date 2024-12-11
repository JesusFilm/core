import replace from 'lodash/replace'

import { messagePlatforms } from '../../../components/Button/utils/findMessagePlatform'
import { JourneyPlausibleEvents, reverseKeyify } from '../../plausibleHelpers'
import {
  GetJourneyAnalytics,
  GetJourneyAnalytics_journeyActionsSums as JourneyActionsSums,
  GetJourneyAnalytics_journeyStepsActions as JourneyStepsAction,
  GetJourneyAnalytics_journeyVisitorsPageExits as JourneyVisitorsPageExit
} from '../__generated__/GetJourneyAnalytics'
import { transformReferrers } from '../transformReferrers'
import {
  type JourneyAnalytics,
  type StepStat
} from '../useJourneyAnalyticsQuery'

const ACTION_EVENTS: Array<keyof JourneyPlausibleEvents> = [
  'navigateNextStep',
  'buttonClick',
  'textResponseSubmit',
  'signupSubmit',
  'radioQuestionSubmit',
  'videoComplete',
  'chatButtonClick',
  'footerChatButtonClick'
]

interface PlausibleEvent {
  stepId: string
  event: keyof JourneyPlausibleEvents
  blockId: string
  target?: string // target step id or link
  events: number
}

export function transformJourneyAnalytics(
  journeyId: string | undefined,
  data: GetJourneyAnalytics
): JourneyAnalytics | undefined {
  if (journeyId == null || data == null) return
  const {
    journeySteps,
    journeyStepsActions,
    journeyVisitorsPageExits,
    journeyReferrer,
    journeyAggregateVisitors,
    journeyActionsSums
    // journeyUtmCampaign
  } = data

  const journeyEvents = getJourneyEvents(journeyStepsActions)
  const journeyEventsSums = getJourneyEvents(journeyActionsSums)
  const stepExits = getStepExits(journeyVisitorsPageExits, journeyId)
  const { chatsStarted, linksVisited } = getLinkClicks(journeyEvents)

  const stepMap = new Map()
  const blockMap = new Map()
  const targetMap = new Map()

  journeyEventsSums.forEach((event) => {
    const step = stepMap.get(event.stepId) ?? {
      eventMap: new Map(),
      total: 0
    }

    // Set event map for step by event type
    let stepEvent = step.eventMap.get(event.event) ?? 0

    stepEvent += event.events

    step.eventMap.set(event.event, stepEvent)

    if (ACTION_EVENTS.includes(event.event)) {
      step.total += event.events

      let block = blockMap.get(event.blockId) ?? 0

      block += event.events

      blockMap.set(event.blockId, block)
    }

    stepMap.set(event.stepId, step)
  })

  journeyEvents.forEach((event) => {
    if (event.target == null || !ACTION_EVENTS.includes(event.event)) return
    const key = `${event.blockId}->${event.target}`

    let target = targetMap.get(key) ?? 0
    target += event.events
    targetMap.set(key, target)
  })

  const stepsStats: StepStat[] = journeySteps.map((step) => {
    const stepId = getStepId(step.property, journeyId)
    return {
      stepId,
      visitors: step.visitors ?? 0,
      timeOnPage: step.timeOnPage ?? 0,
      visitorsExitAtStep:
        stepExits.find((step) => step.id === stepId)?.visitors ?? 0
    }
  })

  const referrers = transformReferrers(journeyReferrer)

  return {
    totalVisitors: journeyAggregateVisitors.visitors?.value ?? 0,
    chatsStarted,
    linksVisited,
    referrers,
    stepsStats,
    stepMap,
    blockMap,
    targetMap
  }
}

function getStepId(property: string, journeyId: string): string {
  return replace(property, `/${journeyId}/`, '')
}

function getJourneyEvents(
  journeyStepsActions: JourneyStepsAction[] | JourneyActionsSums[]
): PlausibleEvent[] {
  const journeyEvents: PlausibleEvent[] = []
  journeyStepsActions.forEach((action) => {
    if (action.property === '(none)') return
    journeyEvents.push({
      ...reverseKeyify(action.property),
      events: action.visitors ?? 0
    })
  })

  return journeyEvents
}

function getStepExits(
  journeyVisitorsPageExits: JourneyVisitorsPageExit[],
  journeyId: string
): Array<{ id: string; visitors: number }> {
  const stepExits = journeyVisitorsPageExits.map((page) => {
    const id = getStepId(page.property, journeyId)
    return {
      id,
      visitors: page.visitors ?? 0
    }
  })

  return stepExits
}

function getLinkClicks(journeyEvents: PlausibleEvent[]): {
  chatsStarted: number
  linksVisited: number
} {
  let chatsStarted = 0
  let linksVisited = 0

  journeyEvents.forEach((plausibleEvent) => {
    const { event, target, events } = plausibleEvent
    if (target != null && target.includes('link')) {
      const isChatLink = messagePlatforms.find(({ url }) =>
        target.includes(url)
      )
      if (isChatLink != null || event === 'footerChatButtonClick') {
        chatsStarted += events
      } else {
        linksVisited += events
      }
    }
  })

  return {
    chatsStarted,
    linksVisited
  }
}
