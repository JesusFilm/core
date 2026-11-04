import { TFunction } from 'i18next'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'

import { BLOCK_TYPES } from './blockTypes'

/** The breadcrumb name of a block by typename. */
export function blockLabel(
  t: TFunction,
  typename: CampaignBlock['__typename']
): string {
  return BLOCK_TYPES[typename].label(t)
}

/** The name of a region card on the canvas and in the Navigator. */
export function regionCardLabel(t: TFunction): string {
  return t('Region card')
}

/** The name of a Region Line, the text a region card carries. */
export function regionLineLabel(t: TFunction): string {
  return t('Region Line')
}

/** The name of one Share Language row of a Region Share section. */
export function shareLanguageLabel(t: TFunction): string {
  return t('Share language')
}
