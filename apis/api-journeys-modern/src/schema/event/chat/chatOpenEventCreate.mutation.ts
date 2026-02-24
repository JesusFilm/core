import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import {
  appendEventToGoogleSheets,
  sendEventsEmail,
  validateBlockEvent
} from '../utils'

import { ChatOpenEventRef } from './chatOpenEvent'
import { ChatOpenEventCreateInput } from './inputs'

builder.mutationField('chatOpenEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    nullable: false,
    type: ChatOpenEventRef,
    args: {
      input: t.arg({ type: ChatOpenEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
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
          typename: 'ChatOpenEvent',
          visitor: { connect: { id: visitor.id } },
          journey: { connect: { id: journeyId } },
          stepId: input.stepId ?? undefined
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
            activityCount: { increment: 1 }
          }
        })
      ])

      await sendEventsEmail(journeyId, visitor.id)

      if (teamId) {
        appendEventToGoogleSheets({
          journeyId,
          teamId,
          row: [
            visitor.id,
            event.createdAt.toISOString(),
            '',
            '',
            '',
            input.blockId ?? '',
            input.value ?? ''
          ]
        }).catch((error) => {
          console.error('Failed to append event to Google Sheets:', error)
        })
      }

      return event
    }
  })
)
