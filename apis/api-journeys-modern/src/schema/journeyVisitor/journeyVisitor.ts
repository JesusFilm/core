import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { MessagePlatform } from '../enums'
import { JourneyEventsFilter } from '../event/journey/inputs'

import { createCsvStringifier } from './export/csv'
import {
  getAncestorByType as getAncestorByTypeHelper,
  getCardHeading as getCardHeadingHelper
} from './export/headings'
import {
  type SimpleBlock,
  buildRenderTree,
  computeOrderIndex
} from './export/order'
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

const journeyBlockSelect = {
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
} as const

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
              select: journeyBlockSelect
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
        // Build a map of blocks (non-deleted only) and compute renderer-aligned order
        const journeyBlocks = journey.blocks.filter((b) => b.deletedAt == null)
        const idToBlock = new Map(journeyBlocks.map((b) => [b.id, b]))

        const simpleBlocks: SimpleBlock[] = journeyBlocks.map((b) => ({
          id: b.id,
          typename: b.typename,
          parentBlockId: b.parentBlockId ?? null,
          parentOrder: b.parentOrder ?? null
        }))
        const treeRoots = buildRenderTree(simpleBlocks)
        const orderIndex = computeOrderIndex(treeRoots)

        // Connectivity filter (default): include only blocks under steps reachable
        // from the entry step via nextBlockId or button navigate actions.
        // Build children map for traversal over non-deleted blocks
        const childrenByParent = new Map<string, typeof journeyBlocks>()
        journeyBlocks.forEach((b) => {
          if (b.parentBlockId != null) {
            const arr = childrenByParent.get(b.parentBlockId) ?? []
            arr.push(b)
            childrenByParent.set(b.parentBlockId, arr)
          }
        })
        // Steps list
        const stepIds = new Set(
          journeyBlocks
            .filter((b) => b.typename === 'StepBlock')
            .map((b) => b.id)
        )
        // Outgoing edges between steps
        const outgoingByStep = new Map<string, Set<string>>()
        const addEdge = (from: string, to: string): void => {
          if (!stepIds.has(to)) return
          const set = outgoingByStep.get(from) ?? new Set<string>()
          set.add(to)
          outgoingByStep.set(from, set)
        }
        // nextBlockId edges
        journeyBlocks.forEach((b) => {
          if (b.typename === 'StepBlock' && b.nextBlockId != null) {
            addEdge(b.id, b.nextBlockId)
          }
        })
        // Helper: collect descendants under a parent id
        function collectDescendants(
          rootId: string,
          acc: typeof journeyBlocks = []
        ): typeof journeyBlocks {
          const kids = childrenByParent.get(rootId) ?? []
          for (const child of kids) {
            acc.push(child)
            collectDescendants(child.id, acc)
          }
          return acc
        }
        // Extract navigate target from action if present
        function getNavigateTargetId(block: any): string | undefined {
          const action = (block as { action?: { blockId?: unknown } }).action
          const blockId = action?.blockId
          return typeof blockId === 'string' ? blockId : undefined
        }
        // Button navigate edges: from each step to any step targeted by descendants' actions
        journeyBlocks
          .filter((b) => b.typename === 'StepBlock')
          .forEach((s) => {
            const descendants = collectDescendants(s.id, [])
            descendants.forEach((node) => {
              const targetId = getNavigateTargetId(node)
              if (targetId != null) addEdge(s.id, targetId)
            })
          })
        // Entry step: first top-level StepBlock by parentOrder (renderer default)
        function chooseEntryStepId(): string | null {
          const topLevelSteps = journeyBlocks
            .filter(
              (b) => b.typename === 'StepBlock' && b.parentBlockId == null
            )
            .sort((a, b) => (a.parentOrder ?? 9999) - (b.parentOrder ?? 9999))
          return topLevelSteps[0]?.id ?? null
        }
        const entryStepId = chooseEntryStepId()
        const connectedStepIds = new Set<string>()
        if (entryStepId != null) {
          const queue: string[] = [entryStepId]
          const visited = new Set<string>()
          while (queue.length > 0) {
            const cur = queue.shift()!
            if (visited.has(cur)) continue
            visited.add(cur)
            connectedStepIds.add(cur)
            const nextSet = outgoingByStep.get(cur)
            if (nextSet != null) nextSet.forEach((n) => queue.push(n))
          }
        }
        // Allowed blocks: all descendants (and the step itself) for each connected step
        const connectedAllowedBlockIds = new Set<string>()
        function dfsCollect(blockId: string): void {
          connectedAllowedBlockIds.add(blockId)
          const kids = childrenByParent.get(blockId) ?? []
          for (const child of kids) dfsCollect(child.id)
        }
        connectedStepIds.forEach((sid) => {
          dfsCollect(sid)
        })

        const includeOld = filter?.includeUnconnectedCards === true
        const allowedBlockIds =
          includeOld === true
            ? new Set(simpleBlocks.map((b) => b.id))
            : connectedAllowedBlockIds

        // Build base event filter and apply connectivity filter by default
        const eventWhere: Prisma.EventWhereInput = {
          journeyId: journeyId,
          label: { not: null }
        }

        // Default: restrict to connected, non-deleted blocks; Option: include all
        eventWhere.blockId =
          includeOld === true
            ? { not: null }
            : { in: Array.from(allowedBlockIds) }

        if (filter?.typenames && filter.typenames.length > 0) {
          eventWhere.typename = { in: filter.typenames }
        }
        if (filter?.periodRangeStart || filter?.periodRangeEnd) {
          eventWhere.createdAt = {}
          if (filter.periodRangeStart) {
            eventWhere.createdAt.gte = parseDateInTimeZoneToUtc(
              filter.periodRangeStart,
              userTimezone
            )
          }
          if (filter.periodRangeEnd) {
            eventWhere.createdAt.lte = parseDateInTimeZoneToUtc(
              filter.periodRangeEnd,
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
        // Build a map of blocks for hierarchy lookups (already defined above)
        // Debug logging removed in favor of deterministic renderer-aligned ordering

        const getAncestorByType = (
          blockId: string | null | undefined,
          type: string
        ) => getAncestorByTypeHelper(idToBlock as any, blockId, type)
        const getCardHeading = (blockId: string | null | undefined) =>
          getCardHeadingHelper(idToBlock as any, journeyBlocks as any, blockId)

        function compareHeaders(
          a: { blockId: string | null },
          b: { blockId: string | null }
        ): number {
          const aOrder =
            a.blockId != null
              ? (orderIndex.get(a.blockId) ?? Number.MAX_SAFE_INTEGER)
              : Number.MAX_SAFE_INTEGER
          const bOrder =
            b.blockId != null
              ? (orderIndex.get(b.blockId) ?? Number.MAX_SAFE_INTEGER)
              : Number.MAX_SAFE_INTEGER
          if (aOrder !== bOrder) return aOrder - bOrder
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
              journeyBlocks.find((b) => b.id === item.blockId)?.typename ?? ''
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
        const { stringifier, onEndPromise, getContent } = createCsvStringifier(
          columns.map((col) => ({ key: col.key }))
        )

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
        return getContent()
      }
    })
})
