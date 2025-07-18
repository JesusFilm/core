import { subject } from '@casl/ability'
import { GraphQLError } from 'graphql'
import isEmpty from 'lodash/isEmpty'
import omit from 'lodash/omit'
import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

import {
  JourneyStatus,
  Prisma,
  UserJourneyRole
} from '.prisma/api-journeys-modern-client'
import {
  JourneySimpleUpdate,
  journeySimpleSchema
} from '@core/shared/ai/journeySimpleTypes'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { ThemeMode } from '../block/card/enums/themeMode'
import { ThemeName } from '../block/card/enums/themeName'
import { builder } from '../builder'
import { Language } from '../language'

import { journeyAcl } from './journey.acl'
import { getSimpleJourney, updateSimpleJourney } from './simple'

// Define JourneyStatus enum to match api-journeys
builder.enumType('JourneyStatus', {
  values: ['archived', 'deleted', 'draft', 'published', 'trashed'] as const
})

// Define IdType enum for legacy compatibility
const IdType = builder.enumType('IdType', {
  values: ['databaseId', 'slug'] as const
})

// Define JourneyMenuButtonIcon enum
const JourneyMenuButtonIcon = builder.enumType('JourneyMenuButtonIcon', {
  values: [
    'menu1',
    'equals',
    'home3',
    'home4',
    'more',
    'ellipsis',
    'grid1',
    'chevronDown'
  ] as const
})

// Define input types
const JourneysFilter = builder.inputType('JourneysFilter', {
  fields: (t) => ({
    featured: t.boolean({ required: false }),
    template: t.boolean({ required: false }),
    ids: t.idList({ required: false }),
    tagIds: t.idList({ required: false }),
    languageIds: t.idList({ required: false }),
    limit: t.int({ required: false }),
    orderByRecent: t.boolean({ required: false })
  })
})

const JourneysQueryOptions = builder.inputType('JourneysQueryOptions', {
  fields: (t) => ({
    hostname: t.string({
      required: false,
      description:
        'hostname filters journeys to those that belong to a team with a custom domain matching the hostname.'
    }),
    embedded: t.boolean({
      required: false,
      description: 'is this being requested from an embed url'
    }),
    journeyCollection: t.boolean({
      required: false,
      description:
        'limit results to journeys in a journey collection (currently only available when using hostname option)'
    })
  })
})

const JourneyCreateInput = builder.inputType('JourneyCreateInput', {
  fields: (t) => ({
    id: t.id({
      required: false,
      description:
        'ID should be unique Response UUID (Provided for optimistic mutation result matching)'
    }),
    title: t.string({ required: true }),
    languageId: t.string({ required: true }),
    themeMode: t.field({ type: ThemeMode, required: false }),
    themeName: t.field({ type: ThemeName, required: false }),
    description: t.string({ required: false }),
    slug: t.string({
      required: false,
      description:
        'Slug should be unique amongst all journeys (server will throw BAD_USER_INPUT error if not). If not required will use title formatted with kebab-case. If the generated slug is not unique the uuid will be placed at the end of the slug guaranteeing uniqueness'
    })
  })
})

const JourneyUpdateInput = builder.inputType('JourneyUpdateInput', {
  fields: (t) => ({
    title: t.string({ required: false }),
    languageId: t.string({ required: false }),
    themeMode: t.field({ type: ThemeMode, required: false }),
    themeName: t.field({ type: ThemeName, required: false }),
    description: t.string({ required: false }),
    creatorDescription: t.string({ required: false }),
    creatorImageBlockId: t.id({ required: false }),
    primaryImageBlockId: t.id({ required: false }),
    slug: t.string({ required: false }),
    seoTitle: t.string({ required: false }),
    seoDescription: t.string({ required: false }),
    hostId: t.string({ required: false }),
    strategySlug: t.string({ required: false }),
    tagIds: t.idList({ required: false }),
    website: t.boolean({ required: false }),
    showShareButton: t.boolean({ required: false }),
    showLikeButton: t.boolean({ required: false }),
    showDislikeButton: t.boolean({ required: false }),
    displayTitle: t.string({ required: false }),
    showHosts: t.boolean({ required: false }),
    showChatButtons: t.boolean({ required: false }),
    showReactionButtons: t.boolean({ required: false }),
    showLogo: t.boolean({ required: false }),
    showMenu: t.boolean({ required: false }),
    showDisplayTitle: t.boolean({ required: false }),
    menuButtonIcon: t.field({
      type: JourneyMenuButtonIcon,
      required: false
    }),
    menuStepBlockId: t.id({ required: false }),
    logoImageBlockId: t.id({ required: false }),
    socialNodeX: t.int({ required: false }),
    socialNodeY: t.int({ required: false })
  })
})

const JourneyTemplateInput = builder.inputType('JourneyTemplateInput', {
  fields: (t) => ({
    template: t.boolean({ required: false })
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
    })
    // Add more fields as needed for federation compatibility
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
        status: JourneyStatus.published
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
        filter.status = { in: status as JourneyStatus[] }
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
                status: JourneyStatus.published,
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
          status: JourneyStatus.published,
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
        data: { status: JourneyStatus.archived, archivedAt: new Date() }
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
        data: { status: JourneyStatus.deleted, deletedAt: new Date() }
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
        data: { status: JourneyStatus.trashed, trashedAt: new Date() }
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
                status: JourneyStatus.published,
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
