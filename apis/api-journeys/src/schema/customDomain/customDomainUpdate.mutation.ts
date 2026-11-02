import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { logger } from '../../logger'
import { builder } from '../builder'
import { badUserInput, forbidden, notFound } from '../campaign/errors'

import { CustomDomainRef } from './customDomain'
import { canAccessCustomDomain } from './customDomain.acl'
import { CustomDomainUpdateInput } from './inputs'
import { updateTeamShortLinks } from './service'

builder.mutationField('customDomainUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: CustomDomainRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CustomDomainUpdateInput, required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const { id, input } = args

      const customDomain = await prisma.customDomain.findUnique({
        where: { id },
        include: { team: { include: { userTeams: true } } }
      })

      if (customDomain == null) throw notFound('custom domain not found')

      if (!canAccessCustomDomain(Action.Update, customDomain, context.user))
        throw forbidden('user is not allowed to update custom domain')

      // A Campaign Domain serves only its campaign: it never takes team
      // routing, so there is nothing on it to update. The refusal is the
      // domain's, not one input key's.
      if (customDomain.campaignId != null)
        throw badUserInput(
          'a campaign domain serves only its campaign and cannot be rerouted',
          'id'
        )

      let journeyCollectionUpdate:
        | { connect: { id: string } }
        | { disconnect: true }
        | undefined

      if ('journeyCollectionId' in input) {
        if (input.journeyCollectionId == null) {
          journeyCollectionUpdate = { disconnect: true }
        } else {
          const journeyCollection = await prisma.journeyCollection.findFirst({
            where: {
              id: input.journeyCollectionId,
              teamId: customDomain.teamId
            }
          })

          if (journeyCollection == null)
            throw forbidden(
              'journey collection not found for this custom domain team'
            )

          journeyCollectionUpdate = {
            connect: { id: input.journeyCollectionId }
          }
        }
      }

      const updated = await prisma.customDomain.update({
        ...query,
        where: { id },
        data: {
          routeAllTeamJourneys: input.routeAllTeamJourneys ?? undefined,
          journeyCollection: journeyCollectionUpdate
        }
      })

      const routeAllChanged =
        input.routeAllTeamJourneys != null &&
        input.routeAllTeamJourneys !== customDomain.routeAllTeamJourneys
      const journeyCollectionChanged =
        'journeyCollectionId' in input &&
        (input.journeyCollectionId ?? null) !== customDomain.journeyCollectionId
      if (routeAllChanged || journeyCollectionChanged) {
        try {
          await updateTeamShortLinks(customDomain.teamId)
        } catch (error) {
          logger.error(
            { teamId: customDomain.teamId, error },
            'Failed to update team QR code short links'
          )
        }
      }

      return updated
    }
  })
)
