import { createHash } from 'node:crypto'

import { users as User, prisma } from '@core/prisma/analytics/client'

export async function getUserFromApiKey(
  apiKey?: string
): Promise<User | undefined> {
  if (apiKey == null) return

  const dbApiKey = await prisma.api_keys.findFirst({
    include: { users: true },
    where: { key_prefix: apiKey.slice(0, 6) }
  })

  if (dbApiKey == null || dbApiKey.key_hash !== hash(apiKey)) return

  return dbApiKey.users
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
