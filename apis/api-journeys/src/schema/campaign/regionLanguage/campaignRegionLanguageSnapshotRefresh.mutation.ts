import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { touchCampaign } from '../block/service'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'
import { badUserInput } from '../validation'

import { authorizeRegionLanguageUpdate, resolveJourneyId } from './service'

builder.mutationField('campaignRegionLanguageSnapshotRefresh', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      '"Refresh from journey": re-read the linked journey’s title and description from the public journey and replace the Share Language’s snapshot with them. The snapshot is the journey’s own language, so only those two values change; nothing else on the row is touched. Never automatic — the editor runs it on request, as a Command whose undo writes the previous snapshot back through `campaignRegionLanguageUpdate`.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `journeyId`): no journey is linked.\n- BAD_USER_INPUT (field: `url`): "Journey not found or not published" — the linked journey is no longer live.',
    type: CampaignRegionLanguageRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, { id: rawId }, context) => {
      const id = String(rawId)
      const regionLanguage = await authorizeRegionLanguageUpdate(
        id,
        context.user
      )
      if (regionLanguage.journeyId == null)
        throw badUserInput('No journey is linked', 'journeyId')
      const journey = await resolveJourneyId(regionLanguage.journeyId, 'url')

      return await prisma.$transaction(async (tx) => {
        const updated = await tx.campaignRegionLanguage.update({
          ...query,
          where: { id },
          data: { title: journey.title, description: journey.description }
        })
        await touchCampaign(tx, regionLanguage.region.campaign.id)
        return updated
      })
    }
  })
)
