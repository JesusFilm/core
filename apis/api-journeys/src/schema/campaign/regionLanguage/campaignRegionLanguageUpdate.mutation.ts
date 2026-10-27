import { Prisma, prisma } from '@core/prisma/journeys/client'

import { GATEWAY_TIMEOUT_MS } from '../../../lib/gateway/graphqlRequest'
import { builder } from '../../builder'
import { logger } from '../../logger'
import { snapshotOf } from '../block/journey/snapshot'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'
import { touchCampaign } from '../campaignWrite'
import { JourneyWithPublicUrl } from '../getJourneyPublicUrl'
import { resolveJourneyId, resolveJourneyLink } from '../journeyLink'
import {
  NULL_FIELD_ERROR,
  TEXT_CAPS,
  assertLengthOrNull,
  assertNotNull
} from '../validation'

import { CampaignRegionLanguageUpdateInput } from './inputs'
import {
  ShortLinkStep,
  authorizeRegionLanguageUpdate,
  createRegionLanguageQrCode,
  lockRegionLanguage,
  retargetRegionLanguageQrCode
} from './service'

builder.mutationField('campaignRegionLanguageUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Link, swap, unlink or re-describe the journey a Share Language hands out. A pasted `url` (admin link or public URL on any domain) resolves to a live-published journey of any team with the routing filter skipped, and its title and description are snapshotted; `journeyId` links by id or, as `null`, unlinks. The Campaign QR Code follows in the same step: linking creates a `QrCode` row in the campaign’s team with its short link (drafts too, never lazily), swapping retargets the same short link so printed codes stay valid, unlinking keeps the row and its short link, which a later link retargets. Re-linking the journey already linked keeps the snapshot and only creates a missing Campaign QR Code. Linking another team’s journey needs no rights there and creates no journey access row. `title` and `description` edit the snapshot and mark it edited (`snapshotEdited`, which an undo can set back outright); linking another journey or unlinking clears the mark.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `url` / `journeyId`): not a journey link, or "Journey not found or not published".\n- BAD_USER_INPUT (field: `title` / `description`): over the length cap.\n' +
      NULL_FIELD_ERROR,
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
      const url = assertNotNull(input.url, 'url')
      const snapshotEdited = assertNotNull(
        input.snapshotEdited,
        'snapshotEdited'
      )
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
      if (input.title !== undefined || input.description !== undefined)
        data.snapshotEdited = true
      if (snapshotEdited !== undefined) data.snapshotEdited = snapshotEdited

      let journey: JourneyWithPublicUrl | null | undefined
      if (url !== undefined) journey = await resolveJourneyLink(url)
      else if (input.journeyId !== undefined)
        journey =
          input.journeyId == null
            ? null
            : await resolveJourneyId(String(input.journeyId))

      // The short-link step is decided inside the transaction and applied as its
      // last statement; should the transaction fail after that, it is undone.
      const shortLink: { step?: ShortLinkStep; applied: boolean } = {
        applied: false
      }
      try {
        return await prisma.$transaction(
          async (tx) => {
            // Decide from the row as locked, not as authorised: a concurrent
            // call may already have linked or unlinked it.
            await lockRegionLanguage(tx, id)
            const current = await tx.campaignRegionLanguage.findUniqueOrThrow({
              where: { id },
              include: { qrCode: true }
            })

            if (journey === null && current.journeyId != null) {
              // Unlink: the QR row and its short link stay, still pointing at
              // the last linked journey, so printed codes keep working; a
              // later link retargets them.
              data.journeyId = null
              data.title = null
              data.description = null
              data.snapshotEdited = false
            } else if (journey != null) {
              // Re-linking the journey already linked keeps its snapshot, an
              // edited one included; it only mints a missing QR code.
              if (journey.id !== current.journeyId) {
                data.journeyId = journey.id
                const snapshot = snapshotOf(journey)
                data.title = snapshot.title
                data.description = snapshot.description
                data.snapshotEdited = false
              }
              if (current.qrCode == null) {
                const created = await createRegionLanguageQrCode(
                  tx,
                  campaign.teamId,
                  journey.id
                )
                data.qrCodeId = created.qrCodeId
                shortLink.step = created.step
              } else if (current.qrCode.toJourneyId !== journey.id)
                shortLink.step = await retargetRegionLanguageQrCode(
                  tx,
                  current.qrCode,
                  journey.id
                )
            }

            const updated = await tx.campaignRegionLanguage.update({
              ...query,
              where: { id },
              data
            })
            await touchCampaign(tx, campaign.id)
            await shortLink.step?.apply()
            shortLink.applied = shortLink.step != null
            return updated
          },
          // The short-link step is a gateway call of up to
          // GATEWAY_TIMEOUT_MS inside this transaction: outlast it.
          { timeout: GATEWAY_TIMEOUT_MS + 5_000 }
        )
      } catch (error) {
        if (shortLink.applied)
          await shortLink.step?.revert().catch((revertError) => {
            logger.error({ error: revertError }, 'short link revert failed')
          })
        throw error
      }
    }
  })
)
