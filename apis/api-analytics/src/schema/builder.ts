// eslint-disable-next-line import/order -- Must be imported first
import { tracer } from '@core/yoga/tracer'

import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import ErrorsPlugin from '@pothos/plugin-errors'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing'
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry'

import type PrismaTypes from '@core/prisma/analytics/__generated__/pothos-types'
import { Prisma, users as User, prisma } from '@core/prisma/analytics/client'

const PrismaPlugin = pluginName

export interface Context {
  currentUser?: User
  apiKey?: string
}

const createSpan = createOpenTelemetryWrapper(tracer, {
  includeSource: true
})

export const builder = new SchemaBuilder<{
  Context: Context
  AuthScopes: {
    isAuthenticated: boolean
  }
  AuthContexts: {
    isAuthenticated: Context & { currentUser: User; apiKey: string }
  }
  PrismaTypes: PrismaTypes
  Scalars: {
    ID: {
      Input: string
      Output: string | number | bigint
    }
  }
}>({
  plugins: [
    TracingPlugin,
    ScopeAuthPlugin,
    ErrorsPlugin,
    DirectivesPlugin,
    PrismaPlugin,
    FederationPlugin
  ],
  scopeAuth: {
    authScopes: async (context) => ({
      isAuthenticated: context.currentUser != null
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
