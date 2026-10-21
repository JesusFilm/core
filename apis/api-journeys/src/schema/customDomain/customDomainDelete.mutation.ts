import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { logger } from '../../logger'
import { builder } from '../builder'
import {
  campaignLanguageTags,
  campaignPagePaths,
  enqueueCampaignRevalidation
} from '../campaign/revalidateCampaign'

import { CustomDomainRef } from './customDomain'
import { canAccessCustomDomain } from './customDomain.acl'
import { deleteVercelDomain, updateTeamShortLinks } from './service'

builder.mutationField('customDomainDelete', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: CustomDomainRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      const customDomain = await prisma.customDomain.findUnique({
        where: { id },
        include: {
          team: { include: { userTeams: true } },
          campaign: { include: { regions: true } }
        }
      })

      if (customDomain == null) {
        throw new GraphQLError('custom domain not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessCustomDomain(Action.Delete, customDomain, context.user)) {
        throw new GraphQLError('user is not allowed to delete custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      await prisma.$transaction(async (tx) => {
        await tx.customDomain.delete({ where: { id } })
        await deleteVercelDomain(customDomain)
      })

      // The domain form of the Campaign Root it released stops resolving, and
      // the root-domain form loses its canonical link to the domain.
      const { campaign } = customDomain
      if (campaign?.status === 'published')
        await enqueueCampaignRevalidation(
          campaignPagePaths({
            ...campaign,
            hostnames: [customDomain.name],
            languageTags: await campaignLanguageTags(campaign.id)
          })
        )

      try {
        await updateTeamShortLinks(customDomain.teamId)
      } catch (error) {
        logger.error(
          { teamId: customDomain.teamId, error },
          'Failed to update team QR code short links'
        )
      }

      return customDomain
    }
  })
)
