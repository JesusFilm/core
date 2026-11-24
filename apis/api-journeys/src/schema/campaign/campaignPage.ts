import { builder } from '../builder'

import { CampaignPageKind } from './enums'

export const CampaignPageRef = builder.prismaObject('CampaignPage', {
  description:
    'One of the two pages a Campaign has: the landing page or the Region Page every Campaign Region renders. Created with the campaign, never deletable.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    campaignId: t.exposeID('campaignId', { nullable: false }),
    kind: t.expose('kind', { type: CampaignPageKind, nullable: false })
  })
})
