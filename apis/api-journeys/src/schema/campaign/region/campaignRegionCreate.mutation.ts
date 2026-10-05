import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { touchCampaign } from '../block/service'
import { CampaignRegionRef } from '../campaignRegion'
import { generateUniqueRegionSlug } from '../validation'

import { NEW_REGION_NAME, authorizeRegionCreate } from './service'

builder.mutationField('campaignRegionCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Add a Campaign Region from the Region Switcher’s "+ Add": born named "New region" in the campaign default language, slugged from that name (`new-region`, `new-region-2`, …), appended last, listed, with no lines or countries and one Share Language row for the campaign default language with no journey yet. Nothing is copied: every region renders the shared Region Page.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve.\n- FORBIDDEN: caller is not in the team.',
    type: CampaignRegionRef,
    nullable: false,
    args: {
      campaignId: t.arg({ type: 'ID', required: true }),
      id: t.arg({
        type: 'ID',
        required: false,
        description: 'A client-generated id, so a redo recreates the same row.'
      })
    },
    resolve: async (
      query,
      _parent,
      { campaignId: rawCampaignId, id },
      context
    ) => {
      const campaignId = String(rawCampaignId)
      const campaign = await authorizeRegionCreate(campaignId, context.user)

      return await prisma.$transaction(async (tx) => {
        const slug = await generateUniqueRegionSlug(
          campaignId,
          NEW_REGION_NAME,
          tx
        )
        const order = await tx.campaignRegion.count({ where: { campaignId } })
        const region = await tx.campaignRegion.create({
          ...query,
          data: {
            id: id != null ? String(id) : undefined,
            campaignId,
            name: NEW_REGION_NAME,
            slug,
            order,
            listed: true,
            languages: {
              create: { languageId: campaign.defaultLanguageId, order: 0 }
            }
          }
        })
        await touchCampaign(tx, campaignId)
        return region
      })
    }
  })
)
