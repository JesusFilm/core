// eslint-disable-next-line import/order -- Must be imported first
import { tracer } from '@core/yoga/tracer'

import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import ErrorsPlugin from '@pothos/plugin-errors'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing'
import WithInputPlugin from '@pothos/plugin-with-input'
import ZodPlugin from '@pothos/plugin-zod'
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry'
import { DateResolver, JSONResolver } from 'graphql-scalars'

import { MediaRole, Prisma } from '.prisma/api-media-client'
import { User } from '@core/yoga/firebaseClient'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'

const PrismaPlugin = pluginName

export interface Context {
  currentRoles: MediaRole[]
  user: User | null
}

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
    isAuthenticated: Context & { user: User }
    isPublisher: Context & { user: User }
  }
  PrismaTypes: PrismaTypes
  Scalars: {
    Date: { Input: Date; Output: Date }
    JSON: { Input: Record<string, unknown>; Output: Record<string, unknown> }
    ID: { Input: string; Output: number | string }
  }
}>({
  plugins: [
    TracingPlugin,
    ScopeAuthPlugin,
    ErrorsPlugin,
    PrismaPlugin,
    ZodPlugin,
    WithInputPlugin,
    DirectivesPlugin,
    FederationPlugin
  ],
  errors: {
    defaultTypes: [Error]
  },
  tracing: {
    default: (config) => isRootField(config),
    wrap: (resolver, options) => createSpan(resolver, options)
  },
  scopeAuth: {
    authScopes: async (context) => ({
      isAuthenticated: context.user != null,
      isPublisher: context.currentRoles.includes('publisher') ?? false
    })
  },
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})

builder.addScalarType('Date', DateResolver)
builder.addScalarType('JSON', JSONResolver)

builder.queryType({})

builder.mutationType({})
