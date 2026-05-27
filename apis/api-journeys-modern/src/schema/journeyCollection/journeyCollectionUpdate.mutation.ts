import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { JourneyCollectionUpdateInput } from './inputs'
import { JourneyCollectionRef } from './journeyCollection'
import { canAccessJourneyCollection } from './journeyCollection.acl'

builder.mutationField('journeyCollectionUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyCollectionRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: JourneyCollectionUpdateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const { id, input } = args

        const journeyCollection = await prisma.journeyCollection.findUnique({
          where: { id: String(id) },
          include: { team: { include: { userTeams: true } } }
        })

        if (journeyCollection == null)
          throw new GraphQLError('journey collection not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (
          !canAccessJourneyCollection(
            Action.Update,
            journeyCollection,
            context.user
          )
        )
          throw new GraphQLError(
            'user is not allowed to update journey collection',
            { extensions: { code: 'FORBIDDEN' } }
          )

        return await prisma.$transaction(async (tx) => {
          if (input.journeyIds != null) {
            await tx.journeyCollectionJourneys.deleteMany({
              where: { journeyCollectionId: String(id) }
            })
            if (input.journeyIds.length > 0) {
              const journeys = await tx.journey.findMany({
                where: {
                  id: { in: input.journeyIds },
                  teamId: journeyCollection.teamId
                },
                select: { id: true }
              })
              const journeyIds = input.journeyIds.filter((jId) =>
                journeys.some((j) => j.id === jId)
              )
              await tx.journeyCollectionJourneys.createMany({
                data: journeyIds.map((journeyId, order) => ({
                  order,
                  journeyId,
                  journeyCollectionId: String(id)
                }))
              })
            }
          }

          return tx.journeyCollection.update({
            ...query,
            where: { id: String(id) },
            data: {
              ...(input.title !== undefined && input.title !== null
                ? { title: input.title }
                : {})
            }
          })
        })
      }
    })
)
