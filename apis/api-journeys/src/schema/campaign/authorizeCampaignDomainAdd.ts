import { prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action } from '../../lib/auth/ability'

import { INCLUDE_CAMPAIGN_ACL, campaignAcl } from './campaign.acl'
import { badUserInput, forbidden } from './errors'

/**
 * Load the campaign a Campaign Domain is being added to, with its regions and
 * domains, and refuse it unless it is `teamId`'s, the caller may update it,
 * and it has no domain yet (GLOSSARY.md: Campaign Domain). The caller named
 * the campaign in its input, so an unknown one is `BAD_USER_INPUT` on
 * `campaignId`, like one of another team, rather than `NOT_FOUND`.
 */
export async function authorizeCampaignDomainAdd(
  campaignId: string,
  teamId: string,
  user: User
) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { ...INCLUDE_CAMPAIGN_ACL, regions: true, customDomains: true }
  })
  if (campaign == null || campaign.teamId !== teamId)
    throw badUserInput('campaign not found for this team', 'campaignId')
  if (!campaignAcl(Action.Update, campaign, user))
    throw forbidden('user is not allowed to update campaign')
  if (campaign.customDomains.length > 0)
    throw badUserInput('campaign already has a custom domain', 'campaignId')
  return campaign
}
