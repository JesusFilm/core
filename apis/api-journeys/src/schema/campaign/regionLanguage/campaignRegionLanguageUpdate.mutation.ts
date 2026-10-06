import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { touchCampaign } from '../block/service'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'
import { JourneyWithPublicUrl } from '../getJourneyPublicUrl'
import { resolveJourneyId, resolveJourneyLink } from '../journeyLink'
import { TEXT_CAPS, assertLengthOrNull } from '../validation'

import { CampaignRegionLanguageUpdateInput } from './inputs'
import {
  authorizeRegionLanguageUpdate,
  createRegionLanguageQrCode,
  deleteQrCodes,
  retargetRegionLanguageQrCode
} from './service'

builder.mutationField('campaignRegionLanguageUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Link, swap, unlink or re-describe the journey a Share Language hands out. A pasted `url` (admin link or public URL on any domain) resolves to a live-published journey of any team with the routing filter skipped, and its title and description are snapshotted; `journeyId` links by id or, as `null`, unlinks. The Campaign QR Code follows in the same step: linking creates a `QrCode` row in the campaign’s team with its short link (drafts too, never lazily), swapping retargets the same short link so printed codes stay valid, unlinking deletes the row and its short link. Linking another team’s journey needs no rights there and creates no journey access row. `title` and `description` edit the snapshot.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `url` / `journeyId`): not a journey link, or "Journey not found or not published".\n- BAD_USER_INPUT (field: `title` / `description`): over the length cap.',
    type: CampaignRegionLanguageRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignRegionLanguageUpdateInput, required: true })
    },
    resolve: async (query, _parent, { id: rawId, input }, context) => {
      const id = String(rawId)
      const regionLanguage = await authorizeRegionLanguageUpdate(
        id,
        context.user
      )
      const campaign = regionLanguage.region.campaign
      const data: Prisma.CampaignRegionLanguageUncheckedUpdateInput = {}

      if (input.title !== undefined)
        data.title = assertLengthOrNull(
          input.title,
          'title',
          TEXT_CAPS.journeyTitle
        )
      if (input.description !== undefined)
        data.description = assertLengthOrNull(
          input.description,
          'description',
          TEXT_CAPS.journeyDescription
        )

      let journey: JourneyWithPublicUrl | null | undefined
      if (input.url != null) journey = await resolveJourneyLink(input.url)
      else if (input.journeyId !== undefined)
        journey =
          input.journeyId == null
            ? null
            : await resolveJourneyId(String(input.journeyId))

      return await prisma.$transaction(async (tx) => {
        if (journey === null && regionLanguage.journeyId != null) {
          // Unlink: the QR row and its short link go; a relink mints new ones.
          if (regionLanguage.qrCode != null)
            await deleteQrCodes(tx, [regionLanguage.qrCode])
          data.journeyId = null
          data.qrCodeId = null
          data.title = null
          data.description = null
        } else if (journey != null) {
          data.journeyId = journey.id
          data.title = journey.title
          data.description = journey.description
          if (regionLanguage.qrCode == null)
            data.qrCodeId = await createRegionLanguageQrCode(
              tx,
              campaign.teamId,
              journey.id
            )
          else if (regionLanguage.qrCode.toJourneyId !== journey.id)
            await retargetRegionLanguageQrCode(
              tx,
              regionLanguage.qrCode,
              journey.id
            )
        }

        const updated = await tx.campaignRegionLanguage.update({
          ...query,
          where: { id },
          data
        })
        await touchCampaign(tx, campaign.id)
        return updated
      })
    }
  })
)
