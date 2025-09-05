// eslint-disable-next-line import/order -- Must be imported first
import { tracer } from '@core/yoga/tracer'

import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing'
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry'

import type PrismaTypes from '@core/prisma/users/__generated__/pothos-types'
import { Prisma, prisma } from '@core/prisma/users/client'
import { User } from '@core/yoga/firebaseClient'
import { InteropContext } from '@core/yoga/interop'

const PrismaPlugin = pluginName

interface BaseContext {
  type: string
}

interface PublicContext extends BaseContext {
  type: 'public'
}

interface AuthenticatedContext extends BaseContext {
  type: 'authenticated'
  currentUser: User
}

interface LocalInteropContext extends BaseContext, InteropContext {
  type: 'interop'
}

export type Context = LocalInteropContext | PublicContext | AuthenticatedContext

const createSpan = createOpenTelemetryWrapper(tracer, {
  includeSource: true
})

export const builder = new SchemaBuilder<{
  Context: Context
  PrismaTypes: PrismaTypes
  Scalars: {
    ID: { Input: string; Output: number | string }
  }
  AuthScopes: {
    isAuthenticated: boolean
    isSuperAdmin: boolean
    isValidInterop: boolean
  }
  AuthContexts: {
    isAuthenticated: Extract<Context, { type: 'authenticated' }>
    isSuperAdmin: Extract<Context, { type: 'authenticated' }>
    isValidInterop: Extract<Context, { type: 'interop' }>
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
    authScopes: async (context: Context) => {
      switch (context.type) {
        case 'authenticated':
          return {
            isAuthenticated: true,
            isSuperAdmin:
              (
                await prisma.user.findUnique({
                  where: { userId: context.currentUser.id }
                })
              )?.superAdmin ?? false,
            isValidInterop: false
          }
        case 'interop':
          return {
            isAuthenticated: false,
            isSuperAdmin: false,
            isValidInterop: true
          }
        default:
          return {
            isAuthenticated: false,
            isSuperAdmin: false,
            isValidInterop: false
          }
      }
    }
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
