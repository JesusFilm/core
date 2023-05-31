// version 3
// increment to trigger re-seed (ie: files other than seed.ts are changed)

// Please note, this seed transfers existing arangodb users to postgresql

import { aql } from 'arangojs'
import { pick } from 'lodash'
import { PrismaClient } from '.prisma/api-users-client'
import { ArangoDB } from './db'

const db = ArangoDB()
const prisma = new PrismaClient()

async function main(): Promise<void> {
  const result = await db.query(aql`
  FOR user IN users
    RETURN user`)
  const users = await result.all()
  await prisma.user.createMany({
    data: users.map((user) => ({
      ...pick(user, ['email', 'userId', 'firstName', 'lastName', 'imageUrl']),
      id: user._key
    })),
    skipDuplicates: true
  })
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
