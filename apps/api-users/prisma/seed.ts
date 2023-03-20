// version 2
// increment to trigger re-seed (ie: files other than seed.ts are changed)

// Please note, this seed transfers existing arangodb users to postgresql

import { aql } from 'arangojs'
import { omit } from 'lodash'
import { PrismaClient, User } from '.prisma/api-users-client'
import { ArangoDB } from '../db/db'

const db = ArangoDB()
const prisma = new PrismaClient()

async function main(): Promise<void> {
  const result = await db.query(aql`
  FOR user IN users
    RETURN user`)
  const users = await result.all()
  await prisma.user.createMany({
    data: users.map(
      (user) =>
        omit(
          {
            ...user,
            id: user._key
          },
          ['_key', '_id', '_rev']
        ) as User
    ),
    skipDuplicates: true
  })
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
