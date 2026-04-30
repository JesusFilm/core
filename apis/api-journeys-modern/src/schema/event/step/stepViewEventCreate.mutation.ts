import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { StepViewEventCreateInput } from './inputs'
import { StepViewEventRef } from './stepViewEvent'

builder.mutationField('stepViewEventCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: StepViewEventRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: StepViewEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (userId == null) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyVisitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.blockId
      )

      const [stepViewEvent] = await Promise.all([
        prisma.event.create({
          data: {
            ...(input.id != null ? { id: input.id } : {}),
            typename: 'StepViewEvent',
            value: input.value ?? undefined,
            visitor: { connect: { id: visitor.id } },
            journey: { connect: { id: journeyId } },
            stepId: input.blockId ?? undefined
          }
        }),
        prisma.visitor.update({
          where: { id: visitor.id },
          data: {
            duration: Math.min(
              1200,
              Math.floor(
                Math.abs(Date.now() - new Date(visitor.createdAt).getTime()) /
                  1000
              )
            ),
            lastStepViewedAt: new Date()
          }
        }),
        prisma.journeyVisitor.update({
          where: {
            journeyId_visitorId: {
              journeyId,
              visitorId: visitor.id
            }
          },
          data: {
            duration: Math.min(
              1200,
              Math.floor(
                Math.abs(
                  Date.now() - new Date(journeyVisitor.createdAt).getTime()
                ) / 1000
              )
            ),
            lastStepViewedAt: new Date()
          }
        })
      ])

      return stepViewEvent
    }
  })
)
