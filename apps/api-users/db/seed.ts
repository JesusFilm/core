import { PrismaClient } from '.prisma/api-users-client'
import { firebaseClient } from '@core/nest/common/firebaseClient'
import { getAuth } from 'firebase-admin/auth'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({})
  for (const user of users) {
    await getAuth(firebaseClient).updateUser(user.userId, {
      emailVerified: true
    })
  }
}
