// eslint-disable-next-line import/order -- Must be imported first
import { tracer } from '@core/yoga/tracer'

import SchemaBuilder from '@pothos/core'
import DataloaderPlugin from '@pothos/plugin-dataloader'
import DirectivesPlugin from '@pothos/plugin-directives'
import ErrorsPlugin from '@pothos/plugin-errors'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import RelayPlugin from '@pothos/plugin-relay'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing'
import WithInputPlugin from '@pothos/plugin-with-input'
import ZodPlugin from '@pothos/plugin-zod'
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry'
import { BigIntResolver, DateResolver, DateTimeResolver } from 'graphql-scalars'

import type PrismaTypes from '@core/prisma/media/__generated__/pothos-types'
import { MediaRole, Prisma, prisma } from '@core/prisma/media/client'
import { User } from '@core/yoga/firebaseClient'
import { InteropContext } from '@core/yoga/interop'

const PrismaPlugin = pluginName

interface BaseContext {
  type: string
  clientName?: string
}

interface PublicContext extends BaseContext {
  type: 'public'
}

interface AuthenticatedContext extends BaseContext {
  type: 'authenticated'
  user: User
  currentRoles: MediaRole[]
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
    Date: { Input: Date; Output: Date }
    DateTime: { Input: Date; Output: Date }
    ID: { Input: string; Output: number | string }
    BigInt: { Input: number | bigint; Output: number | bigint }
  }
}>({
  plugins: [
    TracingPlugin,
    ScopeAuthPlugin,
    ErrorsPlugin,
    PrismaPlugin,
    RelayPlugin,
    ZodPlugin,
    WithInputPlugin,
    DirectivesPlugin,
    FederationPlugin,
    DataloaderPlugin
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
            isPublisher: context.currentRoles.includes('publisher'),
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
  },
  relay: {
    pageInfoTypeOptions: {
      shareable: true
    }
  }
})

builder.addScalarType('Date', DateResolver)
builder.addScalarType('DateTime', DateTimeResolver)
builder.addScalarType('BigInt', BigIntResolver)

builder.queryType({})

builder.mutationType({})
