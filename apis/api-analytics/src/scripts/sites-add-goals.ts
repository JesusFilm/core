import { prisma } from '@core/prisma/analytics/client'

import { addGoalsToAllSites } from '../lib/site/addGoalsToSites'

const DEFAULT_BATCH_SIZE = 100

function printUsage(): void {
  // eslint-disable-next-line no-console
  console.log(`
Usage:
  GOALS="goal1,goal2" pnpm nx run api-analytics:sites-add-goals

Optional:
  BATCH_SIZE=200

Or via args:
  pnpm nx run api-analytics:sites-add-goals -- --goals="goal1,goal2" --batch-size=200
`)
}

function parseArgs(argv: string[]): {
  goals?: string
  batchSize?: number
  help: boolean
} {
  const result: { goals?: string; batchSize?: number; help: boolean } = {
    help: false
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === '--help' || arg === '-h') {
      result.help = true
      continue
    }

    if (arg.startsWith('--goals=')) {
      result.goals = arg.slice('--goals='.length)
      continue
    }
    if (arg === '--goals' || arg === '-g') {
      result.goals = argv[i + 1]
      i++
      continue
    }

    if (arg.startsWith('--batch-size=')) {
      const raw = arg.slice('--batch-size='.length)
      const value = Number.parseInt(raw, 10)
      if (!Number.isNaN(value)) result.batchSize = value
      continue
    }
    if (arg === '--batch-size' || arg === '-b') {
      const raw = argv[i + 1]
      const value = Number.parseInt(raw ?? '', 10)
      if (!Number.isNaN(value)) result.batchSize = value
      i++
      continue
    }
  }

  return result
}

async function main(): Promise<void> {
  try {
    const args = parseArgs(process.argv.slice(2))
    if (args.help) {
      printUsage()
      process.exit(0)
    }

    const goalsRaw = args.goals ?? process.env.GOALS
    if (!goalsRaw) {
      throw new Error(
        'Missing goals. Provide GOALS="goal1,goal2" or --goals="goal1,goal2".'
      )
    }

    const batchSizeRaw = args.batchSize ?? Number(process.env.BATCH_SIZE)
    const batchSize =
      Number.isFinite(batchSizeRaw) && batchSizeRaw > 0
        ? batchSizeRaw
        : DEFAULT_BATCH_SIZE

    const goals = goalsRaw
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)

    if (goals.length === 0) {
      throw new Error('No goals provided after parsing.')
    }

    console.log('Starting sites-add-goals script')
    console.log(`Goals (${goals.length}): ${goals.join(', ')}`)
    console.log(`Batch size: ${batchSize}`)

    console.log('Step 1: Adding missing goals to sites')
    const { totalAdded, totalFailed } = await addGoalsToAllSites(
      prisma,
      goals,
      {
        batchSize,
        logger: console
      }
    )

    console.log('Step 2: Done')
    console.log(`Total added: ${totalAdded}`)
    console.log(`Total failed: ${totalFailed}`)

    if (totalFailed > 0) {
      process.exitCode = 1
    }
  } catch (error) {
    const typedError = error instanceof Error ? error : new Error(String(error))
    console.error('Error during sites-add-goals:', typedError)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  // This script is being run directly
  main().catch((error) => {
    const typedError = error instanceof Error ? error : new Error(String(error))
    console.error('Unhandled error:', typedError)
    process.exit(1)
  })
}

export default main
