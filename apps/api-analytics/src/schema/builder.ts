import SchemaBuilder from '@pothos/core'
import AuthzPlugin from '@pothos/plugin-authz'
import DirectivesPlugin from '@pothos/plugin-directives'
import ErrorsPlugin from '@pothos/plugin-errors'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'

import { Prisma, users as User } from '.prisma/api-analytics-client'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'
import { rules } from '../lib/rules'

const PrismaPlugin = pluginName

export interface Context {
  currentUser?: User
  apiKey?: string
}

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
    AuthzPlugin,
    ErrorsPlugin,
    DirectivesPlugin,
    PrismaPlugin,
    FederationPlugin
  ],
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})
