import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
// eslint-disable-next-line import/no-named-as-default
import PrismaPlugin from '@pothos/plugin-prisma'

import type PrismaTypes from '../__generated__/pothos-types'
import { db } from '../db'

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Scalars: {
    ID: { Input: string; Output: number | string }
  }
}>({
  plugins: [DirectivesPlugin, PrismaPlugin, FederationPlugin],
  prisma: {
    client: db,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})
