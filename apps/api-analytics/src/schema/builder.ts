// eslint-disable-next-line import/order -- Must be imported first
import { tracer } from '@core/yoga/tracer'

import SchemaBuilder from '@pothos/core'
import AuthzPlugin from '@pothos/plugin-authz'
import DirectivesPlugin from '@pothos/plugin-directives'
import ErrorsPlugin from '@pothos/plugin-errors'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing'
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry'

import { Prisma, users as User } from '.prisma/api-analytics-client'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'
import { rules } from '../lib/rules'

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
  AuthZRule: keyof typeof rules
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
    AuthzPlugin,
    ErrorsPlugin,
    DirectivesPlugin,
    PrismaPlugin,
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
  }
})
