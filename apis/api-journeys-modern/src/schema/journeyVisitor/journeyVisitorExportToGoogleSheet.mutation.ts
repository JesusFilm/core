import { format } from 'date-fns'
import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import {
  getIntegrationGoogleAccessToken,
  getTeamGoogleAccessToken
} from '../../lib/google/googleAuth'
import {
  createSpreadsheet,
  ensureSheet,
  writeValues
} from '../../lib/google/sheets'
import { builder } from '../builder'
import { JourneyEventsFilter } from '../event/journey/inputs'

import { JourneyVisitorExportSelect } from './inputs'

interface JourneyVisitorExportRow {
  id: string
  createdAt: string
  name: string
  email: string
  phone: string
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
        visitor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        events: {
          where: eventWhere,
          select: {
            blockId: true,
            label: true,
            value: true
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
      const row: JourneyVisitorExportRow = {
        id: journeyVisitor.visitor.id,
        createdAt: journeyVisitor.createdAt.toISOString(),
        name: journeyVisitor.visitor.name || '',
        email: journeyVisitor.visitor.email || '',
        phone: journeyVisitor.visitor.phone || ''
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

const ExportDestinationInput = builder.inputType(
  'JourneyVisitorGoogleSheetDestinationInput',
  {
    fields: (t) => ({
      mode: t.field({
        type: builder.enumType('GoogleSheetExportMode', {
          values: ['create', 'existing'] as const
        }),
        required: true
      }),
      spreadsheetTitle: t.string(),
      folderId: t.string(),
      spreadsheetId: t.string(),
      sheetName: t.string()
    })
  }
)

const ExportResultRef = builder.objectRef<{
  spreadsheetId: string
  spreadsheetUrl: string
  sheetName: string
}>('JourneyVisitorGoogleSheetExportResult')
builder.objectType(ExportResultRef, {
  fields: (t) => ({
    spreadsheetId: t.exposeString('spreadsheetId'),
    spreadsheetUrl: t.exposeString('spreadsheetUrl'),
    sheetName: t.exposeString('sheetName')
  })
})

builder.mutationField('journeyVisitorExportToGoogleSheet', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: ExportResultRef,
    nullable: false,
    args: {
      journeyId: t.arg.id({ required: true }),
      filter: t.arg({ type: JourneyEventsFilter, required: false }),
      select: t.arg({ type: JourneyVisitorExportSelect, required: false }),
      destination: t.arg({ type: ExportDestinationInput, required: true }),
      integrationId: t.arg.id({ required: false })
    },
    resolve: async (
      _parent,
      { journeyId, filter, select, destination, integrationId },
      context
    ) => {
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
        include: {
          team: { include: { userTeams: true } },
          userJourneys: true,
          blocks: { select: { id: true }, orderBy: { updatedAt: 'asc' } }
        }
      })

      if (journey == null) {
        throw new GraphQLError('Journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!ability(Action.Export, subject('Journey', journey), context.user)) {
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
        if (filter.periodRangeStart)
          eventWhere.createdAt.gte = filter.periodRangeStart
        if (filter.periodRangeEnd)
          eventWhere.createdAt.lte = filter.periodRangeEnd
      }

      const blockHeadersResult = await prisma.event.findMany({
        where: eventWhere,
        select: { blockId: true, label: true },
        distinct: ['blockId', 'label']
      })

      const blockIds = journey.blocks.map((b) => b.id)
      const blockHeaders = blockHeadersResult
        .sort(
          (a, b) =>
            blockIds.findIndex((id) => id === a.blockId) -
            blockIds.findIndex((id) => id === b.blockId)
        )
        .map((item) => ({
          key: `${item.blockId!}-${item.label!}`,
          header: item.label!
        }))

      const columns = [
        { key: 'id' },
        select?.createdAt !== false ? { key: 'createdAt' } : null,
        select?.name !== false ? { key: 'name' } : null,
        select?.email !== false ? { key: 'email' } : null,
        select?.phone !== false ? { key: 'phone' } : null,
        ...(filter?.typenames == null || filter.typenames.length > 0
          ? blockHeaders
          : [])
      ].filter((v) => v != null) as Array<{ key: string }>

      const headerRow = columns.map((c) => (c.key === 'id' ? 'id' : c.key))

      // Build data rows
      const values: (string | null)[][] = [headerRow]
      for await (const row of getJourneyVisitors(journeyId, eventWhere)) {
        const v = columns.map((c) => row[c.key] ?? '')
        values.push(v)
      }

      const accessToken = integrationId
        ? (await getIntegrationGoogleAccessToken(integrationId)).accessToken
        : (await getTeamGoogleAccessToken(journey.teamId)).accessToken

      // Determine which integration was used for this export
      const integrationIdUsed =
        integrationId ??
        (
          await prisma.integration.findFirst({
            where: { teamId: journey.teamId, type: 'google' },
            select: { id: true }
          })
        )?.id

      let spreadsheetId: string
      let spreadsheetUrl: string
      const sheetName =
        destination.sheetName ??
        `${format(new Date(), 'yyyy-MM-dd')} ${journey.slug ?? ''}`.trim()

      if (destination.mode === 'create') {
        const title =
          destination.spreadsheetTitle ?? `${journey.title} Visitors`
        const res = await createSpreadsheet({
          accessToken,
          title,
          folderId: destination.folderId ?? undefined,
          initialSheetTitle: sheetName
        })
        spreadsheetId = res.spreadsheetId
        spreadsheetUrl = res.spreadsheetUrl
      } else {
        if (destination.spreadsheetId == null) {
          throw new GraphQLError(
            'spreadsheetId is required for existing mode',
            { extensions: { code: 'BAD_USER_INPUT' } }
          )
        }
        spreadsheetId = destination.spreadsheetId
        spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
        await ensureSheet({ accessToken, spreadsheetId, sheetTitle: sheetName })
      }

      await writeValues({
        accessToken,
        spreadsheetId,
        sheetTitle: sheetName,
        values,
        append: false
      })

      // Record or update Google Sheets sync configuration for this journey
      if (integrationIdUsed != null) {
        const existingSync = await prisma.googleSheetsSync.findFirst({
          where: { teamId: journey.teamId, journeyId }
        })

        const syncData = {
          teamId: journey.teamId,
          journeyId,
          integrationId: integrationIdUsed,
          spreadsheetId,
          sheetName,
          folderId:
            destination.mode === 'create'
              ? (destination.folderId ?? null)
              : null,
          appendMode: true
        }

        if (existingSync != null) {
          await prisma.googleSheetsSync.update({
            where: { id: existingSync.id },
            data: syncData
          })
        } else {
          await prisma.googleSheetsSync.create({ data: syncData })
        }
      }

      return { spreadsheetId, spreadsheetUrl, sheetName }
    }
  })
)
