import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
// eslint-disable-next-line import/no-named-as-default
import PrismaPlugin from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'

import { Prisma } from '.prisma/api-users-client'
import { User } from '@core/yoga/firebaseClient'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'

interface PrismaUser extends User {
  superAdmin?: boolean
}
export interface Context {
  currentUser: PrismaUser | null
  token?: string | null
  interopToken?: string | null
  ipAddress?: string | null
}

export function validateIpV4(s?: string | null): boolean {
  if (s == null) return true // localhost

  const match = s.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g)
  const ip = match?.[0] ?? ''
  return (
    ip === '3.13.104.200' || // prod aws nat
    ip === '18.225.26.131' || // stage aws nat
    ip === '127.0.0.1' // localhost
  )
}

export function isValidInterOp(
  token?: string | null,
  address?: string | null
): boolean {
  if (token == null) return false
  const validIp = validateIpV4(address)
  return token === process.env.INTEROP_TOKEN && validIp
}

export const builder = new SchemaBuilder<{
  Context: Context
  PrismaTypes: PrismaTypes
  Scalars: {
    ID: { Input: string; Output: number | string }
  }
  AuthScopes: {
    isAuthenticated: boolean
    isCurrentUser: string
    isSuperAdmin: boolean
    isValidInterOp: boolean
  }
}>({
  plugins: [ScopeAuthPlugin, PrismaPlugin, DirectivesPlugin, FederationPlugin],
  authScopes: async (context: Context) => ({
    isAuthenticated: context.currentUser != null,
    isCurrentUser: (id) => context.currentUser?.id === id,
    isSuperAdmin: async () => {
      const user = await prisma.user.findUnique({
        where: { userId: context.currentUser?.id }
      })
      return user?.superAdmin ?? false
    },
    isValidInterOp: isValidInterOp(context.interopToken, context.ipAddress),
    scopeAuthOptions: {
      authorizeOnSubscribe: true
    }
  }),
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})

builder.queryType({})
builder.mutationType({})
