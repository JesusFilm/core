import { subject } from '@casl/ability'
import { GraphQLError } from 'graphql'
import isEmpty from 'lodash/isEmpty'
import omit from 'lodash/omit'
import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

import {
  Prisma,
  JourneyStatus as PrismaJourneyStatus,
  UserJourneyRole,
  prisma
} from '@core/prisma/journeys/client'
import {
  JourneySimpleUpdate,
  journeySimpleSchema
} from '@core/shared/ai/journeySimpleTypes'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { ThemeMode } from '../block/card/enums/themeMode'
import { ThemeName } from '../block/card/enums/themeName'
import { ImageBlock } from '../block/image'
import { builder } from '../builder'
import { Language } from '../language'

import { IdType, JourneyMenuButtonIcon, JourneyStatus } from './enums'
import {
  JourneyCreateInput,
  JourneyTemplateInput,
  JourneyUpdateInput,
  JourneysFilter,
  JourneysQueryOptions
} from './inputs'
import { journeyAcl } from './journey.acl'
import { getSimpleJourney, updateSimpleJourney } from './simple'

// Helper interfaces for journey duplication
interface BlockWithAction {
  id: string
  typename: string
  journeyId: string
  parentBlockId: string | null
  parentOrder: number | null
  action?: any
  [key: string]: any
}

interface DuplicateStepIds {
  get(key: string): string | undefined
  set(key: string, value: string): void
}

// Define external references for federated types
const Tag = builder.externalRef('Tag', builder.selection<{ id: string }>('id'))

Tag.implement({
  externalFields: (t) => ({ id: t.id({ nullable: false }) }),
  fields: (t) => ({
    // No additional fields needed - this is just the external reference
  })
})

// Import JourneyCollection from the existing schema
// Note: JourneyCollection is defined as a Prisma object in the schema

// JourneyStatus enum moved to ./enums/journeyStatus.ts

// Input types and enums are now imported from ./inputs/

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

// Helper function to fetch journey with ACL includes
async function fetchJourneyWithAclIncludes(
  where: Prisma.JourneyWhereUniqueInput
) {
  return await prisma.journey.findUnique({
    where,
    include: {
      userJourneys: true,
      team: {
        include: { userTeams: true }
      }
    }
  })
}

// Helper function to get duplicate numbers for journey title
function getJourneyDuplicateNumbers(
  journeys: { title: string }[],
  title: string
): number[] {
  return journeys.map((journey) => {
    if (journey.title === title) {
      return 0
    } else if (journey.title === `${title} copy`) {
      return 1
    } else {
      // Find the difference between duplicated journey and journey in list
      // titles, remove the "copy" to find duplicate number
      const modifier = journey.title.split(title)[1]?.split(' copy')
      const duplicate = modifier?.[1]?.trim() ?? ''
      const numbers = duplicate.match(/^\d+$/)
      // If no duplicate number found, it's a unique journey. Return 0
      return numbers != null ? Number.parseInt(numbers[0]) : 0
    }
  })
}

// Helper function to get first missing number
function getFirstMissingNumber(numbers: number[]): number {
  const sortedNumbers = [...new Set(numbers)].sort((a, b) => a - b)
  for (let i = 0; i < sortedNumbers.length; i++) {
    if (sortedNumbers[i] !== i) {
      return i
    }
  }
  return sortedNumbers.length
}

// Helper function to duplicate blocks and their children
async function getDuplicateChildren(
  blocks: BlockWithAction[],
  originalJourneyId: string,
  newJourneyId: string,
  duplicateStepIds: DuplicateStepIds
): Promise<BlockWithAction[]> {
  const duplicateBlocks: BlockWithAction[] = []

  for (const block of blocks) {
    const duplicateBlockId = uuidv4()

    // Map relationships to new IDs
    const updatedBlock: BlockWithAction = {
      ...block,
      id: duplicateBlockId,
      journeyId: newJourneyId,
      parentBlockId: block.parentBlockId
        ? duplicateStepIds.get(block.parentBlockId) || null
        : null
    }

    // Handle nextBlockId for StepBlocks
    if (block.typename === 'StepBlock' && block.nextBlockId) {
      updatedBlock.nextBlockId = duplicateStepIds.get(block.nextBlockId) || null
    }

    // Handle block references in other fields
    Object.keys(block).forEach((key) => {
      if (key.includes('BlockId') || key.includes('IconId')) {
        const blockId: string | null | undefined = block[key]
        if (blockId && duplicateStepIds.get(blockId)) {
          updatedBlock[key] = duplicateStepIds.get(blockId)
        }
      }
    })

    // Handle action blockId references
    if (block.action?.blockId) {
      updatedBlock.action = {
        ...block.action,
        blockId:
          duplicateStepIds.get(block.action.blockId) || block.action.blockId
      }
    }

    // Remove fields that shouldn't be duplicated
    delete updatedBlock.createdAt
    delete updatedBlock.updatedAt
    delete updatedBlock.deletedAt

    duplicateBlocks.push(updatedBlock)
  }

  return duplicateBlocks
}

// Core Journey Queries
builder.queryField('journey', (t) =>
  t.field({
    type: JourneyRef,
    nullable: true,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      idType: t.arg({ type: IdType, required: false }),
      options: t.arg({ type: JourneysQueryOptions, required: false })
    },
    resolve: async (_parent, args) => {
      const { id, idType = 'slug', options } = args
      const hostname = options?.hostname ?? null
      const embedded = options?.embedded ?? false

      if (embedded === true && hostname != null) return null

      const filter: Prisma.JourneyWhereUniqueInput =
        idType === 'slug' ? { slug: id } : { id }

      if (embedded !== true) {
        if (hostname != null) {
          filter.team = {
            OR: [
              {
                customDomains: {
                  some: { name: hostname, routeAllTeamJourneys: true }
                }
              },
              {
                journeyCollections: {
                  some: {
                    customDomains: { some: { name: hostname } }
                  }
                }
              }
            ]
          }
        } else {
          filter.team = {
            customDomains: { none: { routeAllTeamJourneys: true } }
          }
        }
      }

      const journey = await prisma.journey.findUnique({
        where: filter
      })

      if (journey == null) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      return journey
    }
  })
)

builder.queryField('journeys', (t) =>
  t.field({
    type: [JourneyRef],
    nullable: false,
    args: {
      where: t.arg({ type: JourneysFilter, required: false }),
      options: t.arg({ type: JourneysQueryOptions, required: false })
    },
    resolve: async (_parent, args) => {
      const { where, options } = args
      const hostname = options?.hostname ?? null
      const embedded = options?.embedded ?? false
      const journeyCollection = options?.journeyCollection ?? false

      if (embedded === true && hostname != null) return []

      const filter: Prisma.JourneyWhereInput = {
        status: PrismaJourneyStatus.published
      }

      if (where?.template != null) filter.template = where.template
      if (where?.featured != null)
        filter.featuredAt = where?.featured ? { not: null } : null
      if (where?.ids != null) filter.id = { in: where?.ids }

      let OR: Prisma.JourneyWhereInput[] = []
      if (where?.tagIds != null) {
        // find every journey which has a journeyTag matching at least 1 tagId
        OR = where.tagIds.map((tagId) => ({
          journeyTags: {
            some: {
              tagId
            }
          }
        }))
      }

      if (embedded !== true) {
        if (hostname != null) {
          if (journeyCollection !== true) {
            OR.push({
              team: {
                customDomains: {
                  some: { name: hostname, routeAllTeamJourneys: true }
                }
              }
            })
          }
          OR.push({
            journeyCollectionJourneys: {
              some: {
                journeyCollection: {
                  customDomains: { some: { name: hostname } }
                }
              }
            }
          })
        } else {
          filter.journeyCollectionJourneys = { none: {} }
          filter.team = {
            customDomains: { none: { routeAllTeamJourneys: true } }
          }
        }
      }

      if (where?.languageIds != null)
        filter.languageId = { in: where?.languageIds }

      if (OR.length > 0) filter.OR = OR

      return await prisma.journey.findMany({
        where: filter,
        include:
          where?.tagIds != null
            ? {
                journeyTags: true
              }
            : undefined,
        take: where?.limit ?? undefined,
        orderBy:
          where?.orderByRecent === true ? { publishedAt: 'desc' } : undefined
      })
    }
  })
)

builder.queryField('adminJourney', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      idType: t.arg({ type: IdType, required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id, idType = 'slug' } = args

      const filter: Prisma.JourneyWhereUniqueInput =
        idType === 'slug' ? { slug: id } : { id }

      const journey = await fetchJourneyWithAclIncludes(filter)

      if (journey == null) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(Action.Read, abilitySubject('Journey', journey), context.user)
      ) {
        throw new GraphQLError('user is not allowed to view journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return journey
    }
  })
)

builder.queryField('adminJourneys', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [JourneyRef],
    nullable: false,
    args: {
      status: t.arg({ type: ['JourneyStatus'], required: false }),
      template: t.arg({ type: 'Boolean', required: false }),
      teamId: t.arg({ type: 'ID', required: false }),
      useLastActiveTeamId: t.arg({ type: 'Boolean', required: false })
    },
    resolve: async (_parent, args, context) => {
      const { status, template, teamId, useLastActiveTeamId } = args
      const userId = context.user.id

      const filter: Prisma.JourneyWhereInput = {}

      if (useLastActiveTeamId === true) {
        const profile = await prisma.journeyProfile.findUnique({
          where: { userId }
        })
        if (profile == null) {
          throw new GraphQLError('journey profile not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
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
            userId,
            role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
          }
        }
        filter.team = {
          userTeams: {
            none: {
              userId
            }
          }
        }
      }

      if (template != null) filter.template = template
      if (status != null) {
        filter.status = { in: status as PrismaJourneyStatus[] }
      }

      // Get all journeys that match the filter, then apply ACL checking
      const journeys = await prisma.journey.findMany({
        where: filter,
        include: {
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      })

      // Filter based on ACL permissions
      return journeys.filter((journey) =>
        ability(Action.Read, abilitySubject('Journey', journey), context.user)
      )
    }
  })
)

// Journey Mutations
builder.mutationField('journeyCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyRef,
    nullable: false,
    args: {
      input: t.arg({ type: JourneyCreateInput, required: true }),
      teamId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input, teamId } = args
      const userId = context.user.id

      // Create a journey object for ACL checking with proper type
      const journeyForAcl: any = {
        teamId,
        team: {
          userTeams: [] // Will be populated in transaction
        },
        userJourneys: []
      }

      let retry = true
      let slug = slugify(input.slug ?? input.title, {
        lower: true,
        strict: true
      })
      const id = input.id ?? uuidv4()

      while (retry) {
        try {
          const journey = await prisma.$transaction(async (tx) => {
            // First, get the team with user relationships for ACL check
            const team = await tx.team.findUnique({
              where: { id: teamId },
              include: { userTeams: true }
            })

            if (!team) {
              throw new GraphQLError('team not found', {
                extensions: { code: 'NOT_FOUND' }
              })
            }

            // Update the journey object for ACL with real team data
            const journeyWithTeam = {
              ...journeyForAcl,
              team
            }

            // Check permissions using ACL
            if (
              !ability(
                Action.Create,
                abilitySubject('Journey', journeyWithTeam),
                context.user
              )
            ) {
              throw new GraphQLError('user is not allowed to create journey', {
                extensions: { code: 'FORBIDDEN' }
              })
            }

            await tx.journey.create({
              data: {
                ...omit(input, [
                  'id',
                  'primaryImageBlockId',
                  'teamId',
                  'hostId'
                ]),
                title: input.title,
                languageId: input.languageId,
                id,
                slug,
                status: PrismaJourneyStatus.published,
                publishedAt: new Date(),
                team: { connect: { id: teamId } },
                userJourneys: {
                  create: {
                    userId,
                    role: UserJourneyRole.owner
                  }
                }
              }
            })

            const journey = await tx.journey.findUnique({
              where: { id },
              include: {
                userJourneys: true,
                team: {
                  include: { userTeams: true }
                }
              }
            })

            if (journey == null) {
              throw new GraphQLError('journey not found', {
                extensions: { code: 'NOT_FOUND' }
              })
            }

            return journey
          })

          retry = false
          return journey
        } catch (err: any) {
          if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
            slug = `${slug}-${uuidv4().slice(0, 8)}`
          } else {
            throw err
          }
        }
      }

      throw new GraphQLError('Failed to create journey', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  })
)

builder.mutationField('journeyUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: JourneyUpdateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      const journey = await fetchJourneyWithAclIncludes({ id })
      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const updateData = { ...input }
      if (input.slug != null) {
        updateData.slug = slugify(input.slug, {
          lower: true,
          strict: true
        })
      }

      try {
        return await prisma.$transaction(async (tx) => {
          // Delete all tags and create with new input tags
          if (input.tagIds != null) {
            await tx.journeyTag.deleteMany({
              where: {
                journeyId: id
              }
            })
          }

          // Build the update data with only directly updatable fields
          const updateFields: any = {}
          if (updateData.title !== undefined)
            updateFields.title = updateData.title
          if (updateData.languageId !== undefined)
            updateFields.languageId = updateData.languageId
          if (updateData.themeMode !== undefined)
            updateFields.themeMode = updateData.themeMode
          if (updateData.themeName !== undefined)
            updateFields.themeName = updateData.themeName
          if (updateData.description !== undefined)
            updateFields.description = updateData.description
          if (updateData.creatorDescription !== undefined)
            updateFields.creatorDescription = updateData.creatorDescription
          if (updateData.slug !== undefined) updateFields.slug = updateData.slug
          if (updateData.seoTitle !== undefined)
            updateFields.seoTitle = updateData.seoTitle
          if (updateData.seoDescription !== undefined)
            updateFields.seoDescription = updateData.seoDescription
          if (updateData.strategySlug !== undefined)
            updateFields.strategySlug = updateData.strategySlug
          if (updateData.website !== undefined)
            updateFields.website = updateData.website
          if (updateData.showShareButton !== undefined)
            updateFields.showShareButton = updateData.showShareButton
          if (updateData.showLikeButton !== undefined)
            updateFields.showLikeButton = updateData.showLikeButton
          if (updateData.showDislikeButton !== undefined)
            updateFields.showDislikeButton = updateData.showDislikeButton
          if (updateData.displayTitle !== undefined)
            updateFields.displayTitle = updateData.displayTitle
          if (updateData.showHosts !== undefined)
            updateFields.showHosts = updateData.showHosts
          if (updateData.showChatButtons !== undefined)
            updateFields.showChatButtons = updateData.showChatButtons
          if (updateData.showReactionButtons !== undefined)
            updateFields.showReactionButtons = updateData.showReactionButtons
          if (updateData.showLogo !== undefined)
            updateFields.showLogo = updateData.showLogo
          if (updateData.showMenu !== undefined)
            updateFields.showMenu = updateData.showMenu
          if (updateData.showDisplayTitle !== undefined)
            updateFields.showDisplayTitle = updateData.showDisplayTitle
          if (updateData.menuButtonIcon !== undefined)
            updateFields.menuButtonIcon = updateData.menuButtonIcon
          if (updateData.socialNodeX !== undefined)
            updateFields.socialNodeX = updateData.socialNodeX
          if (updateData.socialNodeY !== undefined)
            updateFields.socialNodeY = updateData.socialNodeY

          if (input.tagIds != null) {
            updateFields.journeyTags = {
              create: input.tagIds.map((tagId: string) => ({ tagId }))
            }
          }

          const updatedJourney = await tx.journey.update({
            where: { id },
            include: {
              team: {
                include: {
                  customDomains: true
                }
              }
            },
            data: updateFields
          })

          // TODO: Add QR code and revalidation logic like legacy service

          return updatedJourney
        })
      } catch (err: any) {
        if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
          throw new GraphQLError('slug is not unique', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }
        throw err
      }
    }
  })
)

builder.mutationField('journeyDuplicate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      teamId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, teamId } = args
      const user = context.user

      // Get the journey to duplicate with full includes
      const journey = await prisma.journey.findUnique({
        where: { id },
        include: {
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      })

      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization to read the source journey
      if (
        !ability(Action.Read, abilitySubject('Journey', journey), context.user)
      ) {
        throw new GraphQLError('user is not allowed to duplicate journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const duplicateJourneyId = uuidv4()

      // Get existing duplicate journeys for title numbering
      const existingActiveDuplicateJourneys = await prisma.journey.findMany({
        where: {
          title: {
            contains: journey.title
          },
          archivedAt: null,
          trashedAt: null,
          deletedAt: null,
          template: false,
          team: { id: teamId }
        }
      })

      const duplicates = getJourneyDuplicateNumbers(
        existingActiveDuplicateJourneys,
        journey.title
      )
      const duplicateNumber = getFirstMissingNumber(duplicates)
      const duplicateTitle = `${journey.title}${
        duplicateNumber === 0
          ? ''
          : duplicateNumber === 1
            ? ' copy'
            : ` copy ${duplicateNumber}`
      }`.trimEnd()

      let slug = slugify(duplicateTitle, {
        lower: true,
        strict: true
      })

      // Get all step blocks for ID mapping
      const originalBlocks = await prisma.block.findMany({
        where: {
          journeyId: journey.id,
          typename: 'StepBlock',
          deletedAt: null
        },
        orderBy: { parentOrder: 'asc' },
        include: { action: true }
      })

      let duplicateMenuStepBlockId: string | undefined
      const duplicateStepIds = new Map<string, string>()

      // Create step ID mappings
      originalBlocks.forEach((block) => {
        const duplicateBlockId = uuidv4()
        if (journey.menuStepBlockId === block.id) {
          duplicateMenuStepBlockId = duplicateBlockId
        }
        duplicateStepIds.set(block.id, duplicateBlockId)
      })

      // Get all blocks for duplication
      const allBlocks = await prisma.block.findMany({
        where: { journeyId: journey.id, deletedAt: null },
        include: { action: true },
        orderBy: { parentOrder: 'asc' }
      })

      const duplicateBlocks = await getDuplicateChildren(
        allBlocks,
        id,
        duplicateJourneyId,
        duplicateStepIds
      )

      // Handle special image blocks
      let duplicatePrimaryImageBlock: BlockWithAction | undefined
      if (journey.primaryImageBlockId != null) {
        const primaryImageBlock = await prisma.block.findUnique({
          where: { id: journey.primaryImageBlockId },
          include: { action: true }
        })
        if (primaryImageBlock != null) {
          const duplicateId = uuidv4()
          duplicatePrimaryImageBlock = {
            ...omit(primaryImageBlock, ['id']),
            id: duplicateId,
            journeyId: duplicateJourneyId
          }
          duplicateBlocks.push(duplicatePrimaryImageBlock)
        }
      }

      let duplicateLogoImageBlock: BlockWithAction | undefined
      if (journey.logoImageBlockId != null) {
        const logoImageBlock = await prisma.block.findUnique({
          where: { id: journey.logoImageBlockId },
          include: { action: true }
        })
        if (logoImageBlock != null) {
          const duplicateId = uuidv4()
          duplicateLogoImageBlock = {
            ...omit(logoImageBlock, ['id']),
            id: duplicateId,
            journeyId: duplicateJourneyId
          }
          duplicateBlocks.push(duplicateLogoImageBlock)
        }
      }

      let retry = true
      while (retry) {
        try {
          const duplicateJourney = await prisma.$transaction(async (tx) => {
            // Create duplicate journey
            await tx.journey.create({
              data: {
                ...omit(journey, [
                  'primaryImageBlockId',
                  'creatorImageBlockId',
                  'creatorDescription',
                  'publishedAt',
                  'hostId',
                  'teamId',
                  'createdAt',
                  'strategySlug',
                  'logoImageBlockId',
                  'menuStepBlockId'
                ]),
                id: duplicateJourneyId,
                slug,
                title: duplicateTitle,
                status: PrismaJourneyStatus.published,
                publishedAt: new Date(),
                featuredAt: null,
                template: false,
                fromTemplateId: journey.template
                  ? id
                  : (journey.fromTemplateId ?? null),
                team: { connect: { id: teamId } },
                userJourneys: {
                  create: {
                    userId: user.id,
                    role: UserJourneyRole.owner
                  }
                }
              }
            })

            const newJourney = await tx.journey.findUnique({
              where: { id: duplicateJourneyId },
              include: {
                userJourneys: true,
                team: {
                  include: { userTeams: true }
                }
              }
            })

            if (!newJourney) {
              throw new GraphQLError('journey not found', {
                extensions: { code: 'NOT_FOUND' }
              })
            }

            // Check authorization to create in target team
            if (
              !ability(
                Action.Create,
                abilitySubject('Journey', newJourney),
                context.user
              )
            ) {
              throw new GraphQLError(
                'user is not allowed to duplicate journey',
                {
                  extensions: { code: 'FORBIDDEN' }
                }
              )
            }

            return newJourney
          })

          // Create all blocks
          for (const block of duplicateBlocks) {
            await prisma.block.create({
              data: {
                ...omit(block, [
                  'journeyId',
                  'parentBlockId',
                  'posterBlockId',
                  'coverBlockId',
                  'nextBlockId',
                  'action'
                ]),
                typename: block.typename,
                journeyId: duplicateJourneyId,
                settings: block.settings ?? {}
              }
            })
          }

          // Update block references
          for (const block of duplicateBlocks) {
            if (
              block.parentBlockId != null ||
              block.posterBlockId != null ||
              block.coverBlockId != null ||
              block.nextBlockId != null
            ) {
              await prisma.block.update({
                where: { id: block.id },
                data: {
                  parentBlockId: block.parentBlockId ?? undefined,
                  posterBlockId: block.posterBlockId ?? undefined,
                  coverBlockId: block.coverBlockId ?? undefined,
                  nextBlockId: block.nextBlockId ?? undefined
                }
              })
            }

            // Create action if exists
            if (block.action != null && !isEmpty(block.action)) {
              await prisma.action.create({
                data: {
                  ...omit(block.action, ['parentBlockId']),
                  parentBlockId: block.id
                }
              })
            }
          }

          // Update journey with special block references
          const updateData: any = {}
          if (duplicatePrimaryImageBlock != null) {
            updateData.primaryImageBlockId = duplicatePrimaryImageBlock.id
          }
          if (duplicateLogoImageBlock != null) {
            updateData.logoImageBlockId = duplicateLogoImageBlock.id
          }
          if (duplicateMenuStepBlockId != null) {
            updateData.menuStepBlockId = duplicateMenuStepBlockId
          }

          if (Object.keys(updateData).length > 0) {
            await prisma.journey.update({
              where: { id: duplicateJourneyId },
              data: updateData
            })
          }

          retry = false
          return duplicateJourney
        } catch (err: any) {
          if (err.code === 'P2002' && err.meta?.target?.includes('slug')) {
            slug = slugify(`${slug}-${duplicateJourneyId}`)
          } else {
            retry = false
            throw err
          }
        }
      }

      throw new GraphQLError('Failed to duplicate journey', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  })
)

builder.mutationField('journeyPublish', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      const journey = await fetchJourneyWithAclIncludes({ id })
      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Manage,
          abilitySubject('Journey', journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to publish journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.journey.update({
        where: { id },
        data: {
          status: PrismaJourneyStatus.published,
          publishedAt: new Date()
        }
      })
    }
  })
)

builder.mutationField('journeyFeature', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      feature: t.arg({ type: 'Boolean', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, feature } = args

      const journey = await fetchJourneyWithAclIncludes({ id })
      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL - journeyFeature requires manage permission on template
      if (
        !ability(
          Action.Manage,
          abilitySubject('Journey', { ...journey, template: true }),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update featured date', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.journey.update({
        where: { id },
        data: {
          featuredAt: feature ? new Date() : null
        }
      })
    }
  })
)

builder.mutationField('journeysArchive', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [JourneyRef],
    nullable: false,
    args: {
      ids: t.arg({ type: ['ID'], required: true })
    },
    resolve: async (_parent, args, context) => {
      const { ids } = args

      // Check permissions for all journeys using ACL
      const journeys = await Promise.all(
        ids.map(async (id) => {
          const journey = await fetchJourneyWithAclIncludes({ id })
          if (!journey) {
            throw new GraphQLError('journey not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          }
          if (
            !ability(
              Action.Manage,
              abilitySubject('Journey', journey),
              context.user
            )
          ) {
            throw new GraphQLError(
              `user is not allowed to archive journey ${id}`,
              {
                extensions: { code: 'FORBIDDEN' }
              }
            )
          }
          return journey
        })
      )

      await prisma.journey.updateMany({
        where: { id: { in: ids } },
        data: { status: PrismaJourneyStatus.archived, archivedAt: new Date() }
      })

      return journeys
    }
  })
)

builder.mutationField('journeysDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [JourneyRef],
    nullable: false,
    args: {
      ids: t.arg({ type: ['ID'], required: true })
    },
    resolve: async (_parent, args, context) => {
      const { ids } = args

      // Check permissions for all journeys using ACL
      const journeys = await Promise.all(
        ids.map(async (id) => {
          const journey = await fetchJourneyWithAclIncludes({ id })
          if (!journey) {
            throw new GraphQLError('journey not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          }
          if (
            !ability(
              Action.Manage,
              abilitySubject('Journey', journey),
              context.user
            )
          ) {
            throw new GraphQLError(
              `user is not allowed to delete journey ${id}`,
              {
                extensions: { code: 'FORBIDDEN' }
              }
            )
          }
          return journey
        })
      )

      await prisma.journey.updateMany({
        where: { id: { in: ids } },
        data: { status: PrismaJourneyStatus.deleted, deletedAt: new Date() }
      })

      return journeys
    }
  })
)

builder.mutationField('journeysTrash', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [JourneyRef],
    nullable: false,
    args: {
      ids: t.arg({ type: ['ID'], required: true })
    },
    resolve: async (_parent, args, context) => {
      const { ids } = args

      // Check permissions for all journeys using ACL
      const journeys = await Promise.all(
        ids.map(async (id) => {
          const journey = await fetchJourneyWithAclIncludes({ id })
          if (!journey) {
            throw new GraphQLError('journey not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          }
          if (
            !ability(
              Action.Manage,
              abilitySubject('Journey', journey),
              context.user
            )
          ) {
            throw new GraphQLError(
              `user is not allowed to trash journey ${id}`,
              {
                extensions: { code: 'FORBIDDEN' }
              }
            )
          }
          return journey
        })
      )

      await prisma.journey.updateMany({
        where: { id: { in: ids } },
        data: { status: PrismaJourneyStatus.trashed, trashedAt: new Date() }
      })

      return journeys
    }
  })
)

builder.mutationField('journeysRestore', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [JourneyRef],
    nullable: false,
    args: {
      ids: t.arg({ type: ['ID'], required: true })
    },
    resolve: async (_parent, args, context) => {
      const { ids } = args

      // Check permissions for all journeys using ACL
      const journeys = await Promise.all(
        ids.map(async (id) => {
          const journey = await fetchJourneyWithAclIncludes({ id })
          if (!journey) {
            throw new GraphQLError('journey not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          }
          if (
            !ability(
              Action.Manage,
              abilitySubject('Journey', journey),
              context.user
            )
          ) {
            throw new GraphQLError(
              `user is not allowed to restore journey ${id}`,
              {
                extensions: { code: 'FORBIDDEN' }
              }
            )
          }
          return journey
        })
      )

      return await Promise.all(
        journeys.map(
          async (journey) =>
            await prisma.journey.update({
              where: { id: journey.id },
              data: {
                status: PrismaJourneyStatus.published,
                publishedAt: new Date()
              }
            })
        )
      )
    }
  })
)

builder.mutationField('journeyTemplate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: JourneyTemplateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      const journey = await fetchJourneyWithAclIncludes({ id })
      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL - journeyTemplate requires manage permission on template field
      if (
        !ability(
          Action.Manage,
          abilitySubject('Journey', {
            ...journey,
            template: input.template ?? false
          }),
          context.user
        )
      ) {
        throw new GraphQLError(
          'user is not allowed to change journey to or from a template',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.journey.update({
        where: { id },
        data: input
      })
    }
  })
)

// Note: journeyDuplicate mutation is complex and would require block service migration
// For now, we'll skip it and implement it in a later phase

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
      const dbJourney = await fetchJourneyWithAclIncludes({ id })
      if (!dbJourney) {
        throw new GraphQLError('Journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // 2. Check ACL using proper ability function
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', dbJourney),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // 3. Validate and update the journey
      const result = journeySimpleSchema.safeParse(journey)
      if (!result.success) {
        throw new GraphQLError('Input journey data is invalid', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      await updateSimpleJourney(id, result.data as JourneySimpleUpdate)
      return getSimpleJourney(id)
    }
  })
)
