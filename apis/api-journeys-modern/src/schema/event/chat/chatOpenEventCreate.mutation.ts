import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { sendEventsEmail, validateBlockEvent } from '../utils'

import { ChatOpenEventRef } from './chatOpenEvent'
import { ChatOpenEventCreateInput } from './inputs'

builder.mutationField('chatOpenEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    nullable: false,
    type: ChatOpenEventRef,
    args: {
      input: t.arg({ type: ChatOpenEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId, journeyVisitor } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

      const event = await prisma.event.create({
        data: {
          ...input,
          id: input.id || undefined,
          typename: 'ChatOpenEvent',
          visitor: { connect: { id: visitor.id } },
          journey: { connect: { id: journeyId } },
          stepId: input.stepId ?? undefined,
        }
      })

      const now = new Date()
      const visitorUpdate = {
        lastChatStartedAt: now,
        lastChatPlatform: input.value ?? undefined,
        messagePlatform:
          (visitor as any)?.messagePlatform == null
            ? input.value
            : (visitor as any).messagePlatform
      }
      await Promise.all([
        prisma.visitor.update({
          where: { id: visitor.id },
          data: visitorUpdate
        }),
        prisma.journeyVisitor.update({
          where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
          data: {
            lastChatStartedAt: now,
            lastChatPlatform: input.value ?? undefined,
            activityCount: (journeyVisitor.activityCount ?? 0) + 1
          }
        })
      ])

      await sendEventsEmail(journeyId, visitor.id)

      return event
    }
  })
)
