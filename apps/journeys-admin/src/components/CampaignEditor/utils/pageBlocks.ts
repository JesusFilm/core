import { transformCampaignBlocks } from '@core/journeys/ui/Campaign'
import type { CampaignTreeBlock } from '@core/journeys/ui/Campaign'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock
} from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'

/** What a page shows, top to bottom: the header, its sections in order, the footer. */
export interface PageBlocks {
  /** The page's id; undefined when the campaign has no page of the kind. */
  pageId?: string
  header?: CampaignTreeBlock<CampaignBlock>
  sections: Array<CampaignTreeBlock<CampaignBlock>>
  footer?: CampaignTreeBlock<CampaignBlock>
}

/**
 * The blocks a page of the given kind renders, as trees: its sections and the
 * chrome every page shares. The canvas and the Navigator both read it, so the
 * tree shows exactly what the canvas shows.
 */
export function pageBlocks(
  campaign: Pick<Campaign, 'blocks' | 'pages'>,
  pageKind: CampaignPageKind
): PageBlocks {
  const pageId = campaign.pages.find((page) => page.kind === pageKind)?.id
  const sections = transformCampaignBlocks(
    campaign.blocks.filter((block) => block.pageId === pageId)
  )
  const chrome = transformCampaignBlocks(
    campaign.blocks.filter(
      (block) => block.pageId == null && block.regionId == null
    )
  )
  return {
    pageId,
    header: chrome.find((block) => block.__typename === 'CampaignHeaderBlock'),
    sections,
    footer: chrome.find((block) => block.__typename === 'CampaignFooterBlock')
  }
}
