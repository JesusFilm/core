import { translatedFieldCap } from '@core/journeys/ui/Campaign/libs/translatedField'
import { CampaignTextTypename, CampaignTextField } from './campaignTextFields'
export function campaignTextCap(typename: CampaignTextTypename, field: CampaignTextField): number {
  return translatedFieldCap({kind: 'block', typename}, field === 'richTextContent' ? 'content' : field) ?? 0
}
