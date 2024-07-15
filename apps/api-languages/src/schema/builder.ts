import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
import PrismaPlugin from '@pothos/plugin-prisma'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'
import { Prisma } from '.prisma/api-languages-client'

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Scalars: {
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

builder.queryType({})
