import { GraphQLError } from 'graphql'

import { UserJourneyRole, prisma } from '@core/prisma/journeys/client'

import { env } from '../../env'
import { queue as emailQueue } from '../../workers/email/queue'
import { builder } from '../builder'
import { IdType } from '../journey/enums/idType'
import { logger } from '../logger'

import { UserJourneyRef } from './userJourney'
import {
  INCLUDE_USER_JOURNEY_ACL,
  UserJourneyAction,
  userJourneyAcl
} from './userJourney.acl'

builder.mutationField('userJourneyRequest', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserJourneyRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        journeyId: t.arg({ type: 'ID', required: true }),
        idType: t.arg({ type: IdType, required: false })
      },
      resolve: async (query, _parent, args, context) => {
        const journeyId = String(args.journeyId)

        return prisma.$transaction(async (tx) => {
          const userJourney = await tx.userJourney.upsert({
            where: {
              journeyId_userId: { journeyId, userId: context.user.id }
            },
            create: {
              userId: context.user.id,
              journey: { connect: { id: journeyId } },
              role: UserJourneyRole.inviteRequested
            },
            update: {},
            include: {
              ...INCLUDE_USER_JOURNEY_ACL,
              journey: {
                include: {
                  userJourneys: true,
                  team: { include: { userTeams: true } },
                  primaryImageBlock: true
                }
              }
            }
          })

          if (
            !userJourneyAcl(UserJourneyAction.Create, userJourney, context.user)
          )
            throw new GraphQLError(
              'user is not allowed to create userJourney',
              { extensions: { code: 'FORBIDDEN' } }
            )

          const { id: _id, emailVerified: _ev, ...sender } = context.user
          const url = `${env.JOURNEYS_ADMIN_URL}/journeys/${journeyId}`
          void emailQueue
            .add(
              'journey-access-request',
              {
                journey: userJourney.journey,
                url,
                sender
              },
              {
                removeOnComplete: true,
                removeOnFail: { age: 24 * 3600 }
              }
            )
            .catch((err) =>
              logger.error(
                err,
                'failed to enqueue journey-access-request email'
              )
            )

          return tx.userJourney.findUniqueOrThrow({
            ...query,
            where: { id: userJourney.id }
          })
        })
      }
    })
)
