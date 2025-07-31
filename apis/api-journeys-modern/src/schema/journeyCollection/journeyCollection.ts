import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { Action } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { JourneyRef } from '../journey/journey'

import { canAccessJourneyCollection } from './journeyCollection.acl'

// Helper function to fetch journey collection with team info for ACL
async function fetchJourneyCollectionWithAclIncludes(where: { id: string }) {
  return await prisma.journeyCollection.findUnique({
    where,
    include: {
      team: {
        include: { userTeams: true }
      }
    }
  })
}

// JourneyCollection Type
export const JourneyCollectionRef = builder.prismaObject('JourneyCollection', {
  description: 'A collection of journeys associated with a team',
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title', { nullable: true }),
    team: t.relation('team'),
    customDomains: t.relation('customDomains'),
    journeys: t.field({
      type: [JourneyRef],
      resolve: async (journeyCollection) => {
        const journeys = await prisma.journey.findMany({
          where: {
            journeyCollectionJourneys: {
              some: { journeyCollectionId: journeyCollection.id }
            }
          },
          include: {
            journeyCollectionJourneys: {
              where: { journeyCollectionId: journeyCollection.id },
              orderBy: { order: 'asc' }
            }
          }
        })

        // Sort journeys by their order in the collection
        return journeys.sort((a, b) => {
          const orderA = a.journeyCollectionJourneys[0]?.order ?? 0
          const orderB = b.journeyCollectionJourneys[0]?.order ?? 0
          return orderA - orderB
        })
      }
    })
  })
})

// Input Types
const JourneyCollectionCreateInput = builder.inputType(
  'JourneyCollectionCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      teamId: t.id({ required: true }),
      title: t.string({ required: false }),
      journeyIds: t.idList({ required: false })
    })
  }
)

const JourneyCollectionUpdateInput = builder.inputType(
  'JourneyCollectionUpdateInput',
  {
    fields: (t) => ({
      title: t.string({ required: false }),
      journeyIds: t.idList({ required: false })
    })
  }
)

// Query: Get single journey collection
builder.queryField('journeyCollection', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyCollectionRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      const journeyCollection = await fetchJourneyCollectionWithAclIncludes({
        id
      })
      if (!journeyCollection) {
        throw new GraphQLError('journey collection not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (
        !canAccessJourneyCollection(
          Action.Read,
          journeyCollection,
          context.user
        )
      ) {
        throw new GraphQLError(
          'user is not allowed to read journey collection',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return journeyCollection
    }
  })
)

// Query: Get journey collections by team
builder.queryField('journeyCollections', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [JourneyCollectionRef],
    nullable: false,
    args: {
      teamId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { teamId } = args

      // First get all journey collections for the team
      const allJourneyCollections = await prisma.journeyCollection.findMany({
        where: { teamId },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })

      // Filter based on ACL permissions
      const accessibleJourneyCollections = allJourneyCollections.filter(
        (journeyCollection) =>
          canAccessJourneyCollection(
            Action.Read,
            journeyCollection,
            context.user
          )
      )

      return accessibleJourneyCollections
    }
  })
)

// Mutation: Create journey collection
builder.mutationField('journeyCollectionCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyCollectionRef,
    nullable: false,
    args: {
      input: t.arg({ type: JourneyCollectionCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args

      return await prisma.$transaction(async (tx) => {
        // Create the journey collection
        const data: any = {
          ...omit(input, ['teamId', 'journeyIds']),
          id: input.id ?? undefined,
          team: { connect: { id: input.teamId } }
        }

        // Handle journey IDs if provided
        if (input.journeyIds != null && input.journeyIds.length > 0) {
          // Validate that all journeys belong to the team
          const journeys = await tx.journey.findMany({
            where: {
              id: { in: input.journeyIds },
              teamId: input.teamId
            },
            select: { id: true }
          })

          const validJourneyIds = input.journeyIds.filter((id) =>
            journeys.some((j) => j.id === id)
          )

          if (validJourneyIds.length > 0) {
            data.journeyCollectionJourneys = {
              createMany: {
                data: validJourneyIds.map((journeyId, order) => ({
                  order,
                  journeyId
                }))
              }
            }
          }
        }

        const collection = await tx.journeyCollection.create({
          data,
          include: {
            team: { include: { userTeams: true } }
          }
        })

        // Check ACL permissions
        if (
          !canAccessJourneyCollection(Action.Create, collection, context.user)
        ) {
          throw new GraphQLError(
            'user is not allowed to create journey collection',
            {
              extensions: { code: 'FORBIDDEN' }
            }
          )
        }

        return collection
      })
    }
  })
)

// Mutation: Update journey collection
builder.mutationField('journeyCollectionUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyCollectionRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: JourneyCollectionUpdateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      const journeyCollection = await fetchJourneyCollectionWithAclIncludes({
        id
      })
      if (!journeyCollection) {
        throw new GraphQLError('journey collection not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (
        !canAccessJourneyCollection(
          Action.Update,
          journeyCollection,
          context.user
        )
      ) {
        throw new GraphQLError(
          'user is not allowed to update journey collection',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.$transaction(async (tx) => {
        // Handle journey IDs update if provided
        if (input.journeyIds != null) {
          // Delete existing journey relationships
          await tx.journeyCollectionJourneys.deleteMany({
            where: { journeyCollectionId: id }
          })

          if (input.journeyIds.length > 0) {
            // Validate that all journeys belong to the team
            const journeys = await tx.journey.findMany({
              where: {
                id: { in: input.journeyIds },
                teamId: journeyCollection.teamId
              },
              select: { id: true }
            })

            const validJourneyIds = input.journeyIds.filter((journeyId) =>
              journeys.some((j) => j.id === journeyId)
            )

            if (validJourneyIds.length > 0) {
              await tx.journeyCollectionJourneys.createMany({
                data: validJourneyIds.map((journeyId, order) => ({
                  order,
                  journeyId,
                  journeyCollectionId: id
                }))
              })
            }
          }
        }

        // Update the journey collection
        return await tx.journeyCollection.update({
          where: { id },
          data: {
            ...omit(input, ['journeyIds'])
          }
        })
      })
    }
  })
)

// Mutation: Delete journey collection
builder.mutationField('journeyCollectionDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyCollectionRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      const journeyCollection = await fetchJourneyCollectionWithAclIncludes({
        id
      })
      if (!journeyCollection) {
        throw new GraphQLError('journey collection not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (
        !canAccessJourneyCollection(
          Action.Delete,
          journeyCollection,
          context.user
        )
      ) {
        throw new GraphQLError(
          'user is not allowed to delete journey collection',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.journeyCollection.delete({
        where: { id }
      })
    }
  })
)

// Extend Journey type to add journeyCollections field (avoids circular dependency)
builder.prismaObjectField('Journey', 'journeyCollections', (t) =>
  t.field({
    type: [JourneyCollectionRef],
    nullable: false,
    select: (_args, _ctx, nestedSelection) => ({
      journeyCollectionJourneys: {
        include: {
          journeyCollection: nestedSelection(true)
        }
      }
    }),
    resolve: (journey) => {
      return journey.journeyCollectionJourneys.map(
        (jcj) => jcj.journeyCollection
      )
    }
  })
)
