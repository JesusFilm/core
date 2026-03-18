import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { MessagePlatform } from '../enums'
import { JourneyEventsFilter } from '../event/journey/inputs'

import { computeConnectedBlockIds } from './export/connectivity'
import { createCsvStringifier, sanitizeCSVCell } from './export/csv'
import {
  formatDateYmdInTimeZone,
  parseDateInTimeZoneToUtc
} from './export/date'
import {
  type BaseColumnLabelResolver,
  type JourneyExportColumn,
  buildHeaderRows,
  buildJourneyExportColumns,
  getCardHeading as getCardHeadingHelper
} from './export/headings'
import {
  type SimpleBlock,
  buildRenderTree,
  computeOrderIndex
} from './export/order'
import { JourneyVisitorExportSelect } from './inputs'

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
  deletedAt: true,
  exportOrder: true
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
        if (event.blockId) {
          // Normalize label to match header key format
          const normalizedLabel = (event.label ?? '')
            .replace(/\s+/g, ' ')
            .trim()
          const key = `${event.blockId}-${normalizedLabel}`
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

        const includeOld = filter?.includeUnconnectedCards === true
        const connectedAllowedBlockIds = computeConnectedBlockIds({
          journeyBlocks
        })
        const allowedBlockIds =
          includeOld === true
            ? new Set(simpleBlocks.map((b) => b.id))
            : connectedAllowedBlockIds

        // Build base event filter and apply connectivity filter by default
        const eventWhere: Prisma.EventWhereInput = {
          journeyId: journeyId,
          blockId:
            includeOld === true
              ? { not: null }
              : { in: Array.from(allowedBlockIds) }
        }

        // Filter by typenames - if provided use those, otherwise default to submission events only
        if (filter?.typenames && filter.typenames.length > 0) {
          eventWhere.typename = { in: filter.typenames }
        } else {
          // Default: only include submission events (exclude view/navigation events)
          eventWhere.typename = {
            in: [
              'RadioQuestionSubmissionEvent',
              'MultiselectSubmissionEvent',
              'TextResponseSubmissionEvent',
              'SignUpSubmissionEvent'
            ]
          }
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
          distinct: ['blockId', 'label'],
          // Order by createdAt to ensure consistent "first" label per blockId
          orderBy: { createdAt: 'asc' }
        })

        // Normalize labels and deduplicate by blockId (keep only first label per blockId)
        // This prevents creating multiple columns for the same block when events have different labels
        const headerMap = new Map<string, { blockId: string; label: string }>()
        blockHeadersResult
          .filter((header) => header.blockId != null)
          .forEach((header) => {
            const normalizedLabel = (header.label ?? '')
              .replace(/\s+/g, ' ')
              .trim()
            // Key by blockId only to ensure one column per block
            const key = header.blockId!
            // Only add if not already present (keeps first label encountered for each blockId)
            if (!headerMap.has(key)) {
              headerMap.set(key, {
                blockId: header.blockId!,
                label: normalizedLabel
              })
            }
          })
        const normalizedBlockHeaders = Array.from(headerMap.values())

        const getCardHeading = (blockId: string | null | undefined) =>
          getCardHeadingHelper(idToBlock as any, journeyBlocks as any, blockId)

        const baseColumns: JourneyExportColumn[] = [
          { key: 'date', label: 'Date', blockId: null, typename: '' }
        ]
        const columns = buildJourneyExportColumns({
          baseColumns,
          blockHeaders: normalizedBlockHeaders,
          journeyBlocks,
          orderIndex
        })

        const resolveBaseColumnLabel: BaseColumnLabelResolver = ({
          column,
          userTimezone
        }) => {
          if (column.key === 'date') {
            return userTimezone !== 'UTC' && userTimezone !== ''
              ? `Date (${userTimezone})`
              : 'Date'
          }
          return column.label
        }

        const { headerRow } = buildHeaderRows({
          columns,
          userTimezone,
          getCardHeading,
          baseColumnLabelResolver: resolveBaseColumnLabel
        })
        // Stream rows directly to CSV without collecting in memory
        // Use column index as key for the stringifier
        const columnKeys = columns.map((_, index) => `col_${index}`)
        const { stringifier, onEndPromise, getContent } = createCsvStringifier(
          columnKeys.map((key) => ({ key }))
        )

        // Write the header row (sanitized)
        const sanitizedHeaderRow = headerRow.map((cell) =>
          sanitizeCSVCell(cell)
        )
        const headerRowObj: Record<string, string> = {}
        columnKeys.forEach((key, index) => {
          headerRowObj[key] = sanitizedHeaderRow[index] ?? ''
        })
        stringifier.write(headerRowObj)

        for await (const row of getJourneyVisitors(
          journeyId,
          eventWhere,
          userTimezone
        )) {
          // Align row data to columns using column key
          // Column order is determined by exportOrder, matching uses key
          const alignedRowObj: Record<string, string> = {}
          columns.forEach((col, index) => {
            const colKey = `col_${index}`
            // Match row data by column key (includes blockId-label)
            alignedRowObj[colKey] = row[col.key] ?? ''
          })
          stringifier.write(alignedRowObj)
        }
        stringifier.end()
        await onEndPromise
        return getContent()
      }
    })
})
