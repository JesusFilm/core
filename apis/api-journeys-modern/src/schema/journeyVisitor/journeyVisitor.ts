import { stringify } from 'csv-stringify'
import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { MessagePlatform } from '../enums'
import { JourneyEventsFilter } from '../event/journey/inputs'

import { JourneyVisitorExportSelect } from './inputs'

// Sanitize CSV cell while preserving leading whitespace and neutralizing formulas
function sanitizeCSVCell(value: string): string {
  if (value == null) return ''
  const str = typeof value === 'string' ? value : String(value)

  // Preserve leading whitespace; inspect first non-whitespace character
  const leadingMatch = str.match(/^\s*/)
  const leadingWhitespace = leadingMatch != null ? leadingMatch[0] : ''
  const rest = str.slice(leadingWhitespace.length)

  if (rest.length === 0) return str
  // If already explicitly text (leading apostrophe), leave unchanged
  if (rest[0] === "'") return str
  const first = rest[0]
  if (first === '=' || first === '+' || first === '-' || first === '@') {
    return `${leadingWhitespace}'${rest}`
  }
  // Heuristic: treat phone-like numeric strings as text to preserve leading zeros
  // Strip common formatting characters and check if remaining are digits (optionally prefixed by '+')
  const compact = rest.replace(/[\s().-]/g, '')
  const isNumericLike = /^\+?\d{7,}$/.test(compact)
  if (isNumericLike) {
    return `${leadingWhitespace}'${rest}`
  }
  return str
}

// Convert a wall-clock datetime in a specific IANA timezone into a UTC Date
// If the input has an explicit offset (e.g., ends with 'Z' or '+05:00'), it is parsed as-is
// Otherwise, it is interpreted as local wall time in the provided timezone and converted to UTC
function parseDateInTimeZoneToUtc(
  input: string | Date,
  timeZone: string
): Date {
  const hasExplicitOffset = (str: string): boolean =>
    /([zZ]|[+-]\d{2}:?\d{2})$/.test(str)

  if (input instanceof Date) return input
  if (typeof input !== 'string' || input.trim() === '') return new Date(NaN)

  const trimmed = input.trim()
  if (hasExplicitOffset(trimmed)) return new Date(trimmed)

  // Build an initial UTC guess by treating the wall time as if it were UTC
  // Then compute the timezone offset at that instant and adjust
  const initial = new Date(trimmed.endsWith('Z') ? trimmed : `${trimmed}Z`)

  const getTimeZoneOffsetMs = (instant: Date, tz: string): number => {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    const parts = dtf.formatToParts(instant)
    const map: Record<string, string> = {}
    for (const p of parts) map[p.type] = p.value
    const isoLocal = `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}.000Z`
    const asUtcMs = Date.parse(isoLocal)
    return asUtcMs - instant.getTime()
  }

  try {
    const offset1 = getTimeZoneOffsetMs(initial, timeZone)
    let utcMs = initial.getTime() - offset1
    // Recompute once to handle DST transitions precisely
    const offset2 = getTimeZoneOffsetMs(new Date(utcMs), timeZone)
    if (offset2 !== offset1) {
      utcMs = initial.getTime() - offset2
    }
    return new Date(utcMs)
  } catch (err) {
    if (err instanceof RangeError) {
      return initial
    }
    throw err
  }
}

// Format a Date as YYYY-MM-DD for a specific IANA timezone
function formatDateYmdInTimeZone(date: Date, timeZone: string): string {
  try {
    return date.toLocaleDateString('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return date.toISOString().slice(0, 10)
  }
}

export const JourneyVisitorRef = builder.prismaObject('JourneyVisitor', {
  shareable: true,
  fields: (t) => ({
    journeyId: t.exposeID('journeyId', { nullable: false }),
    visitorId: t.exposeID('visitorId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    duration: t.exposeInt('duration'),
    lastChatStartedAt: t.expose('lastChatStartedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastChatPlatform: t.expose('lastChatPlatform', {
      type: MessagePlatform,
      nullable: true
    }),
    lastStepViewedAt: t.expose('lastStepViewedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastLinkAction: t.exposeString('lastLinkAction', { nullable: true }),
    lastTextResponse: t.exposeString('lastTextResponse', { nullable: true }),
    lastRadioQuestion: t.exposeString('lastRadioQuestion', { nullable: true }),
    lastRadioOptionSubmission: t.exposeString('lastRadioOptionSubmission', {
      nullable: true
    }),
    lastMultiselectSubmission: t.exposeString('lastMultiselectSubmission', {
      nullable: true
    }),
    countryCode: t.field({
      type: 'String',
      nullable: true,
      select: {
        visitor: {
          select: {
            countryCode: true
          }
        }
      },
      resolve: ({ visitor }) => {
        return visitor.countryCode ?? null
      }
    }),
    messagePlatform: t.field({
      type: MessagePlatform,
      nullable: true,
      select: {
        visitor: {
          select: {
            messagePlatform: true
          }
        }
      },
      resolve: ({ visitor }) => {
        return visitor.messagePlatform ?? null
      }
    }),
    notes: t.field({
      type: 'String',
      nullable: true,
      select: {
        visitor: {
          select: {
            notes: true
          }
        }
      },
      resolve: ({ visitor }) => {
        return visitor.notes ?? null
      }
    }),
    visitor: t.relation('visitor', { nullable: false }),
    events: t.relation('events', { nullable: false })
  })
})
builder.asEntity(JourneyVisitorRef, {
  key: builder.selection<{ visitorId: string; journeyId: string }>(
    'visitorId journeyId'
  ),
  resolveReference: async (journeyVisitor) => {
    return await prisma.journeyVisitor.findUnique({
      include: {
        visitor: true
      },
      where: {
        journeyId_visitorId: {
          visitorId: journeyVisitor.visitorId,
          journeyId: journeyVisitor.journeyId
        }
      }
    })
  }
})
interface JourneyVisitorExportRow {
  date: string
  [key: string]: string
}

async function* getJourneyVisitors(
  journeyId: string,
  eventWhere: Prisma.EventWhereInput,
  timezone: string,
  batchSize: number = 1000
): AsyncGenerator<JourneyVisitorExportRow> {
  let offset = 0
  let hasMore = true
  while (hasMore) {
    const journeyVisitors = await prisma.journeyVisitor.findMany({
      where: {
        journeyId,
        events: {
          some: eventWhere
        }
      },
      take: batchSize,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true,
        events: {
          where: eventWhere,
          select: {
            blockId: true,
            label: true,
            value: true,
            typename: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })
    if (journeyVisitors.length === 0) {
      hasMore = false
      break
    }
    for (const journeyVisitor of journeyVisitors) {
      // Format date in user's timezone to match frontend display
      const date = formatDateYmdInTimeZone(journeyVisitor.createdAt, timezone)
      const row: JourneyVisitorExportRow = {
        date
      }
      // Group events by blockId-label key and collect values deterministically
      const eventValuesByKey = new Map<string, string[]>()
      journeyVisitor.events.forEach((event) => {
        if (event.blockId && event.label) {
          const key = `${event.blockId}-${event.label}`
          const eventValue = event.value ?? ''
          if (!eventValuesByKey.has(key)) {
            eventValuesByKey.set(key, [])
          }
          eventValuesByKey.get(key)!.push(eventValue)
        }
      })
      // Join values with a fixed separator and sanitize for CSV
      eventValuesByKey.forEach((values, key) => {
        const sanitizedValues = values.map((value) => sanitizeCSVCell(value))
        row[key] = sanitizedValues.join('; ')
      })
      yield row
    }
    offset += batchSize
    hasMore = journeyVisitors.length === batchSize
  }
}
builder.queryField('journeyVisitorExport', (t) => {
  return t
    .withAuth({
      isAuthenticated: true
    })
    .field({
      type: 'String',
      description:
        'Returns a CSV formatted string with journey visitor export data including headers and visitor data with event information',
      args: {
        journeyId: t.arg.id({ required: true }),
        filter: t.arg({ type: JourneyEventsFilter, required: false }),
        select: t.arg({ type: JourneyVisitorExportSelect, required: false }),
        timezone: t.arg.string({
          required: false,
          description:
            'IANA timezone identifier (e.g., "Pacific/Auckland"). Defaults to UTC if not provided.'
        })
      },
      resolve: async (_, { journeyId, filter, select, timezone }, context) => {
        // Use user's timezone or default to UTC
        const userTimezone = timezone ?? 'UTC'
        const journey = await prisma.journey.findUnique({
          where: {
            id: journeyId
          },
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true,
            blocks: {
              select: {
                id: true,
                typename: true,
                parentBlockId: true,
                parentOrder: true,
                nextBlockId: true,
                action: true,
                content: true,
                x: true,
                y: true,
                deletedAt: true
              }
            }
          }
        })
        if (!journey) {
          throw new GraphQLError('Journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        if (
          !ability(Action.Export, subject('Journey', journey), context.user)
        ) {
          throw new GraphQLError('User is not allowed to export visitors', {
            extensions: { code: 'FORBIDDEN' }
          })
        }
        // Build a map of blocks and connectivity info for filtering
        // Consider only non-deleted blocks for connectivity and headers
        const journeyBlocks = journey.blocks.filter(
          (b: any) => b.deletedAt == null
        )
        const idToBlock = new Map(journeyBlocks.map((b) => [b.id, b]))

        // Determine connected steps by following nextBlockId chains from start steps
        interface StepBlockConn {
          id: string
          nextBlockId: string | null
        }
        const stepsForConnectivity: StepBlockConn[] = journeyBlocks
          .filter((b) => b.typename === 'StepBlock')
          .map((b: any) => ({ id: b.id, nextBlockId: b.nextBlockId }))

        // Build incoming edges considering both nextBlockId and button navigate actions
        const hasIncomingLinkConn = new Set<string>()
        const outgoingByStep = new Map<string, Set<string>>()

        // nextBlockId edges
        stepsForConnectivity.forEach((s) => {
          if (s.nextBlockId != null) {
            hasIncomingLinkConn.add(s.nextBlockId)
            const from = s.id
            const to = s.nextBlockId
            const set = outgoingByStep.get(from) ?? new Set<string>()
            set.add(to)
            outgoingByStep.set(from, set)
          }
        })

        // Button edges will be added later, constrained to primary card descendants

        // Choose a single entry step like the frontend: first top-level StepBlock by parentOrder
        function chooseEntryStepId(): string | null {
          const topLevelSteps = journeyBlocks
            .filter(
              (b: any) => b.typename === 'StepBlock' && b.parentBlockId == null
            )
            .sort(
              (a: any, b: any) =>
                (a.parentOrder ?? 9999) - (b.parentOrder ?? 9999)
            )
          return topLevelSteps[0]?.id ?? null
        }

        // getStepAncestorId removed (no longer needed)

        // Build children map for DFS traversal
        const childrenByParent = new Map<string, any[]>()
        journeyBlocks.forEach((b: any) => {
          if (b.parentBlockId != null) {
            const arr = childrenByParent.get(b.parentBlockId) ?? []
            arr.push(b)
            childrenByParent.set(b.parentBlockId, arr)
          }
        })

        // Determine the primary CardBlock for each step (first by parentOrder)
        function getPrimaryCardForStep(stepId: string): any | undefined {
          const children = childrenByParent.get(stepId) ?? []
          const cards = children.filter((c) => c.typename === 'CardBlock')
          if (cards.length === 0) return undefined
          return cards.reduce((min: any, cur: any) => {
            const minOrder = min.parentOrder ?? Number.MAX_SAFE_INTEGER
            const curOrder = cur.parentOrder ?? Number.MAX_SAFE_INTEGER
            return curOrder < minOrder ? cur : min
          })
        }

        // Add button navigation edges from ANY descendants under the step
        function collectDescendants(rootId: string, acc: any[] = []): any[] {
          const kids = childrenByParent.get(rootId) ?? []
          for (const child of kids) {
            acc.push(child)
            collectDescendants(child.id, acc)
          }
          return acc
        }

        stepsForConnectivity.forEach((s) => {
          const descendants = collectDescendants(s.id, [])
          descendants.forEach((node) => {
            const targetBlockId: string | undefined = node?.action?.blockId
            if (targetBlockId != null) {
              const targetStep = idToBlock.get(targetBlockId)
              if (targetStep?.typename === 'StepBlock') {
                hasIncomingLinkConn.add(targetStep.id)
                const set = outgoingByStep.get(s.id) ?? new Set<string>()
                set.add(targetStep.id)
                outgoingByStep.set(s.id, set)
              }
            }
          })
        })

        const startStepsConn = stepsForConnectivity.filter(
          (s) => !hasIncomingLinkConn.has(s.id)
        )

        const includeOld = filter?.includeUnconnectedCards === true
        const traversalRoots: string[] = includeOld
          ? startStepsConn.map((s) => s.id)
          : (() => {
              const root = chooseEntryStepId()
              return root != null ? [root] : []
            })()

        const connectedStepIds = new Set<string>()
        traversalRoots.forEach((rootId) => {
          const queue: string[] = [rootId]
          const visited = new Set<string>()
          while (queue.length > 0) {
            const stepId = queue.shift()!
            if (visited.has(stepId)) continue
            visited.add(stepId)
            connectedStepIds.add(stepId)
            const nextFromMap = outgoingByStep.get(stepId)
            if (nextFromMap != null) {
              nextFromMap.forEach((n) => queue.push(n))
            }
          }
        })

        // Collect allowed block ids: descendants of primary card blocks of connected steps
        const allowedBlockIds = new Set<string>()
        function dfsCollect(blockId: string): void {
          allowedBlockIds.add(blockId)
          const kids = childrenByParent.get(blockId) ?? []
          for (const child of kids) {
            dfsCollect(child.id)
          }
        }

        for (const stepId of connectedStepIds) {
          const primaryCard = getPrimaryCardForStep(stepId)
          if (primaryCard != null) {
            dfsCollect(primaryCard.id)
          }
        }

        // Build base event filter and apply connectivity filter by default
        const eventWhere: Prisma.EventWhereInput = {
          journeyId: journeyId,
          label: { not: null }
        }

        if (filter?.includeUnconnectedCards !== true) {
          eventWhere.blockId = { in: Array.from(allowedBlockIds) }
        } else {
          eventWhere.blockId = { not: null }
        }

        if (filter?.typenames && filter.typenames.length > 0) {
          eventWhere.typename = { in: filter.typenames }
        }
        if (filter?.periodRangeStart || filter?.periodRangeEnd) {
          eventWhere.createdAt = {}
          if (filter.periodRangeStart) {
            eventWhere.createdAt.gte = parseDateInTimeZoneToUtc(
              filter.periodRangeStart as any,
              userTimezone
            )
          }
          if (filter.periodRangeEnd) {
            eventWhere.createdAt.lte = parseDateInTimeZoneToUtc(
              filter.periodRangeEnd as any,
              userTimezone
            )
          }
        }

        // Get unique blockId_label combinations for headers using Prisma
        const blockHeadersResult = await prisma.event.findMany({
          where: eventWhere,
          select: {
            blockId: true,
            label: true
          },
          distinct: ['blockId', 'label']
        })
        // (logging moved below after 'steps' is declared)
        // Build a map of blocks for hierarchy lookups (already defined above)

        // Build step navigation order
        interface StepBlock {
          id: string
          nextBlockId: string | null
          parentOrder: number | null
        }
        const steps: StepBlock[] = journeyBlocks
          .filter((b) => b.typename === 'StepBlock')
          .map((b: any) => ({
            id: b.id,
            nextBlockId: b.nextBlockId,
            parentOrder: b.parentOrder
          }))

        // Debug logging to verify filtering/select logic
        {
          const includeOld = filter?.includeUnconnectedCards === true
          const startStepIds = startStepsConn.map((s) => s.id)
          const sampleAllowed = Array.from(allowedBlockIds).slice(0, 10)
          console.log('[journeyVisitorExport]', {
            journeyId,
            includeUnconnectedCards: includeOld,
            totalBlocks: journeyBlocks.length,
            totalSteps: steps.length,
            startSteps: startStepIds.length,
            startStepIds,
            connectedSteps: connectedStepIds.size,
            traversalRoots,
            allowedBlockIdsCount: allowedBlockIds.size,
            sampleAllowedBlockIds: sampleAllowed,
            headerCandidates: blockHeadersResult.length
          })
        }

        // Build navigation order: find steps with no incoming links and follow nextBlockId chains
        const stepMap = new Map(steps.map((s) => [s.id, s]))
        const hasIncomingLink = new Set<string>()

        // Find all steps that are targets of nextBlockId
        steps.forEach((step) => {
          if (step.nextBlockId) {
            hasIncomingLink.add(step.nextBlockId)
          }
        })

        // Find steps with no incoming links (start points)
        const startSteps = steps.filter((s) => !hasIncomingLink.has(s.id))

        const stepNavigationOrder = new Map<string, number>()
        let orderCounter = 0

        // Follow each chain from start to end
        startSteps.forEach((startStep) => {
          const visitedIds = new Set<string>()
          let current: StepBlock | undefined = startStep
          while (current != null) {
            if (visitedIds.has(current.id)) {
              break
            }
            visitedIds.add(current.id)

            if (!stepNavigationOrder.has(current.id)) {
              stepNavigationOrder.set(current.id, orderCounter++)
            }
            current = current.nextBlockId
              ? stepMap.get(current.nextBlockId)
              : undefined
          }
        })

        // Add any remaining steps that aren't in a chain (sort by parentOrder as fallback)
        steps
          .filter((s) => !stepNavigationOrder.has(s.id))
          .sort((a, b) => (a.parentOrder ?? 9999) - (b.parentOrder ?? 9999))
          .forEach((step) => {
            stepNavigationOrder.set(step.id, orderCounter++)
          })

        function getAncestorByType(
          blockId: string | null | undefined,
          type: string
        ):
          | {
              id: string
              typename: string
              parentBlockId: string | null
              parentOrder: number | null
            }
          | undefined {
          let current = blockId != null ? idToBlock.get(blockId) : undefined
          while (current != null && current.typename !== type) {
            current =
              current.parentBlockId != null
                ? idToBlock.get(current.parentBlockId)
                : undefined
          }
          return current as any
        }
        function getTopLevelChildUnderCard(blockId: string | null | undefined):
          | {
              id: string
              typename: string
              parentBlockId: string | null
              parentOrder: number | null
            }
          | undefined {
          let current = blockId != null ? idToBlock.get(blockId) : undefined
          let parent =
            current?.parentBlockId != null
              ? idToBlock.get(current.parentBlockId)
              : undefined
          // Climb until parent is a CardBlock; return the child right under Card
          while (
            current != null &&
            parent != null &&
            parent.typename !== 'CardBlock'
          ) {
            current = parent
            parent =
              current.parentBlockId != null
                ? idToBlock.get(current.parentBlockId)
                : undefined
          }
          return current as any
        }
        function getCardHeading(blockId: string | null | undefined): string {
          const cardBlock = getAncestorByType(blockId, 'CardBlock')
          if (cardBlock == null) return ''
          // Find all TypographyBlock children of this card
          const typographyBlocks = journeyBlocks
            .filter(
              (b: any) =>
                b.typename === 'TypographyBlock' &&
                b.parentBlockId === cardBlock.id
            )
            .sort(
              (a: any, b: any) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0)
            )
          // Get the first (highest order) typography block's content
          if (typographyBlocks.length > 0) {
            const firstTypography = typographyBlocks[0] as any
            if (firstTypography.content != null) {
              // Content is typically a string or JSON with text
              if (typeof firstTypography.content === 'string') {
                return firstTypography.content
              }
              if (
                typeof firstTypography.content === 'object' &&
                firstTypography.content.text
              ) {
                return firstTypography.content.text
              }
            }
          }
          return ''
        }
        function compareHeaders(
          a: { blockId: string | null },
          b: { blockId: string | null }
        ): number {
          // Derive sort keys
          const aCard = getAncestorByType(a.blockId, 'CardBlock')
          const bCard = getAncestorByType(b.blockId, 'CardBlock')

          const aStep =
            aCard?.parentBlockId != null
              ? getAncestorByType(aCard.parentBlockId, 'StepBlock')
              : undefined
          const bStep =
            bCard?.parentBlockId != null
              ? getAncestorByType(bCard.parentBlockId, 'StepBlock')
              : undefined

          const aChildUnderCard = getTopLevelChildUnderCard(a.blockId)
          const bChildUnderCard = getTopLevelChildUnderCard(b.blockId)

          // Step ordering by navigation flow order
          const aStepOrder =
            aStep != null
              ? (stepNavigationOrder.get(aStep.id) ?? Number.MAX_SAFE_INTEGER)
              : Number.MAX_SAFE_INTEGER
          const bStepOrder =
            bStep != null
              ? (stepNavigationOrder.get(bStep.id) ?? Number.MAX_SAFE_INTEGER)
              : Number.MAX_SAFE_INTEGER
          if (aStepOrder !== bStepOrder) {
            return aStepOrder - bStepOrder
          }

          // Card ordering within step (by parentOrder)
          const aCardOrder = aCard?.parentOrder ?? Number.MAX_SAFE_INTEGER
          const bCardOrder = bCard?.parentOrder ?? Number.MAX_SAFE_INTEGER
          if (aCardOrder !== bCardOrder) {
            return aCardOrder - bCardOrder
          }

          // Block ordering within card (by nearest child under card parentOrder)
          const aBlockOrder =
            aChildUnderCard?.parentOrder ?? Number.MAX_SAFE_INTEGER
          const bBlockOrder =
            bChildUnderCard?.parentOrder ?? Number.MAX_SAFE_INTEGER
          if (aBlockOrder !== bBlockOrder) {
            return aBlockOrder - bBlockOrder
          }

          // Finally, stable by blockId
          return (a.blockId ?? '').localeCompare(b.blockId ?? '')
        }
        // Build headers: date + dynamic block columns grouped by Card and ordered by position
        const blockHeaders = blockHeadersResult
          .sort(compareHeaders)
          .map((item) => ({
            key: `${item.blockId!}-${item.label!}`,
            label: item.label!,
            blockId: item.blockId!,
            typename:
              journeyBlocks.find((b: any) => b.id === item.blockId)?.typename ??
              ''
          }))
        const columns = [
          { key: 'date', label: 'Date', blockId: null, typename: '' },
          ...(filter?.typenames == null || Array.isArray(filter.typenames)
            ? blockHeaders
            : [])
        ].filter((value) => value != null)

        // Build header rows
        // Row 1: Card Heading
        // Row 2: Label/Type (Poll, Name, Response, etc)
        // First, count polls and multiselects per card for numbering
        const cardPollCounts = new Map<
          string,
          { pollCount: number; multiselectCount: number }
        >()

        blockHeaders.forEach((header) => {
          const cardBlock = getAncestorByType(header.blockId, 'CardBlock')
          if (cardBlock) {
            const cardId = cardBlock.id
            if (!cardPollCounts.has(cardId)) {
              cardPollCounts.set(cardId, { pollCount: 0, multiselectCount: 0 })
            }
            const counts = cardPollCounts.get(cardId)!
            if (header.typename === 'RadioQuestionBlock') {
              counts.pollCount++
            } else if (header.typename === 'MultiselectBlock') {
              counts.multiselectCount++
            }
          }
        })

        // Track current counts for each card as we build the label row
        const currentCardCounts = new Map<
          string,
          { pollCount: number; multiselectCount: number }
        >()

        const labelRow = columns.map((col) => {
          if (col.key === 'date')
            return timezone != null && timezone !== ''
              ? `Date (${userTimezone})`
              : 'Date'

          const cardBlock = getAncestorByType(col.blockId, 'CardBlock')
          if (
            cardBlock &&
            (col.typename === 'RadioQuestionBlock' ||
              col.typename === 'MultiselectBlock')
          ) {
            const cardId = cardBlock.id
            if (!currentCardCounts.has(cardId)) {
              currentCardCounts.set(cardId, {
                pollCount: 0,
                multiselectCount: 0
              })
            }

            const counts = currentCardCounts.get(cardId)!
            const totalCounts = cardPollCounts.get(cardId)!

            if (col.typename === 'RadioQuestionBlock') {
              counts.pollCount++
              // Only add number if there are multiple polls on this card
              return totalCounts.pollCount > 1
                ? `Poll ${counts.pollCount}`
                : 'Poll'
            } else if (col.typename === 'MultiselectBlock') {
              counts.multiselectCount++
              // Only add number if there are multiple multiselects on this card
              return totalCounts.multiselectCount > 1
                ? `Multiselect ${counts.multiselectCount}`
                : 'Multiselect'
            }
          }

          // Use the label from the event (e.g., "What is your name?")
          return col.label
        })

        const cardHeadingRow = columns.map((col) => {
          if (col.key === 'date')
            return timezone != null && timezone !== ''
              ? `Date (${userTimezone})`
              : 'Date'
          // Get the highest order heading of the card
          return getCardHeading(col.blockId)
        })
        // Stream rows directly to CSV without collecting in memory
        const stringifier = stringify({
          header: false,
          quoted: true,
          quote: '"',
          escape: '"',
          quoted_empty: true,
          columns: columns.map((col) => ({ key: col.key })),
          cast: {
            string: (value: any) => String(value ?? '')
          }
        })
        const onEndPromise = new Promise((resolve) => {
          stringifier.on('end', resolve)
        })
        let csvContent: string = ''
        stringifier.on('data', (chunk) => {
          csvContent += chunk
        })

        // Manually write the two header rows (sanitized)
        const sanitizedCardHeadingRow = cardHeadingRow.map((cell) =>
          sanitizeCSVCell(cell)
        )
        const sanitizedLabelRow = labelRow.map((cell) => sanitizeCSVCell(cell))
        stringifier.write(sanitizedCardHeadingRow)
        stringifier.write(sanitizedLabelRow)

        for await (const row of getJourneyVisitors(
          journeyId,
          eventWhere,
          userTimezone
        )) {
          stringifier.write(row)
        }
        stringifier.end()
        await onEndPromise
        return csvContent
      }
    })
})
