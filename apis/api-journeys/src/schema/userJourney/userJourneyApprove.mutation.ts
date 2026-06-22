import { GraphQLError } from 'graphql'

import { UserJourneyRole, prisma } from '@core/prisma/journeys/client'

import { env } from '../../env'
import { queue as emailQueue } from '../../workers/email/queue'
import { builder } from '../builder'
import { logger } from '../logger'

import { UserJourneyRef } from './userJourney'
import { UserJourneyAction, userJourneyAcl } from './userJourney.acl'

builder.mutationField('userJourneyApprove', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserJourneyRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const userJourney = await prisma.userJourney.findUnique({
          where: { id: String(args.id) },
          include: {
            journey: {
              include: {
                userJourneys: true,
                team: { include: { userTeams: true } },
                primaryImageBlock: true
              }
            }
          }
        })

        if (userJourney == null)
          throw new GraphQLError('userJourney not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (
          !userJourneyAcl(
            UserJourneyAction.UpdateRole,
            userJourney,
            context.user
          )
        )
          throw new GraphQLError('user is not allowed to update userJourney', {
            extensions: { code: 'FORBIDDEN' }
          })

        const updated = await prisma.userJourney.update({
          ...query,
          where: { id: String(args.id) },
          data: { role: UserJourneyRole.editor }
        })

        const { id: _id, emailVerified: _ev, ...sender } = context.user
        const url = `${env.JOURNEYS_ADMIN_URL}/journeys/${userJourney.journey.id}`
        void emailQueue
          .add(
            'journey-request-approved',
            {
              userId: userJourney.userId,
              url,
              journey: userJourney.journey,
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
              'failed to enqueue journey-request-approved email'
            )
          )

        return updated
      }
    })
)
