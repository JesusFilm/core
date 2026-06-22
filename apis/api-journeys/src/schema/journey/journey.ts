import {
  UserJourneyRole,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'
import { journeySimpleSchema } from '@core/shared/ai/journeySimpleTypes'

import { Block } from '../block/block'
import { ThemeMode } from '../block/card/enums/themeMode'
import { ThemeName } from '../block/card/enums/themeName'
import { ImageBlock } from '../block/image'
import { StepBlock } from '../block/step'
import { builder } from '../builder'
import { Language } from '../language'
import { UserJourneyRef } from '../userJourney/userJourney'

import { JourneyMenuButtonIcon } from './enums'
import { Action, journeyAcl } from './journey.acl'
import { getSimpleJourney, updateSimpleJourney } from './simple'

const Tag = builder.externalRef('Tag', builder.selection<{ id: string }>('id'))

Tag.implement({
  externalFields: (t) => ({ id: t.id({ nullable: false }) }),
  fields: (t) => ({
    // No additional fields needed - this is just the external reference
  })
})

export const JourneyRef = builder.prismaObject('Journey', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { shareable: true, nullable: false }),
    title: t.exposeString('title', {
      nullable: false,
      description: 'private title for creators'
    }),
    description: t.exposeString('description', {
      nullable: true
    }),
    slug: t.exposeString('slug', { shareable: true, nullable: false }),
    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      nullable: false
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      nullable: false
    }),
    status: t.field({
      type: 'JourneyStatus',
      nullable: false,
      resolve: (journey) => journey.status
    }),
    languageId: t.exposeString('languageId', {
      nullable: false
    }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: (journey) => ({ id: journey.languageId ?? '529' })
    }),
    blocks: t.field({
      type: [Block],
      nullable: true,
      resolve: async (journey) => {
        const excludeIds: string[] = []
        if (journey.primaryImageBlockId != null)
          excludeIds.push(journey.primaryImageBlockId)
        if (journey.creatorImageBlockId != null)
          excludeIds.push(journey.creatorImageBlockId)
        if (journey.logoImageBlockId != null)
          excludeIds.push(journey.logoImageBlockId)

        const blocks = await prisma.block.findMany({
          where: {
            journeyId: journey.id,
            deletedAt: null,
            ...(excludeIds.length > 0
              ? { id: { notIn: excludeIds } }
              : undefined)
          },
          orderBy: { parentOrder: 'asc' },
          include: { action: true }
        })

        let filtered = blocks
        let prevLength: number
        do {
          prevLength = filtered.length
          const ids = new Set(filtered.map((b) => b.id))
          filtered = filtered.filter(
            (b) => b.parentBlockId == null || ids.has(b.parentBlockId)
          )
        } while (filtered.length !== prevLength)

        return filtered
      }
    }),
    chatButtons: t.relation('chatButtons', {
      nullable: false
    }),

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
      nullable: true,
      type: ImageBlock
    }),
    logoImageBlock: t.relation('logoImageBlock', {
      nullable: true,
      type: ImageBlock
    }),
    menuStepBlock: t.relation('menuStepBlock', {
      nullable: true,
      type: StepBlock
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
    showAssistant: t.exposeBoolean('showAssistant', {
      nullable: true,
      deprecationReason:
        'Use CardBlock.showAssistant. Removal tracked in NES-1624.'
    }),
    customizable: t.exposeBoolean('customizable', {
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
    userJourneys: t.field({
      type: [UserJourneyRef],
      nullable: true,
      resolve: async (journey, _args, context) => {
        if (context.type !== 'authenticated') return []

        const userJourneys = await prisma.userJourney.findMany({
          where: { journeyId: journey.id },
          include: {
            journey: {
              include: {
                userJourneys: true,
                team: { include: { userTeams: true } }
              }
            }
          }
        })

        const userId = context.user.id
        return userJourneys.filter((uj) => {
          const isTeamMember = uj.journey?.team?.userTeams.some(
            (ut) =>
              ut.userId === userId &&
              (ut.role === UserTeamRole.manager ||
                ut.role === UserTeamRole.member)
          )
          if (isTeamMember === true) return true

          const isJourneyOwnerOrEditor = uj.journey?.userJourneys?.some(
            (j) =>
              j.userId === userId &&
              (j.role === UserJourneyRole.owner ||
                j.role === UserJourneyRole.editor)
          )
          return isJourneyOwnerOrEditor === true
        })
      }
    }),
    // journeyCollections field will be added via extension in journeyCollection module
    strategySlug: t.exposeString('strategySlug', {
      nullable: true
    }),
    templateSite: t.exposeBoolean('templateSite', {
      nullable: true,
      description: 'used to see if a template has a site created for it'
    }),
    plausibleToken: t.field({
      type: 'String',
      nullable: true,
      description: 'used in a plausible share link to embed report',
      resolve: async (journey, _args, context) => {
        if (journey.plausibleToken == null) return null
        if (context.type !== 'authenticated') return null

        const journeyWithAcl = await prisma.journey.findUnique({
          where: { id: journey.id },
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } }
          }
        })
        if (journeyWithAcl == null) return null
        if (!journeyAcl(Action.Update, journeyWithAcl, context.user))
          return null

        return journey.plausibleToken
      }
    }),
    fromTemplateId: t.exposeString('fromTemplateId', {
      nullable: true
    }),
    journeyCustomizationDescription: t.exposeString(
      'journeyCustomizationDescription',
      { nullable: true }
    ),
    journeyCustomizationFields: t.relation('journeyCustomizationFields', {
      nullable: false
    }),
    journeyTheme: t.relation('journeyTheme', {
      nullable: true
    }),
    blockTypenames: t.field({
      type: ['String'],
      nullable: false,
      description:
        'Distinct block typenames present on this journey (non-deleted blocks only)',
      resolve: async (journey) => {
        const blocks = await prisma.block.findMany({
          where: { journeyId: journey.id, deletedAt: null },
          select: { typename: true },
          distinct: ['typename']
        })
        return blocks
          .map((b) => b.typename)
          .filter((t): t is string => t != null && t !== '')
          .sort()
      }
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

builder.queryField('journeySimpleGet', (t) =>
  t.field({
    type: 'Json',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }) => getSimpleJourney(id)
  })
)

builder.mutationField('journeySimpleUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Json',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      journey: t.arg({ type: 'Json', required: true })
    },
    resolve: async (_parent, { id, journey }, context) => {
      // 1. Fetch journey with ACL info
      const dbJourney = await prisma.journey.findUnique({
        where: { id },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })
      if (!dbJourney) throw new Error('Journey not found')

      // 2. Check ACL
      if (!journeyAcl(Action.Update, dbJourney, context.user)) {
        throw new Error('You do not have permission to update this journey')
      }

      // 3. Validate input
      const result = journeySimpleSchema.safeParse(journey)
      if (!result.success) {
        throw new Error(
          'Input journey data is invalid: ' +
            JSON.stringify(result.error.format())
        )
      }

      // 4. Update journey and blocks using the service
      await updateSimpleJourney(id, result.data)

      // 5. Return the updated journey in simple format
      return getSimpleJourney(id)
    }
  })
)
