import { PrismaClient } from '.prisma/api-journeys-client'
import { noop } from 'lodash'
import { nua1, nua2, nuaEp8, nua9 } from './factories/'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  await nua1(prisma)
  await nua2(prisma)
  await nuaEp8(prisma)
  await nua9(prisma)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect().catch(noop)
  })
