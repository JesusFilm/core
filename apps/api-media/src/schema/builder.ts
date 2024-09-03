import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import { DateResolver } from 'graphql-scalars'

import { Prisma, VideoRole } from '.prisma/api-media-client'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'

const PrismaPlugin = pluginName

export interface Context {
  currentRoles?: VideoRole[] | null
  userId: string | null
}

export const builder = new SchemaBuilder<{
  Context: Context
  AuthScopes: {
    isAuthenticated: boolean
    isPublisher: boolean
  }
  PrismaTypes: PrismaTypes
  Scalars: {
    Date: { Input: Date; Output: Date }
    ID: { Input: string; Output: number | string }
  }
}>({
  plugins: [ScopeAuthPlugin, PrismaPlugin, DirectivesPlugin, FederationPlugin],
  scopeAuth: {
    authScopes: async (context) => ({
      isAuthenticated: context.userId != null,
      isPublisher: context.currentRoles?.includes('publisher') ?? false
    })
  },
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})

builder.addScalarType('Date', DateResolver, {})

builder.queryType({})

builder.mutationType({})
