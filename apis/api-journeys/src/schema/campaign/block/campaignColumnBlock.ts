import { builder } from '../../builder'

import { CampaignBlock } from './campaignBlock'

export const CampaignColumnBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignColumnBlock',
  interfaces: [CampaignBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignColumnBlock',
  description:
    'A Column Slot: one of the two fixed cells of a CampaignColumnsBlock. It holds at most one section as its only child; it is created with its Columns section, swapped by an order update, and never deleted or reparented on its own. It carries no fields beyond CampaignBlock.',
  fields: () => ({})
})
