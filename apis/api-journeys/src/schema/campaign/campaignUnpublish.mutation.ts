import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { setCampaignStatus } from './setCampaignStatus'

builder.mutationField('campaignUnpublish', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Move a `published` Campaign back to `draft`. `publishedAt` is kept: it means "last published", not "currently live". Idempotent: an already-draft campaign is a no-op. Queues on-demand revalidation so the public pages stop serving within the publish bound; the linked journeys and their QR codes keep working at their own addresses.\n\nAuth: campaign Update — any member or manager of the campaign’s team, the same as editing.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.',
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) =>
      await setCampaignStatus(query, String(args.id), 'unpublish', context.user)
  })
)
