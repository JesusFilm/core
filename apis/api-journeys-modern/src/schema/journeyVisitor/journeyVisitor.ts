import { stringify } from 'csv-stringify'
import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { MessagePlatform } from '../enums'
import { JourneyEventsFilter } from '../event/journey/inputs'

import { JourneyVisitorExportSelect } from './inputs'

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
      const date = journeyVisitor.createdAt.toISOString().split('T')[0]
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
      // Join values with a fixed separator
      eventValuesByKey.forEach((values, key) => {
        row[key] = values.join('; ')
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
        select: t.arg({ type: JourneyVisitorExportSelect, required: false })
      },
      resolve: async (_, { journeyId, filter, select }, context) => {
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
                content: true
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
        const eventWhere: Prisma.EventWhereInput = {
          journeyId: journeyId,
          blockId: { not: null },
          label: { not: null }
        }
        if (filter?.typenames && filter.typenames.length > 0) {
          eventWhere.typename = { in: filter.typenames }
        }
        if (filter?.periodRangeStart || filter?.periodRangeEnd) {
          eventWhere.createdAt = {}
          if (filter.periodRangeStart) {
            eventWhere.createdAt.gte = filter.periodRangeStart
          }
          if (filter.periodRangeEnd) {
            eventWhere.createdAt.lte = filter.periodRangeEnd
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
        // Build a map of blocks for hierarchy lookups
        const journeyBlocks = journey.blocks
        const idToBlock = new Map(journeyBlocks.map((b) => [b.id, b]))

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
          ...(filter?.typenames == null || filter.typenames.length > 0
            ? blockHeaders
            : [])
        ].filter((value) => value != null)

        // Build header rows
        // Row 1: Label/Type (Poll, Name, Response, etc)
        const labelRow = columns.map((col) => {
          if (col.key === 'date') return 'Date'
          // For Poll and Multiselect blocks, use the block type name
          if (col.typename === 'RadioQuestionBlock') return 'Poll'
          if (col.typename === 'RadioMultiselectBlock') return 'Multiselect'
          // Use the label from the event (e.g., "What is your name?")
          return col.label
        })

        // Row 2: Card Heading
        const cardHeadingRow = columns.map((col) => {
          if (col.key === 'date') return ''
          // Get the highest order heading of the card
          return getCardHeading(col.blockId)
        })
        // Stream rows directly to CSV without collecting in memory
        const stringifier = stringify({
          header: false,
          columns: columns.map((col) => ({ key: col.key }))
        })
        const onEndPromise = new Promise((resolve) => {
          stringifier.on('end', resolve)
        })
        let csvContent: string = ''
        stringifier.on('data', (chunk) => {
          csvContent += chunk
        })

        // Manually write the two header rows
        stringifier.write(labelRow)
        stringifier.write(cardHeadingRow)

        for await (const row of getJourneyVisitors(journeyId, eventWhere)) {
          stringifier.write(row)
        }
        stringifier.end()
        await onEndPromise
        return csvContent
      }
    })
})
