import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { snapshotOf } from '../block/journey/snapshot'
import { touchCampaign } from '../block/service'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'
import { badUserInput, conflict } from '../errors'
import { resolveJourneyId } from '../journeyLink'

import { authorizeRegionLanguageUpdate, lockRegionLanguage } from './service'

builder.mutationField('campaignRegionLanguageSnapshotRefresh', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      '"Refresh from journey": re-read the linked journey’s title and description from the public journey and replace the Share Language’s snapshot with them. The snapshot is the journey’s own language, so only those two values change; nothing else on the row is touched. Never automatic — the editor runs it on request, as a Command whose undo writes the previous snapshot back through `campaignRegionLanguageUpdate`.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `journeyId`): no journey is linked.\n- BAD_USER_INPUT (field: `url`): "Journey not found or not published" — the linked journey is no longer live.\n- CONFLICT (field: `journeyId`): a concurrent call linked another journey; retry.',
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
        // Decide from the row as locked, not as authorised: a concurrent
        // unlink or swap may have changed the journey since.
        await lockRegionLanguage(tx, id)
        const current = await tx.campaignRegionLanguage.findUniqueOrThrow({
          where: { id },
          select: { journeyId: true }
        })
        if (current.journeyId == null)
          throw badUserInput('No journey is linked', 'journeyId')
        if (current.journeyId !== journey.id)
          throw conflict(
            'another journey was just linked; try again',
            'journeyId'
          )
        const updated = await tx.campaignRegionLanguage.update({
          ...query,
          where: { id },
          data: {
            ...snapshotOf(journey),
            snapshotEdited: false
          }
        })
        await touchCampaign(tx, regionLanguage.region.campaign.id)
        return updated
      })
    }
  })
)
