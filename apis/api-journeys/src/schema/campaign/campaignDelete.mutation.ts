import { enqueueShortLinkDeletes } from '../../workers/shortlinkDelete/queue'
import { builder } from '../builder'
import { deleteVercelDomain } from '../customDomain/service'
import { logger } from '../logger'

import { authorizeCampaign } from './authorizeCampaign'
import { CampaignRef } from './campaign'
import { campaignWrite } from './campaignWrite'
import { deleteQrCodes, findRegionQrCodes } from './regionLanguage/service'
import {
  queuePageSetChange,
  snapshotCampaignAddress
} from './revalidateCampaign'

builder.mutationField('campaignDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Hard-delete a Campaign. A published campaign queues on-demand revalidation of its pages, so they stop serving within the publish bound. The database cascade removes its blocks, actions, pages, languages, theme, strings, regions and their rows; every Campaign QR Code of its Share Languages is deleted with its short link; its Campaign Domain is deleted with it and removed from Vercel (a Vercel failure is logged, not thrown), and the linked journeys are untouched. Returns the deleted campaign as its last canonical view.\n\nAuth: campaign Delete — a manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not a manager of the team.',
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      const campaign = await authorizeCampaign(id, 'delete', context.user, {
        customDomains: true
      })

      // The body deletes the Campaign, so there is no row left to touch.
      return await campaignWrite(
        id,
        { touch: false },
        async ({ tx, afterCommit }) => {
          // The language rows cascade away with the campaign, so its address
          // is read before the delete; nothing is left to read after it.
          const before = await snapshotCampaignAddress(tx, id)
          const shortLinkIds = await deleteQrCodes(
            tx,
            await findRegionQrCodes(tx, { region: { campaignId: id } })
          )
          const deleted = await tx.campaign.delete({ ...query, where: { id } })
          afterCommit(async () => await enqueueShortLinkDeletes(shortLinkIds))
          afterCommit(async () => await queuePageSetChange(before, null))
          // The database cascade deleted the Campaign Domain row; its Vercel
          // registration goes after the commit, as short links do.
          afterCommit(async () => {
            await Promise.all(
              campaign.customDomains.map(async ({ name }) => {
                await deleteVercelDomain(name).catch((error: unknown) => {
                  logger.error(
                    { error, campaignId: id, name },
                    'Failed to delete campaign domain from Vercel'
                  )
                })
              })
            )
          })
          return deleted
        }
      )
    }
  })
)
