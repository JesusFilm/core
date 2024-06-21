import replace from 'lodash/replace'

import { JourneyPlausibleEvents, reverseKeyify } from '../plausibleHelpers'

import { PlausibleJourneyActionsSumsFields as JourneyActionsSums } from './plausibleFields/__generated__/PlausibleJourneyActionsSumsFields'
import { PlausibleJourneyAggregateVisitorsFields as JourneyAggregateVisitors } from './plausibleFields/__generated__/PlausibleJourneyAggregateVisitorsFields'
import { PlausibleJourneyReferrerFields as JourneyReferrer } from './plausibleFields/__generated__/PlausibleJourneyReferrerFields'
import { PlausibleJourneyStepsActionsFields as JourneyStepsAction } from './plausibleFields/__generated__/PlausibleJourneyStepsActionsFields'
import { PlausibleJourneyStepsFields as JourneyStep } from './plausibleFields/__generated__/PlausibleJourneyStepsFields'
import { PlausibleJourneyVisitorsPageExitsFields as JourneyVisitorsPageExit } from './plausibleFields/__generated__/PlausibleJourneyVisitorsPageExitsFields'

const ACTION_EVENTS: Array<keyof JourneyPlausibleEvents> = [
  'navigateNextStep',
  'buttonClick',
  'textResponseSubmit',
  'signUpSubmit',
  'radioQuestionSubmit',
  'videoComplete',
  'chatButtonClick'
]

export interface StatsBreakdown {
  journeySteps: JourneyStep[]
  journeyStepsActions: JourneyStepsAction[]
  journeyReferrer: JourneyReferrer[]
  journeyAggregateVisitors: JourneyAggregateVisitors
  journeyVisitorsPageExits: JourneyVisitorsPageExit[]
  journeyActionsSums: JourneyActionsSums[]
}

type SumEventMap = Map<string, number>

export interface JourneyStatsBreakdown {
  totalVisitors: number
  chatsStarted: number
  linksVisited: number
  referrers: JourneyReferrer[]
  stepsStats: StepStat[]
  stepMap: Map<string, { eventMap: SumEventMap; total: number }>
  blockMap: SumEventMap
  targetMap: SumEventMap
}

interface StepStat {
  stepId: string
  visitors: number
  timeOnPage: number
  visitorsExitAtStep: number
}

interface PlausibleEvent {
  stepId: string
  event: keyof JourneyPlausibleEvents
  blockId: string
  target?: string // target step id or link
  events: number
}

interface TransformPlausibleBreakdownProps {
  journeyId?: string
  data?: StatsBreakdown
}

export function transformPlausibleBreakdown({
  journeyId,
  data
}: TransformPlausibleBreakdownProps): JourneyStatsBreakdown | undefined {
  if (journeyId == null || data == null) return
  const {
    journeySteps,
    journeyStepsActions,
    journeyVisitorsPageExits,
    journeyReferrer,
    journeyAggregateVisitors,
    journeyActionsSums
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

  return {
    totalVisitors: journeyAggregateVisitors.visitors?.value ?? 0,
    chatsStarted,
    linksVisited,
    referrers: journeyReferrer,
    stepsStats,
    stepMap,
    blockMap,
    targetMap
  }
}

function getStepId(property: string, journeyId: string): string {
  return replace(property, `${journeyId}/`, '')
}

function getJourneyEvents(
  journeyStepsActions: JourneyStepsAction[] | JourneyActionsSums[]
): PlausibleEvent[] {
  const journeyEvents: PlausibleEvent[] = []
  journeyStepsActions.forEach((action) => {
    if (action.property === '(none)') return
    journeyEvents.push({
      ...reverseKeyify(action.property),
      events: action.events ?? 0
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
    const isChatEvent = event === 'chatButtonClick'
    const isLinkEvent =
      event === 'buttonClick' && target != null && target.includes('link')

    if (isChatEvent) {
      chatsStarted += events
    } else if (isLinkEvent) {
      linksVisited += events
    }
  })

  return {
    chatsStarted,
    linksVisited
  }
}
