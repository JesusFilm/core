import replace from 'lodash/replace'

import { TreeBlock } from '../block'
import { BlockFields_StepBlock as StepBlock } from '../block/__generated__/BlockFields'
import { ActionBlock, isActionBlock } from '../isActionBlock'
import { JourneyPlausibleEvents, reverseKeyify } from '../plausibleHelpers'
import { generateActionTargetKey } from '../plausibleHelpers/plausibleHelpers'

import { PlausibleJourneyAggregateVisitorsFields as JourneyAggregateVisitors } from './plausibleFields/__generated__/PlausibleJourneyAggregateVisitorsFields'
import { PlausibleJourneyReferrerFields as JourneyReferrer } from './plausibleFields/__generated__/PlausibleJourneyReferrerFields'
import { PlausibleJourneyStepsActionsFields as JourneyStepsAction } from './plausibleFields/__generated__/PlausibleJourneyStepsActionsFields'
import { PlausibleJourneyStepsFields as JourneyStep } from './plausibleFields/__generated__/PlausibleJourneyStepsFields'
import { PlausibleJourneyVisitorsPageExitsFields as JourneyVisitorsPageExit } from './plausibleFields/__generated__/PlausibleJourneyVisitorsPageExitsFields'

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
  actionEventMap: Record<string, PlausibleEvent>
}

interface StepStat {
  stepId: string
  visitors: number
  timeOnPage: number
  visitorsExitAtStep: number
  stepEvents: PlausibleEvent[]
}

export interface PlausibleEvent {
  stepId: string
  event: keyof JourneyPlausibleEvents
  blockId: string
  target?: string // target step id or link
  actionKey?: string
  events: number
}

interface PlausibleActionEvent extends PlausibleEvent {
  target: string
}

export interface BlockAnalytics {
  percentOfStepEvents: number
  event: PlausibleEvent
}

interface StepAnalytics {
  blockAnalyticsMap: Record<string, BlockAnalytics>
  totalActiveEvents: number
}

interface TransformPlausibleBreakdownProps {
  journeyId?: string
  data?: StatsBreakdown
}

const ACTION_EVENTS: Array<keyof JourneyPlausibleEvents> = [
  'navigateNextStep',
  'buttonClick',
  'textResponseSubmit',
  'signUpSubmit',
  'radioQuestionSubmit',
  'chatButtonClick',
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
        stepExits.find((step) => step.id === stepId)?.visitors ?? 0,
      stepEvents: journeyEvents.filter((event) => event.stepId === stepId)
    }
  })

  const actionEventMap = Object.fromEntries(
    journeyEvents
      .filter(isActiveActionEvent)
      .map((event) => [formatEventKey(event.blockId, event.target), event])
  )

  return {
    totalVisitors: journeyAggregateVisitors.visitors?.value ?? 0,
    chatsStarted,
    linksVisited,
    referrers: journeyReferrer,
    stepsStats,
    actionEventMap
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

function isActiveActionEvent(
  event: PlausibleEvent
): event is PlausibleActionEvent {
  return ACTION_EVENTS.includes(event.event) && event.target != null
}

export function getStepAnalytics(
  blocks: Array<TreeBlock<StepBlock> | ActionBlock>,
  eventMap?: Record<string, PlausibleEvent>
): StepAnalytics {
  let totalActiveEvents = 0
  const blockAnalyticsMap: { [key: string]: BlockAnalytics } = {}

  // Iterate over action blocks to populate blockAnalyticsMap and totalActiveEvents
  blocks.forEach((block) => {
    if (block == null) return

    const key = getBlockEventKey(block)
    const event = eventMap?.[key]

    if (event != null) {
      totalActiveEvents += event.events
      blockAnalyticsMap[block.id] = { event, percentOfStepEvents: 0 }
    }
  })

  // Calculate
  blocks.forEach((block) => {
    const analytics = blockAnalyticsMap[block.id]

    if (analytics == null) return

    const percentage =
      Math.round(
        (analytics.event.events / totalActiveEvents + Number.EPSILON) * 100
      ) / 100

    blockAnalyticsMap[block.id].percentOfStepEvents = percentage
  })

  return { blockAnalyticsMap, totalActiveEvents }
}
