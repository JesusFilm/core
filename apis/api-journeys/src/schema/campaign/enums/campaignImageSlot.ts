import { builder } from '../../builder'

export const CAMPAIGN_IMAGE_SLOTS = ['cover', 'logo'] as const
export type CampaignImageSlotValue = (typeof CAMPAIGN_IMAGE_SLOTS)[number]

export const CampaignImageSlot = builder.enumType('CampaignImageSlot', {
  values: CAMPAIGN_IMAGE_SLOTS,
  description:
    'Which slot of its parent an owned CampaignImageBlock fills: the Section Background `cover` of any section or chrome block, or the header `logo` (the Brand Mark). An owned image has `parentOrder: null` and replaces the slot’s previous image.'
})
