import { builder } from '../../builder'

export const CAMPAIGN_IMAGE_SLOTS = ['cover', 'logo', 'media'] as const
export type CampaignImageSlotValue = (typeof CAMPAIGN_IMAGE_SLOTS)[number]

export const CampaignImageSlot = builder.enumType('CampaignImageSlot', {
  values: CAMPAIGN_IMAGE_SLOTS,
  description:
    'Which slot of its parent an owned CampaignImageBlock fills: the Section Background `cover` of any section or chrome block, the header `logo` (the Brand Mark), or the `media` slot of a hero or Featured Media section. An owned image has `parentOrder: null` and replaces the slot’s previous block.'
})
