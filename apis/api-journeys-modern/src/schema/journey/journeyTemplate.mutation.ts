import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'
import { queue as plausibleQueue } from '../../workers/plausible/queue'
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
      override: { from: 'api-journeys' },
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
          const FIVE_DAYS = 5 * 24 * 60 * 60
          void plausibleQueue.add(
            'create-template-site',
            {
              __typename: 'plausibleCreateTemplateSite',
              templateId: journeyId
            },
            {
              removeOnComplete: true,
              removeOnFail: { age: FIVE_DAYS, count: 50 }
            }
          )
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
