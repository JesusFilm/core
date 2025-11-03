// eslint-disable-next-line import/order -- Must be imported first
import { tracer } from '@core/yoga/tracer'

import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import RelayPlugin from '@pothos/plugin-relay'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing'
import WithInputPlugin from '@pothos/plugin-with-input'
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry'
import {
  DateResolver,
  DateTimeISOResolver,
  DateTimeResolver
} from 'graphql-scalars'
import { GraphQLJSONObject } from 'graphql-type-json'

import type PrismaTypes from '@core/prisma/journeys/__generated__/pothos-types'
import { Prisma, Role, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'
import { InteropContext } from '@core/yoga/interop'

interface BaseContext {
  type: string
}

interface PublicContext extends BaseContext {
  type: 'public'
}

interface AuthenticatedContext extends BaseContext {
  type: 'authenticated'
  user: User
  currentRoles: Role[]
}

interface LocalInteropContext extends BaseContext, InteropContext {
  type: 'interop'
}

export type Context = LocalInteropContext | PublicContext | AuthenticatedContext

const PrismaPlugin = pluginName

const createSpan = createOpenTelemetryWrapper(tracer, {
  includeSource: true
})

export const builder = new SchemaBuilder<{
  Context: Context
  AuthScopes: {
    isAuthenticated: boolean
    isPublisher: boolean
    isValidInterop: boolean
  }
  AuthContexts: {
    isAuthenticated: Extract<Context, { type: 'authenticated' }>
    isPublisher: Extract<Context, { type: 'authenticated' }>
    isValidInterop: Extract<Context, { type: 'interop' }>
  }
  PrismaTypes: PrismaTypes
  Scalars: {
    Date: { Input: Date; Output: Date }
    DateTimeISO: { Input: Date; Output: Date }
    DateTime: { Input: Date; Output: Date }
    ID: { Input: string; Output: number | string }
    JourneyStatus: { Input: string; Output: string }
    Json: { Input: unknown; Output: unknown }
  }
}>({
  plugins: [
    TracingPlugin,
    ScopeAuthPlugin,
    PrismaPlugin,
    RelayPlugin,
    WithInputPlugin,
    DirectivesPlugin,
    FederationPlugin
  ],
  tracing: {
    default: (config) => isRootField(config),
    wrap: (resolver, options) => createSpan(resolver, options)
  },
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
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
  }
})

builder.queryType({})
builder.mutationType({})
builder.subscriptionType({})
builder.addScalarType('Date', DateResolver)
builder.addScalarType('DateTimeISO', DateTimeISOResolver)
builder.addScalarType('DateTime', DateTimeResolver)
builder.addScalarType('Json', GraphQLJSONObject)
