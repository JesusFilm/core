import replace from 'lodash/replace'

import { JourneyPlausibleEvents, reverseKeyify } from '../plausibleHelpers'

import { PlausibleJourneyActionsSumsFields as JourneyActionsSums } from './plausibleFields/__generated__/PlausibleJourneyActionsSumsFields'
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
  journeyActionsSums: JourneyActionsSums[]
}

export interface JourneyStatsBreakdown {
  totalVisitors: number
  chatsStarted: number
  linksVisited: number
  referrers: JourneyReferrer[]
  stepsStats: StepStat[]
}

interface StepStat {
  stepId: string
  visitors: number
  timeOnPage: number
  visitorsExitAtStep: number
  stepEvents: PlausibleEvent[]
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
      stepEvents: journeyEvents.filter((event) => event.stepId === stepId) ?? []
    }
  })

  return {
    totalVisitors: journeyAggregateVisitors.visitors?.value ?? 0,
    chatsStarted,
    linksVisited,
    referrers: journeyReferrer,
    stepsStats
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
