import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { JourneyCollectionCreateInput } from './inputs'
import { JourneyCollectionRef } from './journeyCollection'
import { canAccessJourneyCollection } from './journeyCollection.acl'

builder.mutationField('journeyCollectionCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyCollectionRef,
      nullable: false,
      args: {
        input: t.arg({ type: JourneyCollectionCreateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const { input } = args

        return await prisma.$transaction(async (tx) => {
          const data: Prisma.JourneyCollectionCreateInput = {
            id: input.id ?? undefined,
            title: input.title ?? undefined,
            team: { connect: { id: input.teamId } }
          }

          if (input.journeyIds != null && input.journeyIds.length > 0) {
            const journeys = await tx.journey.findMany({
              where: {
                id: { in: input.journeyIds },
                teamId: input.teamId
              },
              select: { id: true }
            })
            const journeyIds = input.journeyIds.filter((id) =>
              journeys.some((j) => j.id === id)
            )
            data.journeyCollectionJourneys = {
              createMany: {
                data: journeyIds.map((journeyId, order) => ({
                  order,
                  journeyId
                }))
              }
            }
          }

          const collection = await tx.journeyCollection.create({
            data,
            include: { team: { include: { userTeams: true } } }
          })

          if (
            !canAccessJourneyCollection(Action.Create, collection, context.user)
          )
            throw new GraphQLError(
              'user is not allowed to create journey collection',
              { extensions: { code: 'FORBIDDEN' } }
            )

          return tx.journeyCollection.findUniqueOrThrow({
            ...query,
            where: { id: collection.id }
          })
        })
      }
    })
)
