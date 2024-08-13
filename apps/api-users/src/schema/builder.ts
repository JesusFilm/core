import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
// eslint-disable-next-line import/no-named-as-default
import PrismaPlugin from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'

import { Prisma } from '.prisma/api-languages-client'
import { User } from '@core/yoga/firebaseClient'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'

interface PrismaUser extends User {
  superAdmin?: boolean
}
export interface Context {
  currentUser: PrismaUser | null
  token?: string
}

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Scalars: {
    ID: { Input: string; Output: number | string }
  }
  AuthScopes: {
    isAuthenticated: boolean
    isCurrentUser: (id: string) => boolean
    isSuperAdmin: () => boolean
  }
}>({
  plugins: [PrismaPlugin, ScopeAuthPlugin, DirectivesPlugin, FederationPlugin],
  scopeAuth: {
    authorizeOnSubscribe: true,
    authScopes: async (context) => ({
      isAuthenticated: context.currentUser != null,
      isCurrentUser: (currentUserId) =>
        context.currentUser.id === currentUserId,
      isSuperAdmin: async () => {
        const user = await prisma.user.findUnique({
          where: { userId: context.currentUser.id }
        })
        return user?.superAdmin ?? false
      }
    })
  },
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})

builder.queryType({})
