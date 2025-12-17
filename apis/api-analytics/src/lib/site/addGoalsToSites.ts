import type { PrismaClient } from '@core/prisma/analytics/client'
import { Prisma } from '@core/prisma/analytics/client'

export interface AddGoalsToSitesResult {
  totalAdded: number
  totalFailed: number
}

export interface AddGoalsToSitesOptions {
  batchSize?: number
  logger?: Pick<Console, 'log' | 'warn' | 'error'>
}

const DEFAULT_BATCH_SIZE = 100

async function processSiteBatch(
  prisma: PrismaClient,
  sites: Array<{ id: bigint }>,
  goalNames: string[],
  logger: Pick<Console, 'log' | 'warn' | 'error'>
): Promise<{ added: number; failed: number }> {
  let added = 0
  let failed = 0

  for (const site of sites) {
    try {
      const existingGoals = await prisma.goals.findMany({
        where: {
          site_id: site.id,
          event_name: { in: goalNames }
        },
        select: {
          event_name: true
        }
      })

      const existingGoalNames = new Set(
        existingGoals.map((goal) => goal.event_name).filter(Boolean)
      )

      const newGoals = goalNames.filter(
        (goalName) => !existingGoalNames.has(goalName)
      )

      if (newGoals.length > 0) {
        const now = new Date()
        const result = await prisma.goals.createMany({
          data: newGoals.map((eventName) => ({
            site_id: site.id,
            event_name: eventName,
            inserted_at: now,
            updated_at: now
          })),
          skipDuplicates: true
        })
        added += result.count
      }
    } catch (error) {
      failed++
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        continue
      }
      logger.error(`Failed to add goals to site ${site.id}:`, error)
    }
  }

  return { added, failed }
}

export async function addGoalsToAllSites(
  prisma: PrismaClient,
  goalNames: string[],
  options: AddGoalsToSitesOptions = {}
): Promise<AddGoalsToSitesResult> {
  const logger = options.logger ?? console
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE

  const normalizedGoals = Array.from(
    new Set(goalNames.map((g) => g.trim()).filter(Boolean))
  )

  if (normalizedGoals.length === 0) {
    return { totalAdded: 0, totalFailed: 0 }
  }

  let totalAdded = 0
  let totalFailed = 0
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const sitesNeedingGoals = await prisma.$queryRaw<Array<{ id: bigint }>>`
      SELECT s.id
      FROM sites s
      WHERE (
        SELECT COUNT(DISTINCT g.event_name)
        FROM goals g
        WHERE g.site_id = s.id
          AND g.event_name = ANY(${normalizedGoals}::text[])
      ) < ${normalizedGoals.length}
      ORDER BY s.id ASC
      LIMIT ${batchSize}
      OFFSET ${offset}
    `

    if (sitesNeedingGoals.length === 0) {
      hasMore = false
      break
    }

    const { added, failed } = await processSiteBatch(
      prisma,
      sitesNeedingGoals,
      normalizedGoals,
      logger
    )

    totalAdded += added
    totalFailed += failed

    offset += sitesNeedingGoals.length

    if (sitesNeedingGoals.length < batchSize) {
      hasMore = false
    }
  }

  return { totalAdded, totalFailed }
}
