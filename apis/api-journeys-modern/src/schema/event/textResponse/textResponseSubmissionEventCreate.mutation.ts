import { v4 as uuidv4 } from 'uuid'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import {
  appendEventToGoogleSheets,
  sendEventsEmail,
  validateBlockEvent
} from '../utils'

import { TextResponseSubmissionEventCreateInput } from './inputs/textResponseSubmissionEventCreateInput'
import { TextResponseSubmissionEventRef } from './textResponseSubmissionEvent'

builder.mutationField('textResponseSubmissionEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    nullable: false,
    type: TextResponseSubmissionEventRef,
    args: {
      input: t.arg({
        type: TextResponseSubmissionEventCreateInput,
        required: true
      })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      const { visitor, journeyVisitor, journeyId, teamId, block } =
        await validateBlockEvent(userId, input.blockId, input.stepId ?? null)

      const visitorDataUpdate: Prisma.VisitorUpdateInput = {
        lastTextResponse: input.value
      }

      // Update visitor fields based on text response type
      if (block.type === 'name') {
        visitorDataUpdate.name = input.value
      }
      if (block.type === 'email') {
        visitorDataUpdate.email = input.value
      }
      if (block.type === 'phone') {
        visitorDataUpdate.phone = input.value
      }

      const event = await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'TextResponseSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId || undefined,
          label: input.label || undefined,
          value: input.value,
          visitorId: visitor.id
        }
      })

      await Promise.all([
        prisma.visitor.update({
          where: { id: visitor.id },
          data: visitorDataUpdate
        }),
        prisma.journeyVisitor.update({
          where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
          data: {
            lastTextResponse: input.value,
            activityCount: journeyVisitor.activityCount + 1
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
            `${input.blockId}-${input.label ?? ''}`,
            input.value
          ]
        }).catch((error) => {
          console.error('Failed to append event to Google Sheets:', error)
        })
      }

      return event
    }
  })
)
