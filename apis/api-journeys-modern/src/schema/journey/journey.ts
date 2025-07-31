import { prisma } from '../../lib/prisma'
import { ThemeMode } from '../block/card/enums/themeMode'
import { ThemeName } from '../block/card/enums/themeName'
import { ImageBlock } from '../block/image'
import { builder } from '../builder'
import { Language } from '../language'

import { JourneyMenuButtonIcon } from './enums'

// Define external references for federated types
const Tag = builder.externalRef('Tag', builder.selection<{ id: string }>('id'))

Tag.implement({
  externalFields: (t) => ({ id: t.id({ nullable: false }) }),
  fields: (t) => ({
    // No additional fields needed - this is just the external reference
  })
})

export const JourneyRef = builder.prismaObject('Journey', {
  fields: (t) => ({
    id: t.exposeID('id', { shareable: true, nullable: false }),
    title: t.exposeString('title', {
      shareable: true,
      nullable: false,
      description: 'private title for creators'
    }),
    description: t.exposeString('description', {
      nullable: true,
      shareable: true
    }),
    slug: t.exposeString('slug', { shareable: true, nullable: false }),
    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      shareable: true,
      nullable: false
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      shareable: true,
      nullable: false
    }),
    status: t.field({
      type: 'JourneyStatus',
      nullable: false,
      shareable: true,
      resolve: (journey) => journey.status
    }),
    languageId: t.exposeString('languageId', {
      shareable: true,
      nullable: false
    }),
    language: t.field({
      type: Language,
      shareable: true,
      nullable: false,
      resolve: (journey) => ({ id: journey.languageId ?? '529' })
    }),
    blocks: t.relation('blocks', {
      shareable: true,
      nullable: true
    }),
    chatButtons: t.relation('chatButtons'),

    // Date/Timestamp Fields
    archivedAt: t.expose('archivedAt', {
      type: 'DateTime',
      nullable: true
    }),
    deletedAt: t.expose('deletedAt', {
      type: 'DateTime',
      nullable: true
    }),
    publishedAt: t.expose('publishedAt', {
      type: 'DateTime',
      nullable: true
    }),
    trashedAt: t.expose('trashedAt', {
      type: 'DateTime',
      nullable: true
    }),
    featuredAt: t.expose('featuredAt', {
      type: 'DateTime',
      nullable: true
    }),

    // Theme and Display Fields
    themeMode: t.field({
      type: ThemeMode,
      nullable: false,
      resolve: (journey) => journey.themeMode ?? 'light'
    }),
    themeName: t.field({
      type: ThemeName,
      nullable: false,
      resolve: (journey) => journey.themeName ?? 'base'
    }),
    seoTitle: t.exposeString('seoTitle', {
      nullable: true,
      description: 'title for seo and sharing'
    }),
    seoDescription: t.exposeString('seoDescription', {
      nullable: true
    }),
    template: t.exposeBoolean('template', {
      nullable: true
    }),

    // Image and Block References
    primaryImageBlock: t.relation('primaryImageBlock', {
      nullable: true,
      type: ImageBlock
    }),
    creatorImageBlock: t.relation('creatorImageBlock', {
      nullable: true
    }),
    logoImageBlock: t.relation('logoImageBlock', {
      nullable: true
    }),
    menuStepBlock: t.relation('menuStepBlock', {
      nullable: true
    }),

    // Creator and Content Fields
    creatorDescription: t.exposeString('creatorDescription', {
      nullable: true
    }),

    // Display Control Fields
    website: t.exposeBoolean('website', {
      nullable: true
    }),
    showShareButton: t.exposeBoolean('showShareButton', {
      nullable: true
    }),
    showLikeButton: t.exposeBoolean('showLikeButton', {
      nullable: true
    }),
    showDislikeButton: t.exposeBoolean('showDislikeButton', {
      nullable: true
    }),
    displayTitle: t.exposeString('displayTitle', {
      nullable: true,
      description: 'public title for viewers'
    }),
    showHosts: t.exposeBoolean('showHosts', {
      nullable: true
    }),
    showChatButtons: t.exposeBoolean('showChatButtons', {
      nullable: true
    }),
    showReactionButtons: t.exposeBoolean('showReactionButtons', {
      nullable: true
    }),
    showLogo: t.exposeBoolean('showLogo', {
      nullable: true
    }),
    showMenu: t.exposeBoolean('showMenu', {
      nullable: true
    }),
    showDisplayTitle: t.exposeBoolean('showDisplayTitle', {
      nullable: true
    }),

    // UI Configuration Fields
    menuButtonIcon: t.field({
      type: JourneyMenuButtonIcon,
      nullable: true,
      resolve: (journey) => journey.menuButtonIcon
    }),
    socialNodeX: t.exposeInt('socialNodeX', {
      nullable: true
    }),
    socialNodeY: t.exposeInt('socialNodeY', {
      nullable: true
    }),

    // Relationship and Metadata Fields
    host: t.relation('host', {
      nullable: true
    }),
    team: t.relation('team'),
    tags: t.field({
      type: [Tag],
      nullable: false,
      resolve: async (journey) => {
        const journeyTags = await prisma.journeyTag.findMany({
          where: { journeyId: journey.id }
        })
        return journeyTags.map((jt) => ({ id: jt.tagId }))
      }
    }),
    userJourneys: t.relation('userJourneys', {
      nullable: true
    }),
    // journeyCollections field will be added via extension in journeyCollection module
    strategySlug: t.exposeString('strategySlug', {
      nullable: true
    }),
    plausibleToken: t.exposeString('plausibleToken', {
      nullable: true,
      description: 'used in a plausible share link to embed report'
    }),
    fromTemplateId: t.exposeString('fromTemplateId', {
      nullable: true
    }),
    journeyTheme: t.relation('journeyTheme', {
      nullable: true
    })
  })
})

// Register as a federated entity
builder.asEntity(JourneyRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async (ref) => {
    return prisma.journey.findUnique({
      where: { id: ref.id }
    })
  }
})

