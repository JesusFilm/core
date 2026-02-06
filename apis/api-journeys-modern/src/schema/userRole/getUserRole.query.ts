import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserRoleRef } from './userRole'

const ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED = 'P2002'

async function getUserRoleByUserId(userId: string) {
  try {
    return await prisma.userRole.upsert({
      where: { userId },
      create: { userId },
      update: {}
    })
  } catch (err: any) {
    if (err.code !== ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED) {
      throw err
    }
  }
  return await getUserRoleByUserId(userId)
}

builder.queryField('getUserRole', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).prismaField({
    type: UserRoleRef,
    nullable: true,
    resolve: async (query, _parent, _args, context) => {
      return await getUserRoleByUserId(context.user.id)
    }
  })
)
