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

      journeyVisitor.events.forEach((event) => {
        if (event.blockId && event.label) {
          const key = `${event.blockId}-${event.label}`
          if (row[key]) {
            row[key] += `; ${event.value!}`
          } else {
            row[key] = event.value!
          }
        }
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
                action: true
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
        const idToBlock = new Map(
          journeyBlocks.map((b) => [b.id, b])
        )

        // Build step columns based on navigation flow (similar to arrangeSteps)
        interface StepBlock {
          id: string
          nextBlockId: string | null
        }
        const steps: StepBlock[] = journeyBlocks
          .filter((b) => b.typename === 'StepBlock')
          .map((b: any) => ({
            id: b.id,
            nextBlockId: b.nextBlockId
          }))

        function buildStepColumns(): string[][] {
          const columns: string[][] = []
          const unvisitedStepIds = new Set(steps.map((s) => s.id))

          function visitStepId(id: string | null | undefined): StepBlock | undefined {
            if (id == null || !unvisitedStepIds.has(id)) return undefined
            unvisitedStepIds.delete(id)
            return steps.find((s) => s.id === id)
          }

          function isDescendantBlock(blockId: string, stepId: string): boolean {
            let current = idToBlock.get(blockId)
            while (current != null) {
              if (current.id === stepId) return true
              current = current.parentBlockId != null ? idToBlock.get(current.parentBlockId) : undefined
            }
            return false
          }

          function getDescendants(step: StepBlock): StepBlock[] {
            const descendants: StepBlock[] = []

            // Get next step via nextBlockId
            const nextStep = visitStepId(step.nextBlockId)
            if (nextStep != null) descendants.push(nextStep)

            // Get steps via NavigateToBlockAction from blocks within this step
            const actionBlocks = journeyBlocks.filter(
              (b: any) => 
                b.action?.__typename === 'NavigateToBlockAction' &&
                isDescendantBlock(b.id, step.id)
            )
            actionBlocks.forEach((block: any) => {
              const targetStep = visitStepId(block.action?.blockId)
              if (targetStep != null) descendants.push(targetStep)
            })

            return descendants
          }

          function processSteps(stepsToProcess: StepBlock[]): void {
            if (stepsToProcess.length === 0) return
            columns.push(stepsToProcess.map((s) => s.id))
            const descendants = stepsToProcess.flatMap(getDescendants)
            if (descendants.length > 0) processSteps(descendants)
          }

          // Process all unvisited steps
          while (unvisitedStepIds.size > 0) {
            const firstId = Array.from(unvisitedStepIds)[0]
            const step = visitStepId(firstId)
            if (step != null) processSteps([step])
          }

          return columns
        }

        const stepColumns = buildStepColumns()
        const stepToColumnIndex = new Map<string, number>()
        stepColumns.forEach((column, colIndex) => {
          column.forEach((stepId) => stepToColumnIndex.set(stepId, colIndex))
        })

        function getAncestorByType(blockId: string | null | undefined, type: string): { id: string; typename: string; parentBlockId: string | null; parentOrder: number | null } | undefined {
          let current = blockId != null ? idToBlock.get(blockId) : undefined
          while (current != null && current.typename !== type) {
            current = current.parentBlockId != null ? idToBlock.get(current.parentBlockId) : undefined
          }
          return current as any
        }

        function getTopLevelChildUnderCard(blockId: string | null | undefined): { id: string; typename: string; parentBlockId: string | null; parentOrder: number | null } | undefined {
          let current = blockId != null ? idToBlock.get(blockId) : undefined
          let parent = current?.parentBlockId != null ? idToBlock.get(current.parentBlockId) : undefined
          // Climb until parent is a CardBlock; return the child right under Card
          while (current != null && parent != null && parent.typename !== 'CardBlock') {
            current = parent
            parent = current.parentBlockId != null ? idToBlock.get(current.parentBlockId) : undefined
          }
          return current as any
        }

        function compareHeaders(a: { blockId: string | null }, b: { blockId: string | null }): number {
          // Derive sort keys
          const aCard = getAncestorByType(a.blockId, 'CardBlock')
          const bCard = getAncestorByType(b.blockId, 'CardBlock')
          const aStep = aCard?.parentBlockId != null ? getAncestorByType(aCard.parentBlockId, 'StepBlock') : undefined
          const bStep = bCard?.parentBlockId != null ? getAncestorByType(bCard.parentBlockId, 'StepBlock') : undefined
          const aChildUnderCard = getTopLevelChildUnderCard(a.blockId)
          const bChildUnderCard = getTopLevelChildUnderCard(b.blockId)

          // Step ordering by column index (flow-based)
          const aColumnIndex = aStep != null ? (stepToColumnIndex.get(aStep.id) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER
          const bColumnIndex = bStep != null ? (stepToColumnIndex.get(bStep.id) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER
          if (aColumnIndex !== bColumnIndex) return aColumnIndex - bColumnIndex

          // Within same column, sort by position in column
          if (aStep != null && bStep != null && aColumnIndex === bColumnIndex && aColumnIndex !== Number.MAX_SAFE_INTEGER) {
            const column = stepColumns[aColumnIndex]
            const aRowIndex = column.indexOf(aStep.id)
            const bRowIndex = column.indexOf(bStep.id)
            if (aRowIndex !== bRowIndex) return aRowIndex - bRowIndex
          }

          // Card ordering within step (by parentOrder)
          const aCardOrder = aCard?.parentOrder ?? Number.MAX_SAFE_INTEGER
          const bCardOrder = bCard?.parentOrder ?? Number.MAX_SAFE_INTEGER
          if (aCardOrder !== bCardOrder) return aCardOrder - bCardOrder

          // Block ordering within card (by nearest child under card parentOrder)
          const aBlockOrder = aChildUnderCard?.parentOrder ?? Number.MAX_SAFE_INTEGER
          const bBlockOrder = bChildUnderCard?.parentOrder ?? Number.MAX_SAFE_INTEGER
          if (aBlockOrder !== bBlockOrder) return aBlockOrder - bBlockOrder

          // Finally, stable by blockId
          return (a.blockId ?? '').localeCompare(b.blockId ?? '')
        }

        // Build headers: date + dynamic block columns grouped by Card and ordered by position
        const blockHeaders = blockHeadersResult
          .sort(compareHeaders)
          .map((item) => ({
            key: `${item.blockId!}-${item.label!}`,
            header: item.label!
          }))

        const columns = [
          { key: 'date', header: 'Date' },
          ...(filter?.typenames == null || filter.typenames.length > 0
            ? blockHeaders
            : [])
        ].filter((value) => value != null)

        // Stream rows directly to CSV without collecting in memory
        const stringifier = stringify({
          header: true,
          columns
        })

        const onEndPromise = new Promise((resolve) => {
          stringifier.on('end', resolve)
        })

        let csvContent: string = ''
        stringifier.on('data', (chunk) => {
          csvContent += chunk
        })

        for await (const row of getJourneyVisitors(journeyId, eventWhere)) {
          stringifier.write(row)
        }
        stringifier.end()

        await onEndPromise

        return csvContent
      }
    })
})
