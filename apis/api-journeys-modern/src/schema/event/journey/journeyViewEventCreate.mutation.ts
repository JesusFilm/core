import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { ONE_DAY, getByUserIdAndJourneyId } from '../utils'

import { JourneyViewEventCreateInput } from './inputs'
import { JourneyViewEventRef } from './journeyViewEvent'

builder.mutationField('journeyViewEventCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: JourneyViewEventRef,
    nullable: true,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: JourneyViewEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      const journey = await prisma.journey.findUnique({
        where: { id: input.journeyId }
      })

      if (journey == null) {
        throw new GraphQLError('Journey does not exist', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      const visitorAndJourneyVisitor = await getByUserIdAndJourneyId(
        userId,
        input.journeyId
      )

      if (visitorAndJourneyVisitor == null) {
        throw new GraphQLError('Visitor does not exist', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      const { visitor } = visitorAndJourneyVisitor

      const existingEvent = await prisma.event.findFirst({
        where: {
          typename: 'JourneyViewEvent',
          journeyId: input.journeyId,
          visitorId: visitor.id,
          createdAt: {
            gte: new Date(Date.now() - ONE_DAY * 1000)
          }
        }
      })

      if (existingEvent != null) {
        return null
      }

      const userAgent =
        (context as any).request?.headers?.get('user-agent') ?? null

      const event = prisma.event.create({
        data: {
          ...(input.id != null ? { id: input.id } : {}),
          typename: 'JourneyViewEvent',
          label: input.label ?? undefined,
          value: input.value ?? undefined,
          visitor: { connect: { id: visitor.id } },
          journey: { connect: { id: input.journeyId } }
        }
      })

      if (visitor.userAgent == null && userAgent != null) {
        const [journeyViewEvent] = await Promise.all([
          event,
          prisma.visitor.update({
            where: { id: visitor.id },
            data: { userAgent }
          })
        ])
        return journeyViewEvent
      }

      return await event
    }
  })
)
