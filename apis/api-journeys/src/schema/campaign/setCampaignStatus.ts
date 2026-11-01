import {
  Campaign,
  CampaignStatus,
  Prisma,
  prisma
} from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { authorizeCampaign } from './authorizeCampaign'
import { notFound } from './errors'
import { enqueueCampaignPagesRevalidation } from './revalidateCampaign'

/** The status each transition moves a campaign out of, and what it writes. */
const TRANSITIONS = {
  publish: {
    from: 'draft',
    data: (): Prisma.CampaignUpdateManyMutationInput => ({
      status: 'published',
      publishedAt: new Date()
    })
  },
  unpublish: {
    from: 'published',
    data: (): Prisma.CampaignUpdateManyMutationInput => ({ status: 'draft' })
  }
} as const satisfies Record<
  string,
  { from: CampaignStatus; data: () => Prisma.CampaignUpdateManyMutationInput }
>

/**
 * Publish or unpublish a campaign, as the caller with campaign Update may.
 * Atomic transition + canonical re-read, as the Template Gallery Page pair
 * does: the `from` predicate makes updateMany a no-op for a caller that lost
 * the race, so `publishedAt` is set on the winning publish only, and a
 * campaign already in the target status skips the write. Only a transition
 * queues revalidation of every page.
 */
export async function setCampaignStatus(
  query: { include?: Prisma.CampaignInclude; select?: Prisma.CampaignSelect },
  id: string,
  operation: keyof typeof TRANSITIONS,
  user: User
): Promise<Campaign> {
  const campaign = await authorizeCampaign(id, operation, user, {
    regions: true,
    customDomains: true
  })
  const transition = TRANSITIONS[operation]

  try {
    const { result, transitioned } = await prisma.$transaction(async (tx) => {
      let transitioned = false
      if (campaign.status === transition.from) {
        const { count } = await tx.campaign.updateMany({
          where: { id, status: transition.from },
          data: transition.data()
        })
        transitioned = count > 0
      }
      const result = await tx.campaign.findUniqueOrThrow({
        ...query,
        where: { id }
      })
      return { result, transitioned }
    })
    if (transitioned) await enqueueCampaignPagesRevalidation(campaign)
    return result
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    )
      throw notFound('campaign not found')
    throw error
  }
}
