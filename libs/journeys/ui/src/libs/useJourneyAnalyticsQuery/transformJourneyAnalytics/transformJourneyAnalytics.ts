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
  // VideoTrigger and VideoComplete can double up with each other
  // only choose one of them
  'videoTrigger',
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
    journeyUtmCampaign,
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

  // Merge the trailing-slash and non-trailing-slash Plausible pages that map to
  // the same step block id. A given visitor only ever lands on one of the two
  // variants for a session, so visitors sum without double counting; timeOnPage
  // is a per-visitor average and is combined as a visitor-weighted mean.
  const stepStatsById = new Map<string, StepStat>()
  journeySteps.forEach((step) => {
    const stepId = getStepId(step.property, journeyId)
    const visitors = step.visitors ?? 0
    const timeOnPage = step.timeOnPage ?? 0

    const existing = stepStatsById.get(stepId)
    if (existing == null) {
      stepStatsById.set(stepId, {
        stepId,
        visitors,
        timeOnPage,
        visitorsExitAtStep:
          stepExits.find((exit) => exit.id === stepId)?.visitors ?? 0
      })
      return
    }

    const totalVisitors = existing.visitors + visitors
    existing.timeOnPage =
      totalVisitors === 0
        ? 0
        : (existing.timeOnPage * existing.visitors + timeOnPage * visitors) /
          totalVisitors
    existing.visitors = totalVisitors
  })
  const stepsStats: StepStat[] = Array.from(stepStatsById.values())

  const qrCodeVisitors = journeyUtmCampaign.reduce(
    (sum, campaign) => sum + (campaign.visitors ?? 0),
    0
  )

  const allReferrers =
    qrCodeVisitors > 0
      ? [
          ...journeyReferrer,
          {
            __typename: 'PlausibleStatsResponse' as const,
            property: 'QR Code',
            visitors: qrCodeVisitors
          }
        ]
      : journeyReferrer

  const referrers = transformReferrers(allReferrers)

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
  // Strip the `/${journeyId}/` prefix to recover the step block id, then drop
  // any trailing slash. Visitors who arrive with a query string are recorded by
  // Plausible under `/${journeyId}/${stepId}/` (trailing slash) while others are
  // recorded under `/${journeyId}/${stepId}`; normalizing here collapses both
  // pages back onto the same step block id so their stats can be merged.
  return replace(property, `/${journeyId}/`, '').replace(/\/$/, '')
}

function getJourneyEvents(
  journeyStepsActions: JourneyStepsAction[] | JourneyActionsSums[]
): PlausibleEvent[] {
  const journeyEvents: PlausibleEvent[] = []
  journeyStepsActions.forEach((action) => {
    if (action.property === '(none)') return
    const eventData = reverseKeyify(action.property)
    if (eventData.event === 'videoComplete') return

    journeyEvents.push({
      ...eventData,
      events: action.visitors ?? 0
    })
  })

  return journeyEvents
}

function getStepExits(
  journeyVisitorsPageExits: JourneyVisitorsPageExit[],
  journeyId: string
): Array<{ id: string; visitors: number }> {
  // Sum exits across the trailing-slash and non-trailing-slash pages that
  // resolve to the same step block id (see getStepId).
  const exitsById = new Map<string, number>()
  journeyVisitorsPageExits.forEach((page) => {
    const id = getStepId(page.property, journeyId)
    exitsById.set(id, (exitsById.get(id) ?? 0) + (page.visitors ?? 0))
  })

  return Array.from(exitsById, ([id, visitors]) => ({ id, visitors }))
}

function getLinkClicks(journeyEvents: PlausibleEvent[]): {
  chatsStarted: number
  linksVisited: number
} {
  let chatsStarted = 0
  let linksVisited = 0

  journeyEvents.forEach((plausibleEvent) => {
    const { event, target, events } = plausibleEvent
    if (
      target != null &&
      (target.includes('link:') || target.includes('chat:'))
    ) {
      const isChatLink = messagePlatforms.find(({ url }) =>
        target.includes(url)
      )
      if (
        isChatLink != null ||
        event === 'footerChatButtonClick' ||
        target.includes('chat:')
      ) {
        chatsStarted += events
      } else {
        linksVisited += events
      }
    }

    // Include PhoneAction button clicks that are tracked as chatButtonClick events
    if (
      event === 'chatButtonClick' &&
      target != null &&
      target.includes('phone:')
    ) {
      chatsStarted += events
    }

    // Include videoTrigger events that trigger phone actions
    if (
      event === 'videoTrigger' &&
      target != null &&
      target.includes('phone:')
    ) {
      chatsStarted += events
    }
  })

  return {
    chatsStarted,
    linksVisited
  }
}
