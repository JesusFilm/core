import SchemaBuilder from '@pothos/core'
import DirectivesPlugin from '@pothos/plugin-directives'
import FederationPlugin from '@pothos/plugin-federation'
import pluginName from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'

import {
  Prisma,
  VideoAdminUser,
  VideoAdminUserRole
} from '.prisma/api-videos-client'
import { User } from '@core/yoga/firebaseClient'

import type PrismaTypes from '../__generated__/pothos-types'
import { prisma } from '../lib/prisma'

const PrismaPlugin = pluginName

export interface Context {
  token?: string | null
  currentUser?: User | null
  currentVideoUser?: VideoAdminUser | null
}

export const builder = new SchemaBuilder<{
  Context: Context
  PrismaTypes: PrismaTypes
  Scalars: {
    ID: { Input: string; Output: number | string }
  }
  AuthScopes: {
    isAuthenticated: boolean
    isAdmin: boolean
    isYoutubeMember: boolean
    isYoutubeAdmin: boolean
    isCoreMember: boolean
    isCoreAdmin: boolean
  }
}>({
  plugins: [ScopeAuthPlugin, PrismaPlugin, DirectivesPlugin, FederationPlugin],
  authScopes: async (context: Context) => ({
    isAuthenticated: context.currentVideoUser != null,
    isAdmin: context.currentVideoUser?.roles.includes('admin') ?? false,
    isYoutubeMember: [
      VideoAdminUserRole.youtubeMember,
      VideoAdminUserRole.youtubeAdmin,
      VideoAdminUserRole.admin
    ].some((role) => context.currentVideoUser?.roles.includes(role)),
    isYoutubeAdmin: [
      VideoAdminUserRole.youtubeAdmin,
      VideoAdminUserRole.admin
    ].some((role) => context.currentVideoUser?.roles.includes(role)),
    isCoreMember: [
      VideoAdminUserRole.coreMember,
      VideoAdminUserRole.coreAdmin,
      VideoAdminUserRole.admin
    ].some((role) => context.currentVideoUser?.roles.includes(role)),
    isCoreAdmin: [VideoAdminUserRole.coreAdmin, VideoAdminUserRole.admin].some(
      (role) => context.currentVideoUser?.roles.includes(role)
    )
  }),
  scopeAuthOptions: {
    authorizeOnSubscribe: true
  },
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn'
  }
})

builder.queryType({})
