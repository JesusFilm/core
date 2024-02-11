import { getAuth } from 'firebase-admin/auth'

import { PrismaClient } from '.prisma/api-users-client'
import { firebaseClient } from '@core/nest/common/firebaseClient'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const users = await prisma.user.findMany({})
  for (const user of users) {
    await getAuth(firebaseClient).updateUser(user.userId, {
      emailVerified: true
    })
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
