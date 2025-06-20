// eslint-disable-next-line import/order -- Must be imported first
import { tracer } from '@core/yoga/tracer'

import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing'
import WithInputPlugin from '@pothos/plugin-with-input'
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry'

import { LanguageRole, Prisma } from '.prisma/api-languages-client'
import { User } from '@core/yoga/firebaseClient'
import { InteropContext } from '@core/yoga/interop'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'

const PrismaPlugin = pluginName

interface BaseContext {
  type: string
}

interface PublicContext extends BaseContext {
  type: 'public'
}

interface AuthenticatedContext extends BaseContext {
  type: 'authenticated'
  user: User
  currentRoles: LanguageRole[]
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
  AuthScopes: {
    isAuthenticated: boolean
    isPublisher: boolean
  }
  AuthContexts: {
    isAuthenticated: Extract<Context, { type: 'authenticated' }>
    isPublisher: Extract<Context, { type: 'authenticated' }>
    isValidInterop: Extract<Context, { type: 'interop' }>
  }
  PrismaTypes: PrismaTypes
  Scalars: {
    ID: { Input: string; Output: number | string }
  }
}>({
  plugins: [
    TracingPlugin,
    ScopeAuthPlugin,
    PrismaPlugin,
    DirectivesPlugin,
    FederationPlugin,
    WithInputPlugin
  ],
  tracing: {
    default: (config) => isRootField(config),
    wrap: (resolver, options) => createSpan(resolver, options)
  },
  scopeAuth: {
    authScopes: async (context: Context) => {
      switch (context.type) {
        case 'authenticated':
          return {
            isAuthenticated: true,
            isPublisher: context.currentRoles.includes(LanguageRole.publisher),
            isValidInterop: false
          }
        case 'interop':
          return {
            isAuthenticated: false,
            isPublisher: false,
            isValidInterop: true
          }
        default:
          return {
            isAuthenticated: false,
            isPublisher: false,
            isValidInterop: false
          }
      }
    }
  },
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})

builder.queryType({})

builder.mutationType({})
