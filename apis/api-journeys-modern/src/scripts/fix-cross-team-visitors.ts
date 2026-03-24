import {
  JourneyVisitor,
  PrismaClient,
  Visitor,
  prisma
} from '@core/prisma/journeys/client'

interface MismatchedRecord {
  journeyVisitorId: string
  journeyId: string
  wrongVisitorId: string
  wrongVisitorTeamId: string
  userId: string
  journeyTeamId: string
  journeyVisitorCreatedAt: Date
}

interface FixResult {
  journeyVisitorId: string
  journeyId: string
  action: 'merged' | 'reassigned' | 'created_visitor_and_reassigned' | 'skipped'
  wrongVisitorId: string
  correctVisitorId: string | null
  eventsUpdated: number
}

export async function findMismatchedRecords(
  db: PrismaClient
): Promise<MismatchedRecord[]> {
  return db.$queryRaw<MismatchedRecord[]>`
    SELECT
      jv.id AS "journeyVisitorId",
      jv."journeyId",
      jv."visitorId" AS "wrongVisitorId",
      v."teamId" AS "wrongVisitorTeamId",
      v."userId",
      j."teamId" AS "journeyTeamId",
      jv."createdAt" AS "journeyVisitorCreatedAt"
    FROM "JourneyVisitor" jv
    JOIN "Visitor" v ON v.id = jv."visitorId"
    JOIN "Journey" j ON j.id = jv."journeyId"
    WHERE v."teamId" != j."teamId"
    ORDER BY jv."createdAt" ASC
  `
}

export async function fixMismatchedRecord(
  db: PrismaClient,
  record: MismatchedRecord,
  dryRun: boolean
): Promise<FixResult> {
  const result: FixResult = {
    journeyVisitorId: record.journeyVisitorId,
    journeyId: record.journeyId,
    wrongVisitorId: record.wrongVisitorId,
    correctVisitorId: null,
    action: 'skipped',
    eventsUpdated: 0
  }

  let correctVisitor: Visitor | null = await db.visitor.findFirst({
    where: {
      teamId: record.journeyTeamId,
      userId: record.userId
    }
  })

  const needsVisitorCreation = correctVisitor == null

  if (needsVisitorCreation) {
    if (dryRun) {
      result.action = 'created_visitor_and_reassigned'
      result.correctVisitorId = '<would-be-created>'
      return result
    }

    const wrongVisitor = await db.visitor.findUnique({
      where: { id: record.wrongVisitorId }
    })

    if (wrongVisitor == null) {
      result.action = 'skipped'
      return result
    }

    correctVisitor = await db.visitor.create({
      data: {
        teamId: record.journeyTeamId,
        userId: record.userId,
        name: wrongVisitor.name,
        email: wrongVisitor.email,
        phone: wrongVisitor.phone,
        countryCode: wrongVisitor.countryCode,
        referrer: wrongVisitor.referrer,
        status: wrongVisitor.status,
        messagePlatform: wrongVisitor.messagePlatform,
        messagePlatformId: wrongVisitor.messagePlatformId,
        userAgent: wrongVisitor.userAgent ?? undefined
      }
    })
  }

  if (correctVisitor == null) return result

  result.correctVisitorId = correctVisitor.id

  const existingCorrectJV: JourneyVisitor | null =
    await db.journeyVisitor.findUnique({
      where: {
        journeyId_visitorId: {
          journeyId: record.journeyId,
          visitorId: correctVisitor.id
        }
      }
    })

  const eventCount = await db.event.count({
    where: {
      journeyId: record.journeyId,
      visitorId: record.wrongVisitorId
    }
  })

  result.eventsUpdated = eventCount

  if (existingCorrectJV != null) {
    result.action = 'merged'

    if (dryRun) return result

    const wrongJV = await db.journeyVisitor.findUnique({
      where: { id: record.journeyVisitorId }
    })

    if (wrongJV == null) {
      result.action = 'skipped'
      return result
    }

    await db.$transaction([
      db.event.updateMany({
        where: {
          journeyId: record.journeyId,
          visitorId: record.wrongVisitorId
        },
        data: {
          visitorId: correctVisitor.id
        }
      }),
      db.journeyVisitor.update({
        where: { id: existingCorrectJV.id },
        data: {
          activityCount: {
            increment: wrongJV.activityCount
          },
          duration: {
            increment: wrongJV.duration
          },
          ...(wrongJV.lastStepViewedAt != null &&
          (existingCorrectJV.lastStepViewedAt == null ||
            wrongJV.lastStepViewedAt > existingCorrectJV.lastStepViewedAt)
            ? { lastStepViewedAt: wrongJV.lastStepViewedAt }
            : {}),
          ...(wrongJV.lastChatStartedAt != null &&
          (existingCorrectJV.lastChatStartedAt == null ||
            wrongJV.lastChatStartedAt > existingCorrectJV.lastChatStartedAt)
            ? {
                lastChatStartedAt: wrongJV.lastChatStartedAt,
                lastChatPlatform: wrongJV.lastChatPlatform
              }
            : {}),
          ...(wrongJV.lastTextResponse != null &&
          existingCorrectJV.lastTextResponse == null
            ? { lastTextResponse: wrongJV.lastTextResponse }
            : {}),
          ...(wrongJV.lastRadioQuestion != null &&
          existingCorrectJV.lastRadioQuestion == null
            ? { lastRadioQuestion: wrongJV.lastRadioQuestion }
            : {}),
          ...(wrongJV.lastRadioOptionSubmission != null &&
          existingCorrectJV.lastRadioOptionSubmission == null
            ? { lastRadioOptionSubmission: wrongJV.lastRadioOptionSubmission }
            : {}),
          ...(wrongJV.lastLinkAction != null &&
          existingCorrectJV.lastLinkAction == null
            ? { lastLinkAction: wrongJV.lastLinkAction }
            : {}),
          ...(wrongJV.lastMultiselectSubmission != null &&
          existingCorrectJV.lastMultiselectSubmission == null
            ? {
                lastMultiselectSubmission: wrongJV.lastMultiselectSubmission
              }
            : {})
        }
      }),
      db.journeyVisitor.delete({
        where: { id: record.journeyVisitorId }
      })
    ])
  } else {
    result.action = needsVisitorCreation
      ? 'created_visitor_and_reassigned'
      : 'reassigned'

    if (dryRun) return result

    await db.$transaction([
      db.event.updateMany({
        where: {
          journeyId: record.journeyId,
          visitorId: record.wrongVisitorId
        },
        data: {
          visitorId: correctVisitor.id
        }
      }),
      db.journeyVisitor.delete({
        where: { id: record.journeyVisitorId }
      }),
      db.journeyVisitor.create({
        data: {
          journeyId: record.journeyId,
          visitorId: correctVisitor.id
        }
      })
    ])
  }

  return result
}

export async function fixCrossTeamVisitors(
  db: PrismaClient,
  dryRun = true
): Promise<FixResult[]> {
  const records = await findMismatchedRecords(db)

  console.log(
    `Found ${records.length} mismatched JourneyVisitor records${dryRun ? ' (DRY RUN)' : ''}`
  )

  if (records.length === 0) return []

  const results: FixResult[] = []

  for (const record of records) {
    console.log(
      `\nProcessing JourneyVisitor ${record.journeyVisitorId}:`,
      `\n  Journey: ${record.journeyId} (team: ${record.journeyTeamId})`,
      `\n  Wrong Visitor: ${record.wrongVisitorId} (team: ${record.wrongVisitorTeamId})`,
      `\n  User: ${record.userId}`
    )

    try {
      const fixResult = await fixMismatchedRecord(db, record, dryRun)
      results.push(fixResult)

      console.log(
        `  Action: ${fixResult.action}`,
        `| Correct Visitor: ${fixResult.correctVisitorId ?? 'N/A'}`,
        `| Events updated: ${fixResult.eventsUpdated}`
      )
    } catch (error) {
      console.error(
        `  ERROR processing ${record.journeyVisitorId}:`,
        error instanceof Error ? error.message : error
      )
      results.push({
        journeyVisitorId: record.journeyVisitorId,
        journeyId: record.journeyId,
        wrongVisitorId: record.wrongVisitorId,
        correctVisitorId: null,
        action: 'skipped',
        eventsUpdated: 0
      })
    }
  }

  const summary = {
    total: results.length,
    merged: results.filter((r) => r.action === 'merged').length,
    reassigned: results.filter((r) => r.action === 'reassigned').length,
    createdAndReassigned: results.filter(
      (r) => r.action === 'created_visitor_and_reassigned'
    ).length,
    skipped: results.filter((r) => r.action === 'skipped').length,
    totalEventsUpdated: results.reduce((sum, r) => sum + r.eventsUpdated, 0)
  }

  console.log('\n--- Summary ---')
  console.log(`Total mismatched records: ${summary.total}`)
  console.log(`Merged (correct JV existed): ${summary.merged}`)
  console.log(`Reassigned (JV moved to correct visitor): ${summary.reassigned}`)
  console.log(`Created visitor + reassigned: ${summary.createdAndReassigned}`)
  console.log(`Skipped: ${summary.skipped}`)
  console.log(`Total events updated: ${summary.totalEventsUpdated}`)

  return results
}

async function main(): Promise<void> {
  const dryRun = !process.argv.includes('--apply')

  if (dryRun) {
    console.log('=== DRY RUN MODE ===')
    console.log('Pass --apply to execute changes\n')
  } else {
    console.log('=== APPLYING FIXES ===\n')
  }

  try {
    await fixCrossTeamVisitors(prisma, dryRun)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}

export default main
