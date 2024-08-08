import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import ErrorsPlugin from '@pothos/plugin-errors'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'

import { Prisma, users as User } from '.prisma/api-analytics-client'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'

const PrismaPlugin = pluginName

export interface Context {
  currentUser?: User
  apiKey?: string
}

export const builder = new SchemaBuilder<{
  Context: Context
  PrismaTypes: PrismaTypes
  Scalars: {
    ID: {
      Input: string
      Output: string | number | bigint
    }
  }
  AuthScopes: {
    IsAuthenticated: boolean
  }
}>({
  plugins: [
    ScopeAuthPlugin,
    ErrorsPlugin,
    DirectivesPlugin,
    PrismaPlugin,
    FederationPlugin
  ],
  scopeAuth: {
    authorizeOnSubscribe: true,
    authScopes(context) {
      return {
        IsAuthenticated: context.currentUser != null
      }
    }
  },
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})
