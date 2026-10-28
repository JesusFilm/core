import { prisma as usersPrisma } from '@core/prisma/users/client'

import { logger } from '../../logger'
import type { Context } from '../../schema/builder'

/** One users-database lookup per request, shared by the scope and resolvers. */
const lookups = new WeakMap<object, Promise<boolean>>()

/**
 * Whether the caller has `superAdmin` set on their user in the users database
 * (owned by api-users). Fails closed: a lookup that errors is not a superAdmin.
 */
export async function contextIsSuperAdmin(context: Context): Promise<boolean> {
  if (context.type !== 'authenticated') return false

  const cached = lookups.get(context)
  if (cached != null) return await cached

  const lookup = usersPrisma.user
    .findUnique({
      where: { userId: context.user.id },
      select: { superAdmin: true }
    })
    .then((user) => user?.superAdmin === true)
    .catch((error: unknown) => {
      logger.error({ error }, 'superAdmin lookup failed')
      return false
    })
  lookups.set(context, lookup)
  return await lookup
}
