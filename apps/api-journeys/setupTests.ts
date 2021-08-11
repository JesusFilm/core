import { PrismaClient } from '.prisma/api-journeys-client'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env.test') })

const client = new PrismaClient()

const truncate = async (): Promise<void> => {
  const tablenames: Array<{ tablename: string}> = await client.$queryRaw(
    'SELECT tablename FROM pg_tables WHERE schemaname=\'public\''
  )

  await tablenames.map(async ({ tablename }) => {
    if (tablename === '_prisma_migrations') {
      return await Promise.resolve()
    }

    return await client.$queryRaw(
      `TRUNCATE TABLE public."${tablename}" CASCADE;`
    )
  })
}

beforeAll(async () => {
  await client.$connect()
  await truncate()
})

afterEach(async () => {
  await truncate()
})

afterAll(async () => {
  await client.$disconnect()
})
