import { builder } from '../../builder'
import { CAMPAIGN_TEXT_FIELD_VALUES } from '../translation/textFields'

export const CampaignTextField = builder.enumType('CampaignTextField', {
  values: CAMPAIGN_TEXT_FIELD_VALUES,
  description:
    'Every translatable text field of a Campaign, its regions, strings and blocks. The target names which fields apply: section text (`eyebrow`, `title`, `description`, `bullets`, `content`, `intro`), `CampaignTypographyBlock.content`, `CampaignButtonBlock.label`, `CampaignImageBlock.alt`, `CampaignVideoBlock` / `CampaignJourneyBlock` `title` and `description`, `CampaignRegion.name`, `CampaignString.value` and `Campaign.title`.'
})
