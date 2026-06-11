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
  action: 'merged' | 'skipped'
  skipReason?: string
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

function buildMergeData(
  wrongJV: JourneyVisitor,
  correctJV: JourneyVisitor
): Record<string, unknown> {
  return {
    activityCount: { increment: wrongJV.activityCount },
    duration: { increment: wrongJV.duration },
    ...(wrongJV.lastStepViewedAt != null &&
    (correctJV.lastStepViewedAt == null ||
      wrongJV.lastStepViewedAt > correctJV.lastStepViewedAt)
      ? { lastStepViewedAt: wrongJV.lastStepViewedAt }
      : {}),
    ...(wrongJV.lastChatStartedAt != null &&
    (correctJV.lastChatStartedAt == null ||
      wrongJV.lastChatStartedAt > correctJV.lastChatStartedAt)
      ? {
          lastChatStartedAt: wrongJV.lastChatStartedAt,
          lastChatPlatform: wrongJV.lastChatPlatform
        }
      : {}),
    ...(wrongJV.lastTextResponse != null && correctJV.lastTextResponse == null
      ? { lastTextResponse: wrongJV.lastTextResponse }
      : {}),
    ...(wrongJV.lastRadioQuestion != null && correctJV.lastRadioQuestion == null
      ? { lastRadioQuestion: wrongJV.lastRadioQuestion }
      : {}),
    ...(wrongJV.lastRadioOptionSubmission != null &&
    correctJV.lastRadioOptionSubmission == null
      ? { lastRadioOptionSubmission: wrongJV.lastRadioOptionSubmission }
      : {}),
    ...(wrongJV.lastLinkAction != null && correctJV.lastLinkAction == null
      ? { lastLinkAction: wrongJV.lastLinkAction }
      : {}),
    ...(wrongJV.lastMultiselectSubmission != null &&
    correctJV.lastMultiselectSubmission == null
      ? { lastMultiselectSubmission: wrongJV.lastMultiselectSubmission }
      : {})
  }
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

  const correctVisitor: Visitor | null = await db.visitor.findFirst({
    where: {
      teamId: record.journeyTeamId,
      userId: record.userId
    }
  })

  if (correctVisitor == null) {
    result.skipReason = 'no correct visitor found — requires manual review'
    return result
  }

  result.correctVisitorId = correctVisitor.id

  const correctJV: JourneyVisitor | null = await db.journeyVisitor.findUnique({
    where: {
      journeyId_visitorId: {
        journeyId: record.journeyId,
        visitorId: correctVisitor.id
      }
    }
  })

  if (correctJV == null) {
    result.skipReason =
      'correct visitor exists but no correct JourneyVisitor — requires manual review'
    return result
  }

  const eventCount = await db.event.count({
    where: {
      journeyId: record.journeyId,
      visitorId: record.wrongVisitorId
    }
  })

  result.eventsUpdated = eventCount
  result.action = 'merged'

  if (dryRun) return result

  const wrongJV = await db.journeyVisitor.findUnique({
    where: { id: record.journeyVisitorId }
  })

  if (wrongJV == null) {
    result.action = 'skipped'
    result.skipReason = 'wrong JourneyVisitor disappeared before fix'
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
      where: { id: correctJV.id },
      data: buildMergeData(wrongJV, correctJV)
    }),
    db.journeyVisitor.delete({
      where: { id: record.journeyVisitorId }
    })
  ])

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

      const statusLine =
        fixResult.action === 'merged'
          ? `  Action: merged | Correct Visitor: ${fixResult.correctVisitorId} | Events updated: ${fixResult.eventsUpdated}`
          : `  SKIPPED: ${fixResult.skipReason}`

      console.log(statusLine)
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
        skipReason: error instanceof Error ? error.message : 'unknown error',
        eventsUpdated: 0
      })
    }
  }

  const merged = results.filter((r) => r.action === 'merged')
  const skipped = results.filter((r) => r.action === 'skipped')

  console.log('\n--- Summary ---')
  console.log(`Total mismatched records: ${results.length}`)
  console.log(`Merged: ${merged.length}`)
  console.log(`Skipped: ${skipped.length}`)
  console.log(
    `Total events updated: ${results.reduce((sum, r) => sum + r.eventsUpdated, 0)}`
  )

  if (skipped.length > 0) {
    console.log('\n--- Skipped Records (require manual review) ---')
    for (const s of skipped) {
      console.log(
        `  JV: ${s.journeyVisitorId} | Journey: ${s.journeyId} | Reason: ${s.skipReason}`
      )
    }
  }

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
