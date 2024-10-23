import { GraphQLError } from 'graphql'

import { Prisma, UserJourneyRole } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language'
import { Tag } from '../tag'

import { JourneyMenuButtonIcon } from './enums/journeyMenuButtonIcon'
import { JourneyStatus } from './enums/journeyStatus'
import { ThemeMode } from './enums/themeMode'
import { ThemeName } from './enums/themeName'

builder.prismaObject('Journey', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title', {
      description: 'private title for creators'
    }),
    language: t.field({
      type: Language,
      resolve: ({ languageId: id }) => ({ id })
    }),
    themeMode: t.expose('themeMode', { type: ThemeMode, nullable: true }),
    themeName: t.expose('themeName', { type: ThemeName, nullable: true }),
    description: t.exposeString('description', { nullable: true }),
    creatorDescription: t.exposeString('creatorDescription', {
      nullable: true
    }),
    slug: t.exposeString('slug'),
    archivedAt: t.expose('archivedAt', { type: 'DateTime', nullable: true }),
    deletedAt: t.expose('deletedAt', { type: 'DateTime', nullable: true }),
    publishedAt: t.expose('publishedAt', { type: 'DateTime', nullable: true }),
    trashedAt: t.expose('trashedAt', { type: 'DateTime', nullable: true }),
    featuredAt: t.expose('featuredAt', { type: 'DateTime', nullable: true }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    status: t.expose('status', { type: JourneyStatus, nullable: true }),
    seoTitle: t.exposeString('seoTitle', {
      nullable: true,
      description: 'title for seo and sharing'
    }),
    seoDescription: t.exposeString('seoDescription', { nullable: true }),
    template: t.exposeBoolean('template', { nullable: true }),
    host: t.relation('host', { nullable: true }),
    team: t.relation('team'),
    strategySlug: t.exposeString('strategySlug', { nullable: true }),
    tags: t.field({
      resolve: async (parent) => {
        const journeyTags = await prisma.journeyTag.findMany({
          where: { journeyId: parent.id },
          select: { tagId: true }
        })
        return journeyTags.map(({ tagId: id }) => ({ id }))
      },
      type: [Tag]
    }),
    journeyCollections: t.prismaField({
      type: ['JourneyCollection'],
      resolve: async (query, parent) => {
        return await prisma.journeyCollection.findMany({
          ...query,
          where: {
            journeyCollectionJourneys: {
              some: { journeyId: parent.id }
            }
          }
        })
      }
    }),
    plausibleToken: t.exposeString('plausibleToken', {
      nullable: true,
      description: 'used in a plausible share link to embed report'
    }),
    website: t.exposeBoolean('website', { nullable: true }),
    showShareButton: t.exposeBoolean('showShareButton', { nullable: true }),
    showLikeButton: t.exposeBoolean('showLikeButton', { nullable: true }),
    showDislikeButton: t.exposeBoolean('showDislikeButton', { nullable: true }),
    displayTitle: t.exposeString('displayTitle', {
      nullable: true,
      description: 'public title for viewers'
    }),
    showHosts: t.exposeBoolean('showHosts', { nullable: true }),
    showChatButtons: t.exposeBoolean('showChatButtons', { nullable: true }),
    showReactionButtons: t.exposeBoolean('showReactionButtons', {
      nullable: true
    }),
    showLogo: t.exposeBoolean('showLogo', { nullable: true }),
    showMenu: t.exposeBoolean('showMenu', { nullable: true }),
    showDisplayTitle: t.exposeBoolean('showDisplayTitle', { nullable: true }),
    menuButtonIcon: t.expose('menuButtonIcon', {
      type: JourneyMenuButtonIcon,
      nullable: true
    })
  })
})

builder.queryFields((t) => ({
  adminJourneys: t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['Journey'],
    args: {
      status: t.arg({ type: [JourneyStatus] }),
      template: t.arg.boolean(),
      teamId: t.arg.string(),
      useLastActiveTeamId: t.arg.boolean({
        description:
          'Use Last Active Team Id from JourneyProfile (if null will error)'
      })
    },

    resolve: async (
      query,
      _parent,
      { status, template, teamId, useLastActiveTeamId },
      { user }
    ) => {
      const filter: Prisma.JourneyWhereInput = {}
      if (useLastActiveTeamId === true) {
        const profile = await prisma.journeyProfile.findUnique({
          where: { userId: user.id }
        })
        if (profile == null)
          throw new GraphQLError('journey profile not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        filter.teamId = profile.lastActiveTeamId ?? undefined
      }
      if (teamId != null) {
        filter.teamId = teamId
      } else if (template !== true && filter.teamId == null) {
        // if not looking for templates then only return journeys where:
        //   1. the user is an owner or editor
        //   2. not a member of the team
        filter.userJourneys = {
          some: {
            userId: user.id,
            role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
          }
        }
        filter.team = {
          userTeams: {
            none: {
              userId: user.id
            }
          }
        }
      }
      if (template != null) filter.template = template
      if (status != null) filter.status = { in: status }
      return await prisma.journey.findMany({
        ...query,
        where: {
          AND: [accessibleJourneys, filter]
        }
      })
    }
  })
}))
