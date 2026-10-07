import { transformCampaignBlocks } from '../libs/transformer'
import type { CampaignBlock, CampaignPublic, CampaignTreeOf } from '../types'

export interface CampaignChromeTrees {
  header: CampaignTreeOf<'CampaignHeaderBlock'>
  footer: CampaignTreeOf<'CampaignFooterBlock'>
}

/**
 * The Campaign Chrome treed from the payload's flat `chrome` list: the header
 * with its nav buttons and logo, the footer with its lines and links. The
 * chrome is never absent, but a list missing either row falls back to the
 * bare `header` / `footer` block with no children.
 */
export function campaignChromeTrees(
  campaign: CampaignPublic
): CampaignChromeTrees {
  const roots = transformCampaignBlocks<CampaignBlock>(campaign.chrome)
  const header =
    roots.find(
      (root): root is CampaignTreeOf<'CampaignHeaderBlock'> =>
        root.__typename === 'CampaignHeaderBlock'
    ) ??
    (transformCampaignBlocks<CampaignBlock>([
      campaign.header
    ])[0] as CampaignTreeOf<'CampaignHeaderBlock'>)
  const footer =
    roots.find(
      (root): root is CampaignTreeOf<'CampaignFooterBlock'> =>
        root.__typename === 'CampaignFooterBlock'
    ) ??
    (transformCampaignBlocks<CampaignBlock>([
      campaign.footer
    ])[0] as CampaignTreeOf<'CampaignFooterBlock'>)
  return { header, footer }
}
