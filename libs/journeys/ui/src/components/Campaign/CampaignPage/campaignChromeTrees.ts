import { transformCampaignBlocks } from '../libs/transformer'
import type { CampaignTreeBlock } from '../libs/transformer'
import type { CampaignBlock, CampaignPublic, CampaignTreeOf } from '../types'

export interface CampaignChromeTrees {
  header: CampaignTreeOf<'CampaignHeaderBlock'>
  footer: CampaignTreeOf<'CampaignFooterBlock'>
}

type ChromeTypename = 'CampaignHeaderBlock' | 'CampaignFooterBlock'

function chromeRoot<T extends ChromeTypename>(
  roots: Array<CampaignTreeBlock<CampaignBlock>>,
  typename: T
): CampaignTreeOf<T> {
  const root = roots.find(
    (candidate): candidate is CampaignTreeOf<T> =>
      candidate.__typename === typename
  )
  if (root == null) throw new Error(`Campaign chrome has no ${typename}`)
  return root
}

/**
 * The Campaign Chrome treed from the payload's flat `chrome` list: the header
 * with its nav buttons and logo, the footer with its lines and links. The
 * chrome is never absent: the api creates it with the campaign.
 */
export function campaignChromeTrees(
  campaign: CampaignPublic
): CampaignChromeTrees {
  const roots = transformCampaignBlocks<CampaignBlock>(campaign.chrome)
  return {
    header: chromeRoot(roots, 'CampaignHeaderBlock'),
    footer: chromeRoot(roots, 'CampaignFooterBlock')
  }
}
