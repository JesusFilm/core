import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { conflict, touchCampaign } from '../block/service'
import { CampaignRegionRef } from '../campaignRegion'
import { generateUniqueRegionSlug } from '../validation'

import { NEW_REGION_NAME, authorizeRegionCreate } from './service'

builder.mutationField('campaignRegionCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Add a Campaign Region from the Region Switcher’s "+ Add": born named "New region" in the campaign default language, slugged from that name (`new-region`, `new-region-2`, …), appended last, listed, with no lines or countries and one Share Language row for the campaign default language with no journey yet. Nothing is copied: every region renders the shared Region Page.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nIdempotent per id: a retry with the id of an existing region of the same campaign returns that region.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- CONFLICT: a concurrent create took the id or the derived slug; retry.',
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

      try {
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
      } catch (error) {
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          error.code !== 'P2002'
        )
          throw error
        // A redo whose undo was skipped asks for a row that already exists:
        // answer with it, so the call is idempotent per id and campaign.
        if (id != null) {
          const existing = await prisma.campaignRegion.findUnique({
            ...query,
            where: { id: String(id) }
          })
          if (existing?.campaignId === campaignId) return existing
        }
        throw conflict(
          'another region was just added; try again',
          id != null ? 'id' : 'slug'
        )
      }
    }
  })
)
