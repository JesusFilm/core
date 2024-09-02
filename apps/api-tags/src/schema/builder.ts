import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import { DateResolver } from 'graphql-scalars'

import { Prisma } from '.prisma/api-tags-client'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'

const PrismaPlugin = pluginName

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Scalars: {
    Date: { Input: Date; Output: Date }
    ID: { Input: string; Output: number | string }
  }
}>({
  plugins: [PrismaPlugin, DirectivesPlugin, FederationPlugin],
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})

builder.addScalarType('Date', DateResolver, {})

builder.queryType({})
