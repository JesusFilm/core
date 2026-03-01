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
import { Prisma, prisma } from '@core/prisma/journeys/client'

import { AuthScopes, Context, authScopes } from './authScopes'

const PrismaPlugin = pluginName

const createSpan = createOpenTelemetryWrapper(tracer, {
  includeSource: true
})

export const builder = new SchemaBuilder<{
  Context: Context
  AuthScopes: AuthScopes
  AuthContexts: {
    isAuthenticated: Extract<Context, { type: 'authenticated' }>
    isAnonymous: Extract<Context, { type: 'authenticated' }>
    isInTeam: Extract<Context, { type: 'authenticated' }>
    isIntegrationOwner: Extract<Context, { type: 'authenticated' }>
    isTeamManager: Extract<Context, { type: 'authenticated' }>
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
    authScopes
  }
})

builder.queryType({})
builder.mutationType({})
builder.subscriptionType({})
builder.addScalarType('Date', DateResolver)
builder.addScalarType('DateTimeISO', DateTimeISOResolver)
builder.addScalarType('DateTime', DateTimeResolver)
builder.addScalarType('Json', GraphQLJSONObject)
