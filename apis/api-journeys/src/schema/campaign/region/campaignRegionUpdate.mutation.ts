import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { SlugTakenError } from '../../templateGalleryPage/generateUniqueSlug'
import { touchCampaign } from '../block/service'
import { CampaignRegionRef } from '../campaignRegion'
import { enqueueRegionRevalidation } from '../revalidateCampaign'
import {
  TEXT_CAPS,
  assertLength,
  assertRegionSlugFreeOfJourneys,
  validateRegionSlug
} from '../validation'

import { CampaignRegionUpdateInput } from './inputs'
import { authorizeRegionUpdate, getRegions } from './service'

builder.mutationField('campaignRegionUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Update a Campaign Region’s settings: the default-language name, the slug and whether it is listed on the Region Switcher. The slug never follows a name change; it moves only when given here, and links already shared to the old region address stop resolving. List and unlist are one-field changes with no confirmation.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `name`): empty or over 60 characters.\n- BAD_USER_INPUT (field: `slug`): fails the shape, length or reserved-word checks, is taken by another region of the campaign (including the concurrent-update race on the unique constraint), or equals the slug of a journey in the campaign’s team.\n\nA slug or listing change on a published campaign queues on-demand revalidation of the campaign’s pages, including the region’s previous path.',
    type: CampaignRegionRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignRegionUpdateInput, required: true })
    },
    resolve: async (query, _parent, { id: rawId, input }, context) => {
      const id = String(rawId)
      const region = await authorizeRegionUpdate(id, context.user)

      const data: Prisma.CampaignRegionUpdateInput = {}
      if (input.name != null)
        data.name = assertLength(input.name, 'name', TEXT_CAPS.regionName, {
          required: true
        })
      if (input.slug != null) {
        const slug = await validateRegionSlug(region.campaignId, input.slug, id)
        await assertRegionSlugFreeOfJourneys(region.campaign.teamId, slug)
        data.slug = slug
      }
      if (input.listed != null) data.listed = input.listed

      try {
        const { updated, regionSlugs } = await prisma.$transaction(
          async (tx) => {
            const updated = await tx.campaignRegion.update({
              ...query,
              where: { id },
              data
            })
            await touchCampaign(tx, region.campaignId)
            const regions = await getRegions(region.campaignId, tx)
            return {
              updated,
              regionSlugs: [
                region.slug,
                ...regions.map((candidate) => candidate.slug)
              ]
            }
          }
        )
        const pathsChanged =
          (data.slug != null && data.slug !== region.slug) ||
          (data.listed != null && data.listed !== region.listed)
        if (pathsChanged)
          await enqueueRegionRevalidation(region.campaign, regionSlugs)
        return updated
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          Array.isArray(error.meta?.target) &&
          (error.meta.target as string[]).includes('slug')
        )
          throw new SlugTakenError()
        throw error
      }
    }
  })
)
