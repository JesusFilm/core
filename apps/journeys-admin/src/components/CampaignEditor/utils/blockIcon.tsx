import { ReactElement } from 'react'

import Home3Icon from '@core/shared/ui/icons/Home3'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'

import { BLOCK_TYPES } from './blockTypes'

/** The element-type icon of a block by typename; the campaign (nothing selected) has its own. */
export function blockIcon(
  typename: CampaignBlock['__typename'] | undefined
): ReactElement {
  if (typename == null) return <Home3Icon />
  return BLOCK_TYPES[typename].icon
}
