import { Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action } from '../../lib/auth/ability'
import { logger } from '../../logger'
import { builder } from '../builder'
import { INCLUDE_CAMPAIGN_ACL, campaignAcl } from '../campaign/campaign.acl'
import { badUserInput, forbidden } from '../campaign/errors'
import { enqueueCampaignDomainRevalidation } from '../campaign/revalidateCampaign'
import { isUniqueViolation } from '../campaign/validation'

import { CustomDomainRef } from './customDomain'
import { CustomDomainCreateInput } from './inputs'
import {
  createVercelDomain,
  deleteVercelDomain,
  isDomainValid,
  updateTeamShortLinks
} from './service'

type CustomDomainCreateArgs = typeof CustomDomainCreateInput.$inferInput

/**
 * The campaign a Campaign Domain is being added to, refused unless it is the
 * team's, the caller may update it, it has no domain yet, and the input asks
 * for no team routing.
 */
async function loadDomainCampaign(input: CustomDomainCreateArgs, user: User) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: String(input.campaignId) },
    include: { ...INCLUDE_CAMPAIGN_ACL, regions: true, customDomains: true }
  })
  if (campaign == null || campaign.teamId !== input.teamId)
    throw badUserInput('campaign not found for this team', 'campaignId')
  if (!campaignAcl(Action.Update, campaign, user))
    throw forbidden('user is not allowed to update campaign')
  if (campaign.customDomains.length > 0)
    throw badUserInput('campaign already has a custom domain', 'campaignId')
  if (input.routeAllTeamJourneys === true)
    throw badUserInput(
      'a campaign domain cannot route team journeys',
      'routeAllTeamJourneys'
    )
  if (input.journeyCollectionId != null)
    throw badUserInput(
      'a campaign domain cannot serve a journey collection',
      'journeyCollectionId'
    )
  return campaign
}

/**
 * A concurrent create gave the campaign its domain first, after this request
 * had registered `name` with Vercel. Remove that registration unless a row
 * owns the name (the other request may have used the same one); a Vercel
 * failure is logged, not thrown.
 */
async function releaseVercelDomain(name: string): Promise<void> {
  try {
    const owner = await prisma.customDomain.findUnique({ where: { name } })
    if (owner != null) return
    await deleteVercelDomain(name)
  } catch (error) {
    logger.error(
      { name, error },
      'Failed to remove campaign domain from Vercel after a lost race'
    )
  }
}

builder.mutationField('customDomainCreate', (t) =>
  t
    .withAuth((_parent, args) => ({
      $all: {
        isAuthenticated: true,
        isTeamManager: (
          args.input as typeof CustomDomainCreateInput.$inferInput
        ).teamId
      }
    }))
    .prismaField({
      type: CustomDomainRef,
      nullable: false,
      args: {
        input: t.arg({ type: CustomDomainCreateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const { input } = args

        if (!isDomainValid(input.name))
          throw badUserInput('custom domain has invalid domain name', 'name')

        const campaign =
          input.campaignId == null
            ? null
            : await loadDomainCampaign(input, context.user)

        let registeredWithVercel = false
        const customDomain = await prisma
          .$transaction(async (tx) => {
            const { apexName } = await createVercelDomain(input.name)
            registeredWithVercel = true

            const data: Prisma.CustomDomainCreateInput = {
              ...(input.id != null ? { id: input.id } : {}),
              name: input.name,
              apexName,
              team: { connect: { id: input.teamId } },
              routeAllTeamJourneys:
                campaign != null
                  ? false
                  : (input.routeAllTeamJourneys ?? undefined),
              ...(campaign != null
                ? { campaign: { connect: { id: campaign.id } } }
                : {})
            }

            if (input.journeyCollectionId != null) {
              data.journeyCollection = {
                connect: { id: input.journeyCollectionId }
              }
            }

            return await tx.customDomain.create({
              ...query,
              data
            })
          })
          .catch(async (err: unknown) => {
            // Two creates raced for one campaign: the unique campaignId index
            // refused the second, which is no fault of the domain name.
            if (campaign != null && isUniqueViolation(err, 'campaignId')) {
              if (registeredWithVercel) await releaseVercelDomain(input.name)
              throw badUserInput(
                'campaign already has a custom domain',
                'campaignId'
              )
            }
            if (isUniqueViolation(err, 'name'))
              throw badUserInput('custom domain already exists', 'name')
            throw err
          })

        // A Campaign Domain serves no team journey, so no short link moves;
        // the campaign's pages leave the root address and start on the domain.
        if (campaign != null) {
          await enqueueCampaignDomainRevalidation([campaign], customDomain.name)
          return customDomain
        }

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
