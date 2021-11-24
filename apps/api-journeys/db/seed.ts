import { PrismaClient } from '.prisma/api-journeys-client'
import { noop } from 'lodash'
import { nua1 } from './seeds/nua1'

async function main(): Promise<void> {
  await nua1()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
