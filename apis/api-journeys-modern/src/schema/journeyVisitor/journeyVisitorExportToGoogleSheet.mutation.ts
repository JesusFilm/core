import { format } from 'date-fns'
import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { getIntegrationGoogleAccessToken } from '../../lib/google/googleAuth'
import {
  createSpreadsheet,
  ensureSheet,
  readValues,
  writeValues
} from '../../lib/google/sheets'
import { builder } from '../builder'
import { JourneyEventsFilter } from '../event/journey/inputs'

import { JourneyVisitorExportSelect } from './inputs'

interface JourneyVisitorExportRow {
  visitorId: string
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
        visitorId: journeyVisitor.visitor.id,
        createdAt: journeyVisitor.createdAt.toISOString(),
        name: journeyVisitor.visitor.name || '',
        email: journeyVisitor.visitor.email || '',
        phone: journeyVisitor.visitor.phone || ''
      }

      journeyVisitor.events.forEach((event) => {
        if (event.blockId && event.label && event.value != null) {
          const val = String(event.value)
          if (val === '') {
            return
          }
          const key = `${event.blockId}-${event.label}`
          if (row[key]) {
            row[key] += `; ${val}`
          } else {
            row[key] = val
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
      spreadsheetTitle: t.string({
        description:
          'Required when mode is "create". The title for the new spreadsheet.'
      }),
      folderId: t.string({
        description:
          'Required when mode is "create". The ID of the folder where the spreadsheet should be created.'
      }),
      spreadsheetId: t.string({
        description:
          'Required when mode is "existing". The ID of the existing spreadsheet to export to.'
      }),
      sheetName: t.string({
        description:
          'Required when mode is "existing". The name of the sheet within the existing spreadsheet.'
      })
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
    spreadsheetId: t.exposeID('spreadsheetId', { nullable: false }),
    spreadsheetUrl: t.exposeString('spreadsheetUrl', { nullable: false }),
    sheetName: t.exposeString('sheetName', { nullable: false })
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
      integrationId: t.arg.id({ required: true })
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
        { key: 'visitorId' },
        select?.createdAt !== false ? { key: 'createdAt' } : null,
        select?.name !== false ? { key: 'name' } : null,
        select?.email !== false ? { key: 'email' } : null,
        select?.phone !== false ? { key: 'phone' } : null,
        ...(filter?.typenames == null || filter.typenames.length > 0
          ? blockHeaders
          : [])
      ].filter((v) => v != null) as Array<{ key: string }>

      // Compute the desired header row for this export
      const desiredHeader = columns.map((c) => c.key)

      const accessToken = (await getIntegrationGoogleAccessToken(integrationId))
        .accessToken

      const integrationRecord = await prisma.integration.findUnique({
        where: { id: integrationId },
        select: { id: true, accountEmail: true }
      })

      if (integrationRecord == null) {
        throw new GraphQLError('Integration not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      const integrationIdUsed = integrationRecord.id
      const integrationEmail = integrationRecord.accountEmail ?? null

      // Validate required fields based on mode
      if (destination.mode === 'create') {
        if (
          destination.spreadsheetTitle == null ||
          destination.spreadsheetTitle.trim() === ''
        ) {
          throw new GraphQLError(
            'spreadsheetTitle is required when mode is "create"',
            { extensions: { code: 'BAD_USER_INPUT' } }
          )
        }
        if (
          destination.folderId == null ||
          destination.folderId.trim() === ''
        ) {
          throw new GraphQLError('folderId is required when mode is "create"', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }
      } else if (destination.mode === 'existing') {
        if (
          destination.spreadsheetId == null ||
          destination.spreadsheetId.trim() === ''
        ) {
          throw new GraphQLError(
            'spreadsheetId is required when mode is "existing"',
            { extensions: { code: 'BAD_USER_INPUT' } }
          )
        }
        if (
          destination.sheetName == null ||
          destination.sheetName.trim() === ''
        ) {
          throw new GraphQLError(
            'sheetName is required when mode is "existing"',
            { extensions: { code: 'BAD_USER_INPUT' } }
          )
        }
      }

      let spreadsheetId: string
      let spreadsheetUrl: string
      const sheetName =
        destination.sheetName ??
        `${format(new Date(), 'yyyy-MM-dd')} ${journey.slug ?? ''}`.trim()

      if (destination.mode === 'create') {
        const res = await createSpreadsheet({
          accessToken,
          title: destination.spreadsheetTitle!,
          folderId: destination.folderId!,
          initialSheetTitle: sheetName
        })
        spreadsheetId = res.spreadsheetId
        spreadsheetUrl = res.spreadsheetUrl
      } else {
        spreadsheetId = destination.spreadsheetId!
        spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
        await ensureSheet({ accessToken, spreadsheetId, sheetTitle: sheetName })
      }

      // Read existing header (for existing sheets) and merge to preserve/extend columns
      let finalHeader = desiredHeader
      if (destination.mode === 'existing') {
        const headerRes = await readValues({
          accessToken,
          spreadsheetId,
          range: `${sheetName}!A1:ZZ1`
        })
        const existingHeader: string[] = (headerRes[0] ?? []).map(
          (v) => v ?? ''
        )
        if (existingHeader.length > 0) {
          // Ensure base headers exist in the correct order at start, respecting select preferences
          const base: string[] = ['visitorId']
          if (select?.createdAt !== false) base.push('createdAt')
          if (select?.name !== false) base.push('name')
          if (select?.email !== false) base.push('email')
          if (select?.phone !== false) base.push('phone')
          const merged: string[] = []
          for (const b of base) if (!merged.includes(b)) merged.push(b)
          for (const h of existingHeader)
            if (h !== '' && !merged.includes(h)) merged.push(h)
          for (const h of desiredHeader)
            if (h !== '' && !merged.includes(h)) merged.push(h)
          finalHeader = merged
        }
      }

      // Build data rows aligned to finalHeader
      const values: (string | null)[][] = [finalHeader]
      for await (const row of getJourneyVisitors(journeyId, eventWhere)) {
        const aligned = finalHeader.map((k) => row[k] ?? '')
        values.push(aligned)
      }

      await writeValues({
        accessToken,
        spreadsheetId,
        sheetTitle: sheetName,
        values,
        append: false
      })

      // Record Google Sheets sync configuration for this journey
      const existingSync = await prisma.googleSheetsSync.findFirst({
        where: {
          teamId: journey.teamId,
          journeyId,
          spreadsheetId,
          sheetName
        }
      })

      if (existingSync != null) {
        throw new GraphQLError(
          'A sync already exists for this journey, spreadsheet, and sheet combination',
          { extensions: { code: 'CONFLICT' } }
        )
      }

      const syncData = {
        teamId: journey.teamId,
        journeyId,
        integrationId: integrationIdUsed,
        spreadsheetId,
        sheetName,
        folderId:
          destination.mode === 'create' ? (destination.folderId ?? null) : null,
        email: integrationEmail,
        deletedAt: null
      }

      await prisma.googleSheetsSync.create({ data: syncData })

      return { spreadsheetId, spreadsheetUrl, sheetName }
    }
  })
)
