import { Prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { SlugTakenError } from '../../templateGalleryPage/generateUniqueSlug'
import { CampaignRegionRef } from '../campaignRegion'
import { campaignWrite } from '../campaignWrite'
import { enqueueRegionRevalidation } from '../revalidateCampaign'
import { assertRegionSlugFreeOfJourneys, validateRegionSlug } from '../slug'
import {
  NULL_FIELD_ERROR,
  TEXT_CAPS,
  assertLength,
  assertNotNull,
  isUniqueViolation
} from '../validation'

import { CampaignRegionUpdateInput } from './inputs'
import { authorizeRegionUpdate } from './service'

builder.mutationField('campaignRegionUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      `Update a Campaign Region’s settings: the default-language name, the slug and whether it is listed on the Region Switcher. The slug never follows a name change; it moves only when given here, and links already shared to the old region address stop resolving. List and unlist are one-field changes with no confirmation.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`name\`): empty or over ${TEXT_CAPS.regionName} characters.\n- BAD_USER_INPUT (field: \`slug\`): fails the shape, length or reserved-word checks, is taken by another region of the campaign (including the concurrent-update race on the unique constraint), or equals the slug of a journey in the campaign’s team.\n` +
      NULL_FIELD_ERROR +
      '\n\nA slug or listing change on a published campaign queues on-demand revalidation of the campaign’s pages, including the region’s previous path.',
    type: CampaignRegionRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignRegionUpdateInput, required: true })
    },
    resolve: async (query, _parent, { id: rawId, input }, context) => {
      const id = String(rawId)
      const region = await authorizeRegionUpdate(id, context.user)

      const name = assertNotNull(input.name, 'name')
      const rawSlug = assertNotNull(input.slug, 'slug')
      const listed = assertNotNull(input.listed, 'listed')

      const data: Prisma.CampaignRegionUpdateInput = {}
      if (name !== undefined)
        data.name = assertLength(name, 'name', TEXT_CAPS.regionName, {
          required: true
        })
      if (rawSlug !== undefined) {
        const slug = await validateRegionSlug(region.campaignId, rawSlug, id)
        await assertRegionSlugFreeOfJourneys(region.campaign.teamId, slug)
        data.slug = slug
      }
      if (listed !== undefined) data.listed = listed

      try {
        const { updated, regionSlugs } = await campaignWrite(
          region.campaignId,
          {},
          async ({ tx }) => {
            const updated = await tx.campaignRegion.update({
              ...query,
              where: { id },
              data
            })
            const regions = await tx.campaignRegion.findMany({
              where: { campaignId: region.campaignId },
              orderBy: { order: 'asc' }
            })
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
        if (isUniqueViolation(error, 'slug')) throw new SlugTakenError()
        throw error
      }
    }
  })
)
