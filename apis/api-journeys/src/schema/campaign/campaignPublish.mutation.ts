import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { setCampaignStatus } from './setCampaignStatus'

builder.mutationField('campaignPublish', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Move a `draft` Campaign to `published`, stamping `publishedAt` on the first publish only. Idempotent: an already-published campaign is a no-op (no state change, no re-stamp). Queues on-demand revalidation of the landing page and every region page; nothing on a campaign is locked by its status.\n\nAuth: campaign Update — any member or manager of the campaign’s team, the same as editing.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.',
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) =>
      await setCampaignStatus(query, String(args.id), 'publish', context.user)
  })
)
