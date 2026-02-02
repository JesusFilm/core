import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { appendEventToGoogleSheets, validateBlockEvent } from '../utils'

import { MultiselectSubmissionEventCreateInput } from './inputs/multiselectSubmissionEventCreateInput'
import { MultiselectSubmissionEventRef } from './multiselectSubmissionEvent'

builder.mutationField('multiselectSubmissionEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    nullable: false,
    type: MultiselectSubmissionEventRef,
    args: {
      input: t.arg({
        type: MultiselectSubmissionEventCreateInput,
        required: true
      })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyVisitor, journeyId, teamId } =
        await validateBlockEvent(userId, input.blockId, input.stepId ?? null)

      const event = await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'MultiselectSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId || undefined,
          label: input.label || undefined,
          value: input.values.join(', '),
          visitorId: visitor.id
        }
      })

      await prisma.journeyVisitor.update({
        where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
        data: {
          activityCount: journeyVisitor.activityCount + 1,
          lastMultiselectSubmission: input.label || null
        }
      })

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
            input.values.join(', ')
          ]
        }).catch((error) => {
          console.error('Failed to append event to Google Sheets:', error)
        })
      }

      return event
    }
  })
)
