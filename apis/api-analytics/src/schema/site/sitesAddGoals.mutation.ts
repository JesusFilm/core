import { Prisma, prisma } from '@core/prisma/analytics/client'

import { builder } from '../builder'

const SitesAddGoalsInput = builder.inputType('SitesAddGoalsInput', {
  fields: (t) => ({
    goals: t.stringList({ required: true })
  })
})

const BATCH_SIZE = 100

async function processSiteBatch(
  sites: Array<{ id: bigint }>,
  goalNames: string[]
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
        await prisma.goals.createMany({
          data: newGoals.map((eventName) => ({
            site_id: site.id,
            event_name: eventName,
            inserted_at: new Date(),
            updated_at: new Date()
          })),
          skipDuplicates: true
        })
        added += newGoals.length
      }
    } catch (error) {
      failed++
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        continue
      }
      console.error(`Failed to add goals to site ${site.id}:`, error)
    }
  }

  return { added, failed }
}

builder.mutationType({
  fields: (t) => ({
    sitesAddGoals: t.withAuth({ isAuthenticated: true }).field({
      type: 'Int',
      nullable: false,
      errors: {
        types: [Error]
      },
      args: {
        input: t.arg({ type: SitesAddGoalsInput, required: true })
      },
      resolve: async (_parent, { input }) => {
        let totalAdded = 0
        let totalFailed = 0
        let offset = 0
        let hasMore = true

        while (hasMore) {
          const sitesNeedingGoals = await prisma.$queryRaw<
            Array<{ id: bigint }>
          >`
            SELECT s.id
            FROM sites s
            WHERE (
              SELECT COUNT(DISTINCT g.event_name)
              FROM goals g
              WHERE g.site_id = s.id
                AND g.event_name = ANY(${input.goals}::text[])
            ) < ${input.goals.length}
            ORDER BY s.id ASC
            LIMIT ${BATCH_SIZE}
            OFFSET ${offset}
          `

          if (sitesNeedingGoals.length === 0) {
            hasMore = false
            break
          }

          const { added, failed } = await processSiteBatch(
            sitesNeedingGoals,
            input.goals
          )

          totalAdded += added
          totalFailed += failed

          offset += sitesNeedingGoals.length

          if (sitesNeedingGoals.length < BATCH_SIZE) {
            hasMore = false
          }
        }

        if (totalFailed > 0) {
          console.warn(
            `Failed to add goals to ${totalFailed} sites. Total added: ${totalAdded}`
          )
        }

        return totalAdded
      }
    })
  })
})
