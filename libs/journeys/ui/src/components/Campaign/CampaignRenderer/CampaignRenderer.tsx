import { ReactElement } from 'react'

import { CampaignButton } from '../CampaignButton'
import { CampaignTypography } from '../CampaignTypography'
import { isPageSection } from '../types'
import type { CampaignTree } from '../types'

import { CampaignPageSection } from './sectionRegistry'

interface CampaignRendererProps {
  block: CampaignTree
}

/**
 * One component per campaign typename: the two Extras here, and the 11 page
 * sections through the section registry. Header and footer are Campaign
 * Chrome, rendered by the page's chrome slots rather than as sections, a
 * Campaign Video only ever fills a Media Slot (rendered by its section), and
 * Column Slots and Journey cards render through their section, so they
 * render nothing here.
 */
export function CampaignRenderer({
  block
}: CampaignRendererProps): ReactElement | null {
  switch (block.__typename) {
    case 'CampaignTypographyBlock':
      return <CampaignTypography block={block} />
    case 'CampaignButtonBlock':
      return <CampaignButton block={block} />
  }
  if (!isPageSection(block)) return null
  return <CampaignPageSection block={block} />
}
