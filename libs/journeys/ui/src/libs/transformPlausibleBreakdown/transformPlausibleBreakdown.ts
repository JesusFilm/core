import replace from 'lodash/replace'

import { JourneyPlausibleEvents, reverseKeyify } from '../plausibleHelpers'

import { PlausibleJourneyAggregateVisitorsFields as JourneyAggregateVisitors } from './__generated__/PlausibleJourneyAggregateVisitorsFields'
import { PlausibleJourneyReferrerFields as JourneyReferrer } from './__generated__/PlausibleJourneyReferrerFields'
import { PlausibleJourneyStepsActionsFields as JourneyStepsActions } from './__generated__/PlausibleJourneyStepsActionsFields'
import { PlausibleJourneyStepsFields as JourneySteps } from './__generated__/PlausibleJourneyStepsFields'

interface StatsBreakdown {
  journeySteps: JourneySteps[]
  journeyStepsActions: JourneyStepsActions[]
  journeyReferrer: JourneyReferrer[]
  journeyAggregateVisitors: JourneyAggregateVisitors
}

export interface JourneyStatsBreakdown {
  totalVisitors: number
  chatsStarted: number
  linksVisited: number
  referrers: JourneyReferrer[]
  stepsStats: StepStats[]
}

interface StepStats {
  stepId: string
  visitors: number
  bounceRate: number
  timeOnPage: number
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
    journeyReferrer,
    journeyAggregateVisitors
  } = data

  const journeyEvents: PlausibleEvent[] = journeyStepsActions.map((action) => {
    const { stepId, event, blockId, target } = reverseKeyify(action.property)
    return {
      stepId,
      event,
      blockId,
      target,
      events: action.events ?? 0
    }
  })

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

  const stepsStats: StepStats[] = journeySteps.map((step) => {
    const stepId = replace(step.property, `${journeyId}/`, '')
    return {
      stepId,
      visitors: step.visitors ?? 0,
      bounceRate: step.bounceRate ?? 0, // bounce rate currently not being collected properly
      timeOnPage: 0, // need to fix query to get this data
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
