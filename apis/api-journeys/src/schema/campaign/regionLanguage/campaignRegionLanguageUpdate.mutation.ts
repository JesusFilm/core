import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { touchCampaign } from '../block/service'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'
import { JourneyWithPublicUrl } from '../getJourneyPublicUrl'
import { TEXT_CAPS, assertLengthOrNull } from '../validation'

import { CampaignRegionLanguageUpdateInput } from './inputs'
import {
  authorizeRegionLanguageUpdate,
  createRegionLanguageQrCode,
  deleteQrCodes,
  deleteShortLinks,
  lockRegionLanguage,
  resolveJourneyId,
  resolveJourneyLink,
  retargetRegionLanguageQrCode,
  runWithShortLinkStep
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

      let deletedShortLinkIds: string[] = []
      const updated = await runWithShortLinkStep(
        async (shortLinkStep) =>
          await prisma.$transaction(async (tx) => {
            // Decide from the row as locked, not as authorised: a concurrent
            // call may already have linked or unlinked it.
            await lockRegionLanguage(tx, id)
            const current = await tx.campaignRegionLanguage.findUniqueOrThrow({
              where: { id },
              include: { qrCode: true }
            })

            if (journey === null && current.journeyId != null) {
              // Unlink: the QR row goes now, its short link after commit; a relink mints new ones.
              if (current.qrCode != null)
                deletedShortLinkIds = await deleteQrCodes(tx, [current.qrCode])
              data.journeyId = null
              data.qrCodeId = null
              data.title = null
              data.description = null
            } else if (journey != null) {
              data.journeyId = journey.id
              data.title = journey.title
              data.description = journey.description
              if (current.qrCode == null) {
                const created = await createRegionLanguageQrCode(
                  tx,
                  campaign.teamId,
                  journey.id
                )
                data.qrCodeId = created.qrCodeId
                shortLinkStep.defer(created.step)
              } else if (current.qrCode.toJourneyId !== journey.id)
                shortLinkStep.defer(
                  await retargetRegionLanguageQrCode(
                    tx,
                    current.qrCode,
                    journey.id
                  )
                )
            }

            const updated = await tx.campaignRegionLanguage.update({
              ...query,
              where: { id },
              data
            })
            await touchCampaign(tx, campaign.id)
            await shortLinkStep.apply()
            return updated
          })
      )
      await deleteShortLinks(deletedShortLinkIds)
      return updated
    }
  })
)
