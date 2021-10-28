import { PrismaClient } from '.prisma/api-journeys-client'
import { noop } from 'lodash'
import { fallingPlates } from './factories/fallingPlates'
import { nuaTwo } from './factories/nuaTwo'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  await fallingPlates(prisma)
  await nuaTwo(prisma)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect().catch(noop)
  })
