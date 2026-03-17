import { GraphQLError } from 'graphql'

import { User, prisma } from '@core/prisma/users/client'

import { LogEntry, createLog } from './types'

interface LookupResult {
  user: User
  logs: LogEntry[]
}

export async function lookupUser(
  idType: 'databaseId' | 'email',
  id: string
): Promise<LookupResult> {
  const logs: LogEntry[] = []
  logs.push(createLog(`Looking for user by ${idType}: ${id}`))

  const user =
    idType === 'email'
      ? await prisma.user.findUnique({ where: { email: id } })
      : await prisma.user.findUnique({ where: { id } })

  if (user == null) {
    throw new GraphQLError(`User not found with ${idType}: ${id}`, {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  logs.push(
    createLog(
      `User found: ${user.firstName} ${user.lastName ?? ''} (${user.email ?? 'no email'})`
    )
  )

  return { user, logs }
}
