import { createHash } from 'crypto'

import { Prisma, users as User } from '.prisma/api-analytics-client'

import { prisma } from './prisma'

export async function getUserFromApiKey(
  apiKey?: string
): Promise<User | undefined> {
  if (apiKey == null) return

  try {
    const { key_hash: keyHash, users: user } =
      await prisma.api_keys.findFirstOrThrow({
        include: { users: true },
        where: { key_prefix: apiKey.slice(0, 6) }
      })
    if (keyHash === hash(apiKey)) return user
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025' &&
      error.message === 'No api_keys found'
    )
      return

    throw error
  }
}

// the follow is a javascript version of the do_hash method in
// lib/plausible/auth/api_key.ex file of the plausible/analytics github repo
// https://github.com/plausible/analytics/blob/master/lib/plausible/auth/api_key.ex#L39
function hash(apiKey: string): string {
  return createHash('sha256')
    .update(`${process.env.PLAUSIBLE_SECRET_KEY_BASE}${apiKey}`)
    .digest('hex')
    .toLowerCase()
}
