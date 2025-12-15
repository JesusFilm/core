import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { appendEventToGoogleSheets, validateBlockEvent } from '../utils'

import { ButtonClickEventRef } from './buttonClickEvent'
import { ButtonClickEventCreateInput } from './inputs'

builder.mutationField('buttonClickEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
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

      const { visitor, journeyId, teamId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

      const event = await prisma.event.create({
        data: {
          ...input,
          id: input.id || undefined,
          typename: 'ButtonClickEvent',
          visitor: { connect: { id: visitor.id } },
          journey: { connect: { id: journeyId } },
          stepId: input.stepId ?? undefined
        }
      })

      const updates: Array<Promise<unknown>> = []
      if (teamId) {
        appendEventToGoogleSheets({
          journeyId,
          teamId,
          row: [
            event.visitorId,
            event.createdAt.toISOString(),
            '',
            '',
            '',
            `${input.blockId}-${input.label ?? ''}`,
            input.value ?? ''
          ]
        }).catch((error) => {
          console.error('Failed to append event to Google Sheets:', error)
        })
      }
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
