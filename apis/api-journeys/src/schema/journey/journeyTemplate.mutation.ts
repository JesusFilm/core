import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'
import { enqueueTemplateSite } from '../../workers/plausible/templateSite'
import { builder } from '../builder'

import { JourneyTemplateInput } from './inputs'
import { JourneyRef } from './journey'
import { Action, journeyAcl } from './journey.acl'

builder.mutationField('journeyTemplate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: JourneyTemplateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const journeyId = String(args.id)

        const journey = await prisma.journey.findUnique({
          where: { id: journeyId },
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } }
          }
        })
        if (journey == null)
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        const isGlobalTemplate = journey.team?.id === 'jfp-team'
        if (
          isGlobalTemplate &&
          !journeyAcl(
            Action.Manage,
            { ...journey, template: journey.template },
            context.user
          )
        )
          throw new GraphQLError(
            'user is not allowed to change journey to or from a template',
            { extensions: { code: 'FORBIDDEN' } }
          )

        if (args.input.template === true) {
          void enqueueTemplateSite(journeyId)
        }

        const updatedJourney = await prisma.journey.update({
          ...query,
          where: { id: journeyId },
          data: {
            template: args.input.template ?? undefined
          }
        })
        await recalculateJourneyCustomizable(journeyId)
        return updatedJourney
      }
    })
)
