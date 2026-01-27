import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import {
  appendEventToGoogleSheets,
  sendEventsEmail,
  validateBlockEvent
} from '../utils'

import { SignUpSubmissionEventCreateInput } from './inputs/signUpSubmissionEventCreateInput'
import { SignUpSubmissionEventRef } from './signUpSubmissionEvent'

builder.mutationField('signUpSubmissionEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    nullable: false,
    type: SignUpSubmissionEventRef,
    args: {
      input: t.arg({
        type: SignUpSubmissionEventCreateInput,
        required: true
      })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      const { visitor, journeyVisitor, journeyId, teamId } =
        await validateBlockEvent(userId, input.blockId, input.stepId ?? null)

      const event = await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'SignUpSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId || undefined,
          label: null,
          value: input.name,
          email: input.email,
          visitorId: visitor.id
        }
      })

      // Only update visitor name/email if not already set
      const visitorUpdates: Record<string, string> = {}
      if (visitor.name == null) {
        visitorUpdates.name = input.name
      }
      if (visitor.email == null) {
        visitorUpdates.email = input.email
      }

      if (Object.keys(visitorUpdates).length > 0) {
        await Promise.all([
          prisma.visitor.update({
            where: { id: visitor.id },
            data: visitorUpdates
          }),
          prisma.journeyVisitor.update({
            where: {
              journeyId_visitorId: { journeyId, visitorId: visitor.id }
            },
            data: { activityCount: journeyVisitor.activityCount + 1 }
          })
        ])
      }

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
            `${input.blockId}-`,
            input.name
          ]
        }).catch((error) => {
          console.error('Failed to append event to Google Sheets:', error)
        })
      }

      return event
    }
  })
)
