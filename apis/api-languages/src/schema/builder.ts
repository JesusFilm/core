// eslint-disable-next-line import/order -- Must be imported first
import { tracer } from '@core/yoga/tracer'

import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import TracingPlugin, { isRootField } from '@pothos/plugin-tracing'
import { createOpenTelemetryWrapper } from '@pothos/tracing-opentelemetry'

import { Prisma } from '.prisma/api-languages-client'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'

const PrismaPlugin = pluginName

const createSpan = createOpenTelemetryWrapper(tracer, {
  includeSource: true
})

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Scalars: {
    ID: { Input: string; Output: number | string }
  }
}>({
  plugins: [TracingPlugin, PrismaPlugin, DirectivesPlugin, FederationPlugin],
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
