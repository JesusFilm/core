import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { CampaignRegionRef } from '../campaignRegion'
import { campaignWrite } from '../campaignWrite'
import { badUserInput, conflict } from '../errors'
import { generateUniqueRegionSlug } from '../slug'
import {
  CAMPAIGN_REGIONS_MAX,
  assertClientId,
  isUniqueViolation
} from '../validation'

import { NEW_REGION_NAME, authorizeRegionCreate } from './service'

builder.mutationField('campaignRegionCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Add a Campaign Region from the Region Switcher’s "+ Add": born named "New region" in the campaign default language, slugged from that name (`new-region`, `new-region-2`, …, skipping the slugs of the team’s live journeys), appended last, listed, with no lines or countries and one Share Language row for the campaign default language with no journey yet. Nothing is copied: every region renders the shared Region Page.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nIdempotent per id: a retry with the id of an existing region of the same campaign returns that region.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `id`): not a UUID.\n- BAD_USER_INPUT (field: `campaignId`): the campaign already has 100 regions.\n- CONFLICT: a concurrent create took the id or the derived slug; retry.',
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
      const clientId = assertClientId(id)

      try {
        return await campaignWrite(
          campaignId,
          { structure: true },
          async ({ tx }) => {
            const order = await tx.campaignRegion.count({
              where: { campaignId }
            })
            if (order >= CAMPAIGN_REGIONS_MAX)
              throw badUserInput(
                `a campaign has at most ${CAMPAIGN_REGIONS_MAX} regions`,
                'campaignId'
              )
            const slug = await generateUniqueRegionSlug(
              campaign,
              NEW_REGION_NAME,
              tx
            )
            return await tx.campaignRegion.create({
              ...query,
              data: {
                id: clientId,
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
          }
        )
      } catch (error) {
        const idTaken = clientId != null && isUniqueViolation(error, 'id')
        if (!idTaken && !isUniqueViolation(error, 'slug')) throw error
        // A redo whose undo was skipped asks for a row that already exists:
        // answer with it, so the call is idempotent per id and campaign.
        if (idTaken) {
          const existing = await prisma.campaignRegion.findUnique({
            ...query,
            where: { id: clientId }
          })
          if (existing?.campaignId === campaignId) return existing
        }
        throw conflict(
          'another region was just added; try again',
          idTaken ? 'id' : 'slug'
        )
      }
    }
  })
)
