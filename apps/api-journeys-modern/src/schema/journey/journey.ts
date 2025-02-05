import { createSchema } from 'graphql-yoga'

import {
  JourneyMenuButtonIcon,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '@prisma/client'

import { ai } from '../../scripts/ai'
import { builder } from '../builder'

const Journey = builder.prismaObject('Journey', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
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
    status: t.expose('status', { type: JourneyStatus }),
    seoTitle: t.exposeString('seoTitle', { nullable: true }),
    seoDescription: t.exposeString('seoDescription', { nullable: true }),
    template: t.exposeBoolean('template'),
    strategySlug: t.exposeString('strategySlug', { nullable: true }),
    plausibleToken: t.exposeString('plausibleToken', { nullable: true }),
    website: t.exposeBoolean('website'),
    showShareButton: t.exposeBoolean('showShareButton'),
    showLikeButton: t.exposeBoolean('showLikeButton'),
    showDislikeButton: t.exposeBoolean('showDislikeButton'),
    displayTitle: t.exposeString('displayTitle', { nullable: true }),
    showHosts: t.exposeBoolean('showHosts'),
    showChatButtons: t.exposeBoolean('showChatButtons'),
    showReactionButtons: t.exposeBoolean('showReactionButtons'),
    showLogo: t.exposeBoolean('showLogo'),
    showMenu: t.exposeBoolean('showMenu'),
    showDisplayTitle: t.exposeBoolean('showDisplayTitle'),
    menuButtonIcon: t.expose('menuButtonIcon', {
      type: JourneyMenuButtonIcon,
      nullable: true
    }),
    themeMode: t.expose('themeMode', { type: ThemeMode }),
    themeName: t.expose('themeName', { type: ThemeName }),
    // Relations would be defined here
    language: t.relation('language'),
    host: t.relation('host', { nullable: true }),
    team: t.relation('team', { nullable: true }),
    tags: t.relation('tags'),
    journeyCollections: t.relation('journeyCollections')
  }),
  shareable: true
})

builder.queryField('generateJourney', (t) =>
  t.field({
    type: Journey,
    smartSubscription: true,
    args: {
      userInput: t.arg.string({ required: true })
    },
    subscribe: (subscriptions, journey: { id: string }, args, ctx, info) => {
      subscriptions.register(`generateJourney/${journey.id}`)
    },
    resolve: async (_parent, { userInput }) => {
      const journey = await ai(userInput)
      // Ensure the AI returns the full Journey type
      return journey
    }
  })
)

export const schema = createSchema({
  typeDefs: builder.toSchema()
})
