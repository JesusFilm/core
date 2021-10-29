import { PrismaClient } from '.prisma/api-journeys-client'
import { noop } from 'lodash'
import { fallingPlates, factOrFiction, ressurection } from './factories/'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  await fallingPlates(prisma)
  await factOrFiction(prisma)
  await ressurection(prisma)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect().catch(noop)
  })
