import db from './src/lib/db'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

const truncate = async (): Promise<void> => {
  const tablenames: Array<{ tablename: string}> = await db.$queryRaw(
    'SELECT tablename FROM pg_tables WHERE schemaname=\'public\''
  )

  await tablenames.map(async ({ tablename }) => {
    if (tablename === '_prisma_migrations') {
      return await Promise.resolve()
    }

    return await db.$queryRaw(
      `TRUNCATE TABLE public."${tablename}" CASCADE;`
    )
  })
}

beforeAll(async () => {
  await truncate()
})

afterEach(async () => {
  await truncate()
})
