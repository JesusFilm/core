import { builder } from '../../builder'
import { CampaignColumnsRatio } from '../enums'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignColumnsBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignColumnsBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignColumnsBlock',
  description:
    'A two-column section: always exactly two CampaignColumnBlock children (the Column Slots) at parentOrder 0 and 1, each holding at most one section. Extras are children after the slots.',
  fields: (t) => ({
    ratio: t.field({
      type: CampaignColumnsRatio,
      nullable: false,
      description: 'Width of the two slots at `md` and up; defaults to equal.',
      resolve: (block) => block.ratio ?? 'equal'
    })
  })
})
