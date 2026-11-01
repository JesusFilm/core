import { builder } from '../../builder'

export const CAMPAIGN_TEXT_SOURCES = ['human', 'machine'] as const

export type CampaignTextSourceValue = (typeof CAMPAIGN_TEXT_SOURCES)[number]

export const CampaignTextSource = builder.enumType('CampaignTextSource', {
  values: CAMPAIGN_TEXT_SOURCES,
  description:
    'Who wrote a translation: a person or the machine-translation sweep.'
})
