import { v4 as uuidv4 } from 'uuid'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { ButtonClickEventRef } from './buttonClickEvent'
import { ButtonClickEventCreateInput } from './inputs'

builder.mutationField('buttonClickEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    nullable: false,
    type: ButtonClickEventRef,
    args: {
      input: t.arg({ type: ButtonClickEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

      const event = await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'ButtonClickEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          label: input.label,
          value: input.value,
          action: input.action,
          actionValue: input.actionValue,
          visitorId: visitor.id
        }
      })

      const updates: Array<Promise<unknown>> = []
      if (input.action === 'LinkAction') {
        const visitorData: Prisma.VisitorUpdateInput = {
          ...(input.actionValue !== undefined
            ? { lastLinkAction: input.actionValue }
            : {})
        }
        const journeyVisitorData: Prisma.JourneyVisitorUpdateInput = {
          ...(input.actionValue !== undefined
            ? { lastLinkAction: input.actionValue }
            : {}),
          activityCount: { increment: 1 }
        }
        updates.push(
          prisma.visitor.update({
            where: { id: visitor.id },
            data: visitorData
          }),
          prisma.journeyVisitor.update({
            where: {
              journeyId_visitorId: { journeyId, visitorId: visitor.id }
            },
            data: journeyVisitorData
          })
        )
      }
      if (input.action === 'EmailAction') {
        updates.push(
          prisma.journeyVisitor.update({
            where: {
              journeyId_visitorId: { journeyId, visitorId: visitor.id }
            },
            data: { activityCount: { increment: 1 } }
          })
        )
      }
      await Promise.all(updates)

      return event
    }
  })
)
