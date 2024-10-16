// eslint-disable-next-line import/order -- Must be imported first
import { tracer } from '@core/yoga/tracer'

import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing'
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry'

import { Prisma } from '.prisma/api-users-client'
import { User } from '@core/yoga/firebaseClient'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'

const PrismaPlugin = pluginName

export interface Context {
  currentUser: User | null
  interopToken?: string | null
  ipAddress?: string | null
}

const createSpan = createOpenTelemetryWrapper(tracer, {
  includeSource: true
})

export function validateIpV4(s?: string | null): boolean {
  if (s == null) return true // localhost

  const match = s.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g)
  const ip = match?.[0] ?? ''
  const validIps = process.env.NAT_ADDRESSES?.split(',') ?? []
  return validIps.includes(ip)
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
  plugins: [
    TracingPlugin,
    ScopeAuthPlugin,
    PrismaPlugin,
    DirectivesPlugin,
    FederationPlugin
  ],
  scopeAuth: {
    authorizeOnSubscribe: true,
    authScopes: async (context: Context) => ({
      isAuthenticated: context.currentUser != null,
      isCurrentUser: (id) => context.currentUser?.id === id,
      isSuperAdmin: async () => {
        const user = await prisma.user.findUnique({
          where: { userId: context.currentUser?.id }
        })
        return user?.superAdmin ?? false
      },
      isValidInterOp: isValidInterOp(context.interopToken, context.ipAddress)
    })
  },
  tracing: {
    default: (config) => isRootField(config),
    wrap: (resolver, options) => createSpan(resolver, options)
  },
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})

builder.queryType({})
builder.mutationType({})
