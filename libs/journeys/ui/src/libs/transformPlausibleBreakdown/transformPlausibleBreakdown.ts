import replace from 'lodash/replace'

import { JourneyPlausibleEvents, reverseKeyify } from '../plausibleHelpers'

import { PlausibleJourneyAggregateVisitorsFields as JourneyAggregateVisitors } from './plausibleFields/__generated__/PlausibleJourneyAggregateVisitorsFields'
import { PlausibleJourneyReferrerFields as JourneyReferrer } from './plausibleFields/__generated__/PlausibleJourneyReferrerFields'
import { PlausibleJourneyStepsActionsFields as JourneyStepsAction } from './plausibleFields/__generated__/PlausibleJourneyStepsActionsFields'
import { PlausibleJourneyStepsFields as JourneyStep } from './plausibleFields/__generated__/PlausibleJourneyStepsFields'
import { PlausibleJourneyVisitorsPageExitsFields as JourneyVisitorsPageExit } from './plausibleFields/__generated__/PlausibleJourneyVisitorsPageExitsFields'
import { TreeBlock } from '../block'
import { isActionBlock } from '../isActionBlock'
import { generateActionTargetKey } from '../plausibleHelpers/plausibleHelpers'

export interface StatsBreakdown {
  journeySteps: JourneyStep[]
  journeyStepsActions: JourneyStepsAction[]
  journeyReferrer: JourneyReferrer[]
  journeyAggregateVisitors: JourneyAggregateVisitors
  journeyVisitorsPageExits: JourneyVisitorsPageExit[]
}

export interface JourneyStatsBreakdown {
  totalVisitors: number
  chatsStarted: number
  linksVisited: number
  referrers: JourneyReferrer[]
  stepsStats: StepStat[]
  stepEventMap: Map<string, StepEventMapValue> // keyed by stepId to retrieve action events and all events by type
  targetEventMap: Map<string, EventMapValue> // contains events keyed using blockId->target
}

interface StepStat {
  stepId: string
  visitors: number
  timeOnPage: number
  visitorsExitAtStep: number
}

export interface PlausibleEvent {
  [K: string]: string | number | keyof JourneyPlausibleEvents | undefined
  stepId: string
  event: keyof JourneyPlausibleEvents
  blockId: string
  target?: string // target step id or link
  actionKey?: string
  events: number
}

export interface BlockAnalytics {
  percentOfStepEvents: number
  event: PlausibleEvent
}

interface TransformPlausibleBreakdownProps {
  journeyId?: string
  data?: StatsBreakdown
}

interface EventMapValue {
  total: number
  events: PlausibleEvent[]
}

interface StepEventMapValue {
  blockMap: Map<string, EventMapValue>
  eventMap: Map<keyof JourneyPlausibleEvents, EventMapValue>
  total: number
}

const ACTION_EVENTS: Array<keyof JourneyPlausibleEvents> = [
  'navigateNextStep',
  'buttonClick',
  'textResponseSubmit',
  'signUpSubmit',
  'radioQuestionSubmit',
  'videoComplete'
]

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
    journeyAggregateVisitors
  } = data

  const journeyEvents = getJourneyEvents(journeyStepsActions)
  const stepExits = getStepExits(journeyVisitorsPageExits, journeyId)
  const { chatsStarted, linksVisited } = getLinkClicks(journeyEvents)

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

  const { stepMap, targetMap } = journeyEvents.reduce(
    (acc, event) => {
      // add event to step map keyed by step and event type
      const step = acc.stepMap.get(event.stepId) ?? {
        blockMap: new Map<string, EventMapValue>([]),
        eventMap: new Map<keyof JourneyPlausibleEvents, EventMapValue>([]),
        total: 0
      }

      const stepEvent = step.eventMap.get(event.event) ?? {
        total: 0,
        events: []
      }

      stepEvent.total += event.events
      stepEvent.events.push(event)

      step.eventMap.set(event.event, stepEvent)

      if (
        event.target != null &&
        event.target != '' &&
        ACTION_EVENTS.includes(event.event)
      ) {
        // Add event to step blockMap
        step.total += event.events

        const block = step.blockMap.get(event.blockId) ?? {
          total: 0,
          events: []
        }
        block.total += event.events
        block.events.push(event)

        step.blockMap.set(event.blockId, block)

        // add event to targetMap
        const key = `${event.blockId}->${event.target}`
        const target = acc.targetMap.get(key) ?? {
          total: 0,
          events: []
        }

        target.total += event.events
        target.events.push(event)

        acc.targetMap.set(key, target)
      }

      acc.stepMap.set(event.stepId, step)

      return acc
    },
    {
      stepMap: new Map<string, StepEventMapValue>([]),
      targetMap: new Map<string, EventMapValue>([])
    }
  )

  return {
    totalVisitors: journeyAggregateVisitors.visitors?.value ?? 0,
    chatsStarted,
    linksVisited,
    referrers: journeyReferrer,
    stepsStats,
    stepEventMap: stepMap,
    targetEventMap: targetMap
  }
}

function getStepId(property: string, journeyId: string): string {
  return replace(property, `${journeyId}/`, '')
}

function getJourneyEvents(
  journeyStepsActions: JourneyStepsAction[]
): PlausibleEvent[] {
  const journeyEvents = journeyStepsActions.map((action) => {
    return {
      ...reverseKeyify(action.property),
      events: action.events ?? 0
    }
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

function formatEventKey(from: string, to: string): string {
  return `${from}->${to}`
}

export function getBlockEventKey(block?: TreeBlock): string {
  let key = ''

  if (block == null) {
    return key
  }

  if (block?.__typename === 'StepBlock') {
    // Get a key for Steps that have a next block
    if (block.nextBlockId != null && block.nextBlockId !== '') {
      key = formatEventKey(block.id, block.nextBlockId)
    }
  }

  // Get a key for actions blocks that have an action
  if (isActionBlock(block) && block.action != null) {
    const target = generateActionTargetKey(block.action)
    key = formatEventKey(block.action.parentBlockId, target)
  }

  return key
}
